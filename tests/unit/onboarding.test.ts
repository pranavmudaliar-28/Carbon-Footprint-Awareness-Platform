import { describe, expect, it } from 'vitest';

import { estimateBaseline } from '@/lib/services/onboarding';

describe('estimateBaseline', () => {
  it('combines transport, energy, and food into a monthly total', () => {
    const b = estimateBaseline({
      weeklyCarKm: 40,
      monthlyElectricityKwh: 150,
      dietType: 'mixed',
      householdSize: 1,
    });
    // transport: 40 * 4.33 * 0.17 = 29.444 → 29.444
    expect(b.transportKg).toBeCloseTo(29.444, 2);
    // energy: 150 * 0.71 / 1 = 106.5
    expect(b.energyKg).toBeCloseTo(106.5, 2);
    // food: 60 * 1.2 = 72
    expect(b.foodKg).toBeCloseTo(72, 2);
    expect(b.totalKg).toBeCloseTo(207.944, 2);
  });

  it('splits household electricity per person', () => {
    const solo = estimateBaseline({
      weeklyCarKm: 0,
      monthlyElectricityKwh: 200,
      dietType: 'vegetarian',
      householdSize: 1,
    });
    const family = estimateBaseline({
      weeklyCarKm: 0,
      monthlyElectricityKwh: 200,
      dietType: 'vegetarian',
      householdSize: 4,
    });
    expect(family.energyKg).toBeCloseTo(solo.energyKg / 4, 2);
  });

  it('reflects diet choice', () => {
    const meat = estimateBaseline({ weeklyCarKm: 0, monthlyElectricityKwh: 0, dietType: 'meat_heavy', householdSize: 1 });
    const veg = estimateBaseline({ weeklyCarKm: 0, monthlyElectricityKwh: 0, dietType: 'vegetarian', householdSize: 1 });
    expect(meat.foodKg).toBeGreaterThan(veg.foodKg);
  });
});
