import { createBrowserClient } from '@supabase/ssr';

import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

/** Browser-side Supabase client (anon key only — safe to ship). */
export function createClient() {
  return createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
}
