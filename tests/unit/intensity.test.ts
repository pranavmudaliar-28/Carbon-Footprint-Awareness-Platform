import { describe, expect, it } from 'vitest';

import { emissionIntensity } from '@/lib/services/intensity';

describe('emissionIntensity', () => {
  it('classifies low below 2 kg', () => {
    expect(emissionIntensity(0).level).toBe('low');
    expect(emissionIntensity(1.9).level).toBe('low');
  });

  it('classifies medium from 2 to 10 kg (inclusive)', () => {
    expect(emissionIntensity(2).level).toBe('medium');
    expect(emissionIntensity(6).level).toBe('medium');
    expect(emissionIntensity(10).level).toBe('medium');
  });

  it('classifies high above 10 kg', () => {
    expect(emissionIntensity(10.1).level).toBe('high');
    expect(emissionIntensity(100).level).toBe('high');
  });

  it('returns matching badge variant and a tone class', () => {
    const low = emissionIntensity(1);
    expect(low.badge).toBe('low');
    expect(low.toneClass).toContain('forest');

    const high = emissionIntensity(20);
    expect(high.badge).toBe('high');
    expect(high.toneClass).toContain('ember');
  });
});
