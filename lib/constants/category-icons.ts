import { Car, Plane, ShoppingBag, Utensils, Zap, type LucideIcon } from 'lucide-react';

import type { CategoryKey } from '@/lib/types';

/** Single source of truth for the lucide icon used per category. */
export const CATEGORY_ICON: Record<CategoryKey, LucideIcon> = {
  transport: Car,
  energy: Zap,
  food: Utensils,
  shopping: ShoppingBag,
  travel: Plane,
};

/** Icon for an arbitrary category key string, defaulting to Car. */
export function categoryIcon(key: string): LucideIcon {
  return CATEGORY_ICON[key as CategoryKey] ?? Car;
}
