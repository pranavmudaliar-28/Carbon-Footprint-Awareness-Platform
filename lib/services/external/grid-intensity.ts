/**
 * Grid carbon-intensity service (spec §16.1, §16.2).
 *
 * Server-only. Returns live data from Electricity Maps when
 * ELECTRICITY_MAPS_API_KEY is set (cached in GridSnapshot for ~30 min), and
 * always degrades to a deterministic static value so the demo never fails.
 */

export type GridLevel = 'low' | 'moderate' | 'high';

export interface GridIntensity {
  region: string;
  intensityGco2: number;
  level: GridLevel;
  source: 'live' | 'fallback';
  fetchedAt: string;
}

// India grid ≈ 0.71 kg/kWh = 710 gCO₂/kWh (India CEA 2023) — the static default.
const FALLBACK_GCO2 = 710;
const CACHE_MS = 30 * 60 * 1000; // reuse a snapshot for 30 minutes
const FETCH_TIMEOUT_MS = 4000;

export function classify(intensityGco2: number): GridLevel {
  if (intensityGco2 < 300) return 'low';
  if (intensityGco2 <= 550) return 'moderate';
  return 'high';
}

function fallback(region: string): GridIntensity {
  return {
    region,
    intensityGco2: FALLBACK_GCO2,
    level: classify(FALLBACK_GCO2),
    source: 'fallback',
    fetchedAt: new Date().toISOString(),
  };
}

export async function getGridIntensity(
  region = 'IN'
): Promise<GridIntensity> {
  const apiKey = process.env.ELECTRICITY_MAPS_API_KEY;
  const zone = process.env.ELECTRICITY_MAPS_ZONE ?? 'IN-WE';
  if (!apiKey) return fallback(region);

  // Lazy import keeps the pure `classify` export free of the DB client.
  const { prisma } = await import('@/lib/db/prisma');

  // Serve a recent cached snapshot if we have one.
  try {
    const cached = await prisma.gridSnapshot.findFirst({
      where: { region },
      orderBy: { fetchedAt: 'desc' },
    });
    if (cached && Date.now() - cached.fetchedAt.getTime() < CACHE_MS) {
      return {
        region,
        intensityGco2: cached.intensityGco2,
        level: classify(cached.intensityGco2),
        source: 'live',
        fetchedAt: cached.fetchedAt.toISOString(),
      };
    }
  } catch {
    // ignore cache read failures — fall through to a live fetch
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(
      `https://api.electricitymap.org/v3/carbon-intensity/latest?zone=${encodeURIComponent(zone)}`,
      { headers: { 'auth-token': apiKey }, signal: controller.signal }
    );
    clearTimeout(timer);
    if (!res.ok) return fallback(region);

    const data = (await res.json()) as { carbonIntensity?: number };
    const intensityGco2 = data.carbonIntensity;
    if (typeof intensityGco2 !== 'number' || !Number.isFinite(intensityGco2)) {
      return fallback(region);
    }

    // Cache it (best-effort).
    const snapshot = await prisma.gridSnapshot
      .create({ data: { region, intensityGco2 } })
      .catch(() => null);

    return {
      region,
      intensityGco2,
      level: classify(intensityGco2),
      source: 'live',
      fetchedAt: (snapshot?.fetchedAt ?? new Date()).toISOString(),
    };
  } catch {
    return fallback(region);
  }
}
