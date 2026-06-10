import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

/**
 * Server-side Supabase client bound to the request cookies (httpOnly). Tokens
 * never touch localStorage (spec §11). Use in Server Components, Route Handlers,
 * and Server Actions.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: CookieOptions;
          }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // `setAll` called from a Server Component — safe to ignore; the
            // middleware refreshes the session cookie on the way through.
          }
        },
      },
    }
  );
}
