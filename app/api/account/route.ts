import type { NextResponse } from 'next/server';

import { requireUserId } from '@/lib/api/auth';
import { handleError, ok } from '@/lib/api/http';
import { prisma } from '@/lib/db/prisma';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/account — "delete my data" (spec §11, privacy compliance).
 * Cascades all user-owned rows (Prisma onDelete: Cascade) and removes the
 * Supabase auth user via the service-role client, then signs out.
 */
export async function DELETE(): Promise<NextResponse> {
  try {
    const { userId } = await requireUserId();

    // 1. Remove application data (cascades Profile, entries, actions, goals…).
    await prisma.user.delete({ where: { id: userId } });

    // 2. Remove the auth identity.
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(userId);

    // 3. Clear the session cookie.
    const supabase = createClient();
    await supabase.auth.signOut();

    return ok({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
