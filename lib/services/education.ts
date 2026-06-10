/**
 * Lesson selection (spec §16.4). Pure and unit-tested.
 */
import { LESSONS, type Lesson } from '@/lib/constants/lessons';
import type { CategoryKey } from '@/lib/types';

/** The lesson tied to a category, or null if none. */
export function lessonForCategory(category: CategoryKey): Lesson | null {
  return LESSONS.find((l) => l.relatedCategory === category) ?? null;
}

/** The lesson tied to a specific activity, or null if none. */
export function lessonForActivity(activityKey: string): Lesson | null {
  return (
    LESSONS.find((l) => l.relatedActivityKeys?.includes(activityKey)) ?? null
  );
}
