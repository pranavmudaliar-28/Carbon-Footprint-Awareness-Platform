import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

import {
  isSupabaseConfigured,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from './config';

const PUBLIC_PATHS = ['/login', '/signup', '/auth', '/'];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

/**
 * Refreshes the Supabase session cookie on every request and guards the
 * authenticated `(app)` routes. Unauthenticated users hitting a protected route
 * are redirected to /login.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // No credentials yet (e.g. fresh clone without .env): skip session handling so
  // the app still boots. Public pages render a setup notice; protected pages
  // bounce to /login. Prevents the per-request "URL and Key required" crash.
  if (!isSupabaseConfigured()) {
    return response;
  }

  const supabase = createServerClient(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: CookieOptions;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: getUser() revalidates the JWT with Supabase — do not trust
  // getSession() alone for authorization decisions.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  if (!user && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  return response;
}
