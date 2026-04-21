import { prisma } from "@/lib/db";
import { fetchServiceTypes } from "@/lib/planning-center/services";
import { mapServiceType } from "@/lib/planning-center/mappers";
import { upsertServiceTypes } from "@/lib/repositories/serviceTypesRepo";

export interface SyncResult {
  jobId: string;
  synced: number;
  failed: number;
  status: "completed" | "failed";
  errorMessage?: string;
}

/**
 * Sync all service types from Planning Center into our database.
 *
 * Idempotent: safe to call repeatedly. Uses upsert (externalId is the
 * natural key), so re-running overwrites with the latest data.
 */
export async function syncServiceTypes(): Promise<SyncResult> {
  const job = await prisma.syncJob.create({
    data: { jobType: "service_types", status: "running" },
  });

  try {
    console.log("[SyncServiceTypes] Starting sync...");

    const { data: pcoServiceTypes } = await fetchServiceTypes();
    console.log(
      `[SyncServiceTypes] Fetched ${pcoServiceTypes.length} service types from PCO`
    );

    const mapped = pcoServiceTypes.map(mapServiceType);
    const { synced, failed } = await upsertServiceTypes(mapped);

    await prisma.syncJob.update({
      where: { id: job.id },
      data: {
        status: "completed",
        finishedAt: new Date(),
        itemsSynced: synced,
        itemsFailed: failed,
      },
    });

    console.log(
      `[SyncServiceTypes] Completed: ${synced} synced, ${failed} failed`
    );

    return { jobId: job.id, synced, failed, status: "completed" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error during sync";

    console.error("[SyncServiceTypes] Failed:", message);

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
