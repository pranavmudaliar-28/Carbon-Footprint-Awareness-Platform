import { beforeEach, describe, expect, it } from 'vitest';

import { rateLimit, __resetRateLimiter } from '@/lib/services/rate-limit';

describe('rateLimit', () => {
  beforeEach(() => __resetRateLimiter());

  it('allows up to the limit within a window', () => {
    const now = 1_000_000;
    expect(rateLimit('u1', 3, 60_000, now).ok).toBe(true);
    expect(rateLimit('u1', 3, 60_000, now).ok).toBe(true);
    expect(rateLimit('u1', 3, 60_000, now).ok).toBe(true);
    const blocked = rateLimit('u1', 3, 60_000, now);
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('resets after the window elapses', () => {
    const now = 1_000_000;
    rateLimit('u2', 1, 60_000, now);
    expect(rateLimit('u2', 1, 60_000, now).ok).toBe(false);
    expect(rateLimit('u2', 1, 60_000, now + 60_001).ok).toBe(true);
  });

  it('tracks keys independently', () => {
    const now = 1_000_000;
    rateLimit('a', 1, 60_000, now);
    expect(rateLimit('a', 1, 60_000, now).ok).toBe(false);
    expect(rateLimit('b', 1, 60_000, now).ok).toBe(true);
  });
});
