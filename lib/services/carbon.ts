/**
 * Carbon calculation service (spec §6).
 *
 * Pure, dependency-free, and the single source of truth for converting an
 * activity quantity into kg CO₂e. Targeted for 100% unit-test coverage.
 *
 *   co2eKg = quantity × emissionFactor.co2ePerUnit
 */

export interface EmissionFactorLike {
  co2ePerUnit: number;
}

/**
 * Compute kg CO₂e for a quantity of an activity.
 * @throws RangeError if inputs are negative or not finite numbers.
 */
export function calculateCo2e(
  quantity: number,
  factor: EmissionFactorLike
): number {
  if (!Number.isFinite(quantity) || quantity < 0) {
    throw new RangeError(`quantity must be a finite number >= 0, got ${quantity}`);
  }
  if (!Number.isFinite(factor.co2ePerUnit) || factor.co2ePerUnit < 0) {
    throw new RangeError(
      `co2ePerUnit must be a finite number >= 0, got ${factor.co2ePerUnit}`
    );
  }
  return roundKg(quantity * factor.co2ePerUnit);
}

/** Round a kg value to 3 decimal places (grams) for stable storage/display. */
export function roundKg(kg: number): number {
  return Math.round(kg * 1000) / 1000;
}
