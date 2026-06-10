'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { jsonFetch } from '@/lib/fetcher';
import { Button } from '@/components/ui/button';
import {
  InsightCardView,
  type EnrichedInsight,
} from '@/components/features/insight-card-view';

interface InsightsResponse {
  insights: EnrichedInsight[];
}

/** Dashboard insight card — fetches and renders the top opportunity. */
export function InsightCard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['insight'],
    queryFn: () => jsonFetch<InsightsResponse>('/api/insights'),
  });

  if (isLoading) {
    return (
      <div className="rounded-card border border-l-4 border-border border-l-forest-500 bg-card p-6 shadow-soft">
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

  return (
    <InsightCardView insight={insight} primary>
      <Button asChild>
        <Link href="/actions">See actions you can take</Link>
      </Button>
    </InsightCardView>
  );
}
