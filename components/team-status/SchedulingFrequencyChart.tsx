"use client";

import { useMemo } from "react";
import { ResponsiveBar } from "@nivo/bar";
import type { TeamMemberRow } from "@/lib/team-status/getWorshipTeamStatus";

interface SchedulingFrequencyChartProps {
  members: TeamMemberRow[];
}

function BarTooltip({ label, avg, median, color }: { label: string; avg: number; median: number; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        <span className="font-semibold">{label}</span>
      </div>
      <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted">
        <span>Avg: {avg} plans</span>
        <span>Median: {median} plans</span>
      </div>
    </div>
  );
}

function computeMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export function SchedulingFrequencyChart({ members }: SchedulingFrequencyChartProps) {
  const data = useMemo(() => {
    const singles = members.filter((m) => !m.isMultiRole);
    const multis = members.filter((m) => m.isMultiRole);

    const singleCounts = singles.map((m) => m.distinctPlanCount);
    const multiCounts = multis.map((m) => m.distinctPlanCount);

    const singleAvg = singleCounts.length > 0
      ? Math.round(singleCounts.reduce((a, b) => a + b, 0) / singleCounts.length)
      : 0;
    const multiAvg = multiCounts.length > 0
      ? Math.round(multiCounts.reduce((a, b) => a + b, 0) / multiCounts.length)
      : 0;

    return [
      {
        group: "Single Role",
        avg: singleAvg,
        median: computeMedian(singleCounts),
        count: singles.length,
        color: "hsl(220, 70%, 55%)",
      },
      {
        group: "Multi-Talented",
        avg: multiAvg,
        median: computeMedian(multiCounts),
        count: multis.length,
        color: "hsl(330, 65%, 55%)",
      },
    ];
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
      <div className="mb-2 flex justify-center gap-6 text-xs">
        {data.map((d) => (
          <div key={d.group} className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
              <span className="text-muted">{d.group}</span>
            </div>
            <span className="text-sm font-bold tabular-nums">{d.avg}</span>
            <span className="text-[10px] text-muted">avg plans ({d.count})</span>
          </div>
        ))}
      </div>
      <div className="flex-1" style={{ minHeight: 120 }}>
        <ResponsiveBar
          data={data}
          keys={["avg", "median"]}
          indexBy="group"
          groupMode="grouped"
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 28, left: 40 }}
          padding={0.3}
          colors={({ id, data: d }) =>
            id === "avg" ? (d.color as string) : `${d.color as string}80`
          }
          borderRadius={3}
          enableGridX={false}
          enableGridY={false}
          axisTop={null}
          axisRight={null}
          axisBottom={{ tickSize: 0, tickPadding: 6 }}
          axisLeft={{ tickSize: 0, tickPadding: 6, tickValues: 4 }}
          label={(d) => `${d.value}`}
          labelSkipHeight={14}
          labelTextColor="#fff"
          tooltip={({ data: d, id, color }) => (
            <BarTooltip
              label={`${d.group} (${id as string})`}
              avg={d.avg as number}
              median={d.median as number}
              color={color}
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
          legends={[
            {
              dataFrom: "keys",
              anchor: "bottom-right",
              direction: "row",
              translateY: 26,
              itemWidth: 70,
              itemHeight: 16,
              symbolSize: 8,
              symbolShape: "circle",
              itemTextColor: "hsl(220, 10%, 50%)",
            },
          ]}
        />
      </div>
    </div>
  );
}
