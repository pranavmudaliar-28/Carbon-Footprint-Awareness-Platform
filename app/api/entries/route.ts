import type { NextRequest, NextResponse } from 'next/server';

import { requireUserId } from '@/lib/api/auth';
import { ApiError, handleError, ok } from '@/lib/api/http';
import { prisma } from '@/lib/db/prisma';
import { calculateCo2e } from '@/lib/services/carbon';
import { resolveFactor } from '@/lib/services/external/emission-factors';
import { createEntrySchema } from '@/lib/validators/schemas';

export const dynamic = 'force-dynamic';

/** GET /api/entries — the current user's entries (most recent first). */
export async function GET(): Promise<NextResponse> {
  try {
    const { userId } = await requireUserId();
    const entries = await prisma.activityEntry.findMany({
      where: { userId },
      orderBy: { occurredOn: 'desc' },
      take: 100,
      include: { category: { select: { key: true, label: true } } },
    });
    return ok({ entries });
  } catch (err) {
    return handleError(err);
  }
}

/** POST /api/entries — log an activity. co2eKg is computed & stored server-side. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await requireUserId();
    const body = await request.json();
    const input = createEntrySchema.parse(body);

    // Look up the emission factor (region IN) — source of truth for the factor.
    const factor = await prisma.emissionFactor.findUnique({
      where: {
        activityKey_region: { activityKey: input.activityKey, region: 'IN' },
      },
      include: { category: true },
    });
    if (!factor) {
      throw new ApiError(400, `Unknown activity: ${input.activityKey}`);
    }

    // Resolve via the factor service — live (Climatiq) when configured, else the
    // seeded DB factor (deterministic fallback).
    const resolved = await resolveFactor(factor);
    const co2eKg = calculateCo2e(input.quantity, {
      co2ePerUnit: resolved.co2ePerUnit,
    });

    const entry = await prisma.activityEntry.create({
      data: {
        userId,
        categoryId: factor.categoryId,
        activityKey: input.activityKey,
        quantity: input.quantity,
        co2eKg,
        occurredOn: input.occurredOn ? new Date(input.occurredOn) : new Date(),
      },
      include: { category: { select: { key: true, label: true } } },
    });

    return ok({ entry }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
