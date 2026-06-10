import { cache } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Prisma } from '@prisma/client';

import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { prisma } from '@/lib/db/prisma';
import { ApiError } from '@/lib/api/http';

export type DbUserWithProfile = Prisma.UserGetPayload<{
  include: { profile: true };
}>;

/**
 * Verified session user, deduped per request via React cache(). The (app) layout
 * and the page it renders both call this in the same request, so the remote
 * getUser() round-trip runs once instead of twice. Returns null if signed out or
 * unconfigured.
 */
export const getSessionUser = cache(async (): Promise<SupabaseUser | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  // The middleware (updateSession) already revalidates the JWT against Supabase
  // on every request, so here we read the session from the cookie LOCALLY — no
  // extra network round-trip per page. (getUser() would re-hit the auth server.)
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
});

function emailFor(user: SupabaseUser): string {
  return user.email ?? `${user.id}@no-email.verda.local`;
}

/**
 * Ensure the mirror `public.User` row exists — at most ONCE per server process
 * per user (in-memory set), so the hot path doesn't pay a DB write on every
 * request. `User.id` = the auth uid so RLS (`auth.uid() = userId`) lines up.
 */
const ensuredUserIds = new Set<string>();
async function ensureUserOnce(user: SupabaseUser): Promise<void> {
  if (ensuredUserIds.has(user.id)) return;
  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: { id: user.id, email: emailFor(user), profile: { create: {} } },
  });
  ensuredUserIds.add(user.id);
}

/**
 * Verified user id only — NO per-request DB read on the hot path. Use in API
 * routes/handlers that just scope queries by userId. Client-supplied ids are
 * never trusted (spec §11).
 */
export async function requireUserId(): Promise<{
  userId: string;
  authUser: SupabaseUser;
}> {
  if (!isSupabaseConfigured()) {
    throw new ApiError(
      503,
      'Supabase is not configured. Add credentials to .env.'
    );
  }
  const user = await getSessionUser();
  if (!user) throw new ApiError(401, 'Unauthorized');
  await ensureUserOnce(user);
  return { userId: user.id, authUser: user };
}

/**
 * Full mirrored DB user incl. profile — for routes/pages that need profile or
 * country (dashboard, offset, settings, footprint). One read after the row is
 * ensured.
 */
export async function requireUser(): Promise<{
  authUser: SupabaseUser;
  dbUser: DbUserWithProfile;
}> {
  const { authUser } = await requireUserId();
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: { profile: true },
  });
  if (dbUser) return { authUser, dbUser };

  // Defensive: row vanished (e.g. ensured set stale) — recreate.
  const created = await prisma.user.upsert({
    where: { id: authUser.id },
    update: {},
    create: {
      id: authUser.id,
      email: emailFor(authUser),
      profile: { create: {} },
    },
    include: { profile: true },
  });
  return { authUser, dbUser: created };
}
