import { NextResponse, type NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/** POST /auth/signout — clear the session and return to login. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/login', request.url), { status: 303 });
}
