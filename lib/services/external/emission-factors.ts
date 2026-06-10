/**
 * Emission-factor resolver (spec §16.2).
 *
 * The seeded `emission_factors` table is the deterministic source of truth and
 * always-available fallback. When CLIMATIQ_API_KEY is set AND an activity is
 * mapped to a Climatiq activity id, the live factor can override it — but any
 * failure silently falls back to the DB value so logging never breaks.
 */

export interface DbFactorLike {
  activityKey: string;
  unit: string;
  co2ePerUnit: number;
  source: string;
}

export interface ResolvedFactor {
  co2ePerUnit: number;
  source: string;
  live: boolean;
}

/**
 * Map our activity keys to Climatiq `activity_id`s. Intentionally empty by
 * default — populate to enable live factor lookups for specific activities.
 * Anything not mapped uses the DB factor.
 */
const CLIMATIQ_ACTIVITY_IDS: Record<string, string> = {};

export async function resolveFactor(
  dbFactor: DbFactorLike,
  region = 'IN'
): Promise<ResolvedFactor> {
  const apiKey = process.env.CLIMATIQ_API_KEY;
  const activityId = CLIMATIQ_ACTIVITY_IDS[dbFactor.activityKey];

  if (!apiKey || !activityId) {
    return {
      co2ePerUnit: dbFactor.co2ePerUnit,
      source: dbFactor.source,
      live: false,
    };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://api.climatiq.io/data/v1/estimate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emission_factor: { activity_id: activityId, region },
        parameters: { number: 1, number_unit: dbFactor.unit },
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`Climatiq ${res.status}`);

    const data = (await res.json()) as { co2e?: number };
    if (typeof data.co2e !== 'number' || !Number.isFinite(data.co2e)) {
      throw new Error('Climatiq returned no co2e');
    }
    return { co2ePerUnit: data.co2e, source: 'Climatiq (live)', live: true };
  } catch {
    // Deterministic fallback — never block a log on an external API.
    return {
      co2ePerUnit: dbFactor.co2ePerUnit,
      source: dbFactor.source,
      live: false,
    };
  }
}
