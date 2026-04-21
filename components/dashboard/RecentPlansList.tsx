import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

interface PlanRow {
  id: string;
  title: string | null;
  dates: string | null;
  sortDate: Date | null;
  seriesTitle: string | null;
  serviceType: { name: string } | null;
}

interface RecentPlansListProps {
  plans: PlanRow[];
}

export function RecentPlansList({ plans }: RecentPlansListProps) {
  if (plans.length === 0) {
    return (
      <EmptyState
        title="No plans yet"
        description="Sync service types and plans from Planning Center to get started."
      />
    );
  }

  return (
    <Card>
      <CardHeader title="Recent Plans" />
      <div className="-mx-6 -mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted">
              <th className="px-6 py-3">Plan</th>
              <th className="px-6 py-3">Service Type</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Series</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {plans.map((plan) => (
              <tr
                key={plan.id}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="px-6 py-4">
                  <Link
                    href={`/plans/${plan.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {plan.title || plan.dates || "Untitled Plan"}
                  </Link>
                </td>
                <td className="px-6 py-4 text-muted">
                  {plan.serviceType?.name ?? "—"}
                </td>
                <td className="px-6 py-4 text-muted">
                  {formatDate(plan.sortDate)}
                </td>
                <td className="px-6 py-4 text-muted">
                  {plan.seriesTitle ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
