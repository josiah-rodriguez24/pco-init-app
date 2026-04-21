import { prisma } from "@/lib/db";
import type { MappedServiceType } from "@/lib/planning-center/mappers";
import type { ServiceType } from "@/generated/prisma/client";

/**
 * Upsert a service type — insert if new, update if externalId exists.
 */
export async function upsertServiceType(
  data: MappedServiceType
): Promise<ServiceType> {
  return prisma.serviceType.upsert({
    where: { externalId: data.externalId },
    create: {
      externalId: data.externalId,
      name: data.name,
      description: data.description,
      frequency: data.frequency,
      lastSyncedAt: new Date(),
    },
    update: {
      name: data.name,
      description: data.description,
      frequency: data.frequency,
      lastSyncedAt: new Date(),
    },
  });
}

/**
 * Bulk upsert service types. Returns count of successfully upserted items.
 */
export async function upsertServiceTypes(
  items: MappedServiceType[]
): Promise<{ synced: number; failed: number }> {
  let synced = 0;
  let failed = 0;

  for (const item of items) {
    try {
      await upsertServiceType(item);
      synced++;
    } catch (error) {
      console.error(
        `[ServiceTypesRepo] Failed to upsert service type ${item.externalId}:`,
        error
      );
      failed++;
    }
  }

  return { synced, failed };
}

/**
 * List all service types, ordered by name.
 */
export async function listServiceTypes(): Promise<ServiceType[]> {
  return prisma.serviceType.findMany({
    orderBy: { name: "asc" },
  });
}

/**
 * Get a single service type by internal ID.
 */
export async function getServiceTypeById(
  id: string
): Promise<ServiceType | null> {
  return prisma.serviceType.findUnique({ where: { id } });
}

/**
 * Get a service type by its Planning Center external ID.
 */
export async function getServiceTypeByExternalId(
  externalId: string
): Promise<ServiceType | null> {
  return prisma.serviceType.findUnique({ where: { externalId } });
}

/**
 * Count all service types.
 */
export async function countServiceTypes(): Promise<number> {
  return prisma.serviceType.count();
}
