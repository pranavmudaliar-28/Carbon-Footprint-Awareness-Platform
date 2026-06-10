import Link from 'next/link';

import { Flame, TreePine } from 'lucide-react';

import { requireUser } from '@/lib/api/auth';
import { buildFootprintSummary } from '@/lib/services/footprint';
import { treesEquivalent } from '@/lib/services/offset';
import { kgToKmEquivalent } from '@/lib/constants/categories';
import { StatCard } from '@/components/features/stat-card';
import { EmptyState } from '@/components/features/empty-state';
import { InsightCard } from '@/components/features/insight-card';
import { GridBanner } from '@/components/features/grid-banner';
import { OffsetCard } from '@/components/features/offset-card';
import { LessonCard } from '@/components/features/lesson-card';
import { CategoryDonut, TrendChart } from '@/components/charts/lazy-charts';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata = { title: 'Dashboard · Verda' };
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { dbUser } = await requireUser();
  const summary = await buildFootprintSummary(
    dbUser.id,
    dbUser.profile?.baselineKg ?? null
  );

  const hasData = summary.entryCount > 0;
  const vsAvg = summary.totalKg - summary.nationalAvgKg;
  const vsAvgPct =
    summary.nationalAvgKg > 0
      ? Math.round((vsAvg / summary.nationalAvgKg) * 100)
      : 0;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Your footprint
            </h1>
            {summary.streakDays > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-forest-500/15 px-3 py-1 text-sm font-medium text-forest-700">
                <Flame className="h-4 w-4" aria-hidden="true" />
                {summary.streakDays}-day streak
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {summary.month} · {summary.entryCount} activit
            {summary.entryCount === 1 ? 'y' : 'ies'} logged
          </p>
        </div>
        <Button asChild>
          <Link href="/track">Track activity</Link>
        </Button>
      </header>

      <GridBanner />

      {!hasData ? (
        <>
          <EmptyState
            title="Track your first activity to see your footprint take shape."
            description="Add a commute, a meal, or your electricity use — Verda turns it into a clear number and a personal next step."
            ctaLabel="Track an activity"
            ctaHref="/track"
          />
          <InsightCard />
        </>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="This month"
              value={summary.totalKg}
              deltaKg={summary.delta.deltaKg}
              deltaPct={summary.delta.deltaPct}
              caption={`≈ ${kgToKmEquivalent(summary.totalKg)} km of driving`}
            />
            <StatCard
              label="Projected with your actions"
              value={summary.projectedKg}
              animate={false}
              deltaKg={
                summary.activeSavingsKg > 0 ? -summary.activeSavingsKg : null
              }
              caption={
                summary.activeSavingsKg > 0
                  ? `${summary.activeSavingsKg} kg/mo saved from your actions`
                  : 'Accept an action to project savings'
              }
            />
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Offset to date</CardDescription>
                <CardTitle className="text-3xl">
                  {summary.offsetTotalKg}{' '}
                  <span className="text-base font-normal text-muted-foreground">
                    kg CO₂e
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="flex items-center gap-1 text-sm font-medium text-forest-700">
                  <TreePine className="h-4 w-4" aria-hidden="true" />
                  {summary.offsetTotalKg > 0
                    ? `≈ ${treesEquivalent(summary.offsetTotalKg)} trees`
                    : 'Offset your residual below'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>vs national average</CardDescription>
                <CardTitle className="text-3xl">
                  {Math.abs(vsAvgPct)}%{' '}
                  <span
                    className={
                      vsAvg <= 0
                        ? 'text-base font-normal text-forest-700'
                        : 'text-base font-normal text-ember-500'
                    }
                  >
                    {vsAvg <= 0 ? 'lower' : 'higher'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">
                  India avg ≈ {summary.nationalAvgKg} kg CO₂e/month (Our World in
                  Data)
                </p>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">By category</CardTitle>
                <CardDescription>Where this month’s emissions come from</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryDonut data={summary.breakdown} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trend</CardTitle>
                <CardDescription>
                  Last 6 months{summary.goal ? ' vs your goal' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TrendChart
                  data={summary.trend}
                  goalKg={summary.goal?.targetKg ?? null}
                />
              </CardContent>
            </Card>
          </section>

          <InsightCard />

          {summary.breakdown[0] && (
            <LessonCard categoryKey={summary.breakdown[0].category} />
          )}

          <OffsetCard residualKg={summary.projectedKg} />
        </>
      )}
    </div>
  );
}
