'use client';

import { useQuery } from '@tanstack/react-query';
import { Lightbulb, Sparkles, TrendingDown } from 'lucide-react';

import type { InsightResult } from '@/lib/types';
import { jsonFetch } from '@/lib/fetcher';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface InsightsResponse {
  insights: Array<
    InsightResult & { recommendationId: string | null; equivalentKm: number }
  >;
}

const difficultyVariant = {
  low: 'low',
  medium: 'medium',
  high: 'high',
} as const;

export function InsightCard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['insight'],
    queryFn: () => jsonFetch<InsightsResponse>('/api/insights'),
  });

  if (isLoading) {
    return (
      <div className="rounded-card border-l-4 border-l-forest-500 border border-border bg-card p-6 shadow-soft">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-6 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-4 w-full animate-pulse rounded bg-muted" />
      </div>
    );
  }

  const insight = data?.insights?.[0];

  if (isError || !insight) {
    return (
      <div className="rounded-card border border-border bg-card p-6 shadow-soft">
        <p className="text-sm text-muted-foreground">
          We couldn’t load your insight right now.{' '}
          {error instanceof Error ? error.message : ''}
        </p>
      </div>
    );
  }

  const equivalentKm = insight.equivalentKm;

  return (
    <article className="rounded-card border border-border border-l-4 border-l-forest-500 bg-card p-6 shadow-soft">
      <div className="flex items-center gap-2 text-sm font-medium text-forest-700">
        {insight.source === 'ai' ? (
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Lightbulb className="h-4 w-4" aria-hidden="true" />
        )}
        <span>
          {insight.source === 'ai'
            ? 'Your AI coach'
            : 'Smart suggestion'}
        </span>
        <Badge
          variant={difficultyVariant[insight.difficulty]}
          className="ml-auto capitalize"
        >
          {insight.difficulty} effort
        </Badge>
      </div>

      <h3 className="mt-3 font-heading text-xl font-semibold leading-snug text-forest-900">
        {insight.headline}
      </h3>
      <p className="mt-2 text-sm text-foreground">{insight.action}</p>

      {insight.estimatedSavingKg > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-button bg-leaf-50 px-4 py-3">
          <TrendingDown
            className="h-5 w-5 text-forest-700"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-forest-900">
            Saves ~{insight.estimatedSavingKg} kg CO₂e/month
            <span className="font-normal text-muted-foreground">
              {' '}
              — about {equivalentKm} km not driven.
            </span>
          </p>
        </div>
      )}

      <Button asChild className="mt-5">
        <Link href="/actions">See actions you can take</Link>
      </Button>
    </article>
  );
}
