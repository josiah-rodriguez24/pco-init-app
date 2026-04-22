import { CalendarDays } from "lucide-react";
import { SchedulerCalendar } from "@/components/smart-scheduler/SchedulerCalendar";
import { ProfilerPanel } from "@/components/smart-scheduler/ProfilerPanel";
import { SwapsPanel } from "@/components/smart-scheduler/SwapsPanel";
import { TeamRosterPanel } from "@/components/smart-scheduler/TeamRosterPanel";

export default function SmartSchedulerPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-secondary to-primary p-2.5">
            <CalendarDays className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Smart Scheduler</h1>
            <p className="text-sm text-muted">
              Plan services, balance your roster, and keep your teams healthy.
            </p>
          </div>
        </div>
      </div>

      {/* Main layout: calendar + sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Calendar — dominant area */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-sm">
          <SchedulerCalendar />
        </div>

        {/* Sidebar panels */}
        <div className="space-y-6">
          <ProfilerPanel />
          <SwapsPanel />
        </div>
      </div>

      {/* Team rosters — full width beneath */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Team Rosters</h2>
        <TeamRosterPanel />
      </div>
    </div>
  );
}
