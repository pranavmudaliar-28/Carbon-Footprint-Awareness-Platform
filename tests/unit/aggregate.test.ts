import { describe, expect, it } from 'vitest';

import {
  breakdownByCategory,
  currentStreak,
  filterByMonth,
  monthKey,
  monthOverMonthDelta,
  topActivityKey,
  topCategory,
  totalKg,
  trendSeries,
  type AggregatableEntry,
} from '@/lib/services/aggregate';

const REF = new Date('2026-06-15T00:00:00Z');

const entries: AggregatableEntry[] = [
  { categoryKey: 'transport', activityKey: 'petrol_car_km', co2eKg: 17, occurredOn: '2026-06-02T00:00:00Z' },
  { categoryKey: 'food', activityKey: 'beef_meal', co2eKg: 6, occurredOn: '2026-06-10T00:00:00Z' },
  { categoryKey: 'transport', activityKey: 'public_bus_km', co2eKg: 3, occurredOn: '2026-06-12T00:00:00Z' },
  { categoryKey: 'energy', activityKey: 'grid_electricity_kwh', co2eKg: 10, occurredOn: '2026-05-20T00:00:00Z' },
];

describe('monthKey', () => {
  it('formats YYYY-MM in UTC', () => {
    expect(monthKey('2026-06-02T00:00:00Z')).toBe('2026-06');
    expect(monthKey(new Date('2026-01-31T23:00:00Z'))).toBe('2026-01');
  });
});

describe('filterByMonth + totalKg', () => {
  it('sums only the requested month', () => {
    expect(totalKg(filterByMonth(entries, '2026-06'))).toBe(26);
    expect(totalKg(filterByMonth(entries, '2026-05'))).toBe(10);
  });

  it('totalKg of empty is 0', () => {
    expect(totalKg([])).toBe(0);
  });
});

describe('breakdownByCategory', () => {
  it('groups and sums per category', () => {
    const b = breakdownByCategory(filterByMonth(entries, '2026-06'));
    expect(b).toEqual({ transport: 20, food: 6 });
  });
});

describe('topCategory / topActivityKey', () => {
  it('finds the largest category', () => {
    expect(topCategory(filterByMonth(entries, '2026-06'))).toBe('transport');
  });

  it('finds the largest single activity', () => {
    expect(topActivityKey(filterByMonth(entries, '2026-06'))).toBe(
      'petrol_car_km'
    );
  });

  it('returns null with no entries', () => {
    expect(topCategory([])).toBeNull();
    expect(topActivityKey([])).toBeNull();
  });
});

describe('trendSeries', () => {
  it('returns N months ending at the reference month, zero-filled', () => {
    const series = trendSeries(entries, 6, REF);
    expect(series.map((p) => p.month)).toEqual([
      '2026-01',
      '2026-02',
      '2026-03',
      '2026-04',
      '2026-05',
      '2026-06',
    ]);
    expect(series.find((p) => p.month === '2026-05')?.co2eKg).toBe(10);
    expect(series.find((p) => p.month === '2026-06')?.co2eKg).toBe(26);
    expect(series.find((p) => p.month === '2026-03')?.co2eKg).toBe(0);
  });
});

describe('monthOverMonthDelta', () => {
  it('computes current vs previous month', () => {
    const d = monthOverMonthDelta(entries, REF);
    expect(d.currentKg).toBe(26);
    expect(d.previousKg).toBe(10);
    expect(d.deltaKg).toBe(16);
    expect(d.deltaPct).toBe(160);
  });

  it('returns null deltaPct when previous month is 0', () => {
    const onlyCurrent = entries.filter((e) => monthKey(e.occurredOn) === '2026-06');
    const d = monthOverMonthDelta(onlyCurrent, REF);
    expect(d.previousKg).toBe(0);
    expect(d.deltaPct).toBeNull();
  });
});

describe('currentStreak', () => {
  const TODAY = new Date('2026-06-15T12:00:00Z');
  const onDay = (d: string): AggregatableEntry => ({
    categoryKey: 'transport',
    activityKey: 'petrol_car_km',
    co2eKg: 1,
    occurredOn: `${d}T10:00:00Z`,
  });

  it('counts consecutive days ending today', () => {
    const e = [onDay('2026-06-13'), onDay('2026-06-14'), onDay('2026-06-15')];
    expect(currentStreak(e, TODAY)).toBe(3);
  });

  it('grants a grace day when today is not logged yet but yesterday is', () => {
    const e = [onDay('2026-06-13'), onDay('2026-06-14')]; // no 06-15
    expect(currentStreak(e, TODAY)).toBe(2);
  });

  it('resets at a gap', () => {
    const e = [onDay('2026-06-15'), onDay('2026-06-14'), onDay('2026-06-12')];
    expect(currentStreak(e, TODAY)).toBe(2);
  });

  it('is 0 when neither today nor yesterday is logged', () => {
    expect(currentStreak([onDay('2026-06-13')], TODAY)).toBe(0);
  });

  it('counts a day once regardless of how many entries it has', () => {
    const e = [onDay('2026-06-15'), onDay('2026-06-15'), onDay('2026-06-14')];
    expect(currentStreak(e, TODAY)).toBe(2);
  });

  it('is 0 with no entries', () => {
    expect(currentStreak([], TODAY)).toBe(0);
  });
});
