"use client";

import { useMemo } from "react";
import { ResponsiveBar } from "@nivo/bar";
import type { TeamMemberRow } from "@/lib/team-status/getWorshipTeamStatus";
import { getRoleLabel, ROLE_DEFINITIONS } from "@/lib/team-status/roleTaxonomy";

interface MultiTalentOverlapChartProps {
  members: TeamMemberRow[];
}

const OVERLAP_COLOR = "hsl(280, 55%, 55%)";

function BarTooltip({ label, pct, count }: { label: string; pct: number; count: number }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold">{label}</p>
      <p className="text-xs text-muted">
        {pct}% of multi-talented ({count} {count === 1 ? "person" : "people"})
      </p>
    </div>
  );
}

export function MultiTalentOverlapChart({ members }: MultiTalentOverlapChartProps) {
  const { data, multiCount } = useMemo(() => {
    const multi = members.filter((m) => m.isMultiRole);
    const total = multi.length;
    if (total === 0) return { data: [], multiCount: 0 };

    const sankeyTags = new Set(
      ROLE_DEFINITIONS.filter((r) => r.isSankeyNode).map((r) => r.tag)
    );

    const tagCounts = new Map<string, number>();
    for (const m of multi) {
      for (const tag of m.roleTags) {
        if (sankeyTags.has(tag)) {
          tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
        }
      }
    }

    const rows = [...tagCounts.entries()]
      .map(([tag, count]) => ({
        tag,
        label: getRoleLabel(tag),
        count,
        pct: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    return { data: rows, multiCount: total };
  }, [members]);

  if (multiCount === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        No multi-talented members
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <p className="mb-1.5 text-center text-xs text-muted">
        {multiCount} multi-talented {multiCount === 1 ? "person" : "people"}
      </p>
      <div className="flex-1" style={{ minHeight: Math.max(120, data.length * 26 + 16) }}>
        <ResponsiveBar
          data={data}
          keys={["pct"]}
          indexBy="label"
          layout="horizontal"
          margin={{ top: 2, right: 36, bottom: 2, left: 90 }}
          padding={0.25}
          colors={OVERLAP_COLOR}
          borderRadius={3}
          enableGridX={false}
          enableGridY={false}
          axisTop={null}
          axisRight={null}
          axisBottom={null}
          axisLeft={{ tickSize: 0, tickPadding: 8 }}
          label={(d) => `${d.value}%`}
          labelSkipWidth={20}
          labelTextColor="#fff"
          tooltip={({ data: d }) => (
            <BarTooltip
              label={d.label as string}
              pct={d.pct as number}
              count={d.count as number}
            />
          )}
          animate
          motionConfig="gentle"
          theme={{
            text: { fontSize: 11 },
            axis: {
              ticks: {
                text: { fill: "hsl(220, 10%, 50%)", fontSize: 11 },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
