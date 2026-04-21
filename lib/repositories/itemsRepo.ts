import { prisma } from "@/lib/db";
import type { MappedItem, MappedSong } from "@/lib/planning-center/mappers";
import type { Item, Song } from "@/generated/prisma/client";

export async function upsertSong(data: MappedSong): Promise<Song> {
  return prisma.song.upsert({
    where: { externalId: data.externalId },
    create: {
      externalId: data.externalId,
      title: data.title,
      author: data.author,
      ccliNumber: data.ccliNumber,
    },
    update: {
      title: data.title,
      author: data.author,
      ccliNumber: data.ccliNumber,
    },
  });
}

export async function upsertSongs(
  items: MappedSong[]
): Promise<{ synced: number; failed: number }> {
  let synced = 0;
  let failed = 0;

  for (const item of items) {
    try {
      await upsertSong(item);
      synced++;
    } catch (error) {
      console.error(
        `[ItemsRepo] Failed to upsert song ${item.externalId}:`,
        error
      );
      failed++;
    }
  }

  return { synced, failed };
}

export async function upsertItem(
  data: MappedItem,
  planId: string,
  songDbId: string | null
): Promise<Item> {
  return prisma.item.upsert({
    where: { externalId: data.externalId },
    create: {
      externalId: data.externalId,
      planId,
      title: data.title,
      itemType: data.itemType,
      sequence: data.sequence,
      length: data.length,
      songId: songDbId,
    },
    update: {
      title: data.title,
      itemType: data.itemType,
      sequence: data.sequence,
      length: data.length,
      songId: songDbId,
    },
  });
}

export async function upsertItems(
  items: MappedItem[],
  planId: string,
  songLookup: Map<string, string>
): Promise<{ synced: number; failed: number }> {
  let synced = 0;
  let failed = 0;

  for (const item of items) {
    try {
      const songDbId = item.songExternalId
        ? songLookup.get(item.songExternalId) ?? null
        : null;
      await upsertItem(item, planId, songDbId);
      synced++;
    } catch (error) {
      console.error(
        `[ItemsRepo] Failed to upsert item ${item.externalId}:`,
        error
      );
      failed++;
    }
  }

  return { synced, failed };
}
