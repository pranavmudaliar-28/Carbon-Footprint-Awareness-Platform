'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TreePine, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

import { jsonFetch } from '@/lib/fetcher';
import { treesEquivalent } from '@/lib/services/offset';
import {
  OFFSET_PROVIDERS,
  OFFSET_DISCLAIMER,
} from '@/lib/constants/offset-providers';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Offset card (spec §16.3) — sized to the residual (projected) footprint. Closes
 * the loop past "reduce" with curated, verified providers and an honest
 * complement-not-substitute disclaimer.
 */
export function OffsetCard({ residualKg }: { residualKg: number }) {
  const queryClient = useQueryClient();
  const trees = treesEquivalent(residualKg);

  const record = useMutation({
    mutationFn: (provider: string) =>
      jsonFetch('/api/offset', {
        method: 'POST',
        body: JSON.stringify({ provider, offsetKg: residualKg }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['offsets'] });
      toast.success('Logged your offset — thank you for closing the loop.');
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : 'Could not record offset.'),
  });

  if (residualKg <= 0) return null;

  return (
    <Card className="border-l-4 border-l-forest-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TreePine className="h-5 w-5 text-forest-700" aria-hidden="true" />
          Offset what’s left
        </CardTitle>
        <CardDescription>
          About {residualKg} kg CO₂e remain this month ≈ {trees} tree
          {trees === 1 ? '' : 's'} worth of yearly absorption.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {OFFSET_PROVIDERS.map((p) => (
            <li
              key={p.key}
              className="flex flex-wrap items-center justify-between gap-2 rounded-button border border-border p-3"
            >
              <div className="min-w-0">
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-muted-foreground">{p.blurb}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href={p.url} target="_blank" rel="noopener noreferrer">
                    Visit
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </Button>
                <Button
                  size="sm"
                  onClick={() => record.mutate(p.name)}
                  disabled={record.isPending}
                >
                  I offset this
                </Button>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">{OFFSET_DISCLAIMER}</p>
      </CardContent>
    </Card>
  );
}
