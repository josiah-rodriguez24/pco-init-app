import { prisma } from "@/lib/db";
import type { MappedNeededPosition } from "@/lib/planning-center/mappers";
import type { NeededPosition } from "@/generated/prisma/client";

export async function upsertNeededPosition(
  data: MappedNeededPosition,
  planId: string
): Promise<NeededPosition> {
  return prisma.neededPosition.upsert({
    where: { externalId: data.externalId },
    create: {
      externalId: data.externalId,
      planId,
      teamPositionName: data.teamPositionName,
      quantity: data.quantity,
      scheduledTo: data.scheduledTo,
    },
    update: {
      teamPositionName: data.teamPositionName,
      quantity: data.quantity,
      scheduledTo: data.scheduledTo,
    },
  });
}

export async function upsertNeededPositions(
  items: MappedNeededPosition[],
  planId: string
): Promise<{ synced: number; failed: number }> {
  let synced = 0;
  let failed = 0;

  for (const item of items) {
    try {
      await upsertNeededPosition(item, planId);
      synced++;
    } catch (error) {
      console.error(
        `[NeededPositionRepo] Failed to upsert needed position ${item.externalId}:`,
        error
      );
      failed++;
    }
  }

  return { synced, failed };
}
