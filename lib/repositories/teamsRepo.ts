import { prisma } from "@/lib/db";
import type { MappedTeam } from "@/lib/planning-center/mappers";
import type { Team } from "@/generated/prisma/client";

/**
 * Upsert a team — insert if new, update if externalId exists.
 */
export async function upsertTeam(
  data: MappedTeam,
  serviceTypeId: string
): Promise<Team> {
  return prisma.team.upsert({
    where: { externalId: data.externalId },
    create: {
      externalId: data.externalId,
      serviceTypeId,
      name: data.name,
      sequence: data.sequence,
    },
    update: {
      name: data.name,
      sequence: data.sequence,
    },
  });
}

/**
 * Bulk upsert teams for a service type. Returns synced/failed counts.
 */
export async function upsertTeams(
  items: MappedTeam[],
  serviceTypeId: string
): Promise<{ synced: number; failed: number }> {
  let synced = 0;
  let failed = 0;

  for (const item of items) {
    if (item.isArchived) continue; // skip archived teams
    try {
      await upsertTeam(item, serviceTypeId);
      synced++;
    } catch (error) {
      console.error(
        `[TeamsRepo] Failed to upsert team ${item.externalId}:`,
        error
      );
      failed++;
    }
  }

  return { synced, failed };
}

/**
 * List all teams, optionally filtered by service type.
 */
export async function listTeams(serviceTypeId?: string): Promise<Team[]> {
  return prisma.team.findMany({
    where: serviceTypeId ? { serviceTypeId } : {},
    orderBy: { sequence: "asc" },
  });
}

/**
 * Get a team by its PCO external ID.
 */
export async function getTeamByExternalId(
  externalId: string
): Promise<Team | null> {
  return prisma.team.findUnique({ where: { externalId } });
}

/**
 * Count teams.
 */
export async function countTeams(): Promise<number> {
  return prisma.team.count();
}
