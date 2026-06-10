import { cn } from '@/lib/utils';

/**
 * Verda wordmark (spec §10): a downward-trending leaf beside the name, signalling
 * a shrinking footprint. Mono-color in the primary forest token.
 */
export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span
      className={cn('inline-flex items-center gap-2 text-primary', className)}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        aria-hidden="true"
        role="img"
      >
        {/* leaf with a downward vein — footprint shrinking */}
        <path
          d="M20 4C9 4 4 9.5 4 16c0 1.7.5 3.2 1.3 4.4C8 14 13 10.5 18 9c-4.2 2.4-7.5 6-9.4 10.6C10.8 20.5 13 21 15 21c5 0 5-9 5-17Z"
          fill="currentColor"
        />
      </svg>
      {showText && (
        <span className="font-heading text-xl font-semibold tracking-tight">
          Verda
        </span>
      )}
    </span>
  );
}
