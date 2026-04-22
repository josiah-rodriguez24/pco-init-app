export type Tier = "A" | "B" | "C" | "D";

export interface TierConfig {
  label: string;
  description: string;
  minCount: number;
}

/**
 * Tier thresholds based on total times scheduled.
 * Ordered from highest to lowest so the first match wins.
 *
 * These are intentionally easy to tweak in one place and will eventually
 * be replaced by a DB-backed manual assignment system.
 */
export const TIER_THRESHOLDS: readonly { tier: Tier; minCount: number }[] = [
  { tier: "A", minCount: 10 },
  { tier: "B", minCount: 5 },
  { tier: "C", minCount: 2 },
  { tier: "D", minCount: 0 },
] as const;

export const TIER_META: Record<Tier, TierConfig> = {
  A: { label: "A Tier", description: "Very Skilled", minCount: 10 },
  B: { label: "B Tier", description: "Skilled", minCount: 5 },
  C: { label: "C Tier", description: "Up & Coming", minCount: 2 },
  D: { label: "D Tier", description: "Beginner", minCount: 0 },
};

export function computeTier(scheduledCount: number): Tier {
  for (const { tier, minCount } of TIER_THRESHOLDS) {
    if (scheduledCount >= minCount) return tier;
  }
  return "D";
}
