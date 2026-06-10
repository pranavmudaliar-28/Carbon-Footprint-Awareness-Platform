import { describe, expect, it } from 'vitest';

import {
  createEntrySchema,
  onboardingSchema,
  updateProfileSchema,
} from '@/lib/validators/schemas';

describe('createEntrySchema', () => {
  it('accepts a valid entry', () => {
    const r = createEntrySchema.safeParse({
      activityKey: 'petrol_car_km',
      quantity: 12,
    });
    expect(r.success).toBe(true);
  });

  it('rejects unknown fields (no mass-assignment)', () => {
    const r = createEntrySchema.safeParse({
      activityKey: 'petrol_car_km',
      quantity: 12,
      userId: 'attacker-supplied',
      co2eKg: 0,
    });
    expect(r.success).toBe(false);
  });

  it('rejects non-positive quantity', () => {
    expect(
      createEntrySchema.safeParse({ activityKey: 'petrol_car_km', quantity: 0 })
        .success
    ).toBe(false);
    expect(
      createEntrySchema.safeParse({ activityKey: 'petrol_car_km', quantity: -5 })
        .success
    ).toBe(false);
  });

  it('rejects malformed activityKey', () => {
    expect(
      createEntrySchema.safeParse({ activityKey: 'Petrol Car', quantity: 1 })
        .success
    ).toBe(false);
  });
});

describe('onboardingSchema', () => {
  it('defaults householdSize to 1', () => {
    const r = onboardingSchema.parse({
      weeklyCarKm: 10,
      monthlyElectricityKwh: 100,
      dietType: 'mixed',
    });
    expect(r.householdSize).toBe(1);
  });

  it('rejects an invalid diet type', () => {
    expect(
      onboardingSchema.safeParse({
        weeklyCarKm: 10,
        monthlyElectricityKwh: 100,
        dietType: 'carnivore',
      }).success
    ).toBe(false);
  });
});

describe('updateProfileSchema', () => {
  it('accepts a valid profile (name optional)', () => {
    expect(
      updateProfileSchema.safeParse({ householdSize: 3, country: 'IN' }).success
    ).toBe(true);
    expect(
      updateProfileSchema.safeParse({
        name: 'Pranav',
        householdSize: 1,
        country: 'US',
      }).success
    ).toBe(true);
  });

  it('rejects unknown fields and bad household size', () => {
    expect(
      updateProfileSchema.safeParse({
        householdSize: 1,
        country: 'IN',
        baselineKg: 99,
      }).success
    ).toBe(false);
    expect(
      updateProfileSchema.safeParse({ householdSize: 0, country: 'IN' }).success
    ).toBe(false);
  });
});
