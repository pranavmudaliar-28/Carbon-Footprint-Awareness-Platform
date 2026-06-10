-- ─────────────────────────────────────────────────────────────────────────────
-- Verda — Row-Level Security policies (spec §5, §11).
--
-- Defense-in-depth. The Next.js app talks to Postgres through Prisma using a
-- privileged role that BYPASSES RLS; the app layer enforces ownership by scoping
-- every query to the verified session user (see lib/api/auth.ts). These policies
-- additionally lock down ANY access that arrives through the Supabase client /
-- PostgREST (anon or authenticated JWT), so a leaked anon key cannot read or
-- write another user's rows.
--
-- Model `User.id` is set to the Supabase auth user id on first login, so
-- `auth.uid()` matches our `id` / `userId` columns.
--
-- Apply with:  npm run prisma:rls
-- (or paste into the Supabase SQL editor)
-- ─────────────────────────────────────────────────────────────────────────────

-- Helper: enable RLS + owner policy on a user-owned table whose owner column is "userId".
-- (Written out explicitly per table for clarity / auditability.)

-- ── User ─────────────────────────────────────────────────────────────────────
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_self_access" ON "User";
CREATE POLICY "user_self_access" ON "User"
  USING ("id" = auth.uid()::text)
  WITH CHECK ("id" = auth.uid()::text);

-- ── Profile ──────────────────────────────────────────────────────────────────
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profile_owner_access" ON "Profile";
CREATE POLICY "profile_owner_access" ON "Profile"
  USING ("userId" = auth.uid()::text)
  WITH CHECK ("userId" = auth.uid()::text);

-- ── ActivityEntry ────────────────────────────────────────────────────────────
ALTER TABLE "ActivityEntry" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "entry_owner_access" ON "ActivityEntry";
CREATE POLICY "entry_owner_access" ON "ActivityEntry"
  USING ("userId" = auth.uid()::text)
  WITH CHECK ("userId" = auth.uid()::text);

-- ── UserAction ───────────────────────────────────────────────────────────────
ALTER TABLE "UserAction" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "action_owner_access" ON "UserAction";
CREATE POLICY "action_owner_access" ON "UserAction"
  USING ("userId" = auth.uid()::text)
  WITH CHECK ("userId" = auth.uid()::text);

-- ── Goal ─────────────────────────────────────────────────────────────────────
ALTER TABLE "Goal" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "goal_owner_access" ON "Goal";
CREATE POLICY "goal_owner_access" ON "Goal"
  USING ("userId" = auth.uid()::text)
  WITH CHECK ("userId" = auth.uid()::text);

-- ── UserAchievement ──────────────────────────────────────────────────────────
ALTER TABLE "UserAchievement" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_achievement_owner_access" ON "UserAchievement";
CREATE POLICY "user_achievement_owner_access" ON "UserAchievement"
  USING ("userId" = auth.uid()::text)
  WITH CHECK ("userId" = auth.uid()::text);

-- ── OffsetAction (v2 §16.3) ──────────────────────────────────────────────────
ALTER TABLE "OffsetAction" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "offset_owner_access" ON "OffsetAction";
CREATE POLICY "offset_owner_access" ON "OffsetAction"
  USING ("userId" = auth.uid()::text)
  WITH CHECK ("userId" = auth.uid()::text);

-- ── Reference tables — read-only to any authenticated user, no writes ─────────
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "category_read" ON "Category";
CREATE POLICY "category_read" ON "Category" FOR SELECT
  USING (auth.role() = 'authenticated');

ALTER TABLE "EmissionFactor" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "factor_read" ON "EmissionFactor";
CREATE POLICY "factor_read" ON "EmissionFactor" FOR SELECT
  USING (auth.role() = 'authenticated');

ALTER TABLE "Recommendation" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "recommendation_read" ON "Recommendation";
CREATE POLICY "recommendation_read" ON "Recommendation" FOR SELECT
  USING (auth.role() = 'authenticated');

ALTER TABLE "Achievement" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "achievement_read" ON "Achievement";
CREATE POLICY "achievement_read" ON "Achievement" FOR SELECT
  USING (auth.role() = 'authenticated');

-- GridSnapshot is regional cache (no user column) — authenticated read only.
ALTER TABLE "GridSnapshot" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "grid_read" ON "GridSnapshot";
CREATE POLICY "grid_read" ON "GridSnapshot" FOR SELECT
  USING (auth.role() = 'authenticated');
