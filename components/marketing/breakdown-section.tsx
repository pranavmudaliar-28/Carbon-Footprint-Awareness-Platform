import { Reveal } from '@/components/marketing/reveal';
import { CarbonScore } from '@/components/marketing/carbon-score';

const bars = [
  { label: 'Transport', pct: 46 },
  { label: 'Home energy', pct: 28 },
  { label: 'Food', pct: 18 },
  { label: 'Everything else', pct: 8 },
];

/** Landing "Most people guess wrong…" — breakdown bars + the vs-average gauge. */
export function BreakdownSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <Reveal className="grid items-center gap-10 rounded-3xl border border-[hsl(var(--l-fg)/0.1)] bg-[hsl(var(--l-fg)/0.03)] p-8 backdrop-blur-xl lg:grid-cols-[1fr_auto] lg:p-12">
        <div>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-[hsl(var(--l-fg))] sm:text-4xl">
            Most people guess wrong about their biggest source
          </h2>
          <p className="mt-4 max-w-xl text-lg text-[hsl(var(--l-muted))]">
            The numbers don’t. Verda rolls everything into one honest picture —
            and shows you precisely which slice of your life weighs the most.
          </p>
          <div className="mt-6 space-y-3">
            {bars.map((b) => (
              <div key={b.label}>
                <div className="flex justify-between text-sm text-[hsl(var(--l-fg))]">
                  <span>{b.label}</span>
                  <span className="tabular-nums text-[hsl(var(--l-muted))]">
                    {b.pct}%
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-[hsl(var(--l-fg)/0.05)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--l-accent))] to-[hsl(var(--l-accent-2))]"
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid justify-items-center gap-3">
          <CarbonScore score={71} suffix="% lighter" />
          <p className="text-center text-sm text-[hsl(var(--l-muted))]">
            Your footprint vs the
            <br />
            <span className="text-[hsl(var(--l-accent-2))]">
              India per-capita average
            </span>
          </p>
        </div>
      </Reveal>
    </section>
  );
}
