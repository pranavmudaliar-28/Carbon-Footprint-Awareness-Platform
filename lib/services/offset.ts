/**
 * Offset helpers (spec §16.3). Pure and unit-tested.
 *
 * A mature tree sequesters roughly 21 kg CO₂ per year, so a residual of ~120 kg
 * maps to ~6 trees — matching the spec's example.
 */
export const KG_CO2_PER_TREE_YEAR = 21;

export function treesEquivalent(kg: number): number {
  if (!Number.isFinite(kg) || kg <= 0) return 0;
  return Math.round(kg / KG_CO2_PER_TREE_YEAR);
}
