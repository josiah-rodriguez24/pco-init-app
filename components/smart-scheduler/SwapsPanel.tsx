import { ArrowRightLeft } from "lucide-react";

interface Swap {
  from: string;
  to: string;
  reason: string;
  date: string;
}

const recommendedSwaps: Swap[] = [
  { from: "Sam Patel", to: "Drew Chen", reason: "Fatigue relief", date: "Apr 26" },
  { from: "Riley Nguyen", to: "Casey Brooks", reason: "Overcommitted", date: "Apr 26" },
  { from: "Jordan Kim", to: "Taylor Swift", reason: "Balance rotation", date: "May 3" },
];

export function SwapsPanel() {
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-sm">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
        Recommended Swaps
      </h3>
      <ul className="space-y-3">
        {recommendedSwaps.map((swap, i) => (
          <li key={i} className="rounded-xl bg-surface/50 p-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-danger">{swap.from}</span>
              <ArrowRightLeft className="h-3.5 w-3.5 text-muted" />
              <span className="font-medium text-success">{swap.to}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-muted">
              <span>{swap.reason}</span>
              <span>{swap.date}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
