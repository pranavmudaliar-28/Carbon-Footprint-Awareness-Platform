'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { TooltipProvider } from '@/components/ui/tooltip';

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

/** App-wide client providers: TanStack Query cache + Radix tooltip context. */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        {children}
        <ProgressBar
          height="4px"
          color="#16a34a"
          options={{ showSpinner: false }}
          shallowRouting
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
