import { prisma } from "@/lib/db";
import { fetchPeopleForPlan } from "@/lib/planning-center/services";
import { mapPlanPerson } from "@/lib/planning-center/mappers";
import { upsertPlanPeople } from "@/lib/repositories/planPeopleRepo";
import type { SyncResult } from "./syncServiceTypes";

/**
 * Sync plan people (team member assignments) for all synced plans.
 *
 * Iterates every plan in the DB, fetches team_members from PCO,
 * and upserts into PlanPerson. Also extracts the person relationship
 * ID so syncPeople can later link personId FKs.
 *
 * Idempotent: uses upsert keyed on externalId.
 */
export async function syncPlanPeople(): Promise<SyncResult> {
  const job = await prisma.syncJob.create({
    data: { jobType: "plan_people", status: "running" },
  });

  try {
    console.log("[SyncPlanPeople] Starting sync...");

    const plans = await prisma.plan.findMany({
      include: { serviceType: true },
    });

    if (plans.length === 0) {
      const msg = "No plans in DB — sync plans first";
      console.warn(`[SyncPlanPeople] ${msg}`);
      await prisma.syncJob.update({
        where: { id: job.id },
        data: { status: "completed", finishedAt: new Date(), errorMessage: msg },
      });
      return { jobId: job.id, synced: 0, failed: 0, status: "completed", errorMessage: msg };
    }

    let totalSynced = 0;
    let totalFailed = 0;

    for (const plan of plans) {
      try {
        const { data: pcoMembers, included } = await fetchPeopleForPlan(
          plan.serviceType.externalId,
          plan.externalId
        );

        const mapped = pcoMembers.map((r) => mapPlanPerson(r, included));
        const { synced, failed } = await upsertPlanPeople(mapped, plan.id);

        totalSynced += synced;
        totalFailed += failed;
      } catch (error) {
        console.error(
          `[SyncPlanPeople] Error syncing people for plan ${plan.externalId}:`,
          error instanceof Error ? error.message : error
        );
        totalFailed++;
      }
    }

    await prisma.syncJob.update({
      where: { id: job.id },
      data: {
        status: "completed",
        finishedAt: new Date(),
        itemsSynced: totalSynced,
        itemsFailed: totalFailed,
      },
    });

    console.log(
      `[SyncPlanPeople] Completed: ${totalSynced} synced, ${totalFailed} failed`
    );

    return { jobId: job.id, synced: totalSynced, failed: totalFailed, status: "completed" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error during sync";
    console.error("[SyncPlanPeople] Failed:", message);

    await prisma.syncJob.update({
      where: { id: job.id },
      data: { status: "failed", finishedAt: new Date(), errorMessage: message },
    });

    return { jobId: job.id, synced: 0, failed: 0, status: "failed", errorMessage: message };
  }
}
