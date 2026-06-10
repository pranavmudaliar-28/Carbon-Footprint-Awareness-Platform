/**
 * In-memory per-key rate limiter (spec §11 — rate-limit the AI endpoint).
 *
 * Fixed-window counter. Suitable for a single-instance hackathon deploy; swap
 * for Upstash/Redis when running multiple instances. `now` is injectable for
 * deterministic tests.
 */
interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  /** epoch ms when the window resets */
  resetAt: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): RateLimitResult {
  const existing = store.get(key);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    ok: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}

/** Test helper — clears all windows. */
export function __resetRateLimiter(): void {
  store.clear();
}
