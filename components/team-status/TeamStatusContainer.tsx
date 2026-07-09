"use client";

import { useState, useMemo, type ReactNode } from "react";
import { X } from "lucide-react";
import { SankeyChart } from "./SankeyChart";
import { StatusDataGrid } from "./StatusDataGrid";
import { SkillBreadthChart } from "./SkillBreadthChart";
import { TierHealthChart } from "./TierHealthChart";
import { MultiTalentOverlapChart } from "./MultiTalentOverlapChart";
import { DevelopingJoinTrendChart } from "./DevelopingJoinTrendChart";
import { SingleTalentRecencyChart } from "./SingleTalentRecencyChart";
import { TalentUtilizationMixChart } from "./TalentUtilizationMixChart";
import type { TeamStatusData } from "@/lib/team-status/getWorshipTeamStatus";
import { filterMembersByNode } from "@/lib/team-status/filterMembers";

interface TeamStatusContainerProps {
  data: TeamStatusData;
}

export function TeamStatusContainer({ data }: TeamStatusContainerProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  function handleNodeClick(nodeId: string) {
    setActiveFilter((prev) => (prev === nodeId ? null : nodeId));
  }

  function handleLinkClick(_source: string, target: string) {
    setActiveFilter((prev) => (prev === target ? null : target));
  }

  const filteredMembers = useMemo(
    () => filterMembersByNode(data.members, activeFilter),
    [data.members, activeFilter]
  );

  const multiRoleCount = data.members.filter((m) => m.isMultiRole).length;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Row 1: Sankey (dominant) + donut stack (compact sidebar) ── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Sankey — hero chart, gets 8 of 12 columns */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-sm xl:col-span-8">
          <div className="mb-3 text-center">
            <h2 className="text-xl font-semibold sm:text-2xl">
              Worship Team Breakdown
            </h2>
            <p className="mt-1 text-sm text-muted">
              Click any section to filter the charts &amp; table.
            </p>
            {activeFilter && activeFilter !== "Worship Team" && (
              <button
                type="button"
                onClick={() => setActiveFilter(null)}
                className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20 cursor-pointer"
              >
                Filtered: {activeFilter}
                <X className="h-3 w-3" aria-hidden />
              </button>
            )}
            {multiRoleCount > 0 && (
              <p className="mt-1 text-xs text-muted/70">
                Counts show skill memberships &mdash; {multiRoleCount} multi-role{" "}
                {multiRoleCount === 1 ? "person appears" : "people appear"} in
                more than one branch.
              </p>
            )}
          </div>
          <SankeyChart
            nodes={data.sankeyNodes}
            links={data.sankeyLinks}
            onNodeClick={handleNodeClick}
            onLinkClick={handleLinkClick}
          />
        </div>

        {/* Donut stack — three compact donuts stacked vertically */}
        <div className="flex flex-col gap-3 xl:col-span-4">
          <ChartCard title="Skill Breadth" subtitle="Single vs multi-talented">
            <SkillBreadthChart members={filteredMembers} />
          </ChartCard>

          <ChartCard title="Team Development" subtitle="Tier distribution">
            <TierHealthChart members={filteredMembers} />
          </ChartCard>

          <ChartCard title="Utilization Mix" subtitle="Usage by talent type">
            <TalentUtilizationMixChart members={filteredMembers} />
          </ChartCard>
        </div>
      </div>

      {/* ── Row 2: Detail charts (bar + line + bar) ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Multi-Talent Overlap"
          subtitle="Talents covered by multi-skilled members"
        >
          <MultiTalentOverlapChart members={filteredMembers} />
        </ChartCard>

        <ChartCard
          title="Developing Members"
          subtitle="Join timeline & schedule frequency"
        >
          <DevelopingJoinTrendChart members={filteredMembers} />
        </ChartCard>

        <ChartCard
          title="Single-Talent Recency"
          subtitle="Least-recently scheduled single-role members"
        >
          <SingleTalentRecencyChart members={filteredMembers} />
        </ChartCard>
      </div>

      {/* ── Data table ── */}
      <StatusDataGrid
        data={data.members}
        activeFilter={activeFilter}
        onClearFilter={() => setActiveFilter(null)}
      />
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card/80 px-4 py-3 backdrop-blur-sm">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold leading-tight">{title}</h3>
        <span className="shrink-0 text-[11px] text-muted">{subtitle}</span>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
