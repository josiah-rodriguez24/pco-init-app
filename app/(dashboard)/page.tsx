import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentPlansList } from "@/components/dashboard/RecentPlansList";
import { countServiceTypes } from "@/lib/repositories/serviceTypesRepo";
import { countPlans, getRecentPlans } from "@/lib/repositories/plansRepo";
import { countTeams } from "@/lib/repositories/teamsRepo";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getLatestSync() {
  const job = await prisma.syncJob.findFirst({
    where: { status: "completed", finishedAt: { not: null } },
    orderBy: { finishedAt: "desc" },
  });
  return job;
}

export default async function DashboardPage() {
  const [serviceTypeCount, planCount, teamCount, recentPlans, latestSync] =
    await Promise.all([
      countServiceTypes(),
      countPlans(),
      countTeams(),
      getRecentPlans(10),
      getLatestSync(),
    ]);

  const hasData = serviceTypeCount > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Overview of your Planning Center Services data.
        </p>
      </div>

      {!hasData && (
        <div className="rounded-xl border border-dashed border-warning bg-yellow-50 p-6 dark:bg-yellow-900/10">
          <h2 className="font-semibold text-warning">No data synced yet</h2>
          <p className="mt-1 text-sm text-muted">
            Run an initial sync to populate the dashboard. From your terminal:
          </p>
          <pre className="mt-3 rounded-lg bg-card p-3 text-xs font-mono">
            curl -X POST http://localhost:3000/api/pco/sync/all
          </pre>
          <p className="mt-2 text-xs text-muted">
            This syncs service types, teams, and plans in order.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Service Types" value={serviceTypeCount} />
        <StatsCard label="Teams" value={teamCount} />
        <StatsCard label="Plans" value={planCount} />
        <StatsCard
          label="Last Sync"
          value={latestSync ? formatDate(latestSync.finishedAt) : "Never"}
          sublabel={
            latestSync
              ? `${latestSync.jobType} — ${latestSync.itemsSynced} items`
              : "Run a sync to get started"
          }
        />
      </div>

      <RecentPlansList plans={recentPlans} />
    </div>
  );
}
