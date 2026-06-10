import { describe, expect, it } from 'vitest';

import { treesEquivalent } from '@/lib/services/offset';

describe('treesEquivalent', () => {
  it('matches the spec example (~120 kg ≈ 6 trees)', () => {
    expect(treesEquivalent(120)).toBe(6);
  });

  it('returns 0 for zero or negative residual', () => {
    expect(treesEquivalent(0)).toBe(0);
    expect(treesEquivalent(-10)).toBe(0);
  });

  it('rounds to the nearest tree', () => {
    expect(treesEquivalent(21)).toBe(1);
    expect(treesEquivalent(31)).toBe(1); // 31/21 = 1.48 → 1
    expect(treesEquivalent(32)).toBe(2); // 32/21 = 1.52 → 2
  });

  it('ignores non-finite input', () => {
    expect(treesEquivalent(Infinity)).toBe(0);
    expect(treesEquivalent(NaN)).toBe(0);
  });
});
