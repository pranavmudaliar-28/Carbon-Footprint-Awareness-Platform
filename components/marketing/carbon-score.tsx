'use client';

import { CountUp } from '@/components/features/count-up';

/** A circular gauge with a count-up value (e.g. "% lighter vs the average"). */
export function CarbonScore({
  score = 72,
  suffix = '/ 100',
}: {
  score?: number;
  suffix?: string;
}) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const dash = (circumference * Math.min(100, Math.max(0, score))) / 100;

  return (
    <div className="relative grid h-40 w-40 place-items-center">
      <svg viewBox="0 0 120 120" className="h-40 w-40 -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="hsl(var(--l-border))"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--l-accent))" />
            <stop offset="100%" stopColor="hsl(var(--l-accent-2))" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="font-heading text-4xl font-bold text-[hsl(var(--l-fg))]">
          <CountUp value={score} />
        </p>
        <p className="text-xs text-[hsl(var(--l-muted))]">{suffix}</p>
      </div>
    </div>
  );
}
