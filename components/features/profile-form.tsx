'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { jsonFetch } from '@/lib/fetcher';
import { updateProfileSchema } from '@/lib/validators/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

const COUNTRIES = [
  { code: 'IN', label: 'India' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'AU', label: 'Australia' },
  { code: 'CA', label: 'Canada' },
  { code: 'DE', label: 'Germany' },
];

export function ProfileForm({
  name,
  householdSize,
  country,
}: {
  name: string;
  householdSize: number;
  country: string;
}) {
  const router = useRouter();
  const [nameValue, setNameValue] = useState(name);
  const [household, setHousehold] = useState(String(householdSize));
  const [countryValue, setCountryValue] = useState(country);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = updateProfileSchema.safeParse({
      name: nameValue.trim() || undefined,
      householdSize: Number(household),
      country: countryValue,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please check your details.');
      return;
    }

    setPending(true);
    try {
      await jsonFetch('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify(parsed.data),
      });
      toast.success('Profile updated.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={nameValue}
          maxLength={80}
          placeholder="Your name"
          onChange={(e) => setNameValue(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="household">Household size</Label>
          <Input
            id="household"
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            value={household}
            onChange={(e) => setHousehold(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Region</Label>
          <Select
            id="country"
            value={countryValue}
            onChange={(e) => setCountryValue(e.target.value)}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div aria-live="polite" className="min-h-[1rem]">
        {error && <p className="text-sm font-medium text-ember-500">{error}</p>}
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save profile'}
      </Button>
    </form>
  );
}
