import { prisma } from "@/lib/db";
import {
  fetchTeamPositionsForServiceType,
  fetchPersonTeamPositionAssignments,
} from "@/lib/planning-center/services";
import {
  mapTeamPosition,
  mapPersonTeamPositionAssignment,
} from "@/lib/planning-center/mappers";
import {
  upsertTeamPositions,
  upsertPersonTeamPositionAssignment,
} from "@/lib/repositories/teamPositionRepo";
import { listServiceTypes } from "@/lib/repositories/serviceTypesRepo";
import type { SyncResult } from "./syncServiceTypes";

/**
 * Sync team positions and their person assignments for all service types.
 *
 * Prerequisites: service types and people must be synced first.
 * Idempotent: uses upsert keyed on externalId.
 */
export async function syncTeamPositions(): Promise<SyncResult> {
  const job = await prisma.syncJob.create({
    data: { jobType: "team_positions", status: "running" },
  });

  try {
    console.log("[SyncTeamPositions] Starting sync...");

    const serviceTypes = await listServiceTypes();
    if (serviceTypes.length === 0) {
      const msg = "No service types in DB — sync service types first";
      console.warn(`[SyncTeamPositions] ${msg}`);
      await prisma.syncJob.update({
        where: { id: job.id },
        data: { status: "completed", finishedAt: new Date(), errorMessage: msg },
      });
      return { jobId: job.id, synced: 0, failed: 0, status: "completed", errorMessage: msg };
    }

    let totalSynced = 0;
    let totalFailed = 0;

    for (const st of serviceTypes) {
      try {
        console.log(
          `[SyncTeamPositions] Fetching positions for "${st.name}" (${st.externalId})`
        );

        const { data: pcoPositions } = await fetchTeamPositionsForServiceType(
          st.externalId
        );
        const mappedPositions = pcoPositions.map(mapTeamPosition);
        const { synced, failed } = await upsertTeamPositions(
          mappedPositions,
          st.id
        );

        totalSynced += synced;
        totalFailed += failed;

        // Sync person assignments for each position
        for (const posResource of pcoPositions) {
          try {
            const { data: assignments } =
              await fetchPersonTeamPositionAssignments(
                st.externalId,
                posResource.id
              );

            const dbPosition = await prisma.teamPosition.findUnique({
              where: { externalId: posResource.id },
            });
            if (!dbPosition) continue;

            for (const assignmentResource of assignments) {
              try {
                const mapped = mapPersonTeamPositionAssignment(assignmentResource);
                if (!mapped.personExternalId) continue;

                const dbPerson = await prisma.person.findUnique({
                  where: { externalId: mapped.personExternalId },
                });
                if (!dbPerson) continue;

                await upsertPersonTeamPositionAssignment(
                  mapped,
                  dbPerson.id,
                  dbPosition.id
                );
                totalSynced++;
              } catch (error) {
                console.error(
                  `[SyncTeamPositions] Failed to upsert assignment ${assignmentResource.id}:`,
                  error instanceof Error ? error.message : error
                );
                totalFailed++;
              }
            }
          } catch (error) {
            console.error(
              `[SyncTeamPositions] Error fetching assignments for position ${posResource.id}:`,
              error instanceof Error ? error.message : error
            );
          }
        }
      } catch (error) {
        console.error(
          `[SyncTeamPositions] Error syncing positions for service type ${st.externalId}:`,
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
      `[SyncTeamPositions] Completed: ${totalSynced} synced, ${totalFailed} failed`
    );

    return { jobId: job.id, synced: totalSynced, failed: totalFailed, status: "completed" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error during sync";
    console.error("[SyncTeamPositions] Failed:", message);

    await prisma.syncJob.update({
      where: { id: job.id },
      data: { status: "failed", finishedAt: new Date(), errorMessage: message },
    });

    return { jobId: job.id, synced: 0, failed: 0, status: "failed", errorMessage: message };
  }
}
