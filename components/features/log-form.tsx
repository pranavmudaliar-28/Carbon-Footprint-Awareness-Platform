'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  Info,
  GraduationCap,
  Plus,
  Car,
  Zap,
  Utensils,
  ShoppingBag,
  Plane,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { jsonFetch } from '@/lib/fetcher';
import { calculateCo2e } from '@/lib/services/carbon';
import { lessonForActivity } from '@/lib/services/education';
import { kgToKmEquivalent } from '@/lib/constants/categories';
import type { Lesson } from '@/lib/constants/lessons';
import { createEntrySchema } from '@/lib/validators/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface FactorOption {
  activityKey: string;
  label: string;
  unit: string;
  co2ePerUnit: number;
  categoryKey: string;
  categoryLabel: string;
  source: string;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  transport: Car,
  energy: Zap,
  food: Utensils,
  shopping: ShoppingBag,
  travel: Plane,
};

/** Per-entry emission intensity → Badge variant + label (preview accent only). */
function intensity(kg: number): { variant: 'low' | 'medium' | 'high'; label: string } {
  if (kg < 2) return { variant: 'low', label: 'Low impact' };
  if (kg <= 10) return { variant: 'medium', label: 'Medium impact' };
  return { variant: 'high', label: 'High impact' };
}

export function LogForm({ factors }: { factors: FactorOption[] }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const f of factors) seen.set(f.categoryKey, f.categoryLabel);
    return [...seen.entries()].map(([key, label]) => ({ key, label }));
  }, [factors]);

  const [categoryKey, setCategoryKey] = useState(categories[0]?.key ?? '');
  const activitiesInCategory = factors.filter(
    (f) => f.categoryKey === categoryKey
  );
  const [activityKey, setActivityKey] = useState(
    activitiesInCategory[0]?.activityKey ?? ''
  );
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [lesson, setLesson] = useState<Lesson | null>(null);

  const selected =
    factors.find((f) => f.activityKey === activityKey) ??
    activitiesInCategory[0];

  const qtyNum = Number(quantity);
  const preview =
    selected && Number.isFinite(qtyNum) && qtyNum > 0
      ? calculateCo2e(qtyNum, { co2ePerUnit: selected.co2ePerUnit })
      : null;

  function onCategoryChange(key: string) {
    setCategoryKey(key);
    const first = factors.find((f) => f.categoryKey === key);
    setActivityKey(first?.activityKey ?? '');
    setLesson(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = createEntrySchema.safeParse({ activityKey, quantity: qtyNum });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please check your input.');
      return;
    }

    setPending(true);
    try {
      await jsonFetch('/api/entries', {
        method: 'POST',
        body: JSON.stringify(parsed.data),
      });
      // Background refresh: insight (client) + recent entries list.
      void queryClient.invalidateQueries({ queryKey: ['insight'] });
      void queryClient.invalidateQueries({ queryKey: ['entries'] });
      toast.success(
        preview ? `Logged — that’s ${preview} kg CO₂e.` : 'Activity logged.'
      );
      setLesson(
        preview !== null && preview >= 5 ? lessonForActivity(activityKey) : null
      );
      setQuantity('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setPending(false);
    }
  }

  if (!selected) {
    return (
      <p className="text-sm text-muted-foreground">
        No activities available. Seed the database first.
      </p>
    );
  }

  const previewIntensity = preview !== null ? intensity(preview) : null;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Category — icon chips */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Category</legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {categories.map((c) => {
            const Icon = CATEGORY_ICONS[c.key] ?? Car;
            const active = c.key === categoryKey;
            return (
              <button
                key={c.key}
                type="button"
                aria-pressed={active}
                onClick={() => onCategoryChange(c.key)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-card border p-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  active
                    ? 'border-forest-500 bg-leaf-50 text-forest-700'
                    : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {c.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Activity — chips */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Activity</legend>
        <div className="flex flex-wrap gap-2">
          {activitiesInCategory.map((f) => {
            const active = f.activityKey === activityKey;
            return (
              <button
                key={f.activityKey}
                type="button"
                aria-pressed={active}
                onClick={() => setActivityKey(f.activityKey)}
                className={cn(
                  'rounded-pill border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  active
                    ? 'border-forest-500 bg-forest-700 text-primary-foreground'
                    : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Amount with unit suffix */}
      <div className="space-y-2">
        <Label htmlFor="quantity">Amount</Label>
        <div className="relative">
          <Input
            id="quantity"
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            placeholder={`e.g. 12`}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="pr-16"
            required
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {selected.unit}
          </span>
        </div>
      </div>

      {/* Live preview */}
      <div className="rounded-card bg-leaf-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">This will add</p>
            <p className="font-heading text-2xl font-semibold text-forest-900">
              {preview !== null ? `${preview} kg CO₂e` : '—'}
            </p>
            {preview !== null && (
              <p className="text-xs text-muted-foreground">
                ≈ {kgToKmEquivalent(preview)} km of driving
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {previewIntensity && (
              <Badge variant={previewIntensity.variant}>
                {previewIntensity.label}
              </Badge>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-button p-1 text-xs text-muted-foreground hover:text-foreground"
                  aria-label="How we calculate this"
                >
                  <Info className="h-4 w-4" aria-hidden="true" />
                  How we calculate
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {selected.co2ePerUnit} kg CO₂e per {selected.unit}. Source:{' '}
                {selected.source}.
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      <div aria-live="polite" className="min-h-[1.25rem]">
        {error && <p className="text-sm font-medium text-ember-500">{error}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        {pending ? 'Logging…' : 'Track activity'}
      </Button>

      {lesson && (
        <div role="status" className="space-y-1 rounded-card bg-leaf-50 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-forest-700">
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            {lesson.title}
          </p>
          <p className="text-sm text-foreground">{lesson.body}</p>
        </div>
      )}
    </form>
  );
}
