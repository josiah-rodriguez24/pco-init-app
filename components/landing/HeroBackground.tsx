"use client";

import { motion } from "motion/react";

const blobs = [
  {
    className: "bg-primary/30 dark:bg-primary/20",
    size: "w-[600px] h-[600px]",
    position: "-top-32 -left-32",
    delay: 0,
  },
  {
    className: "bg-secondary/25 dark:bg-secondary/15",
    size: "w-[500px] h-[500px]",
    position: "top-1/4 -right-24",
    delay: 2,
  },
  {
    className: "bg-accent/20 dark:bg-accent/10",
    size: "w-[450px] h-[450px]",
    position: "bottom-0 left-1/3",
    delay: 4,
  },
  {
    className: "bg-[var(--gradient-mid)]/20 dark:bg-[var(--gradient-mid)]/10",
    size: "w-[350px] h-[350px]",
    position: "top-1/2 left-12",
    delay: 1,
  },
];

export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl ${blob.size} ${blob.position} ${blob.className}`}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 15, 0],
            scale: [1, 1.08, 0.95, 1],
          }}
          transition={{
            duration: 12 + i * 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            delay: blob.delay,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
    </div>
  );
}
