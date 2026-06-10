/**
 * Centralized public Supabase config. NEXT_PUBLIC vars are inlined at build time,
 * so this module is safe to import on both server and client.
 *
 * `isSupabaseConfigured()` lets the app degrade gracefully (show a setup notice
 * instead of crashing) when credentials are absent — e.g. a fresh clone with no
 * `.env`. See lib/supabase/middleware.ts and components/features/setup-notice.tsx.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  // Require a well-formed http(s) URL so a half-filled .env (e.g. just the
  // project ref) shows the setup notice instead of throwing "Invalid supabaseUrl".
  return Boolean(
    SUPABASE_URL && /^https?:\/\/.+/.test(SUPABASE_URL) && SUPABASE_ANON_KEY
  );
}
