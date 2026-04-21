import { prisma } from "@/lib/db";
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
  serviceTypeId: string
): Promise<TeamPosition> {
  return prisma.teamPosition.upsert({
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
