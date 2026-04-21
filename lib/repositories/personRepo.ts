import { prisma } from "@/lib/db";
import type { MappedPerson } from "@/lib/planning-center/mappers";
import type { Person } from "@/generated/prisma/client";

export async function upsertPerson(data: MappedPerson): Promise<Person> {
  return prisma.person.upsert({
    where: { externalId: data.externalId },
    create: {
      externalId: data.externalId,
      firstName: data.firstName,
      lastName: data.lastName,
      name: data.name,
      email: data.email,
      photoThumbnail: data.photoThumbnail,
      status: data.status,
      lastSyncedAt: new Date(),
    },
    update: {
      firstName: data.firstName,
      lastName: data.lastName,
      name: data.name,
      email: data.email,
      photoThumbnail: data.photoThumbnail,
      status: data.status,
      lastSyncedAt: new Date(),
    },
  });
}

export async function upsertPeople(
  items: MappedPerson[]
): Promise<{ synced: number; failed: number }> {
  let synced = 0;
  let failed = 0;

  for (const item of items) {
    try {
      await upsertPerson(item);
      synced++;
    } catch (error) {
      console.error(
        `[PersonRepo] Failed to upsert person ${item.externalId}:`,
        error
      );
      failed++;
    }
  }

  return { synced, failed };
}

export async function getPersonByExternalId(
  externalId: string
): Promise<Person | null> {
  return prisma.person.findUnique({ where: { externalId } });
}

export async function listPeople(): Promise<Person[]> {
  return prisma.person.findMany({ orderBy: { name: "asc" } });
}

export async function countPeople(): Promise<number> {
  return prisma.person.count();
}
