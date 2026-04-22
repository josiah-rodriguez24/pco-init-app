import { User, TrendingDown, TrendingUp, Minus } from "lucide-react";

interface ProfileEntry {
  name: string;
  trend: "up" | "down" | "stable";
  frequency: string;
  score: number;
}

const profiles: ProfileEntry[] = [
  { name: "Alex Rivera", trend: "up", frequency: "3x/mo", score: 92 },
  { name: "Jordan Kim", trend: "down", frequency: "5x/mo", score: 64 },
  { name: "Sam Patel", trend: "down", frequency: "6x/mo", score: 42 },
  { name: "Casey Brooks", trend: "stable", frequency: "2x/mo", score: 88 },
];

const trendIcon: Record<string, typeof TrendingUp> = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

const trendColor: Record<string, string> = {
  up: "text-success",
  down: "text-danger",
  stable: "text-muted",
};

export function ProfilerPanel() {
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-sm">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
        Profiler
      </h3>
      <ul className="space-y-3">
        {profiles.map((p) => {
          const TrendIcon = trendIcon[p.trend];
          return (
            <li key={p.name} className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface">
                <User className="h-4 w-4 text-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted">{p.frequency}</p>
              </div>
              <TrendIcon className={`h-4 w-4 ${trendColor[p.trend]}`} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
