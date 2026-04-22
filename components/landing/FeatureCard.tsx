"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  gradient: string;
  index: number;
}

export function FeatureCard({
  title,
  description,
  href,
  icon: Icon,
  gradient,
  index,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
    >
      <Link
        href={href}
        className="group relative block cursor-pointer overflow-hidden rounded-2xl border border-border bg-card/80 p-8 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      >
        <div
          className={`mb-6 inline-flex rounded-xl p-3 ${gradient}`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="mb-2 text-xl font-semibold tracking-tight">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-muted">
          {description}
        </p>
        <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary transition-colors group-hover:text-primary/80">
          Explore
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </Link>
    </motion.div>
  );
}
