import { prisma } from "@/lib/db";
import type { MappedPlan } from "@/lib/planning-center/mappers";
import type { Plan, ServiceType, PlanPerson, Item, PlanTeam, Team } from "@/generated/prisma/client";

// ---------------------------------------------------------------------------
// Typed result shapes — Prisma v7 does not expose PlanGetPayload, so we build
// intersection types that mirror what the `include` clauses actually return.
// ---------------------------------------------------------------------------

/** A plan row joined with its parent service type (used in lists). */
export type PlanWithServiceType = Plan & { serviceType: ServiceType };

/** A plan with all detail relations (used on the detail page). */
export type PlanDetail = Plan & {
  serviceType: ServiceType;
  people: PlanPerson[];
  items: Item[];
  teams: (PlanTeam & { team: Team })[];
};

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

/**
 * Upsert a plan — insert if new, update if externalId exists.
 */
export async function upsertPlan(
  data: MappedPlan,
  serviceTypeId: string
): Promise<Plan> {
  return prisma.plan.upsert({
    where: { externalId: data.externalId },
    create: {
      externalId: data.externalId,
      serviceTypeId,
      title: data.title,
      dates: data.dates,
      sortDate: data.sortDate,
      seriesTitle: data.seriesTitle,
      status: data.status,
      totalLength: data.totalLength,
      planningCenterUrl: data.planningCenterUrl,
      lastSyncedAt: new Date(),
    },
    update: {
      title: data.title,
      dates: data.dates,
      sortDate: data.sortDate,
      seriesTitle: data.seriesTitle,
      status: data.status,
      totalLength: data.totalLength,
      planningCenterUrl: data.planningCenterUrl,
      lastSyncedAt: new Date(),
    },
  });
}

/**
 * Bulk upsert plans for a given service type.
 */
export async function upsertPlans(
  items: MappedPlan[],
  serviceTypeId: string
): Promise<{ synced: number; failed: number }> {
  let synced = 0;
  let failed = 0;

  for (const item of items) {
    try {
      await upsertPlan(item, serviceTypeId);
      synced++;
    } catch (error) {
      console.error(
        `[PlansRepo] Failed to upsert plan ${item.externalId}:`,
        error
      );
      failed++;
    }
  }

  return { synced, failed };
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/**
 * List plans with optional filtering. Includes the parent service type.
 */
export async function listPlans(options?: {
  serviceTypeId?: string;
  limit?: number;
  offset?: number;
}): Promise<{ plans: PlanWithServiceType[]; total: number }> {
  const where = options?.serviceTypeId
    ? { serviceTypeId: options.serviceTypeId }
    : {};

  const [plans, total] = await Promise.all([
    prisma.plan.findMany({
      where,
      orderBy: { sortDate: "desc" },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
      include: { serviceType: true },
    }),
    prisma.plan.count({ where }),
  ]);

  return { plans: plans as PlanWithServiceType[], total };
}

/**
 * Get a single plan by internal ID with all detail relations.
 */
export async function getPlanById(id: string): Promise<PlanDetail | null> {
  const plan = await prisma.plan.findUnique({
    where: { id },
    include: {
      serviceType: true,
      people: { orderBy: { position: "asc" } },
      items: { orderBy: { sequence: "asc" } },
      teams: { include: { team: true } },
    },
  });

  return plan as PlanDetail | null;
}

/**
 * Get the most recent plans for the dashboard (includes service type).
 */
export async function getRecentPlans(limit = 10): Promise<PlanWithServiceType[]> {
  const plans = await prisma.plan.findMany({
    orderBy: { sortDate: "desc" },
    take: limit,
    include: { serviceType: true },
  });

  return plans as PlanWithServiceType[];
}

/**
 * Count all plans.
 */
export async function countPlans(): Promise<number> {
  return prisma.plan.count();
}
