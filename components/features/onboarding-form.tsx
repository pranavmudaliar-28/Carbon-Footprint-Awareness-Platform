'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { jsonFetch } from '@/lib/fetcher';
import { onboardingSchema } from '@/lib/validators/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

export function OnboardingForm() {
  const router = useRouter();
  const [weeklyCarKm, setWeeklyCarKm] = useState('40');
  const [monthlyElectricityKwh, setMonthlyElectricityKwh] = useState('150');
  const [dietType, setDietType] = useState('mixed');
  const [householdSize, setHouseholdSize] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = onboardingSchema.safeParse({
      weeklyCarKm: Number(weeklyCarKm),
      monthlyElectricityKwh: Number(monthlyElectricityKwh),
      dietType,
      householdSize: Number(householdSize),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please check your answers.');
      return;
    }

    setPending(true);
    try {
      const { baseline } = await jsonFetch<{ baseline: { totalKg: number } }>(
        '/api/onboarding',
        { method: 'POST', body: JSON.stringify(parsed.data) }
      );
      toast.success(
        `Your starting point: about ${baseline.totalKg} kg CO₂e a month.`
      );
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="weeklyCarKm">
          How far do you drive in a typical week? (km)
        </Label>
        <Input
          id="weeklyCarKm"
          type="number"
          inputMode="numeric"
          min={0}
          step="any"
          value={weeklyCarKm}
          onChange={(e) => setWeeklyCarKm(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="monthlyElectricityKwh">
          Monthly household electricity use (kWh)
        </Label>
        <Input
          id="monthlyElectricityKwh"
          type="number"
          inputMode="numeric"
          min={0}
          step="any"
          value={monthlyElectricityKwh}
          onChange={(e) => setMonthlyElectricityKwh(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          A rough number from a recent bill is fine.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dietType">Which best describes your diet?</Label>
        <Select
          id="dietType"
          value={dietType}
          onChange={(e) => setDietType(e.target.value)}
        >
          <option value="meat_heavy">Meat with most meals</option>
          <option value="mixed">A mix of meat and plant-based</option>
          <option value="vegetarian">Mostly vegetarian / vegan</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="householdSize">People in your household</Label>
        <Input
          id="householdSize"
          type="number"
          inputMode="numeric"
          min={1}
          max={20}
          value={householdSize}
          onChange={(e) => setHouseholdSize(e.target.value)}
          required
        />
      </div>

      <div aria-live="polite" className="min-h-[1.25rem]">
        {error && (
          <p className="text-sm font-medium text-ember-500">{error}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Calculating…' : 'See my starting point'}
      </Button>
    </form>
  );
}
