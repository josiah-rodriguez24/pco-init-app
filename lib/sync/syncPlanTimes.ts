import { prisma } from "@/lib/db";
import { fetchPlanTimesForPlan } from "@/lib/planning-center/services";
import { mapPlanTime } from "@/lib/planning-center/mappers";
import { upsertPlanTimes } from "@/lib/repositories/planTimeRepo";
import type { SyncResult } from "./syncServiceTypes";

/**
 * Sync plan times (service time slots) for all synced plans.
 *
 * Prerequisites: plans must be synced first.
 * Idempotent: uses upsert keyed on externalId.
 */
export async function syncPlanTimes(): Promise<SyncResult> {
  const job = await prisma.syncJob.create({
    data: { jobType: "plan_times", status: "running" },
  });

  try {
    console.log("[SyncPlanTimes] Starting sync...");

    const plans = await prisma.plan.findMany({
      include: { serviceType: true },
    });

    if (plans.length === 0) {
      const msg = "No plans in DB — sync plans first";
      console.warn(`[SyncPlanTimes] ${msg}`);
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
        const { data: pcoPlanTimes } = await fetchPlanTimesForPlan(
          plan.serviceType.externalId,
          plan.externalId
        );
        const mapped = pcoPlanTimes.map(mapPlanTime);
        const { synced, failed } = await upsertPlanTimes(mapped, plan.id);

        totalSynced += synced;
        totalFailed += failed;
      } catch (error) {
        console.error(
          `[SyncPlanTimes] Error syncing plan times for plan ${plan.externalId}:`,
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
      `[SyncPlanTimes] Completed: ${totalSynced} synced, ${totalFailed} failed`
    );

    return { jobId: job.id, synced: totalSynced, failed: totalFailed, status: "completed" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error during sync";
    console.error("[SyncPlanTimes] Failed:", message);

    await prisma.syncJob.update({
      where: { id: job.id },
      data: { status: "failed", finishedAt: new Date(), errorMessage: message },
    });

    return { jobId: job.id, synced: 0, failed: 0, status: "failed", errorMessage: message };
  }
}
