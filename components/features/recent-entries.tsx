'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Car,
  Zap,
  Utensils,
  ShoppingBag,
  Plane,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { jsonFetch } from '@/lib/fetcher';
import type { FactorOption } from '@/components/features/log-form';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  transport: Car,
  energy: Zap,
  food: Utensils,
  shopping: ShoppingBag,
  travel: Plane,
};

interface EntryRow {
  id: string;
  activityKey: string;
  quantity: number;
  co2eKg: number;
  occurredOn: string;
  category: { key: string; label: string };
}

function intensityTone(kg: number): string {
  if (kg < 2) return 'text-forest-700';
  if (kg <= 10) return 'text-amber-400';
  return 'text-ember-500';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function RecentEntries({ factors }: { factors: FactorOption[] }) {
  const byKey = useMemo(
    () => new Map(factors.map((f) => [f.activityKey, f])),
    [factors]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['entries'],
    queryFn: () => jsonFetch<{ entries: EntryRow[] }>('/api/entries'),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-card bg-muted/40"
          />
        ))}
      </div>
    );
  }

  const entries = data?.entries ?? [];

  if (entries.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Nothing logged yet — your activities will appear here.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {entries.slice(0, 12).map((e) => {
        const factor = byKey.get(e.activityKey);
        const Icon = CATEGORY_ICONS[e.category.key] ?? Car;
        return (
          <li
            key={e.id}
            className="flex items-center gap-3 rounded-card border border-border bg-card p-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-muted text-forest-700">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {factor?.label ?? e.category.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {e.quantity} {factor?.unit ?? ''} · {formatDate(e.occurredOn)}
              </p>
            </div>
            <span
              className={cn(
                'shrink-0 text-sm font-semibold tabular-nums',
                intensityTone(e.co2eKg)
              )}
            >
              {e.co2eKg} kg
            </span>
          </li>
        );
      })}
    </ul>
  );
}
