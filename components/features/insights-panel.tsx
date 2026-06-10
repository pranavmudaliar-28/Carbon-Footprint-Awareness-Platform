'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { jsonFetch } from '@/lib/fetcher';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  InsightCardView,
  type EnrichedInsight,
} from '@/components/features/insight-card-view';

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

  function adoptButton(insight: EnrichedInsight) {
    if (!insight.recommendationId) return null;
    return (
      <Button
        onClick={() => adopt.mutate(insight.recommendationId!)}
        disabled={adopt.isPending}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Adopt this action
      </Button>
    );
  }

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
        <InsightCardView insight={primary} primary>
          {adoptButton(primary)}
        </InsightCardView>
      )}

      {rest.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {rest.map((insight, i) => (
            <InsightCardView key={`${insight.category}-${i}`} insight={insight}>
              {adoptButton(insight)}
            </InsightCardView>
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
                    <span className="tabular-nums text-muted-foreground">
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
                    <p className="text-xs text-muted-foreground">Tip: {b.tip}</p>
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
