import type { NextRequest, NextResponse } from 'next/server';

import { requireUserId } from '@/lib/api/auth';
import { handleError, ok } from '@/lib/api/http';
import { prisma } from '@/lib/db/prisma';
import { estimateBaseline } from '@/lib/services/onboarding';
import { onboardingSchema } from '@/lib/validators/schemas';

export const dynamic = 'force-dynamic';

/** POST /api/onboarding — compute and store the user's baseline footprint. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await requireUserId();
    const input = onboardingSchema.parse(await request.json());

    const baseline = estimateBaseline(input);

    await prisma.profile.update({
      where: { userId },
      data: {
        householdSize: input.householdSize,
        baselineKg: baseline.totalKg,
      },
    });

    return ok({ baseline });
  } catch (err) {
    return handleError(err);
  }
}
