import { ArrowDownRight } from 'lucide-react';

import { Reveal } from '@/components/marketing/reveal';

/** Landing "Watch the number fall" — streak strip + before/after comparison. */
export function ProgressSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <Reveal className="grid items-center gap-10 rounded-3xl border border-[hsl(var(--l-fg)/0.1)] bg-[hsl(var(--l-fg)/0.03)] p-8 backdrop-blur-xl lg:grid-cols-2 lg:p-12">
        <div>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-[hsl(var(--l-fg))] sm:text-4xl">
            Watch the number fall
          </h2>
          <p className="mt-4 text-lg text-[hsl(var(--l-muted))]">
            Small swaps compound. Verda keeps score — week after week — so the
            motivation doesn’t fade after day three.
          </p>
          <div className="mt-6 flex items-center gap-1.5">
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                className={`h-6 w-3 rounded-full ${
                  i < 11
                    ? 'bg-gradient-to-b from-[hsl(var(--l-accent))] to-[hsl(var(--l-accent-2))]'
                    : 'bg-[hsl(var(--l-fg)/0.1)]'
                }`}
              />
            ))}
            <span className="ml-3 text-sm font-medium text-[hsl(var(--l-accent-2))]">
              11-day streak
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[hsl(var(--l-fg)/0.1)] bg-[hsl(var(--l-fg)/0.03)] p-5">
            <p className="text-xs uppercase tracking-wide text-[hsl(var(--l-muted))]">
              Before
            </p>
            <p className="mt-1 font-heading text-3xl font-bold text-[hsl(var(--l-fg))]">
              412 kg
            </p>
            <p className="text-xs text-[hsl(var(--l-muted))]">last month</p>
          </div>
          <div className="rounded-2xl border border-[hsl(var(--l-accent)/0.4)] bg-[hsl(var(--l-accent)/0.08)] p-5">
            <p className="text-xs uppercase tracking-wide text-[hsl(var(--l-accent-2))]">
              On track for
            </p>
            <p className="mt-1 bg-gradient-to-r from-[hsl(var(--l-accent))] to-[hsl(var(--l-accent-2))] bg-clip-text font-heading text-3xl font-bold text-transparent">
              327 kg
            </p>
            <p className="flex items-center gap-1 text-xs text-[hsl(var(--l-accent-2))]">
              <ArrowDownRight className="h-3 w-3" /> 85 kg lighter
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
