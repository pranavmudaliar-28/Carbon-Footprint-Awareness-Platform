'use client';

import { useEffect, useState } from 'react';
import { co2 } from '@tgwf/co2';
import { Gauge } from 'lucide-react';

/**
 * Estimates this page's carbon emission from its transferred bytes (Performance
 * API) using CO2.js (spec §16.1). No network call — purely client-side. The app
 * measuring its own footprint is the meta-move that evidences Efficiency.
 */
export function PageEmission() {
  const [grams, setGrams] = useState<number | null>(null);

  useEffect(() => {
    try {
      const nav = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming | undefined;
      const resources = performance.getEntriesByType(
        'resource'
      ) as PerformanceResourceTiming[];

      const bytes =
        (nav?.transferSize ?? 0) +
        resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
      if (bytes <= 0) return;

      const model = new co2();
      // Conservative: assume non-green network path for the estimate.
      const g = model.perByte(bytes, false);
      setGrams(Math.round(g * 100) / 100);
    } catch {
      // Performance API unavailable — silently skip the widget.
    }
  }, []);

  if (grams == null) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
      This page emitted ~{grams} g CO₂e
    </span>
  );
}
