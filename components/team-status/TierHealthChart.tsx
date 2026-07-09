"use client";

import { useMemo } from "react";
import { ResponsivePie } from "@nivo/pie";
import type { TeamMemberRow } from "@/lib/team-status/getWorshipTeamStatus";
import type { FriendlyTierGroup } from "@/lib/team-status/tiers";

interface TierHealthChartProps {
  members: TeamMemberRow[];
}

const TIER_ORDER: FriendlyTierGroup[] = ["Very Skilled", "Skilled", "Developing"];

const TIER_COLORS: Record<FriendlyTierGroup, string> = {
  "Very Skilled": "hsl(152, 60%, 42%)",
  Skilled: "hsl(220, 70%, 55%)",
  Developing: "hsl(38, 90%, 55%)",
};

function ChartTooltip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        <span className="font-semibold">{label}</span>
        <span className="tabular-nums text-muted">{value}</span>
      </div>
    </div>
  );
}

export function TierHealthChart({ members }: TierHealthChartProps) {
  const data = useMemo(() => {
    const counts: Record<FriendlyTierGroup, number> = {
      "Very Skilled": 0,
      Skilled: 0,
      Developing: 0,
    };
    for (const m of members) {
      counts[m.friendlyTier]++;
    }
    return TIER_ORDER.map((tier) => ({
      id: tier,
      label: tier,
      value: counts[tier],
      color: TIER_COLORS[tier],
    })).filter((d) => d.value > 0);
  }, [members]);

  const total = members.length;

  if (total === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        No data available
      </div>
    );
  }

  const developing = data.find((d) => d.id === "Developing")?.value ?? 0;
  const devPct = Math.round((developing / total) * 100);

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
          <span className="text-lg font-bold tabular-nums leading-none">{total}</span>
          <span className="text-[9px] text-muted">{devPct}% Dev</span>
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
