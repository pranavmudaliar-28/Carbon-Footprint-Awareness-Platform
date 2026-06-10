import { NextResponse, type NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * OAuth / email-confirmation callback. Exchanges the `code` for a session and
 * redirects into the app. On first login the DB user is created lazily by
 * `requireUser` on the first authenticated API call.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
