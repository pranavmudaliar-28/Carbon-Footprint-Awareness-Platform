import type { NextRequest, NextResponse } from 'next/server';

import { requireUserId } from '@/lib/api/auth';
import { handleError, ok } from '@/lib/api/http';
import { prisma } from '@/lib/db/prisma';
import { upsertGoalSchema } from '@/lib/validators/schemas';

export const dynamic = 'force-dynamic';

/** PUT /api/goal — set or update the monthly reduction target. */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await requireUserId();
    const input = upsertGoalSchema.parse(await request.json());

    const goal = await prisma.goal.upsert({
      where: { userId_month: { userId, month: input.month } },
      update: { targetKg: input.targetKg },
      create: {
        userId,
        month: input.month,
        targetKg: input.targetKg,
      },
    });

    return ok({ goal });
  } catch (err) {
    return handleError(err);
  }
}
