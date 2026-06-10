import { describe, expect, it } from 'vitest';

import {
  lessonForActivity,
  lessonForCategory,
} from '@/lib/services/education';

describe('education lesson selection', () => {
  it('finds a lesson by category', () => {
    const lesson = lessonForCategory('food');
    expect(lesson?.relatedCategory).toBe('food');
  });

  it('finds a lesson by activity key', () => {
    const lesson = lessonForActivity('petrol_car_km');
    expect(lesson?.relatedActivityKeys).toContain('petrol_car_km');
  });

  it('returns null for an unknown activity', () => {
    expect(lessonForActivity('nonexistent_activity')).toBeNull();
  });
});
