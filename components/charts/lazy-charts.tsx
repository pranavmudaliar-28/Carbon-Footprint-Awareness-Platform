'use client';

import dynamic from 'next/dynamic';

/**
 * Lazy-loaded charts (spec §16.1 lightweight payload). Recharts is heavy, so it's
 * code-split out of the initial dashboard bundle and loaded client-side with a
 * skeleton placeholder — no layout shift, smaller first load.
 */
function ChartSkeleton() {
  return (
    <div
      className="h-56 w-full animate-pulse rounded-card bg-muted/40"
      aria-hidden="true"
    />
  );
}

export const CategoryDonut = dynamic(
  () => import('./category-donut').then((m) => m.CategoryDonut),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

export const TrendChart = dynamic(
  () => import('./trend-chart').then((m) => m.TrendChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
