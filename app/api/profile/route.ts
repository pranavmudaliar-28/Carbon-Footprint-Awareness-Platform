import type { NextRequest, NextResponse } from 'next/server';

import { requireUserId } from '@/lib/api/auth';
import { handleError, ok } from '@/lib/api/http';
import { prisma } from '@/lib/db/prisma';
import { updateProfileSchema } from '@/lib/validators/schemas';

export const dynamic = 'force-dynamic';

/** PATCH /api/profile — update name, country (on User) and household size (Profile). */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await requireUserId();
    const input = updateProfileSchema.parse(await request.json());

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          name: input.name && input.name.length > 0 ? input.name : null,
          country: input.country.toUpperCase(),
        },
      }),
      prisma.profile.update({
        where: { userId },
        data: { householdSize: input.householdSize },
      }),
    ]);

    return ok({ updated: true });
  } catch (err) {
    return handleError(err);
  }
}
