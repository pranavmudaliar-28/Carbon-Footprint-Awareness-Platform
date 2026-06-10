import type { NextResponse } from 'next/server';

import { requireUser } from '@/lib/api/auth';
import { handleError, ok } from '@/lib/api/http';
import { buildFootprintSummary } from '@/lib/services/footprint';

export const dynamic = 'force-dynamic';

/** GET /api/footprint — aggregated dashboard data for the current user. */
export async function GET(): Promise<NextResponse> {
  try {
    const { dbUser } = await requireUser();
    const summary = await buildFootprintSummary(
      dbUser.id,
      dbUser.profile?.baselineKg ?? null
    );
    return ok(summary);
  } catch (err) {
    return handleError(err);
  }
}
