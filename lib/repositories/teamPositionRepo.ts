import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type {
  MappedTeamPosition,
  MappedPersonTeamPositionAssignment,
} from "@/lib/planning-center/mappers";
import type {
  TeamPosition,
  PersonTeamPositionAssignment,
} from "@/generated/prisma/client";

export async function upsertTeamPosition(
  data: MappedTeamPosition,
  serviceTypeId: string,
  teamId?: string | null
): Promise<TeamPosition> {
  const tagsJson = (data.tags ?? undefined) as Prisma.InputJsonValue | undefined;
  const tagGroupsJson = (data.tagGroups ?? undefined) as Prisma.InputJsonValue | undefined;
  const negativeTagGroupsJson = (data.negativeTagGroups ?? undefined) as Prisma.InputJsonValue | undefined;

  return prisma.teamPosition.upsert({
    where: { externalId: data.externalId },
    create: {
      externalId: data.externalId,
      serviceTypeId,
      teamId: teamId ?? null,
      name: data.name,
      sequence: data.sequence,
      tags: tagsJson,
      tagGroups: tagGroupsJson,
      negativeTagGroups: negativeTagGroupsJson,
    },
    update: {
      name: data.name,
      sequence: data.sequence,
      teamId: teamId ?? undefined,
      tags: tagsJson,
      tagGroups: tagGroupsJson,
      negativeTagGroups: negativeTagGroupsJson,
    },
  });
}

export async function upsertTeamPositions(
  items: MappedTeamPosition[],
  serviceTypeId: string
): Promise<{ synced: number; failed: number }> {
  let synced = 0;
  let failed = 0;

  for (const item of items) {
    try {
      await upsertTeamPosition(item, serviceTypeId);
      synced++;
    } catch (error) {
      console.error(
        `[TeamPositionRepo] Failed to upsert position ${item.externalId}:`,
        error
      );
      failed++;
    }
  }

  return { synced, failed };
}

export async function upsertPersonTeamPositionAssignment(
  data: MappedPersonTeamPositionAssignment,
  personId: string,
  teamPositionId: string
): Promise<PersonTeamPositionAssignment> {
  return prisma.personTeamPositionAssignment.upsert({
    where: { externalId: data.externalId },
    create: {
      externalId: data.externalId,
      personId,
      teamPositionId,
      schedulePreference: data.schedulePreference,
      preferredWeeks: data.preferredWeeks,
    },
    update: {
      schedulePreference: data.schedulePreference,
      preferredWeeks: data.preferredWeeks,
    },
  });
}
