import { prisma } from "@/lib/db";
import type { MappedBlockout } from "@/lib/planning-center/mappers";
import type { Blockout } from "@/generated/prisma/client";

export async function upsertBlockout(
  data: MappedBlockout,
  personId: string
): Promise<Blockout> {
  return prisma.blockout.upsert({
    where: { externalId: data.externalId },
    create: {
      externalId: data.externalId,
      personId,
      description: data.description,
      reason: data.reason,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      repeatFrequency: data.repeatFrequency,
      repeatPeriod: data.repeatPeriod,
      repeatInterval: data.repeatInterval,
      repeatUntil: data.repeatUntil,
      timeZone: data.timeZone,
    },
    update: {
      description: data.description,
      reason: data.reason,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      repeatFrequency: data.repeatFrequency,
      repeatPeriod: data.repeatPeriod,
      repeatInterval: data.repeatInterval,
      repeatUntil: data.repeatUntil,
      timeZone: data.timeZone,
    },
  });
}

export async function upsertBlockouts(
  items: MappedBlockout[],
  personId: string
): Promise<{ synced: number; failed: number }> {
  let synced = 0;
  let failed = 0;

  for (const item of items) {
    try {
      await upsertBlockout(item, personId);
      synced++;
    } catch (error) {
      console.error(
        `[BlockoutRepo] Failed to upsert blockout ${item.externalId}:`,
        error
      );
      failed++;
    }
  }

  return { synced, failed };
}
