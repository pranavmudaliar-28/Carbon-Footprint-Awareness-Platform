import { Car, Utensils, Zap } from 'lucide-react';

const entries = [
  { time: '8:15', label: 'Morning commute', detail: '12 km, petrol car', kg: 3.2, icon: Car, color: 'hsl(var(--l-accent))' },
  { time: '13:00', label: 'Lunch', detail: 'Chicken bowl', kg: 1.4, icon: Utensils, color: 'hsl(45 88% 62%)' },
  { time: '19:30', label: 'Home energy', detail: 'AC + cooking', kg: 4.8, icon: Zap, color: 'hsl(var(--l-accent-2))' },
];

/** Tangible "a day in carbon" timeline (decorative sample data). */
export function DailyTimeline() {
  return (
    <div className="rounded-2xl border border-[hsl(var(--l-fg)/0.1)] bg-[hsl(var(--l-fg)/0.04)] p-6 backdrop-blur-xl sm:p-8">
      <ol className="relative space-y-5 before:absolute before:left-[1.15rem] before:top-2 before:h-[calc(100%-3.5rem)] before:w-px before:bg-[hsl(var(--l-fg)/0.1)]">
        {entries.map(({ time, label, detail, kg, icon: Icon, color }) => (
          <li key={time} className="relative flex items-center gap-4">
            <span
              className="z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[hsl(var(--l-fg)/0.1)] bg-[hsl(var(--l-fg)/0.06)]"
              style={{ color }}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[hsl(var(--l-fg))]">
                {label}
              </p>
              <p className="text-xs text-[hsl(var(--l-muted))]">
                {time} · {detail}
              </p>
            </div>
            <span className="font-heading text-lg font-semibold tabular-nums text-[hsl(var(--l-fg))]">
              {kg} kg
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex items-center justify-between border-t border-[hsl(var(--l-fg)/0.1)] pt-5">
        <p className="text-sm text-[hsl(var(--l-muted))]">Daily total</p>
        <p className="bg-gradient-to-r from-[hsl(var(--l-accent))] to-[hsl(var(--l-accent-2))] bg-clip-text font-heading text-2xl font-bold text-transparent">
          9.4 kg CO₂e
        </p>
      </div>
    </div>
  );
}
