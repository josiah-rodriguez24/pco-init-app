import { prisma } from "@/lib/db";
import { fetchPlans } from "@/lib/planning-center/services";
import { mapPlan } from "@/lib/planning-center/mappers";
import { upsertPlans } from "@/lib/repositories/plansRepo";
import { listServiceTypes } from "@/lib/repositories/serviceTypesRepo";

export interface SyncPlansResult {
  jobId: string;
  synced: number;
  failed: number;
  status: "completed" | "failed";
  errorMessage?: string;
}

/**
 * Sync plans from Planning Center for all known service types.
 *
 * Prerequisites: service types must be synced first so we have internal IDs.
 *
 * Idempotent: uses upsert keyed on externalId.
 *
 * By default syncs both future and past plans. Pass `filter` to limit scope:
 *   - "future" — upcoming plans only
 *   - "past"   — historical plans only
 *   - "all"    — both future and past (default)
 */
export async function syncPlans(options?: {
  filter?: "future" | "past" | "all";
}): Promise<SyncPlansResult> {
  const job = await prisma.syncJob.create({
    data: { jobType: "plans", status: "running" },
  });

  try {
    console.log("[SyncPlans] Starting sync...");

    const serviceTypes = await listServiceTypes();
    if (serviceTypes.length === 0) {
      const msg = "No service types in DB — sync service types first";
      console.warn(`[SyncPlans] ${msg}`);
      await prisma.syncJob.update({
        where: { id: job.id },
        data: {
          status: "completed",
          finishedAt: new Date(),
          errorMessage: msg,
        },
      });
      return {
        jobId: job.id,
        synced: 0,
        failed: 0,
        status: "completed",
        errorMessage: msg,
      };
    }

    const requestedFilter = options?.filter ?? "all";
    const filters: string[] =
      requestedFilter === "all"
        ? ["future", "past"]
        : [requestedFilter];

    let totalSynced = 0;
    let totalFailed = 0;

    for (const filter of filters) {
      for (const st of serviceTypes) {
        try {
          console.log(
            `[SyncPlans] Fetching plans for "${st.name}" (${st.externalId}), filter=${filter}`
          );

          const { data: pcoPlans } = await fetchPlans(st.externalId, { filter });
          const mapped = pcoPlans.map(mapPlan);
          const { synced, failed } = await upsertPlans(mapped, st.id);

          totalSynced += synced;
          totalFailed += failed;
        } catch (error) {
          console.error(
            `[SyncPlans] Error syncing plans for service type ${st.externalId}:`,
            error instanceof Error ? error.message : error
          );
          totalFailed++;
        }
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
      `[SyncPlans] Completed: ${totalSynced} synced, ${totalFailed} failed`
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

    console.error("[SyncPlans] Failed:", message);

    await prisma.syncJob.update({
      where: { id: job.id },
      data: {
        status: "failed",
        finishedAt: new Date(),
        errorMessage: message,
      },
    });

    return {
      jobId: job.id,
      synced: 0,
      failed: 0,
      status: "failed",
      errorMessage: message,
    };
  }
}
