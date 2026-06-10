/**
 * Aggregation service (spec §5 "fast aggregation", §13).
 *
 * Pure functions over already-fetched entries — no DB, no I/O. They turn a flat
 * list of activity entries into the shapes the dashboard renders: monthly total,
 * per-category breakdown, trend series, and month-over-month delta.
 */
import type {
  CategoryBreakdown,
  CategoryKey,
  TrendPoint,
} from '@/lib/types';

export interface AggregatableEntry {
  categoryKey: CategoryKey;
  activityKey: string;
  co2eKg: number;
  occurredOn: Date | string;
}

/** ISO month key, e.g. "2026-06". */
export function monthKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const y = d.getUTCFullYear();
  const m = `${d.getUTCMonth() + 1}`.padStart(2, '0');
  return `${y}-${m}`;
}

/** ISO day key (UTC), e.g. "2026-06-09". */
export function dayKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const m = `${d.getUTCMonth() + 1}`.padStart(2, '0');
  const day = `${d.getUTCDate()}`.padStart(2, '0');
  return `${d.getUTCFullYear()}-${m}-${day}`;
}

/**
 * Consecutive days (UTC) with at least one logged activity, ending today — with a
 * one-day grace: if nothing is logged yet today but yesterday is, the streak
 * still counts from yesterday. Returns 0 if neither today nor yesterday logged.
 */
export function currentStreak(
  entries: AggregatableEntry[],
  referenceDate: Date = new Date()
): number {
  if (entries.length === 0) return 0;
  const days = new Set(entries.map((e) => dayKey(e.occurredOn)));

  const cursor = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate()
    )
  );

  // Grace: start at today, or fall back to yesterday if today isn't logged yet.
  if (!days.has(dayKey(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (!days.has(dayKey(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

/** Entries that occurred in the given ISO month. */
export function filterByMonth(
  entries: AggregatableEntry[],
  month: string
): AggregatableEntry[] {
  return entries.filter((e) => monthKey(e.occurredOn) === month);
}

/** Sum of co2eKg across entries. */
export function totalKg(entries: AggregatableEntry[]): number {
  return round1(entries.reduce((sum, e) => sum + e.co2eKg, 0));
}

/** Per-category CO₂e totals. */
export function breakdownByCategory(
  entries: AggregatableEntry[]
): CategoryBreakdown {
  const out: CategoryBreakdown = {};
  for (const e of entries) {
    out[e.categoryKey] = round1((out[e.categoryKey] ?? 0) + e.co2eKg);
  }
  return out;
}

/** The category contributing the most CO₂e, or null when there are no entries. */
export function topCategory(entries: AggregatableEntry[]): CategoryKey | null {
  const breakdown = breakdownByCategory(entries);
  let top: CategoryKey | null = null;
  let max = -Infinity;
  for (const [key, kg] of Object.entries(breakdown) as [
    CategoryKey,
    number,
  ][]) {
    if (kg > max) {
      max = kg;
      top = key;
    }
  }
  return top;
}

/** The single activity (activityKey) contributing the most CO₂e, or null. */
export function topActivityKey(entries: AggregatableEntry[]): string | null {
  const totals = new Map<string, number>();
  for (const e of entries) {
    totals.set(e.activityKey, (totals.get(e.activityKey) ?? 0) + e.co2eKg);
  }
  let top: string | null = null;
  let max = -Infinity;
  for (const [key, kg] of totals) {
    if (kg > max) {
      max = kg;
      top = key;
    }
  }
  return top;
}

/**
 * Trend series for the trailing `months` calendar months ending at
 * `referenceDate` (inclusive). Months with no entries are filled with 0 so the
 * chart has a continuous x-axis.
 */
export function trendSeries(
  entries: AggregatableEntry[],
  months: number,
  referenceDate: Date = new Date()
): TrendPoint[] {
  const keys: string[] = [];
  const base = new Date(
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), 1)
  );
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setUTCMonth(d.getUTCMonth() - i);
    keys.push(monthKey(d));
  }
  const byMonth = new Map<string, number>();
  for (const e of entries) {
    const k = monthKey(e.occurredOn);
    byMonth.set(k, (byMonth.get(k) ?? 0) + e.co2eKg);
  }
  return keys.map((month) => ({
    month,
    co2eKg: round1(byMonth.get(month) ?? 0),
  }));
}

export interface MonthDelta {
  currentKg: number;
  previousKg: number;
  /** currentKg - previousKg. Negative = improvement (less emitted). */
  deltaKg: number;
  /** Percent change vs previous month; null when previous month was 0. */
  deltaPct: number | null;
}

/** Month-over-month comparison for the StatCard delta arrow (spec §8). */
export function monthOverMonthDelta(
  entries: AggregatableEntry[],
  referenceDate: Date = new Date()
): MonthDelta {
  const current = monthKey(referenceDate);
  const prevDate = new Date(
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() - 1, 1)
  );
  const previous = monthKey(prevDate);

  const currentKg = totalKg(filterByMonth(entries, current));
  const previousKg = totalKg(filterByMonth(entries, previous));
  const deltaKg = round1(currentKg - previousKg);
  const deltaPct =
    previousKg === 0 ? null : round1((deltaKg / previousKg) * 100);

  return { currentKg, previousKg, deltaKg, deltaPct };
}

/** Round to one decimal place (kg). Shared by the aggregation + footprint services. */
export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
