"use client";

import { Activity, CalendarDays, BarChart3, Users, Zap, ShieldCheck } from "lucide-react";
import { HeroBackground } from "@/components/landing/HeroBackground";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { StatPill } from "@/components/landing/StatPill";
import Link from "next/link";

const features = [
  {
    title: "Team Status",
    description:
      "Visualize team workload, burnout risk, and participation flow with a dynamic Sankey diagram and interactive data grid.",
    href: "/team-status",
    icon: Activity,
    gradient: "bg-gradient-to-br from-primary to-[var(--gradient-mid)]",
  },
  {
    title: "Smart Scheduler",
    description:
      "Plan services with an intelligent calendar, recommended swaps, and team profiling to keep your roster balanced.",
    href: "/smart-scheduler",
    icon: CalendarDays,
    gradient: "bg-gradient-to-br from-secondary to-primary",
  },
];

const highlights = [
  {
    title: "Flow Visualization",
    description: "See how people move between teams, roles, and weeks at a glance.",
    icon: BarChart3,
  },
  {
    title: "Team Intelligence",
    description: "A/B/C team classification with automatic balance scoring.",
    icon: Users,
  },
  {
    title: "Smart Swaps",
    description: "AI-recommended substitutions based on availability and fatigue.",
    icon: Zap,
  },
  {
    title: "Health Indicators",
    description: "Track overcommitment, gaps, and burnout signals before they become problems.",
    icon: ShieldCheck,
  },
];

const stats = [
  { label: "Teams Tracked", value: "24+" },
  { label: "Services Planned", value: "1,200" },
  { label: "Health Score", value: "94%" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Minimal nav */}
      <header className="fixed inset-x-0 top-0 z-40">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary via-[var(--gradient-mid)] to-secondary bg-clip-text text-transparent">
            PCO Team Status
          </span>
          <nav className="flex items-center gap-4">
            <Link
              href="/team-status"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              Team Status
            </Link>
            <Link
              href="/smart-scheduler"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden pt-16">
        <HeroBackground />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Planning Center Intelligence
          </div>
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Keep your team{" "}
            <span className="bg-gradient-to-r from-primary via-[var(--gradient-mid)] to-secondary bg-clip-text text-transparent">
              healthy
            </span>{" "}
            and your schedule{" "}
            <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              smart
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            A health dashboard and team planner that surfaces burnout, balances
            workload, and recommends optimal schedules — all powered by your
            Planning Center data.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/team-status"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
            >
              <Activity className="h-4 w-4" />
              View Team Status
            </Link>
            <Link
              href="/smart-scheduler"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 px-6 py-3 text-sm font-semibold backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
              <CalendarDays className="h-4 w-4" />
              Open Scheduler
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-16 flex flex-wrap justify-center gap-4">
            {stats.map((stat, i) => (
              <StatPill key={stat.label} {...stat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="relative mx-auto max-w-5xl px-6 py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Two tools, one mission
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Real-time team visibility and intelligent scheduling, built for
            worship and production teams.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} {...feature} index={i} />
          ))}
        </div>
      </section>

      {/* Highlights grid */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm"
            >
              <item.icon className="mb-4 h-5 w-5 text-primary" />
              <h3 className="mb-1 text-sm font-semibold">{item.title}</h3>
              <p className="text-xs leading-relaxed text-muted">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted">
        PCO Team Status &middot; Planning Center Services Intelligence
      </footer>
    </div>
  );
}
