import { InsightsPanel } from '@/components/features/insights-panel';

export const metadata = { title: 'Insights · Verda' };

export default function InsightsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Your personalized insights
        </h1>
        <p className="text-sm text-muted-foreground">
          We look at where your emissions concentrate and surface the
          highest-impact changes — each with the saving quantified.
        </p>
      </header>

      <InsightsPanel />

      <p className="text-xs text-muted-foreground">
        Estimates use published emission factors and your logged activities.
        They’re directional, not exact — log more to sharpen them.
      </p>
    </div>
  );
}
