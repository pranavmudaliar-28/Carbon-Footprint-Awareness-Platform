import { prisma } from '@/lib/db/prisma';
import {
  getAdoptedActionSavingsKg,
  getTotalOffsetKg,
  getUserAggregatableEntries,
} from '@/lib/db/queries';
import {
  breakdownByCategory,
  currentStreak,
  filterByMonth,
  monthKey,
  monthOverMonthDelta,
  round1,
  totalKg,
  trendSeries,
  type MonthDelta,
} from '@/lib/services/aggregate';
import {
  CATEGORY_META,
  NATIONAL_AVG_MONTHLY_KG,
} from '@/lib/constants/categories';
import type { CategoryKey, TrendPoint } from '@/lib/types';

const TREND_MONTHS = 6;

export interface BreakdownSlice {
  category: CategoryKey;
  label: string;
  co2eKg: number;
  colorVar: string;
}

export interface FootprintSummary {
  month: string;
  totalKg: number;
  projectedKg: number;
  activeSavingsKg: number;
  delta: MonthDelta;
  breakdown: BreakdownSlice[];
  trend: TrendPoint[];
  goal: { targetKg: number; month: string } | null;
  baselineKg: number | null;
  nationalAvgKg: number;
  entryCount: number;
  offsetTotalKg: number;
  streakDays: number;
}

/**
 * Build the aggregated dashboard summary for a user. Shared by the
 * /api/footprint route and the dashboard server component so the math lives in
 * exactly one place.
 */
export async function buildFootprintSummary(
  userId: string,
  baselineKg: number | null,
  now: Date = new Date()
): Promise<FootprintSummary> {
  const month = monthKey(now);

  const [entries, adoptedSavingsKg, goal, offsetTotalKg] = await Promise.all([
    getUserAggregatableEntries(userId),
    getAdoptedActionSavingsKg(userId),
    prisma.goal.findUnique({
      where: { userId_month: { userId, month } },
    }),
    getTotalOffsetKg(userId),
  ]);

  const monthEntries = filterByMonth(entries, month);
  const currentTotal = totalKg(monthEntries);
  // Apply full action savings to the display, but cap the actual projected
  // footprint at 0 so it never implies a negative/impossible number.
  const activeSavingsKg = round1(adoptedSavingsKg);
  const projectedKg = round1(Math.max(0, currentTotal - activeSavingsKg));

  const breakdownObj = breakdownByCategory(monthEntries);
  const breakdown: BreakdownSlice[] = (
    Object.entries(breakdownObj) as [CategoryKey, number][]
  )
    .map(([key, co2eKg]) => ({
      category: key,
      label: CATEGORY_META[key].label,
      co2eKg,
      colorVar: CATEGORY_META[key].colorVar,
    }))
    .sort((a, b) => b.co2eKg - a.co2eKg);

  return {
    month,
    totalKg: currentTotal,
    projectedKg,
    activeSavingsKg,
    delta: monthOverMonthDelta(entries, now),
    breakdown,
    trend: trendSeries(entries, TREND_MONTHS, now),
    goal: goal ? { targetKg: goal.targetKg, month: goal.month } : null,
    baselineKg,
    nationalAvgKg: NATIONAL_AVG_MONTHLY_KG,
    entryCount: entries.length,
    offsetTotalKg: round1(offsetTotalKg),
    streakDays: currentStreak(entries, now),
  };
}
