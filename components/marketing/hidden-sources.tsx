import { Shirt, Plane, Beef } from 'lucide-react';

const sources = [
  {
    icon: Shirt,
    headline: 'One new T-shirt',
    big: '8 kg',
    sub: '≈ 47 km of driving — baked in before you’ve worn it once.',
  },
  {
    icon: Plane,
    headline: 'A short domestic flight',
    big: '≈ a month',
    sub: 'of daily bus commutes, gone in two hours in the air.',
  },
  {
    icon: Beef,
    headline: 'A single beef dinner',
    big: '12×',
    sub: 'the carbon of the same meal made vegetarian.',
  },
];

/** "The footprint you can't feel" — surprising equivalency cards. */
export function HiddenSources() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {sources.map(({ icon: Icon, headline, big, sub }) => (
        <div
          key={headline}
          className="rounded-2xl border border-[hsl(var(--l-fg)/0.1)] bg-[hsl(var(--l-fg)/0.04)] p-6 backdrop-blur-xl"
        >
          <Icon
            className="h-7 w-7 text-[hsl(var(--l-accent-2))]"
            aria-hidden="true"
          />
          <p className="mt-4 text-sm text-[hsl(var(--l-muted))]">{headline}</p>
          <p className="mt-1 bg-gradient-to-r from-[hsl(var(--l-accent))] to-[hsl(var(--l-accent-2))] bg-clip-text font-heading text-3xl font-bold text-transparent">
            {big}
          </p>
          <p className="mt-2 text-sm text-[hsl(var(--l-fg))]/80">{sub}</p>
        </div>
      ))}
    </div>
  );
}
