import { prisma } from '@/lib/db/prisma';
import type { AggregatableEntry } from '@/lib/services/aggregate';
import type { CategoryKey } from '@/lib/types';

/**
 * Fetch a user's entries in the shape the pure aggregation service expects.
 * Always scoped by userId (spec §11). Indexed by [userId, occurredOn] (spec §5).
 */
export async function getUserAggregatableEntries(
  userId: string
): Promise<AggregatableEntry[]> {
  const rows = await prisma.activityEntry.findMany({
    where: { userId },
    select: {
      co2eKg: true,
      occurredOn: true,
      activityKey: true,
      category: { select: { key: true } },
    },
    orderBy: { occurredOn: 'asc' },
  });

  return rows.map((r) => ({
    categoryKey: r.category.key as CategoryKey,
    activityKey: r.activityKey,
    co2eKg: r.co2eKg,
    occurredOn: r.occurredOn,
  }));
}

/**
 * Sum of expected monthly savings from the user's adopted actions — both
 * `active` (committed) and `completed` (done). Only `dismissed` actions are
 * excluded: completing an action still reduces your footprint.
 */
export async function getAdoptedActionSavingsKg(
  userId: string
): Promise<number> {
  const actions = await prisma.userAction.findMany({
    where: { userId, status: { in: ['active', 'completed'] } },
    select: { recommendation: { select: { avgSavingKg: true } } },
  });
  return actions.reduce((sum, a) => sum + a.recommendation.avgSavingKg, 0);
}

/** Total CO₂e the user has offset to date (all OffsetActions). */
export async function getTotalOffsetKg(userId: string): Promise<number> {
  const agg = await prisma.offsetAction.aggregate({
    where: { userId },
    _sum: { offsetKg: true },
  });
  return agg._sum.offsetKg ?? 0;
}
