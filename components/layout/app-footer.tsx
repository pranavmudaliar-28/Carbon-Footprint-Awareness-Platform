import { Leaf, ShieldQuestion } from 'lucide-react';

import { getGreenHostStatus } from '@/lib/services/external/green-host';
import { PageEmission } from '@/components/features/page-emission';

/**
 * App footer (spec §16.1): a green-hosting badge (Green Web Foundation, keyless)
 * + the live page-emission widget. Server component so the host check runs and
 * caches on the server.
 */
export async function AppFooter() {
  const host = await getGreenHostStatus();

  return (
    <footer className="mt-12 border-t border-border px-1 py-6">
      <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        {host.checked && host.green ? (
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-forest-500/10 px-3 py-1 text-xs font-medium text-forest-700">
            <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
            Hosted on green energy
            {host.hostedBy ? ` · ${host.hostedBy}` : ''}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldQuestion className="h-3.5 w-3.5" aria-hidden="true" />
            {host.checked
              ? 'Green hosting unverified'
              : 'Green hosting check unavailable'}
          </span>
        )}

        <PageEmission />
      </div>
    </footer>
  );
}
