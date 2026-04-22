import { Users } from "lucide-react";

interface TeamGroup {
  tier: "A" | "B" | "C";
  label: string;
  description: string;
  members: string[];
  color: string;
}

const teams: TeamGroup[] = [
  {
    tier: "A",
    label: "A Team",
    description: "Primary — high availability & experience",
    members: ["Alex Rivera", "Casey Brooks", "Drew Chen"],
    color: "border-l-primary",
  },
  {
    tier: "B",
    label: "B Team",
    description: "Rotation — regular contributors",
    members: ["Jordan Kim", "Morgan Lee", "Taylor Swift"],
    color: "border-l-secondary",
  },
  {
    tier: "C",
    label: "C Team",
    description: "Reserve — developing or limited availability",
    members: ["Sam Patel", "Riley Nguyen"],
    color: "border-l-accent",
  },
];

export function TeamRosterPanel() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <div
          key={team.tier}
          className={`rounded-2xl border border-border border-l-4 bg-card/80 p-5 backdrop-blur-sm ${team.color}`}
        >
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-muted" />
            <h3 className="text-sm font-semibold">{team.label}</h3>
          </div>
          <p className="mb-3 text-xs text-muted">{team.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {team.members.map((m) => (
              <span
                key={m}
                className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
