import Link from 'next/link';
import { Sprout } from 'lucide-react';

import { Button } from '@/components/ui/button';

/** Friendly first-time empty state (spec §8, §10 microcopy). */
export function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-leaf-50 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-leaf-300/40 text-forest-700">
        <Sprout className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-heading text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {ctaLabel && ctaHref && (
        <Button asChild className="mt-6">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      )}
    </div>
  );
}
