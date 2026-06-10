import { Suspense } from 'react';

import { AuthForm } from '@/components/features/auth-form';

export const metadata = { title: 'Sign up · Verda' };

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Start understanding your footprint in minutes.
        </p>
      </div>
      <Suspense fallback={null}>
        <AuthForm mode="signup" />
      </Suspense>
    </div>
  );
}
