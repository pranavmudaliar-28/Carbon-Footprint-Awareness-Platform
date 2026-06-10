/**
 * Zod schemas for every API boundary (spec §11). All use `.strict()` to reject
 * unknown fields — defense against mass-assignment and malformed payloads.
 */
import { z } from 'zod';

export const createEntrySchema = z
  .object({
    activityKey: z
      .string()
      .min(1)
      .max(64)
      .regex(/^[a-z0-9_]+$/, 'activityKey must be snake_case'),
    quantity: z.number().positive().finite().max(1_000_000),
    // Optional ISO date; defaults to "now" server-side when omitted.
    occurredOn: z.string().datetime().optional(),
  })
  .strict();
export type CreateEntryInput = z.infer<typeof createEntrySchema>;

export const onboardingSchema = z
  .object({
    weeklyCarKm: z.number().nonnegative().finite().max(10_000),
    monthlyElectricityKwh: z.number().nonnegative().finite().max(100_000),
    dietType: z.enum(['meat_heavy', 'mixed', 'vegetarian']),
    householdSize: z.number().int().positive().max(20).default(1),
  })
  .strict();
export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const upsertGoalSchema = z
  .object({
    targetKg: z.number().positive().finite().max(1_000_000),
    month: z.string().regex(/^\d{4}-\d{2}$/, 'month must be YYYY-MM'),
  })
  .strict();
export type UpsertGoalInput = z.infer<typeof upsertGoalSchema>;

export const acceptActionSchema = z
  .object({
    recommendationId: z.string().uuid(),
  })
  .strict();
export type AcceptActionInput = z.infer<typeof acceptActionSchema>;

export const updateActionSchema = z
  .object({
    status: z.enum(['active', 'completed', 'dismissed']),
  })
  .strict();
export type UpdateActionInput = z.infer<typeof updateActionSchema>;

export const recordOffsetSchema = z
  .object({
    provider: z.string().min(1).max(64),
    offsetKg: z.number().positive().finite().max(1_000_000),
  })
  .strict();
export type RecordOffsetInput = z.infer<typeof recordOffsetSchema>;

export const updateProfileSchema = z
  .object({
    name: z.string().trim().max(80).optional(),
    householdSize: z.number().int().positive().max(20),
    country: z.string().trim().min(2).max(3),
  })
  .strict();
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
