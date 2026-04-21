import { prisma } from "@/lib/db";
import { fetchItemsForPlan } from "@/lib/planning-center/services";
import { mapItem, mapSong } from "@/lib/planning-center/mappers";
import { upsertItems, upsertSong } from "@/lib/repositories/itemsRepo";
import type { JsonApiResource, PcoSongAttributes } from "@/lib/planning-center/types";
import type { SyncResult } from "./syncServiceTypes";

/**
 * Sync items (and associated songs) for all synced plans.
 *
 * Uses `?include=song` on the items endpoint so song data arrives in
 * the included[] sideload without additional API calls.
 *
 * Idempotent: uses upsert keyed on externalId.
 */
export async function syncItems(): Promise<SyncResult> {
  const job = await prisma.syncJob.create({
    data: { jobType: "items", status: "running" },
  });

  try {
    console.log("[SyncItems] Starting sync...");

    const plans = await prisma.plan.findMany({
      include: { serviceType: true },
    });

    if (plans.length === 0) {
      const msg = "No plans in DB — sync plans first";
      console.warn(`[SyncItems] ${msg}`);
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
        const { data: pcoItems, included } = await fetchItemsForPlan(
          plan.serviceType.externalId,
          plan.externalId
        );

        // Upsert songs from the included[] sideload first
        const songLookup = new Map<string, string>();
        const songResources = (included ?? []).filter(
          (r) => r.type === "Song"
        ) as JsonApiResource<PcoSongAttributes>[];

        for (const songResource of songResources) {
          try {
            const mappedSong = mapSong(songResource);
            const dbSong = await upsertSong(mappedSong);
            songLookup.set(mappedSong.externalId, dbSong.id);
          } catch (error) {
            console.error(
              `[SyncItems] Failed to upsert song ${songResource.id}:`,
              error instanceof Error ? error.message : error
            );
          }
        }

        const mappedItems = pcoItems.map(mapItem);
        const { synced, failed } = await upsertItems(mappedItems, plan.id, songLookup);

        totalSynced += synced;
        totalFailed += failed;
      } catch (error) {
        console.error(
          `[SyncItems] Error syncing items for plan ${plan.externalId}:`,
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
      `[SyncItems] Completed: ${totalSynced} synced, ${totalFailed} failed`
    );

    return { jobId: job.id, synced: totalSynced, failed: totalFailed, status: "completed" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error during sync";
    console.error("[SyncItems] Failed:", message);

    await prisma.syncJob.update({
      where: { id: job.id },
      data: { status: "failed", finishedAt: new Date(), errorMessage: message },
    });

    return { jobId: job.id, synced: 0, failed: 0, status: "failed", errorMessage: message };
  }
}
