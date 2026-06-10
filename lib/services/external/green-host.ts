/**
 * Green-hosting verification (spec §16.1, §16.2) via the keyless Green Web
 * Foundation API. Server-only, cached in-memory with a long TTL. Degrades to an
 * "unknown" status if the API is unreachable.
 */
export interface GreenHostStatus {
  domain: string;
  green: boolean;
  hostedBy: string | null;
  checked: boolean; // false when the lookup could not be performed
}

const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12h
const cache = new Map<string, { value: GreenHostStatus; expiresAt: number }>();

function resolveDomain(explicit?: string): string {
  if (explicit) return stripHost(explicit);
  const site = process.env.GREEN_CHECK_DOMAIN ?? process.env.NEXT_PUBLIC_SITE_URL;
  return stripHost(site ?? 'localhost');
}

function stripHost(value: string): string {
  try {
    return new URL(value.includes('://') ? value : `https://${value}`).hostname;
  } catch {
    return value;
  }
}

export async function getGreenHostStatus(
  domainInput?: string
): Promise<GreenHostStatus> {
  const domain = resolveDomain(domainInput);

  const hit = cache.get(domain);
  if (hit && hit.expiresAt > Date.now()) return hit.value;

  let value: GreenHostStatus = {
    domain,
    green: false,
    hostedBy: null,
    checked: false,
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(
      `https://api.thegreenwebfoundation.org/api/v3/greencheck/${encodeURIComponent(domain)}`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    if (res.ok) {
      const data = (await res.json()) as { green?: boolean; hosted_by?: string };
      value = {
        domain,
        green: Boolean(data.green),
        hostedBy: data.hosted_by ?? null,
        checked: true,
      };
    }
  } catch {
    // leave checked:false — the badge renders a neutral state
  }

  cache.set(domain, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
}
