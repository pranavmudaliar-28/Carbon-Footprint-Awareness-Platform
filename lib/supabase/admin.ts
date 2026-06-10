import { createClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client. SERVER-ONLY — bypasses RLS. Used solely to
 * delete the auth user during the "delete my data" flow (spec §11). Never import
 * this into a client component.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Supabase admin client requires URL + service role key');
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
