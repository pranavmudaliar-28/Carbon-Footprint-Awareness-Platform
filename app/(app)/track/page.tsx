import { prisma } from '@/lib/db/prisma';
import { LogForm, type FactorOption } from '@/components/features/log-form';
import { RecentEntries } from '@/components/features/recent-entries';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = { title: 'Track · Verda' };
export const dynamic = 'force-dynamic';

const CATEGORY_ORDER = ['transport', 'energy', 'food', 'shopping', 'travel'];

export default async function TrackPage() {
  const factors = await prisma.emissionFactor.findMany({
    where: { region: 'IN' },
    include: { category: { select: { key: true, label: true } } },
    orderBy: { label: 'asc' },
  });

  const options: FactorOption[] = factors
    .map((f) => ({
      activityKey: f.activityKey,
      label: f.label,
      unit: f.unit,
      co2ePerUnit: f.co2ePerUnit,
      categoryKey: f.category.key,
      categoryLabel: f.category.label,
      source: f.source,
    }))
    .sort(
      (a, b) =>
        CATEGORY_ORDER.indexOf(a.categoryKey) -
        CATEGORY_ORDER.indexOf(b.categoryKey)
    );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Track an activity
        </h1>
        <p className="text-sm text-muted-foreground">
          Pick what you did and we’ll turn it into kg CO₂e using published
          emission factors.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardContent className="pt-6">
            <LogForm factors={options} />
          </CardContent>
        </Card>

        <section className="lg:col-span-2">
          <h2 className="mb-3 font-heading text-lg font-semibold">
            Recent activity
          </h2>
          <RecentEntries factors={options} />
        </section>
      </div>
    </div>
  );
}
