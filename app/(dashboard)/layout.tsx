import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            PCO Dashboard
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link
              href="/"
              className="text-muted transition-colors hover:text-foreground"
            >
              Home
            </Link>
            <Link
              href="/plans"
              className="text-muted transition-colors hover:text-foreground"
            >
              Plans
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {children}
      </main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted">
        PCO Dashboard &middot; Data synced from Planning Center
      </footer>
    </div>
  );
}
