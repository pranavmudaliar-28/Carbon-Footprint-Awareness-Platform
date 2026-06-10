import { describe, expect, it } from 'vitest';

import { calculateCo2e, roundKg } from '@/lib/services/carbon';

describe('calculateCo2e', () => {
  it('multiplies quantity by the emission factor', () => {
    // Petrol car: 100 km × 0.17 kg/km = 17 kg (spec §6)
    expect(calculateCo2e(100, { co2ePerUnit: 0.17 })).toBe(17);
  });

  it('handles fractional quantities', () => {
    expect(calculateCo2e(2.5, { co2ePerUnit: 6.0 })).toBe(15);
  });

  it('returns 0 when quantity is 0', () => {
    expect(calculateCo2e(0, { co2ePerUnit: 0.71 })).toBe(0);
  });

  it('rounds to 3 decimal places', () => {
    expect(calculateCo2e(1, { co2ePerUnit: 0.123456 })).toBe(0.123);
  });

  it('throws on negative quantity', () => {
    expect(() => calculateCo2e(-1, { co2ePerUnit: 0.17 })).toThrow(RangeError);
  });

  it('throws on non-finite quantity', () => {
    expect(() => calculateCo2e(Infinity, { co2ePerUnit: 0.17 })).toThrow(
      RangeError
    );
    expect(() => calculateCo2e(NaN, { co2ePerUnit: 0.17 })).toThrow(RangeError);
  });

  it('throws on negative factor', () => {
    expect(() => calculateCo2e(1, { co2ePerUnit: -0.5 })).toThrow(RangeError);
  });

  it('throws on non-finite factor', () => {
    expect(() => calculateCo2e(1, { co2ePerUnit: Infinity })).toThrow(
      RangeError
    );
  });
});

describe('roundKg', () => {
  it('rounds to 3 decimals', () => {
    expect(roundKg(0.1234)).toBe(0.123);
    expect(roundKg(0.1235)).toBe(0.124);
    expect(roundKg(10)).toBe(10);
  });
});
