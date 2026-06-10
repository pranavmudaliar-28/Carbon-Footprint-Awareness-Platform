'use client';

import { useQuery } from '@tanstack/react-query';

import { jsonFetch } from '@/lib/fetcher';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface OffsetRow {
  id: string;
  provider: string;
  offsetKg: number;
  createdAt: string;
}

export function OffsetHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ['offsets'],
    queryFn: () =>
      jsonFetch<{ offsets: OffsetRow[]; totalKg: number }>('/api/offset'),
  });

  if (isLoading) {
    return <div className="h-24 animate-pulse rounded-card bg-muted/40" />;
  }

  const offsets = data?.offsets ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your offsets</CardTitle>
        <CardDescription>
          {offsets.length === 0
            ? 'No offsets recorded yet.'
            : `${data?.totalKg ?? 0} kg CO₂e offset across ${offsets.length} action${offsets.length === 1 ? '' : 's'}.`}
        </CardDescription>
      </CardHeader>
      {offsets.length > 0 && (
        <CardContent>
          <ul className="divide-y divide-border">
            {offsets.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="font-medium">{o.provider}</span>
                <span className="text-muted-foreground">
                  {o.offsetKg} kg ·{' '}
                  {new Date(o.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}
