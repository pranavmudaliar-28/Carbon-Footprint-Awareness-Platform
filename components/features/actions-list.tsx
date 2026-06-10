'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Leaf, RotateCcw, X } from 'lucide-react';
import { toast } from 'sonner';

import { jsonFetch } from '@/lib/fetcher';
import { EFFORT_VARIANT } from '@/lib/constants/categories';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Recommendation {
  id: string;
  categoryKey: string;
  title: string;
  description: string;
  avgSavingKg: number;
  effort: 'low' | 'medium' | 'high';
}

interface UserAction {
  id: string;
  recommendationId: string;
  status: 'active' | 'completed' | 'dismissed';
  recommendation: Recommendation;
}

interface ActionsResponse {
  recommendations: Recommendation[];
  userActions: UserAction[];
}

const SUGGESTED_LIMIT = 5;

function RecCard({
  rec,
  accent,
  children,
}: {
  rec: Recommendation;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className={accent ? 'border-l-4 border-l-forest-500' : ''}>
      <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium text-foreground">{rec.title}</h3>
            <Badge variant={EFFORT_VARIANT[rec.effort]} className="capitalize">
              {rec.effort} effort
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Leaf className="h-3 w-3" aria-hidden="true" />~{rec.avgSavingKg} kg/mo
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{rec.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">{children}</div>
      </CardContent>
    </Card>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

export function ActionsList() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['actions'],
    queryFn: () => jsonFetch<ActionsResponse>('/api/actions'),
  });

  const accept = useMutation({
    mutationFn: (recommendationId: string) =>
      jsonFetch('/api/actions', {
        method: 'POST',
        body: JSON.stringify({ recommendationId }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['actions'] });
      toast.success('Action added — your projected footprint just dropped.');
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : 'Could not add action.'),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserAction['status'] }) =>
      jsonFetch(`/api/actions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: (_d, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['actions'] });
      toast.success(
        vars.status === 'completed'
          ? 'Nice — marked done! Here’s a fresh suggestion.'
          : vars.status === 'active'
            ? 'Back in progress.'
            : 'Action removed.'
      );
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-card border border-border bg-muted/40"
          />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-muted-foreground">
        Couldn’t load actions. Please refresh.
      </p>
    );
  }

  const actedRecIds = new Set(data.userActions.map((a) => a.recommendationId));
  const suggested = data.recommendations
    .filter((r) => !actedRecIds.has(r.id))
    .sort((a, b) => b.avgSavingKg - a.avgSavingKg)
    .slice(0, SUGGESTED_LIMIT);
  const active = data.userActions.filter((a) => a.status === 'active');
  const completed = data.userActions.filter((a) => a.status === 'completed');

  const busy = accept.isPending || updateStatus.isPending;

  return (
    <div className="space-y-8">
      <Section
        title="Suggested for you"
        description="Highest-impact changes you haven’t adopted yet."
      >
        {suggested.length === 0 ? (
          <p className="rounded-card border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            You’ve adopted every suggestion — amazing. Log more activities to
            unlock fresh ideas.
          </p>
        ) : (
          <ul className="space-y-3">
            {suggested.map((rec) => (
              <li key={rec.id}>
                <RecCard rec={rec}>
                  <Button
                    size="sm"
                    onClick={() => accept.mutate(rec.id)}
                    disabled={busy}
                  >
                    Accept
                  </Button>
                </RecCard>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {active.length > 0 && (
        <Section
          title="In progress"
          description="Actions you’ve committed to."
        >
          <ul className="space-y-3">
            {active.map((a) => (
              <li key={a.id}>
                <RecCard rec={a.recommendation} accent>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateStatus.mutate({ id: a.id, status: 'completed' })
                    }
                    disabled={busy}
                  >
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Mark done
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Remove action: ${a.recommendation.title}`}
                    onClick={() =>
                      updateStatus.mutate({ id: a.id, status: 'dismissed' })
                    }
                    disabled={busy}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </RecCard>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {completed.length > 0 && (
        <Section
          title="Completed"
          description="Done and dusted — keep it up."
        >
          <ul className="space-y-3">
            {completed.map((a) => (
              <li key={a.id}>
                <RecCard rec={a.recommendation}>
                  <Badge variant="low" className="gap-1">
                    <Check className="h-3 w-3" aria-hidden="true" /> Done
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Move back to in progress: ${a.recommendation.title}`}
                    onClick={() =>
                      updateStatus.mutate({ id: a.id, status: 'active' })
                    }
                    disabled={busy}
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </RecCard>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
