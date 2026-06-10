import { ArrowDownRight, Sparkles } from 'lucide-react';

import { CountUp } from '@/components/features/count-up';

/**
 * Glass "live dashboard" preview for the landing hero. Dark/premium, token-based.
 * Decorative — aria-hidden.
 */
export function AppPreview() {
  const slices = [
    { label: 'Transport', pct: 46, color: 'hsl(var(--l-accent))' },
    { label: 'Energy', pct: 28, color: 'hsl(var(--l-accent-2))' },
    { label: 'Food', pct: 18, color: 'hsl(45 88% 62%)' },
    { label: 'Other', pct: 8, color: 'hsl(150 12% 55%)' },
  ];
  let acc = 0;
  const stops = slices
    .map((s) => {
      const from = acc;
      acc += s.pct;
      return `${s.color} ${from}% ${acc}%`;
    })
    .join(', ');

  return (
    <div aria-hidden="true" className="relative w-full max-w-md">
      {/* glow */}
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-[hsl(var(--l-accent)/0.35)] to-[hsl(var(--l-accent-2)/0.2)] blur-2xl" />

      <div className="rounded-2xl border border-[hsl(var(--l-fg)/0.1)] bg-[hsl(var(--l-fg)/0.05)] p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-[hsl(var(--l-muted))]">
              Today’s footprint
            </p>
            <p className="font-heading text-3xl font-semibold text-[hsl(var(--l-fg))]">
              <CountUp value={9.4} decimals={1} />{' '}
              <span className="text-sm font-normal text-[hsl(var(--l-muted))]">
                kg CO₂e
              </span>
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-[hsl(var(--l-accent-2))]">
              <ArrowDownRight className="h-3.5 w-3.5" /> 12% lighter than
              yesterday
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--l-fg)/0.1)] bg-[hsl(var(--l-fg)/0.05)] px-2.5 py-1 text-xs font-medium text-[hsl(var(--l-accent-2))]">
            <Sparkles className="h-3 w-3" /> AI
          </span>
        </div>

        <div className="mt-6 flex items-center gap-5">
          <div
            className="relative h-28 w-28 shrink-0 rounded-full"
            style={{ background: `conic-gradient(${stops})` }}
          >
            <div className="absolute inset-[13px] rounded-full bg-[hsl(var(--l-bg-2))]" />
          </div>
          <ul className="flex-1 space-y-1.5">
            {slices.map((s) => (
              <li
                key={s.label}
                className="flex items-center gap-2 text-xs text-[hsl(var(--l-muted))]"
              >
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: s.color }}
                />
                {s.label}
                <span className="ml-auto font-medium tabular-nums text-[hsl(var(--l-fg))]">
                  {s.pct}%
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-xs text-[hsl(var(--l-muted))]">
            6-month trajectory
          </p>
          <svg viewBox="0 0 240 56" className="h-14 w-full" role="presentation">
            <defs>
              <linearGradient id="prevSpark" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="hsl(var(--l-accent))"
                  stopOpacity="0.4"
                />
                <stop
                  offset="100%"
                  stopColor="hsl(var(--l-accent))"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
            <path
              d="M0 16 L40 20 L80 18 L120 28 L160 34 L200 40 L240 46"
              fill="none"
              stroke="hsl(var(--l-accent-2))"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M0 16 L40 20 L80 18 L120 28 L160 34 L200 40 L240 46 L240 56 L0 56 Z"
              fill="url(#prevSpark)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
