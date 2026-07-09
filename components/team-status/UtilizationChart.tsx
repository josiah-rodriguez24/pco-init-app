"use client";

import { useMemo } from "react";
import { ResponsiveBar } from "@nivo/bar";
import type { TeamMemberRow } from "@/lib/team-status/getWorshipTeamStatus";

interface UtilizationChartProps {
  members: TeamMemberRow[];
}

const MAX_BARS = 12;

function daysSince(isoDate: string | null): number {
  if (!isoDate) return Infinity;
  const diff = Date.now() - new Date(isoDate).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function barColor(days: number, hasBlockouts: boolean): string {
  if (hasBlockouts) return "hsl(220, 15%, 65%)";
  if (days > 180) return "hsl(0, 65%, 55%)";
  if (days > 90) return "hsl(38, 90%, 55%)";
  return "hsl(152, 60%, 42%)";
}

function BarTooltip({
  name,
  days,
  count,
  hasBlockouts,
  color,
}: {
  name: string;
  days: number;
  count: number;
  hasBlockouts: boolean;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold">{name}</p>
      <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted">
        <span>
          {days === Infinity ? "Never scheduled" : `${days} days since last served`}
        </span>
        <span>Served {count} time{count !== 1 ? "s" : ""}</span>
        {hasBlockouts && (
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
            Has blockouts on file
          </span>
        )}
      </div>
    </div>
  );
}

export function UtilizationChart({ members }: UtilizationChartProps) {
  const { data, hasMore } = useMemo(() => {
    const enriched = members.map((m) => ({
      name: m.personName.split(" ").slice(0, 2).join(" "),
      fullName: m.personName,
      days: daysSince(m.lastServedDate),
      count: m.scheduledCount,
      hasBlockouts: m.hasBlockouts,
    }));

    enriched.sort((a, b) => b.days - a.days);

    const truncated = enriched.length > MAX_BARS;
    const visible = enriched.slice(0, MAX_BARS);

    return {
      data: visible.map((v) => ({
        name: v.name,
        fullName: v.fullName,
        days: v.days === Infinity ? 999 : v.days,
        displayDays: v.days,
        count: v.count,
        hasBlockouts: v.hasBlockouts ? 1 : 0,
        color: barColor(v.days, v.hasBlockouts),
      })),
      hasMore: truncated,
    };
  }, [members]);

  if (members.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        No data available
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1" style={{ minHeight: 240 }}>
        <ResponsiveBar
          data={data}
          keys={["days"]}
          indexBy="name"
          layout="horizontal"
          margin={{ top: 4, right: 40, bottom: 4, left: 100 }}
          padding={0.3}
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
          }}
          label={({ data: d }) =>
            (d.displayDays as number) === Infinity ? "N/A" : `${d.displayDays}d`
          }
          labelSkipWidth={24}
          labelTextColor="#fff"
          tooltip={({ data: d }) => (
            <BarTooltip
              name={d.fullName as string}
              days={d.displayDays as number}
              count={d.count as number}
              hasBlockouts={d.hasBlockouts === 1}
              color={d.color as string}
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
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: "hsl(220, 15%, 65%)" }} />
          <span className="text-muted">Has blockouts</span>
        </div>
      </div>
      {hasMore && (
        <p className="mt-1 text-center text-[10px] text-muted/70">
          Showing top {MAX_BARS} least-recently scheduled
        </p>
      )}
    </div>
  );
}
