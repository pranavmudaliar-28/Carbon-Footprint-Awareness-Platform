'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/** Light/dark theme toggle. Persists to localStorage; the no-FOUC script in the
 * root layout applies the saved theme before first paint. */
export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('verda-theme', next ? 'dark' : 'light');
    } catch {
      // ignore storage failures
    }
  }

  return (
    <Button
      variant="outline"
      onClick={toggle}
      aria-pressed={mounted ? isDark : undefined}
      className={cn(className)}
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
      {isDark ? 'Switch to light' : 'Switch to dark'}
    </Button>
  );
}
