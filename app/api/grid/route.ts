import type { NextResponse } from 'next/server';

import { requireUserId } from '@/lib/api/auth';
import { handleError, ok } from '@/lib/api/http';
import { getGridIntensity } from '@/lib/services/external/grid-intensity';

export const dynamic = 'force-dynamic';

/** GET /api/grid — live (or fallback) grid carbon intensity for the user's region. */
export async function GET(): Promise<NextResponse> {
  try {
    await requireUserId();
    const grid = await getGridIntensity('IN');
    return ok({ grid });
  } catch (err) {
    return handleError(err);
  }
}
