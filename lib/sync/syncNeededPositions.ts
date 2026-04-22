import { prisma } from "@/lib/db";
import { fetchNeededPositionsForPlan } from "@/lib/planning-center/services";
import { mapNeededPosition } from "@/lib/planning-center/mappers";
import { upsertNeededPositions } from "@/lib/repositories/neededPositionRepo";
import type { SyncResult } from "./syncServiceTypes";

/**
 * Sync needed (unfilled) positions for all plans.
 *
 * This provides demand/request data: how many slots of each position
 * were still open per plan. Gracefully handles plans where the endpoint
 * returns empty or errors by continuing to the next plan.
 *
 * Idempotent: uses upsert keyed on externalId.
 */
export async function syncNeededPositions(): Promise<SyncResult> {
  const job = await prisma.syncJob.create({
    data: { jobType: "needed_positions", status: "running" },
  });

  try {
    console.log("[SyncNeededPositions] Starting sync...");

    const plans = await prisma.plan.findMany({
      include: { serviceType: true },
    });

    if (plans.length === 0) {
      const msg = "No plans in DB — sync plans first";
      console.warn(`[SyncNeededPositions] ${msg}`);
      await prisma.syncJob.update({
        where: { id: job.id },
        data: { status: "completed", finishedAt: new Date(), errorMessage: msg },
      });
      return { jobId: job.id, synced: 0, failed: 0, status: "completed", errorMessage: msg };
    }

    let totalSynced = 0;
    let totalFailed = 0;

    for (const plan of plans) {
      try {
        const { data: pcoNeeded } = await fetchNeededPositionsForPlan(
          plan.serviceType.externalId,
          plan.externalId
        );

        if (pcoNeeded.length === 0) continue;

        const mapped = pcoNeeded.map(mapNeededPosition);
        const { synced, failed } = await upsertNeededPositions(mapped, plan.id);

        totalSynced += synced;
        totalFailed += failed;
      } catch (error) {
        console.error(
          `[SyncNeededPositions] Error syncing needed positions for plan ${plan.externalId}:`,
          error instanceof Error ? error.message : error
        );
        totalFailed++;
      }
    }

    await prisma.syncJob.update({
      where: { id: job.id },
      data: {
        status: "completed",
        finishedAt: new Date(),
        itemsSynced: totalSynced,
        itemsFailed: totalFailed,
      },
    });

    console.log(
      `[SyncNeededPositions] Completed: ${totalSynced} synced, ${totalFailed} failed`
    );

    return { jobId: job.id, synced: totalSynced, failed: totalFailed, status: "completed" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error during sync";
    console.error("[SyncNeededPositions] Failed:", message);

    await prisma.syncJob.update({
      where: { id: job.id },
      data: { status: "failed", finishedAt: new Date(), errorMessage: message },
    });

    return { jobId: job.id, synced: 0, failed: 0, status: "failed", errorMessage: message };
  }
}
