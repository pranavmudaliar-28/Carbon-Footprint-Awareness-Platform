import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { getSessionUser } from '@/lib/api/auth';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { AppShell } from '@/components/layout/app-shell';
import { AppFooter } from '@/components/layout/app-footer';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protected routes need a backend — without config, bounce to /login (which
  // shows the setup notice) instead of crashing on client creation.
  if (!isSupabaseConfigured()) redirect('/login');

  // Defense-in-depth: middleware already guards these routes, but verify here too.
  // Deduped per request (React cache) so the page's requireUser() reuses it.
  const user = await getSessionUser();
  if (!user) redirect('/login');

  return (
    <AppShell
      footer={
        <Suspense fallback={null}>
          <AppFooter />
        </Suspense>
      }
    >
      {children}
    </AppShell>
  );
}
