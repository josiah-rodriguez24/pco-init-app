import { prisma } from "@/lib/db";
import { fetchBlockoutsForPerson } from "@/lib/planning-center/services";
import { mapBlockout } from "@/lib/planning-center/mappers";
import { upsertBlockouts } from "@/lib/repositories/blockoutRepo";
import type { SyncResult } from "./syncServiceTypes";

/**
 * Sync blockouts (unavailability windows) for all synced Person records.
 *
 * Prerequisites: people must be synced first.
 * Idempotent: uses upsert keyed on externalId.
 */
export async function syncBlockouts(): Promise<SyncResult> {
  const job = await prisma.syncJob.create({
    data: { jobType: "blockouts", status: "running" },
  });

  try {
    console.log("[SyncBlockouts] Starting sync...");

    const people = await prisma.person.findMany({
      select: { id: true, externalId: true, name: true },
    });

    if (people.length === 0) {
      const msg = "No people in DB — sync people first";
      console.warn(`[SyncBlockouts] ${msg}`);
      await prisma.syncJob.update({
        where: { id: job.id },
        data: { status: "completed", finishedAt: new Date(), errorMessage: msg },
      });
      return { jobId: job.id, synced: 0, failed: 0, status: "completed", errorMessage: msg };
    }

    let totalSynced = 0;
    let totalFailed = 0;

    for (const person of people) {
      try {
        const { data: pcoBlockouts } = await fetchBlockoutsForPerson(
          person.externalId
        );
        const mapped = pcoBlockouts.map(mapBlockout);
        const { synced, failed } = await upsertBlockouts(mapped, person.id);

        totalSynced += synced;
        totalFailed += failed;
      } catch (error) {
        console.error(
          `[SyncBlockouts] Error syncing blockouts for person ${person.externalId}:`,
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
      `[SyncBlockouts] Completed: ${totalSynced} synced, ${totalFailed} failed`
    );

    return { jobId: job.id, synced: totalSynced, failed: totalFailed, status: "completed" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error during sync";
    console.error("[SyncBlockouts] Failed:", message);

    await prisma.syncJob.update({
      where: { id: job.id },
      data: { status: "failed", finishedAt: new Date(), errorMessage: message },
    });

    return { jobId: job.id, synced: 0, failed: 0, status: "failed", errorMessage: message };
  }
}
