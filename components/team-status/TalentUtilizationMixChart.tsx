"use client";

import { useMemo } from "react";
import { ResponsivePie } from "@nivo/pie";
import type { TeamMemberRow } from "@/lib/team-status/getWorshipTeamStatus";

interface TalentUtilizationMixChartProps {
  members: TeamMemberRow[];
}

function ChartTooltip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        <span className="font-semibold">{label}</span>
        <span className="tabular-nums text-muted">{value} assignments</span>
      </div>
    </div>
  );
}

export function TalentUtilizationMixChart({ members }: TalentUtilizationMixChartProps) {
  const data = useMemo(() => {
    let singleUsage = 0;
    let multiUsage = 0;
    for (const m of members) {
      if (m.isMultiRole) {
        multiUsage += m.scheduledCount;
      } else {
        singleUsage += m.scheduledCount;
      }
    }
    return [
      { id: "Single Role", label: "Single Role", value: singleUsage, color: "hsl(220, 70%, 55%)" },
      { id: "Multi-Talented", label: "Multi-Talented", value: multiUsage, color: "hsl(330, 65%, 55%)" },
    ].filter((d) => d.value > 0);
  }, [members]);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        No data available
      </div>
    );
  }

  const multiUsage = data.find((d) => d.id === "Multi-Talented")?.value ?? 0;
  const multiPct = Math.round((multiUsage / total) * 100);

  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0" style={{ width: 110, height: 110 }}>
        <ResponsivePie
          data={data}
          innerRadius={0.62}
          padAngle={2}
          cornerRadius={3}
          activeOuterRadiusOffset={2}
          colors={{ datum: "data.color" }}
          enableArcLinkLabels={false}
          enableArcLabels={false}
          margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
          tooltip={({ datum }) => (
            <ChartTooltip label={datum.label as string} value={datum.value} color={datum.color} />
          )}
          animate
          motionConfig="gentle"
        />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold tabular-nums leading-none">{multiPct}%</span>
          <span className="text-[9px] text-muted">Multi</span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 text-xs">
        {data.map((d) => (
          <div key={d.id} className="flex items-center gap-1.5">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
            <span className="text-muted">{d.label}</span>
            <span className="tabular-nums font-medium">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
