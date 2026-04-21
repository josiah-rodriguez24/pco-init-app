import { prisma } from "@/lib/db";
import { fetchTeamsForServiceType } from "@/lib/planning-center/services";
import { mapTeam } from "@/lib/planning-center/mappers";
import { upsertTeams } from "@/lib/repositories/teamsRepo";
import { listServiceTypes } from "@/lib/repositories/serviceTypesRepo";
import type { SyncResult } from "./syncServiceTypes";

/**
 * Sync teams for all known service types.
 *
 * Prerequisites: service types must be synced first.
 * Idempotent: uses upsert keyed on externalId.
 */
export async function syncTeams(): Promise<SyncResult> {
  const job = await prisma.syncJob.create({
    data: { jobType: "teams", status: "running" },
  });

  try {
    console.log("[SyncTeams] Starting sync...");

    const serviceTypes = await listServiceTypes();
    if (serviceTypes.length === 0) {
      const msg = "No service types in DB — sync service types first";
      console.warn(`[SyncTeams] ${msg}`);
      await prisma.syncJob.update({
        where: { id: job.id },
        data: {
          status: "completed",
          finishedAt: new Date(),
          errorMessage: msg,
        },
      });
      return { jobId: job.id, synced: 0, failed: 0, status: "completed", errorMessage: msg };
    }

    let totalSynced = 0;
    let totalFailed = 0;

    for (const st of serviceTypes) {
      try {
        console.log(
          `[SyncTeams] Fetching teams for "${st.name}" (${st.externalId})`
        );

        const { data: pcoTeams } = await fetchTeamsForServiceType(st.externalId);
        const mapped = pcoTeams.map(mapTeam);
        const { synced, failed } = await upsertTeams(mapped, st.id);

        totalSynced += synced;
        totalFailed += failed;
      } catch (error) {
        console.error(
          `[SyncTeams] Error syncing teams for service type ${st.externalId}:`,
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
      `[SyncTeams] Completed: ${totalSynced} synced, ${totalFailed} failed`
    );

    return {
      jobId: job.id,
      synced: totalSynced,
      failed: totalFailed,
      status: "completed",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error during sync";
    console.error("[SyncTeams] Failed:", message);

    await prisma.syncJob.update({
      where: { id: job.id },
      data: { status: "failed", finishedAt: new Date(), errorMessage: message },
    });

    return { jobId: job.id, synced: 0, failed: 0, status: "failed", errorMessage: message };
  }
}
