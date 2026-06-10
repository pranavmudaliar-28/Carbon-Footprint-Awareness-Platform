import { describe, expect, it } from 'vitest';

import { classify } from '@/lib/services/external/grid-intensity';

describe('grid intensity classify', () => {
  it('classifies low / moderate / high by gCO₂/kWh', () => {
    expect(classify(120)).toBe('low');
    expect(classify(299)).toBe('low');
    expect(classify(300)).toBe('moderate');
    expect(classify(550)).toBe('moderate');
    expect(classify(551)).toBe('high');
    expect(classify(710)).toBe('high'); // India fallback default
  });
});
