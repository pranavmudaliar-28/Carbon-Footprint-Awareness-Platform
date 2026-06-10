import { Suspense } from 'react';

import { AuthForm } from '@/components/features/auth-form';

export const metadata = { title: 'Log in · Verda' };

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Log in to pick up where you left off.
        </p>
      </div>
      <Suspense fallback={null}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
