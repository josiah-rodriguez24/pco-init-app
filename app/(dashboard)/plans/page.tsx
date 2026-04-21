import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { listPlans } from "@/lib/repositories/plansRepo";
import { listServiceTypes } from "@/lib/repositories/serviceTypesRepo";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PlansPageProps {
  searchParams: Promise<{ serviceType?: string; page?: string }>;
}

const PAGE_SIZE = 25;

export default async function PlansPage({ searchParams }: PlansPageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10));
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [{ plans, total }, serviceTypes] = await Promise.all([
    listPlans({
      serviceTypeId: params.serviceType,
      limit: PAGE_SIZE,
      offset,
    }),
    listServiceTypes(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Plans</h1>
        <p className="mt-1 text-sm text-muted">
          All synced plans from Planning Center Services.
        </p>
      </div>

      {/* Filter by service type */}
      {serviceTypes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/plans"
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              !params.serviceType
                ? "bg-primary text-primary-foreground"
                : "bg-gray-100 text-muted hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            }`}
          >
            All
          </Link>
          {serviceTypes.map((st) => (
            <Link
              key={st.id}
              href={`/plans?serviceType=${st.id}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                params.serviceType === st.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-100 text-muted hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
              }`}
            >
              {st.name}
            </Link>
          ))}
        </div>
      )}

      {plans.length === 0 ? (
        <EmptyState
          title="No plans found"
          description={
            params.serviceType
              ? "No plans match this filter. Try a different service type."
              : "Sync plans from Planning Center to see them here."
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="-m-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted">
                  <th className="px-6 py-3">Plan</th>
                  <th className="px-6 py-3">Service Type</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Series</th>
                  <th className="px-6 py-3">Timing</th>
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
                      {plan.serviceType.name}
                    </td>
                    <td className="px-6 py-4 text-muted">
                      {formatDate(plan.sortDate)}
                    </td>
                    <td className="px-6 py-4 text-muted">
                      {plan.seriesTitle ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      {plan.sortDate && new Date(plan.sortDate) > new Date() ? (
                        <Badge variant="info">upcoming</Badge>
                      ) : plan.sortDate ? (
                        <Badge variant="default">past</Badge>
                      ) : (
                        <Badge variant="warning">no date</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted">
            Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of{" "}
            {total} plans
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={`/plans?page=${currentPage - 1}${
                  params.serviceType
                    ? `&serviceType=${params.serviceType}`
                    : ""
                }`}
                className="rounded-lg border border-border px-3 py-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Previous
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={`/plans?page=${currentPage + 1}${
                  params.serviceType
                    ? `&serviceType=${params.serviceType}`
                    : ""
                }`}
                className="rounded-lg border border-border px-3 py-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
