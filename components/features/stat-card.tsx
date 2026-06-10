import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CountUp } from '@/components/features/count-up';

export interface StatCardProps {
  label: string;
  value: number;
  unit?: string;
  decimals?: number;
  /** current - previous. Negative = improvement (less emitted). */
  deltaKg?: number | null;
  deltaPct?: number | null;
  caption?: string;
  animate?: boolean;
}

/**
 * Big-number stat with a directional delta. For a carbon footprint, DOWN is good
 * — so a negative delta renders green with a down arrow (spec §8). The trend is
 * conveyed by icon + text + color together, never color alone (spec §12).
 */
export function StatCard({
  label,
  value,
  unit = 'kg CO₂e',
  decimals = 1,
  deltaKg = null,
  deltaPct = null,
  caption,
  animate = true,
}: StatCardProps) {
  const hasDelta = deltaKg !== null && deltaKg !== 0;
  const improved = (deltaKg ?? 0) < 0;

  const DeltaIcon = !hasDelta ? Minus : improved ? ArrowDownRight : ArrowUpRight;
  const deltaTone = !hasDelta
    ? 'text-muted-foreground'
    : improved
      ? 'text-forest-700'
      : 'text-ember-500';

  const deltaLabel = !hasDelta
    ? 'No change vs last month'
    : `${improved ? 'Down' : 'Up'} ${Math.abs(deltaKg ?? 0)} kg${
        deltaPct !== null ? ` (${Math.abs(deltaPct)}%)` : ''
      } vs last month`;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">
          {animate ? (
            <CountUp value={value} decimals={decimals} />
          ) : (
            value.toFixed(decimals)
          )}{' '}
          <span className="text-base font-normal text-muted-foreground">
            {unit}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className={cn('flex items-center gap-1 text-sm font-medium', deltaTone)}>
          <DeltaIcon className="h-4 w-4" aria-hidden="true" />
          <span>{deltaLabel}</span>
        </p>
        {caption && (
          <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
        )}
      </CardContent>
    </Card>
  );
}
