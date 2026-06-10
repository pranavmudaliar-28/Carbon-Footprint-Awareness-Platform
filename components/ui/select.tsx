import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Native <select> wrapper. Native is intentional: it is fully keyboard- and
 * screen-reader-accessible out of the box and mobile-friendly (spec §12).
 */
const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        'flex h-10 w-full appearance-none rounded-button border border-input bg-surface px-3 py-2 pr-9 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      aria-hidden="true"
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
    />
  </div>
));
Select.displayName = 'Select';

export { Select };
