'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { jsonFetch } from '@/lib/fetcher';
import { monthKey } from '@/lib/services/aggregate';
import { upsertGoalSchema } from '@/lib/validators/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function GoalForm({ currentTargetKg }: { currentTargetKg: number | null }) {
  const router = useRouter();
  const [targetKg, setTargetKg] = useState(
    currentTargetKg != null ? String(currentTargetKg) : ''
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = upsertGoalSchema.safeParse({
      targetKg: Number(targetKg),
      month: monthKey(new Date()),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Enter a valid target.');
      return;
    }

    setPending(true);
    try {
      await jsonFetch('/api/goal', {
        method: 'PUT',
        body: JSON.stringify(parsed.data),
      });
      toast.success('Monthly goal saved — it’ll show on your dashboard trend.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="targetKg">Target for this month (kg CO₂e)</Label>
        <div className="flex gap-2">
          <Input
            id="targetKg"
            type="number"
            inputMode="numeric"
            min={1}
            step="any"
            placeholder="e.g. 120"
            value={targetKg}
            onChange={(e) => setTargetKg(e.target.value)}
            required
          />
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Save goal'}
          </Button>
        </div>
      </div>
      <div aria-live="polite" className="min-h-[1rem]">
        {error && <p className="text-sm font-medium text-ember-500">{error}</p>}
      </div>
    </form>
  );
}
