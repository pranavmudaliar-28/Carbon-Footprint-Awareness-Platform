'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Animated number count-up (spec §8). Honors prefers-reduced-motion by jumping
 * straight to the final value (spec §12).
 */
export function CountUp({
  value,
  durationMs = 800,
  decimals = 0,
  className,
}: {
  value: number;
  durationMs?: number;
  decimals?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) {
      setDisplay(value);
      return;
    }

    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplay(from + (value - from) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, durationMs]);

  return <span className={className}>{display.toFixed(decimals)}</span>;
}
