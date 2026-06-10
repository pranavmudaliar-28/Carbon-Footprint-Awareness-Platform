import type { NextResponse } from 'next/server';

import { requireUserId } from '@/lib/api/auth';
import { handleError, fail, ok } from '@/lib/api/http';
import { prisma } from '@/lib/db/prisma';
import { getUserAggregatableEntries } from '@/lib/db/queries';
import {
  breakdownByCategory,
  filterByMonth,
  monthKey,
  topActivityKey,
  totalKg,
} from '@/lib/services/aggregate';
import { generateInsight, rankedOpportunities } from '@/lib/services/insights';
import { lessonForCategory } from '@/lib/services/education';
import { rateLimit } from '@/lib/services/rate-limit';
import { CATEGORY_META, kgToKmEquivalent } from '@/lib/constants/categories';
import type { CategoryKey, InsightContext } from '@/lib/types';

// Per-user limit on the (potentially paid) AI endpoint — spec §11.
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

export const dynamic = 'force-dynamic';

/** GET /api/insights — the single highest-impact change for the current user. */
export async function GET(): Promise<NextResponse> {
  try {
    const { userId } = await requireUserId();

    const limited = rateLimit(
      `insights:${userId}`,
      RATE_LIMIT,
      RATE_WINDOW_MS
    );
    if (!limited.ok) {
      const retryAfter = Math.ceil((limited.resetAt - Date.now()) / 1000);
      return fail(429, 'Too many requests — please wait a moment.', {
        retryAfter,
      });
    }

    const [entries, goal, recommendations] = await Promise.all([
      getUserAggregatableEntries(userId),
      prisma.goal.findUnique({
        where: {
          userId_month: { userId, month: monthKey(new Date()) },
        },
      }),
      prisma.recommendation.findMany(),
    ]);

    const month = monthKey(new Date());
    const monthEntries = filterByMonth(entries, month);

    const context: InsightContext = {
      monthlyFootprintKg: totalKg(monthEntries),
      breakdownByCategory: breakdownByCategory(monthEntries),
      topActivity: topActivityKey(monthEntries),
      userGoalKg: goal?.targetKg ?? null,
      region: 'IN',
    };

    // Top-3 ranked opportunities (deterministic), with the #1 optionally
    // enriched by the AI coach when an API key is configured.
    const opportunities = rankedOpportunities(context, recommendations, 3);
    const primary = await generateInsight(context, recommendations);
    if (primary.source === 'ai' && opportunities[0]) {
      const rec = recommendations
        .filter((r) => r.categoryKey === primary.category)
        .sort((a, b) => b.avgSavingKg - a.avgSavingKg)[0];
      opportunities[0] = {
        insight: primary,
        recommendationId: rec?.id ?? opportunities[0].recommendationId,
      };
    }

    const insights = opportunities.map((o) => ({
      ...o.insight,
      recommendationId: o.recommendationId,
      equivalentKm: kgToKmEquivalent(o.insight.estimatedSavingKg),
    }));

    // Per-category breakdown with a short, actionable tip.
    const total = context.monthlyFootprintKg;
    const breakdown = (
      Object.entries(context.breakdownByCategory) as [CategoryKey, number][]
    )
      .sort((a, b) => b[1] - a[1])
      .map(([category, co2eKg]) => {
        const rec = recommendations
          .filter((r) => r.categoryKey === category)
          .sort((a, b) => b.avgSavingKg - a.avgSavingKg)[0];
        return {
          category,
          label: CATEGORY_META[category].label,
          co2eKg,
          pct: total > 0 ? Math.round((co2eKg / total) * 100) : 0,
          tip: rec?.title ?? lessonForCategory(category)?.title ?? '',
        };
      });

    return ok({ insights, breakdown });
  } catch (err) {
    return handleError(err);
  }
}
