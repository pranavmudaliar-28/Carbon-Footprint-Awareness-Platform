import type { NextRequest, NextResponse } from 'next/server';

import { requireUserId } from '@/lib/api/auth';
import { ApiError, handleError, ok } from '@/lib/api/http';
import { prisma } from '@/lib/db/prisma';
import { acceptActionSchema } from '@/lib/validators/schemas';

export const dynamic = 'force-dynamic';

/** GET /api/actions — all recommendations plus the current user's adopted actions. */
export async function GET(): Promise<NextResponse> {
  try {
    const { userId } = await requireUserId();
    const [recommendations, userActions] = await Promise.all([
      prisma.recommendation.findMany({ orderBy: { avgSavingKg: 'desc' } }),
      prisma.userAction.findMany({
        where: { userId },
        include: { recommendation: true },
        orderBy: { adoptedAt: 'desc' },
      }),
    ]);
    return ok({ recommendations, userActions });
  } catch (err) {
    return handleError(err);
  }
}

/** POST /api/actions — accept a recommendation (adjusts projected footprint). */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await requireUserId();
    const input = acceptActionSchema.parse(await request.json());

    const recommendation = await prisma.recommendation.findUnique({
      where: { id: input.recommendationId },
    });
    if (!recommendation) {
      throw new ApiError(404, 'Recommendation not found');
    }

    // Re-activate an existing (e.g. dismissed) action, else create a new one.
    const existing = await prisma.userAction.findFirst({
      where: { userId, recommendationId: input.recommendationId },
    });

    const action = existing
      ? await prisma.userAction.update({
          where: { id: existing.id },
          data: { status: 'active' },
          include: { recommendation: true },
        })
      : await prisma.userAction.create({
          data: {
            userId,
            recommendationId: input.recommendationId,
            status: 'active',
          },
          include: { recommendation: true },
        });

    return ok({ action }, { status: existing ? 200 : 201 });
  } catch (err) {
    return handleError(err);
  }
}
