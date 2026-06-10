import type { NextRequest, NextResponse } from 'next/server';

import { requireUserId } from '@/lib/api/auth';
import { handleError, ok } from '@/lib/api/http';
import { prisma } from '@/lib/db/prisma';
import { recordOffsetSchema } from '@/lib/validators/schemas';

export const dynamic = 'force-dynamic';

/** GET /api/offset — the current user's offset history. */
export async function GET(): Promise<NextResponse> {
  try {
    const { userId } = await requireUserId();
    const offsets = await prisma.offsetAction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    const totalKg = offsets.reduce((sum, o) => sum + o.offsetKg, 0);
    return ok({ offsets, totalKg: Math.round(totalKg * 10) / 10 });
  } catch (err) {
    return handleError(err);
  }
}

/** POST /api/offset — record an offset the user took (spec §16.3). */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await requireUserId();
    const input = recordOffsetSchema.parse(await request.json());

    const offset = await prisma.offsetAction.create({
      data: {
        userId,
        provider: input.provider,
        offsetKg: input.offsetKg,
      },
    });

    return ok({ offset }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
