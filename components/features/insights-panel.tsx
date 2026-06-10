'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Lightbulb,
  RefreshCw,
  Sparkles,
  TrendingDown,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

import type { InsightResult } from '@/lib/types';
import { jsonFetch } from '@/lib/fetcher';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EnrichedInsight extends InsightResult {
  recommendationId: string | null;
  equivalentKm: number;
}
interface BreakdownTip {
  category: string;
  label: string;
  co2eKg: number;
  pct: number;
  tip: string;
}
interface InsightsResponse {
  insights: EnrichedInsight[];
  breakdown: BreakdownTip[];
}

const difficultyVariant = { low: 'low', medium: 'medium', high: 'high' } as const;

function InsightCardView({
  insight,
  primary,
  onAdopt,
  adopting,
}: {
  insight: EnrichedInsight;
  primary?: boolean;
  onAdopt: (id: string) => void;
  adopting: boolean;
}) {
  return (
    <article
      className={cn(
        'rounded-card border border-border bg-card p-6 shadow-soft',
        primary ? 'border-l-4 border-l-forest-500' : ''
      )}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-forest-700">
        {insight.source === 'ai' ? (
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Lightbulb className="h-4 w-4" aria-hidden="true" />
        )}
        <span>{insight.source === 'ai' ? 'Your AI coach' : 'Smart suggestion'}</span>
        <Badge
          variant={difficultyVariant[insight.difficulty]}
          className="ml-auto capitalize"
        >
          {insight.difficulty} effort
        </Badge>
      </div>

      <h3
        className={cn(
          'mt-3 font-heading font-semibold leading-snug text-forest-900',
          primary ? 'text-xl' : 'text-lg'
        )}
      >
        {insight.headline}
      </h3>
      <p className="mt-2 text-sm text-foreground">{insight.action}</p>

      {insight.estimatedSavingKg > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-button bg-leaf-50 px-4 py-3">
          <TrendingDown className="h-5 w-5 text-forest-700" aria-hidden="true" />
          <p className="text-sm font-medium text-forest-900">
            Saves ~{insight.estimatedSavingKg} kg CO₂e/month
            <span className="font-normal text-muted-foreground">
              {' '}
              — about {insight.equivalentKm} km not driven.
            </span>
          </p>
        </div>
      )}

      {insight.recommendationId && (
        <Button
          className="mt-5"
          onClick={() => onAdopt(insight.recommendationId!)}
          disabled={adopting}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Adopt this action
        </Button>
      )}
    </article>
  );
}

export function InsightsPanel() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['insights'],
    queryFn: () => jsonFetch<InsightsResponse>('/api/insights'),
  });

  const adopt = useMutation({
    mutationFn: (recommendationId: string) =>
      jsonFetch('/api/actions', {
        method: 'POST',
        body: JSON.stringify({ recommendationId }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['actions'] });
      toast.success('Added to your actions — projected footprint updated.');
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : 'Could not adopt action.'),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-44 animate-pulse rounded-card bg-muted/40" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-32 animate-pulse rounded-card bg-muted/40" />
          <div className="h-32 animate-pulse rounded-card bg-muted/40" />
        </div>
      </div>
    );
  }

  if (isError || !data || data.insights.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        We couldn’t load your insights right now. Log a few activities and try
        again.
      </p>
    );
  }

  const [primary, ...rest] = data.insights;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold">
          Top opportunities
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ['insights'] })
          }
          disabled={isFetching}
        >
          <RefreshCw
            className={cn('h-4 w-4', isFetching && 'animate-spin')}
            aria-hidden="true"
          />
          Refresh
        </Button>
      </div>

      {primary && (
        <InsightCardView
          insight={primary}
          primary
          onAdopt={adopt.mutate}
          adopting={adopt.isPending}
        />
      )}

      {rest.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {rest.map((insight, i) => (
            <InsightCardView
              key={`${insight.category}-${i}`}
              insight={insight}
              onAdopt={adopt.mutate}
              adopting={adopt.isPending}
            />
          ))}
        </div>
      )}

      {data.breakdown.length > 0 && (
        <Card>
          <CardContent className="space-y-3 p-6">
            <h3 className="font-heading text-lg font-semibold">By category</h3>
            <ul className="space-y-3">
              {data.breakdown.map((b) => (
                <li key={b.category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{b.label}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {b.co2eKg} kg · {b.pct}%
                    </span>
                  </div>
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-pill bg-muted"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-pill bg-forest-500"
                      style={{ width: `${Math.min(100, b.pct)}%` }}
                    />
                  </div>
                  {b.tip && (
                    <p className="text-xs text-muted-foreground">
                      Tip: {b.tip}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
