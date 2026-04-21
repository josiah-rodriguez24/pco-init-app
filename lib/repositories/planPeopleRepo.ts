import { prisma } from "@/lib/db";
import type { MappedPlanPerson } from "@/lib/planning-center/mappers";
import type { PlanPerson } from "@/generated/prisma/client";

/**
 * Upsert a plan person — insert if new, update if externalId exists.
 */
export async function upsertPlanPerson(
  data: MappedPlanPerson,
  planId: string
): Promise<PlanPerson> {
  return prisma.planPerson.upsert({
    where: { externalId: data.externalId },
    create: {
      externalId: data.externalId,
      planId,
      personName: data.personName,
      personEmail: data.personEmail,
      teamName: data.teamName,
      status: data.status,
      position: data.position,
    },
    update: {
      personName: data.personName,
      personEmail: data.personEmail,
      teamName: data.teamName,
      status: data.status,
      position: data.position,
    },
  });
}

/**
 * Bulk upsert plan people. Returns synced/failed counts.
 */
export async function upsertPlanPeople(
  items: MappedPlanPerson[],
  planId: string
): Promise<{ synced: number; failed: number }> {
  let synced = 0;
  let failed = 0;

  for (const item of items) {
    try {
      await upsertPlanPerson(item, planId);
      synced++;
    } catch (error) {
      console.error(
        `[PlanPeopleRepo] Failed to upsert plan person ${item.externalId}:`,
        error
      );
      failed++;
    }
  }

  return { synced, failed };
}

/**
 * List people for a plan.
 */
export async function listPlanPeople(planId: string): Promise<PlanPerson[]> {
  return prisma.planPerson.findMany({
    where: { planId },
    orderBy: { position: "asc" },
  });
}

/**
 * Count total plan people.
 */
export async function countPlanPeople(): Promise<number> {
  return prisma.planPerson.count();
}
