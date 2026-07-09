"use client";

import { useMemo } from "react";
import { ResponsiveLine } from "@nivo/line";
import type { TeamMemberRow } from "@/lib/team-status/getWorshipTeamStatus";

interface DevelopingJoinTrendChartProps {
  members: TeamMemberRow[];
}

const BRAND_NEW_DAYS = 90;

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function DevelopingJoinTrendChart({ members }: DevelopingJoinTrendChartProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  const { lineData, brandNew, avgScheduled, devCount } = useMemo(() => {
    const devMembers = members.filter((m) => m.friendlyTier === "Developing");
    const cutoff = todayMs - BRAND_NEW_DAYS * 24 * 60 * 60 * 1000;

    const withJoin = devMembers.filter((m) => m.joinedAt);
    const brandNewMembers = withJoin.filter(
      (m) => new Date(m.joinedAt!).getTime() >= cutoff
    );

    const buckets = new Map<string, number>();
    for (const m of withJoin) {
      const key = monthKey(new Date(m.joinedAt!));
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }

    const sorted = [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b));
    const points = sorted.reduce<{ x: string; y: number }[]>((acc, [key, count]) => {
      const prev = acc.length > 0 ? acc[acc.length - 1].y : 0;
      acc.push({ x: monthLabel(key), y: prev + count });
      return acc;
    }, []);

    const totalScheduled = devMembers.reduce((s, m) => s + m.scheduledCount, 0);

    return {
      lineData: [{ id: "Developing", data: points }],
      brandNew: brandNewMembers.length,
      avgScheduled: devMembers.length > 0 ? Math.round(totalScheduled / devMembers.length) : 0,
      devCount: devMembers.length,
    };
  }, [members, todayMs]);

  if (devCount === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        No developing members
      </div>
    );
  }

  const hasPoints = lineData[0].data.length > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex justify-center gap-4 text-xs">
        <div className="flex flex-col items-center">
          <span className="text-base font-bold tabular-nums">{brandNew}</span>
          <span className="text-[10px] text-muted">New (&le;{BRAND_NEW_DAYS}d)</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-base font-bold tabular-nums">{devCount}</span>
          <span className="text-[10px] text-muted">Developing</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-base font-bold tabular-nums">{avgScheduled}</span>
          <span className="text-[10px] text-muted">Avg Served</span>
        </div>
      </div>

      {hasPoints ? (
        <div className="flex-1" style={{ minHeight: 140 }}>
          <ResponsiveLine
            data={lineData}
            margin={{ top: 8, right: 16, bottom: 32, left: 36 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: 0, max: "auto" }}
            curve="monotoneX"
            colors={["hsl(38, 90%, 55%)"]}
            lineWidth={2}
            enableArea
            areaOpacity={0.15}
            pointSize={6}
            pointColor={{ theme: "background" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            enableGridX={false}
            axisBottom={{
              tickRotation: -45,
              tickSize: 0,
              tickPadding: 6,
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 6,
              tickValues: 5,
            }}
            useMesh
            tooltip={({ point }) => (
              <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg">
                <span className="font-semibold">{point.data.xFormatted}</span>
                <span className="ml-2 tabular-nums text-muted">
                  {point.data.yFormatted} cumulative
                </span>
              </div>
            )}
            animate
            motionConfig="gentle"
            theme={{
              text: { fontSize: 10 },
              axis: {
                ticks: {
                  text: { fill: "hsl(220, 10%, 50%)", fontSize: 10 },
                },
              },
            }}
          />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-xs text-muted">
          No join date data available
        </div>
      )}
    </div>
  );
}
