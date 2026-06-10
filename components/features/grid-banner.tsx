'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Leaf, Zap, Info } from 'lucide-react';

import { jsonFetch } from '@/lib/fetcher';
import type { GridIntensity } from '@/lib/services/external/grid-intensity';
import { cn } from '@/lib/utils';

/**
 * Grid-aware "eco mode" banner (spec §16.1). Shows actionable nudges ONLY on live
 * data; on fallback it shows a neutral, honest info chip. Sets data-grid on the
 * document so heavy visuals can soften when the grid is dirty.
 */
export function GridBanner() {
  const { data } = useQuery({
    queryKey: ['grid'],
    queryFn: () => jsonFetch<{ grid: GridIntensity }>('/api/grid'),
    staleTime: 10 * 60 * 1000,
  });

  const grid = data?.grid;

  useEffect(() => {
    if (grid?.source === 'live' && grid.level === 'high') {
      document.documentElement.setAttribute('data-grid', 'high');
    } else {
      document.documentElement.removeAttribute('data-grid');
    }
    return () => document.documentElement.removeAttribute('data-grid');
  }, [grid?.source, grid?.level]);

  if (!grid) return null;

  // Fallback → neutral, non-alarming chip (honesty, spec §10).
  if (grid.source === 'fallback') {
    return (
      <div
        role="status"
        className="flex items-center gap-2 rounded-card border border-border bg-muted px-4 py-2.5 text-sm text-muted-foreground"
      >
        <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          Showing typical grid intensity ({grid.intensityGco2} gCO₂/kWh). Add an
          Electricity Maps key for live, location-aware nudges.
        </span>
      </div>
    );
  }

  // Live data → actionable nudges.
  const config = {
    low: {
      icon: Leaf,
      cls: 'border-forest-500/40 bg-forest-500/10 text-forest-900',
      msg: 'Grid is clean right now — a good time to run the wash or charge your EV.',
    },
    moderate: {
      icon: Zap,
      cls: 'border-border bg-muted text-foreground',
      msg: 'Grid carbon intensity is average right now.',
    },
    high: {
      icon: Zap,
      cls: 'border-amber-400/50 bg-amber-400/10 text-slate-900',
      msg: 'Grid is carbon-heavy right now — a good moment to delay the dryer or dishwasher.',
    },
  }[grid.level];

  const Icon = config.icon;

  return (
    <div
      role="status"
      className={cn(
        'flex items-center gap-2 rounded-card border px-4 py-2.5 text-sm font-medium',
        config.cls
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{config.msg}</span>
      <span className="ml-auto whitespace-nowrap text-xs font-normal opacity-70">
        {grid.intensityGco2} gCO₂/kWh · live
      </span>
    </div>
  );
}
