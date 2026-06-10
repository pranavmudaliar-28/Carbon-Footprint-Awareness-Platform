'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

import { kgToKmEquivalent } from '@/lib/constants/categories';

const ROUND_TRIP_KM = 19; // a typical car commute, both ways
const PETROL_KG_PER_KM = 0.17; // DEFRA 2023
const WEEKS_PER_MONTH = 4.33;

/** Future-savings calculator: drag to swap N car commutes/week → live kg/month. */
export function SavingsCalculator() {
  const [commutes, setCommutes] = useState(2);

  const kgPerMonth = Math.round(
    commutes * ROUND_TRIP_KM * PETROL_KG_PER_KM * WEEKS_PER_MONTH
  );
  const km = kgToKmEquivalent(kgPerMonth);

  return (
    <div className="rounded-2xl border border-[hsl(var(--l-fg)/0.1)] bg-[hsl(var(--l-fg)/0.04)] p-6 backdrop-blur-xl">
      <p className="text-sm text-[hsl(var(--l-muted))]">
        If you swapped
        <span className="mx-1 font-semibold text-[hsl(var(--l-fg))]">
          {commutes}
        </span>
        car commute{commutes === 1 ? '' : 's'} a week for the bus…
      </p>

      <label className="mt-4 block">
        <span className="sr-only">Car commutes swapped per week</span>
        <input
          type="range"
          min={0}
          max={7}
          step={1}
          value={commutes}
          onChange={(e) => setCommutes(Number(e.target.value))}
          aria-valuetext={`${commutes} commutes per week`}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[hsl(var(--l-fg)/0.1)]"
          style={{ accentColor: 'hsl(var(--l-accent))' }}
        />
        <div className="mt-1 flex justify-between text-[10px] text-[hsl(var(--l-muted))]">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
      </label>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[hsl(var(--l-muted))]">
            You’d keep out of the air
          </p>
          <p className="bg-gradient-to-r from-[hsl(var(--l-accent))] to-[hsl(var(--l-accent-2))] bg-clip-text font-heading text-4xl font-bold text-transparent">
            {kgPerMonth} kg
            <span className="text-base font-normal text-[hsl(var(--l-muted))]">
              {' '}
              / month
            </span>
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm text-[hsl(var(--l-muted))]">
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            that’s about {km} km not driven
          </p>
        </div>
      </div>
    </div>
  );
}
