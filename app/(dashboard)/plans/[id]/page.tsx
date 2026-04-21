import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPlanById } from "@/lib/repositories/plansRepo";
import { formatDate, formatDuration } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PlanDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlanDetailPage({ params }: PlanDetailPageProps) {
  const { id } = await params;
  const plan = await getPlanById(id);

  if (!plan) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted">
        <Link href="/plans" className="hover:text-foreground">
          Plans
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">
          {plan.title || plan.dates || "Plan Detail"}
        </span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {plan.title || plan.dates || "Untitled Plan"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {plan.serviceType.name} &middot; {formatDate(plan.sortDate)}
            {plan.planningCenterUrl && (
              <>
                {" "}&middot;{" "}
                <a
                  href={plan.planningCenterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View in PCO
                </a>
              </>
            )}
          </p>
        </div>
        {plan.status && (
          <Badge
            variant={plan.status === "confirmed" ? "success" : "default"}
          >
            {plan.status}
          </Badge>
        )}
      </div>

      {/* Meta row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-medium uppercase text-muted">Dates</p>
          <p className="mt-1 font-medium">{plan.dates ?? "—"}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-muted">Series</p>
          <p className="mt-1 font-medium">{plan.seriesTitle ?? "—"}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-muted">
            Total Length
          </p>
          <p className="mt-1 font-medium">
            {formatDuration(plan.totalLength)}
          </p>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader
          title="Items"
          description="Songs, media, and other items in this plan"
        />
        {plan.items.length === 0 ? (
          <EmptyState title="No items" description="This plan has no items synced yet." />
        ) : (
          <div className="-mx-6 -mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted">
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {plan.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-3 text-muted">
                      {item.sequence ?? "—"}
                    </td>
                    <td className="px-6 py-3 font-medium">{item.title}</td>
                    <td className="px-6 py-3">
                      <Badge>{item.itemType ?? "item"}</Badge>
                    </td>
                    <td className="px-6 py-3 text-muted">
                      {formatDuration(item.length)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* People */}
      <Card>
        <CardHeader
          title="Team Members"
          description="People assigned to this plan"
        />
        {plan.people.length === 0 ? (
          <EmptyState
            title="No team members"
            description="No people have been synced for this plan yet."
          />
        ) : (
          <div className="-mx-6 -mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Position</th>
                  <th className="px-6 py-3">Team</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {plan.people.map((person) => (
                  <tr key={person.id}>
                    <td className="px-6 py-3 font-medium">
                      {person.personName}
                    </td>
                    <td className="px-6 py-3 text-muted">
                      {person.position ?? "—"}
                    </td>
                    <td className="px-6 py-3 text-muted">
                      {person.teamName ?? "—"}
                    </td>
                    <td className="px-6 py-3">
                      <Badge
                        variant={
                          person.status === "C"
                            ? "success"
                            : person.status === "D"
                              ? "danger"
                              : "default"
                        }
                      >
                        {person.status ?? "—"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
