import type { CategoryKey } from '@/lib/types';

/**
 * Presentation metadata for the five categories (spec §2, §9).
 * Emission FACTORS live in the DB — only display data lives here.
 * `color` references a semantic Tailwind token, never a raw hex (spec §9).
 */
export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  /** lucide-react icon name */
  icon: string;
  /** Tailwind text/fill token for charts and badges */
  colorVar: string;
}

export const CATEGORY_META: Record<CategoryKey, CategoryMeta> = {
  transport: { key: 'transport', label: 'Transport', icon: 'Car', colorVar: 'hsl(var(--forest-700))' },
  energy: { key: 'energy', label: 'Energy', icon: 'Zap', colorVar: 'hsl(var(--sky-500))' },
  food: { key: 'food', label: 'Food', icon: 'Utensils', colorVar: 'hsl(var(--forest-500))' },
  shopping: { key: 'shopping', label: 'Shopping', icon: 'ShoppingBag', colorVar: 'hsl(var(--amber-400))' },
  travel: { key: 'travel', label: 'Travel', icon: 'Plane', colorVar: 'hsl(var(--ember-500))' },
};

/**
 * India per-capita emissions ≈ 1.9 t CO₂e/year (Our World in Data, 2022),
 * ≈ 158 kg/month. Used for the "lighter than X%" comparison microcopy.
 */
export const NATIONAL_AVG_MONTHLY_KG = 158;

/**
 * Relatable equivalent: 1 kg CO₂e ≈ km not driven in a petrol car
 * (petrol car factor 0.17 kg/km → 1 / 0.17 ≈ 5.9 km). Spec §10 voice:
 * always pair numbers with a relatable equivalent.
 */
export const KM_PER_KG_CO2E = 1 / 0.17;

export function kgToKmEquivalent(kg: number): number {
  return Math.round(kg * KM_PER_KG_CO2E);
}

/** Maps a recommendation/insight effort to its Badge variant (single source). */
export const EFFORT_VARIANT = {
  low: 'low',
  medium: 'medium',
  high: 'high',
} as const;
