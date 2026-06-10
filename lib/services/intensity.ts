/**
 * Emission-intensity classification for a single entry/preview (kg CO₂e).
 * Pure & unit-tested. One source of truth for the low/medium/high thresholds and
 * their associated Badge variant + text-tone class.
 */
export type IntensityLevel = 'low' | 'medium' | 'high';

export interface Intensity {
  level: IntensityLevel;
  /** Badge variant (matches components/ui/badge variants). */
  badge: IntensityLevel;
  /** Tailwind text-color token class for inline figures. */
  toneClass: string;
  /** Short human label. */
  label: string;
}

export function emissionIntensity(kg: number): Intensity {
  if (kg < 2) {
    return { level: 'low', badge: 'low', toneClass: 'text-forest-700', label: 'Low impact' };
  }
  if (kg <= 10) {
    return { level: 'medium', badge: 'medium', toneClass: 'text-amber-400', label: 'Medium impact' };
  }
  return { level: 'high', badge: 'high', toneClass: 'text-ember-500', label: 'High impact' };
}
