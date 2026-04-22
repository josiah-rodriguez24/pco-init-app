"use client";

import { useState } from "react";
import { SankeyChart } from "./SankeyChart";
import { StatusDataGrid } from "./StatusDataGrid";
import type { TeamStatusData } from "@/lib/team-status/getWorshipTeamStatus";

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

  const multiRoleCount = data.members.filter((m) => m.isMultiRole).length;

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-sm">
        <div className="mb-4 text-center">
          <h2 className="text-xl font-semibold sm:text-2xl">
            Worship Team Breakdown
          </h2>
          <p className="mt-1 text-sm text-muted">
            Click any section to filter the table below.
          </p>
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

      <StatusDataGrid
        data={data.members}
        activeFilter={activeFilter}
        onClearFilter={() => setActiveFilter(null)}
      />
    </>
  );
}
