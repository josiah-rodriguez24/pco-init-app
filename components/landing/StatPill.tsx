"use client";

import { motion } from "motion/react";

interface StatPillProps {
  label: string;
  value: string;
  index: number;
}

export function StatPill({ label, value, index }: StatPillProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
      className="flex flex-col items-center rounded-2xl border border-border bg-card/60 px-8 py-5 backdrop-blur-sm"
    >
      <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        {value}
      </span>
      <span className="mt-1 text-xs font-medium text-muted">{label}</span>
    </motion.div>
  );
}
