import type { NextRequest, NextResponse } from 'next/server';

import { requireUserId } from '@/lib/api/auth';
import { ApiError, handleError, ok } from '@/lib/api/http';
import { prisma } from '@/lib/db/prisma';
import { updateActionSchema } from '@/lib/validators/schemas';

export const dynamic = 'force-dynamic';

/** PATCH /api/actions/[id] — update an action's status (complete / dismiss). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { userId } = await requireUserId();
    const input = updateActionSchema.parse(await request.json());

    // Ownership check before mutating — never trust the path id alone.
    const existing = await prisma.userAction.findFirst({
      where: { id: params.id, userId },
    });
    if (!existing) {
      throw new ApiError(404, 'Action not found');
    }

    const action = await prisma.userAction.update({
      where: { id: existing.id },
      data: { status: input.status },
      include: { recommendation: true },
    });

    return ok({ action });
  } catch (err) {
    return handleError(err);
  }
}
