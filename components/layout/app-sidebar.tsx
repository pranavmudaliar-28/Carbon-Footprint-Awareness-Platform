'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Lightbulb,
  ListChecks,
  TreePine,
  GraduationCap,
  Settings,
  LogOut,
  Loader2,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Logo } from '@/components/brand/logo';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/track', label: 'Track', icon: PlusCircle },
  { href: '/insights', label: 'Insights', icon: Lightbulb },
  { href: '/actions', label: 'Actions', icon: ListChecks },
  { href: '/offset', label: 'Offset', icon: TreePine },
  { href: '/learn', label: 'Learn', icon: GraduationCap },
  { href: '/settings', label: 'Settings', icon: Settings },
];

/**
 * Vertical navigation. Shared by the desktop sidebar and the mobile drawer.
 * `onNavigate` lets the drawer close itself when a link is tapped.
 */
export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  useEffect(() => {
    // Clear loading state when pathname changes (navigation complete)
    setLoadingPath(null);
  }, [pathname]);

  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex rounded-button px-2 py-1"
        onClick={() => {
          if (pathname !== '/dashboard') setLoadingPath('/dashboard');
          onNavigate?.();
        }}
      >
        <Logo />
      </Link>

      <nav aria-label="Primary" className="flex-1">
        <ul className="space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => {
                    if (!active) setLoadingPath(href);
                    onNavigate?.();
                  }}
                  className={cn(
                    'flex items-center gap-3 rounded-button px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    active
                      ? 'bg-muted text-forest-700'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {loadingPath === href ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
                  ) : (
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <form action="/auth/signout" method="post" className="mt-auto">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-button px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          Sign out
        </button>
      </form>
    </div>
  );
}
