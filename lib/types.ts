/** Shared domain types for Verda. */

export const CATEGORY_KEYS = [
  'transport',
  'energy',
  'food',
  'shopping',
  'travel',
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export type Difficulty = 'low' | 'medium' | 'high';

/** Per-category CO₂e totals for a period (kg). Keys are category keys. */
export type CategoryBreakdown = Partial<Record<CategoryKey, number>>;

/** A single point on the footprint trend line. */
export interface TrendPoint {
  /** ISO month, e.g. "2026-06". */
  month: string;
  co2eKg: number;
}

/** Context sent to the insight generator (spec §7). */
export interface InsightContext {
  monthlyFootprintKg: number;
  breakdownByCategory: CategoryBreakdown;
  topActivity: string | null;
  userGoalKg: number | null;
  region: string;
}

/** The insight card payload — identical shape from AI or fallback (spec §7). */
export interface InsightResult {
  headline: string;
  action: string;
  estimatedSavingKg: number;
  category: CategoryKey;
  difficulty: Difficulty;
  /** "ai" when produced by Claude, "fallback" when produced by the rule engine. */
  source: 'ai' | 'fallback';
}
