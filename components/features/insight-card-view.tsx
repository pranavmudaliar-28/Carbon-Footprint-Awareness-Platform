import { Lightbulb, Sparkles, TrendingDown } from 'lucide-react';

import type { InsightResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { EFFORT_VARIANT } from '@/lib/constants/categories';
import { Badge } from '@/components/ui/badge';

export interface EnrichedInsight extends InsightResult {
  recommendationId: string | null;
  equivalentKm: number;
}

/**
 * Presentational insight card — shared by the dashboard ([insight-card.tsx]) and
 * the insights page ([insights-panel.tsx]). `children` is the call-to-action
 * slot (e.g. an "Adopt this action" button or a link).
 */
export function InsightCardView({
  insight,
  primary,
  children,
}: {
  insight: EnrichedInsight;
  primary?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <article
      className={cn(
        'rounded-card border border-border bg-card p-6 shadow-soft',
        primary && 'border-l-4 border-l-forest-500'
      )}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-forest-700">
        {insight.source === 'ai' ? (
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Lightbulb className="h-4 w-4" aria-hidden="true" />
        )}
        <span>
          {insight.source === 'ai' ? 'Your AI coach' : 'Smart suggestion'}
        </span>
        <Badge
          variant={EFFORT_VARIANT[insight.difficulty]}
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

      {children && <div className="mt-5">{children}</div>}
    </article>
  );
}
