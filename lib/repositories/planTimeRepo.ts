import { prisma } from "@/lib/db";
import type { MappedPlanTime } from "@/lib/planning-center/mappers";
import type { PlanTime } from "@/generated/prisma/client";

export async function upsertPlanTime(
  data: MappedPlanTime,
  planId: string
): Promise<PlanTime> {
  return prisma.planTime.upsert({
    where: { externalId: data.externalId },
    create: {
      externalId: data.externalId,
      planId,
      name: data.name,
      timeType: data.timeType,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
    },
    update: {
      name: data.name,
      timeType: data.timeType,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
    },
  });
}

export async function upsertPlanTimes(
  items: MappedPlanTime[],
  planId: string
): Promise<{ synced: number; failed: number }> {
  let synced = 0;
  let failed = 0;

  for (const item of items) {
    try {
      await upsertPlanTime(item, planId);
      synced++;
    } catch (error) {
      console.error(
        `[PlanTimeRepo] Failed to upsert plan time ${item.externalId}:`,
        error
      );
      failed++;
    }
  }

  return { synced, failed };
}
