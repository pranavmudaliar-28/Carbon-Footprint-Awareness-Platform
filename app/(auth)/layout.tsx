import Link from 'next/link';

import { Logo } from '@/components/brand/logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-leaf-50 px-6 py-12">
      <Link href="/" className="mb-8 rounded-button">
        <Logo />
      </Link>
      <div className="w-full max-w-sm rounded-card border border-border bg-card p-8 shadow-soft">
        {children}
      </div>
    </div>
  );
}
