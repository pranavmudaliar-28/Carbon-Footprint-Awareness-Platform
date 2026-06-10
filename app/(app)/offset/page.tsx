import { requireUser } from '@/lib/api/auth';
import { buildFootprintSummary } from '@/lib/services/footprint';
import { OffsetCard } from '@/components/features/offset-card';
import { OffsetHistory } from '@/components/features/offset-history';
import { EmptyState } from '@/components/features/empty-state';

export const metadata = { title: 'Offset · Verda' };
export const dynamic = 'force-dynamic';

export default async function OffsetPage() {
  const { dbUser } = await requireUser();
  const summary = await buildFootprintSummary(
    dbUser.id,
    dbUser.profile?.baselineKg ?? null
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Offset
        </h1>
        <p className="text-sm text-muted-foreground">
          Understand → Track → Reduce → Offset the rest. Fund verified climate
          projects sized to your residual footprint.
        </p>
      </header>

      {summary.projectedKg > 0 ? (
        <OffsetCard residualKg={summary.projectedKg} />
      ) : (
        <EmptyState
          title="Nothing left to offset yet"
          description="Track some activities to see your residual footprint and curated offset options."
          ctaLabel="Track an activity"
          ctaHref="/track"
        />
      )}

      <OffsetHistory />
    </div>
  );
}
