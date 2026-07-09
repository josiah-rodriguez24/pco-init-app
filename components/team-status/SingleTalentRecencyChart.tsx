"use client";

import { useMemo } from "react";
import { ResponsiveBar } from "@nivo/bar";
import type { TeamMemberRow } from "@/lib/team-status/getWorshipTeamStatus";

interface SingleTalentRecencyChartProps {
  members: TeamMemberRow[];
}

const MAX_BARS = 10;

function daysSince(isoDate: string | null, nowMs: number): number {
  if (!isoDate) return Infinity;
  const diff = nowMs - new Date(isoDate).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function barColor(days: number): string {
  if (days > 180) return "hsl(0, 65%, 55%)";
  if (days > 90) return "hsl(38, 90%, 55%)";
  return "hsl(152, 60%, 42%)";
}

function BarTooltip({ name, days }: { name: string; days: number }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold">{name}</p>
      <p className="text-xs text-muted">
        {days === Infinity ? "Never scheduled" : `${days} days since last served`}
      </p>
    </div>
  );
}

export function SingleTalentRecencyChart({ members }: SingleTalentRecencyChartProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  const { data, hasMore, singleCount } = useMemo(() => {
    const singles = members.filter((m) => !m.isMultiRole);
    const enriched = singles.map((m) => ({
      personKey: m.personKey,
      name: m.personName.split(" ").slice(0, 2).join(" "),
      fullName: m.personName,
      days: daysSince(m.lastServedDate, todayMs),
    }));

    enriched.sort((a, b) => b.days - a.days);

    const truncated = enriched.length > MAX_BARS;
    const visible = enriched.slice(0, MAX_BARS);

    return {
      data: visible.map((v) => ({
        personKey: v.personKey,
        name: v.name,
        fullName: v.fullName,
        days: v.days === Infinity ? 999 : v.days,
        displayDays: v.days,
        color: barColor(v.days),
      })),
      hasMore: truncated,
      singleCount: singles.length,
    };
  }, [members, todayMs]);

  if (singleCount === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        No single-role members
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1" style={{ minHeight: Math.min(data.length * 26 + 16, 240) }}>
        <ResponsiveBar
          data={data}
          keys={["days"]}
          indexBy="personKey"
          layout="horizontal"
          margin={{ top: 2, right: 36, bottom: 2, left: 90 }}
          padding={0.25}
          colors={({ data: d }) => d.color as string}
          borderRadius={3}
          enableGridX={false}
          enableGridY={false}
          axisTop={null}
          axisRight={null}
          axisBottom={null}
          axisLeft={{
            tickSize: 0,
            tickPadding: 8,
            format: (value) =>
              data.find((d) => d.personKey === value)?.name ?? String(value),
          }}
          label={({ data: d }) =>
            (d.displayDays as number) === Infinity ? "N/A" : `${d.displayDays}d`
          }
          labelSkipWidth={24}
          labelTextColor="#fff"
          tooltip={({ data: d }) => (
            <BarTooltip name={d.fullName as string} days={d.displayDays as number} />
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
      <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: "hsl(0, 65%, 55%)" }} />
          <span className="text-muted">&gt; 180 days</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: "hsl(38, 90%, 55%)" }} />
          <span className="text-muted">91-180 days</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: "hsl(152, 60%, 42%)" }} />
          <span className="text-muted">&le; 90 days</span>
        </div>
      </div>
      {hasMore && (
        <p className="mt-1 text-center text-[10px] text-muted/70">
          Showing top {MAX_BARS} of {singleCount} single-role members
        </p>
      )}
    </div>
  );
}
