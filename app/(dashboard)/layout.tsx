import Link from "next/link";
import { Activity, CalendarDays } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-[var(--gradient-mid)] to-secondary bg-clip-text text-transparent">
              PCO Team Status
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-sm font-medium">
            <Link
              href="/team-status"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
            >
              <Activity className="h-4 w-4" />
              Team Status
            </Link>
            <Link
              href="/smart-scheduler"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
            >
              <CalendarDays className="h-4 w-4" />
              Smart Scheduler
            </Link>
          </nav>
        </div>
      </header>
      <main className="w-full flex-1 px-6 py-8">
        {children}
      </main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted">
        PCO Team Status &middot; Planning Center Services Intelligence
      </footer>
    </div>
  );
}
