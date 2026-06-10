/**
 * Onboarding baseline estimator (spec §2 "3-question footprint baseline").
 *
 * Pure function: turns the three onboarding answers into an approximate monthly
 * kg CO₂e baseline, stored on Profile.baselineKg to measure progress against.
 * Uses the same public emission factors as the calculator (spec §6).
 */
import type { OnboardingInput } from '@/lib/validators/schemas';
import { roundKg } from '@/lib/services/carbon';

const WEEKS_PER_MONTH = 4.33;
const PETROL_CAR_KG_PER_KM = 0.17; // DEFRA 2023
const GRID_KG_PER_KWH = 0.71; // India CEA 2023
const MAIN_MEALS_PER_MONTH = 60; // ~2 main meals/day

// Representative per-meal CO₂e by diet, derived from food factors (spec §6).
const DIET_KG_PER_MEAL: Record<OnboardingInput['dietType'], number> = {
  meat_heavy: 2.5,
  mixed: 1.2,
  vegetarian: 0.5,
};

export interface BaselineBreakdown {
  transportKg: number;
  energyKg: number;
  foodKg: number;
  totalKg: number;
}

export function estimateBaseline(input: OnboardingInput): BaselineBreakdown {
  const household = Math.max(1, input.householdSize);

  const transportKg = roundKg(
    input.weeklyCarKm * WEEKS_PER_MONTH * PETROL_CAR_KG_PER_KM
  );
  // Household electricity is shared — attribute a per-person share.
  const energyKg = roundKg(
    (input.monthlyElectricityKwh * GRID_KG_PER_KWH) / household
  );
  const foodKg = roundKg(
    MAIN_MEALS_PER_MONTH * DIET_KG_PER_MEAL[input.dietType]
  );

  return {
    transportKg,
    energyKg,
    foodKg,
    totalKg: roundKg(transportKg + energyKg + foodKg),
  };
}
