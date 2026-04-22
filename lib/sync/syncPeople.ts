import { prisma } from "@/lib/db";
import {
  fetchAllServicesPeople,
  fetchEmailsForPerson,
} from "@/lib/planning-center/services";
import { mapPerson } from "@/lib/planning-center/mappers";
import { upsertPeople } from "@/lib/repositories/personRepo";
import type { SyncResult } from "./syncServiceTypes";

/**
 * Sync all people from the Services API into the Person table.
 *
 * After upserting Person records, enriches each one with their primary
 * email by fetching /people/{id}/emails. Then links PlanPerson rows
 * to their corresponding Person by matching the PCO person relationship.
 *
 * Idempotent: uses upsert keyed on externalId.
 */
export async function syncPeople(): Promise<SyncResult> {
  const job = await prisma.syncJob.create({
    data: { jobType: "people", status: "running" },
  });

  try {
    console.log("[SyncPeople] Starting sync...");

    const { data: pcoPeople } = await fetchAllServicesPeople();
    console.log(`[SyncPeople] Fetched ${pcoPeople.length} people from PCO`);

    const mapped = pcoPeople.map(mapPerson);
    const { synced, failed } = await upsertPeople(mapped);

    // Enrich with primary email
    let emailsEnriched = 0;
    for (const person of pcoPeople) {
      try {
        const { data: emails } = await fetchEmailsForPerson(person.id);
        const primary = emails.find((e) => e.attributes.primary === true);
        const address = primary?.attributes.address ?? emails[0]?.attributes.address;

        if (address) {
          await prisma.person.update({
            where: { externalId: person.id },
            data: { email: address },
          });
          emailsEnriched++;
        }
      } catch {
        // Email fetch failures are non-fatal; the person record still exists
      }
    }

    console.log(`[SyncPeople] Enriched ${emailsEnriched} people with emails`);

    // Link PlanPerson rows to Person records via the PCO person relationship
    await linkPlanPeopleToPersons();

    await prisma.syncJob.update({
      where: { id: job.id },
      data: {
        status: "completed",
        finishedAt: new Date(),
        itemsSynced: synced,
        itemsFailed: failed,
      },
    });

    console.log(
      `[SyncPeople] Completed: ${synced} synced, ${failed} failed`
    );

    return { jobId: job.id, synced, failed, status: "completed" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error during sync";
    console.error("[SyncPeople] Failed:", message);

    await prisma.syncJob.update({
      where: { id: job.id },
      data: { status: "failed", finishedAt: new Date(), errorMessage: message },
    });

    return { jobId: job.id, synced: 0, failed: 0, status: "failed", errorMessage: message };
  }
}

/**
 * Link PlanPerson rows to Person records.
 *
 * Primary strategy: match on personExternalId (the PCO person relationship
 * ID stored during plan-people sync). Falls back to name matching for any
 * rows that lack personExternalId.
 */
async function linkPlanPeopleToPersons(): Promise<void> {
  const unlinked = await prisma.planPerson.findMany({
    where: { personId: null },
    select: { id: true, personName: true, personExternalId: true },
  });

  if (unlinked.length === 0) return;

  const people = await prisma.person.findMany({
    select: { id: true, externalId: true, name: true },
  });

  const externalIdLookup = new Map<string, string>();
  const nameLookup = new Map<string, string>();
  for (const p of people) {
    externalIdLookup.set(p.externalId, p.id);
    nameLookup.set(p.name.toLowerCase(), p.id);
  }

  let linked = 0;
  for (const pp of unlinked) {
    const personId =
      (pp.personExternalId ? externalIdLookup.get(pp.personExternalId) : null) ??
      nameLookup.get(pp.personName.toLowerCase()) ??
      null;

    if (personId) {
      await prisma.planPerson.update({
        where: { id: pp.id },
        data: { personId },
      });
      linked++;
    }
  }

  console.log(
    `[SyncPeople] Linked ${linked}/${unlinked.length} PlanPerson rows to Person records`
  );
}
