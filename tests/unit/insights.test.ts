import { describe, expect, it } from 'vitest';

import {
  rankedOpportunities,
  ruleEngineInsight,
  type RecommendationLike,
} from '@/lib/services/insights';
import type { InsightContext } from '@/lib/types';

const recommendations: RecommendationLike[] = [
  { categoryKey: 'transport', title: 'Swap 2 car commutes a week for the bus', description: '…', avgSavingKg: 32, effort: 'low' },
  { categoryKey: 'food', title: 'Try 3 plant-based dinners a week', description: '…', avgSavingKg: 24, effort: 'medium' },
];

describe('ruleEngineInsight', () => {
  it('targets the largest-emitting category and quantifies the saving', () => {
    const context: InsightContext = {
      monthlyFootprintKg: 330,
      breakdownByCategory: { transport: 290, food: 40 },
      topActivity: 'petrol_car_km',
      userGoalKg: 300,
      region: 'IN',
    };

    const insight = ruleEngineInsight(context, recommendations);

    expect(insight.category).toBe('transport');
    expect(insight.headline).toContain('Transport');
    expect(insight.headline).toContain('88%'); // 290/330
    expect(insight.action).toBe('Swap 2 car commutes a week for the bus');
    expect(insight.estimatedSavingKg).toBe(32);
    expect(insight.difficulty).toBe('low');
    expect(insight.source).toBe('fallback');
  });

  it('returns a gentle starter insight when there is no data', () => {
    const context: InsightContext = {
      monthlyFootprintKg: 0,
      breakdownByCategory: {},
      topActivity: null,
      userGoalKg: null,
      region: 'IN',
    };

    const insight = ruleEngineInsight(context, recommendations);

    expect(insight.headline).toMatch(/log a few activities/i);
    expect(insight.source).toBe('fallback');
  });

  it('falls back to the highest-saving recommendation when no category match exists', () => {
    const context: InsightContext = {
      monthlyFootprintKg: 100,
      breakdownByCategory: { energy: 100 },
      topActivity: 'grid_electricity_kwh',
      userGoalKg: null,
      region: 'IN',
    };

    const insight = ruleEngineInsight(context, recommendations);

    // Top category stays energy, but the action comes from the best available rec.
    expect(insight.category).toBe('energy');
    expect(insight.estimatedSavingKg).toBe(32);
  });
});

describe('rankedOpportunities', () => {
  const recs: RecommendationLike[] = [
    { id: 't1', categoryKey: 'transport', title: 'Bus commutes', description: '…', avgSavingKg: 32, effort: 'low' },
    { id: 'e1', categoryKey: 'energy', title: 'LED bulbs', description: '…', avgSavingKg: 15, effort: 'low' },
    { id: 'f1', categoryKey: 'food', title: 'Plant-based dinners', description: '…', avgSavingKg: 24, effort: 'medium' },
  ];

  it('ranks categories by emissions and maps each to its recommendation id', () => {
    const context: InsightContext = {
      monthlyFootprintKg: 400,
      breakdownByCategory: { transport: 290, energy: 70, food: 40 },
      topActivity: 'petrol_car_km',
      userGoalKg: null,
      region: 'IN',
    };

    const ops = rankedOpportunities(context, recs, 3);

    expect(ops.map((o) => o.insight.category)).toEqual([
      'transport',
      'energy',
      'food',
    ]);
    expect(ops[0]?.recommendationId).toBe('t1');
    expect(ops[1]?.recommendationId).toBe('e1');
    expect(ops.length).toBe(3);
  });

  it('respects the limit', () => {
    const context: InsightContext = {
      monthlyFootprintKg: 400,
      breakdownByCategory: { transport: 290, energy: 70, food: 40 },
      topActivity: null,
      userGoalKg: null,
      region: 'IN',
    };
    expect(rankedOpportunities(context, recs, 2).length).toBe(2);
  });

  it('returns a single starter opportunity when there is no data', () => {
    const context: InsightContext = {
      monthlyFootprintKg: 0,
      breakdownByCategory: {},
      topActivity: null,
      userGoalKg: null,
      region: 'IN',
    };
    const ops = rankedOpportunities(context, recs, 3);
    expect(ops.length).toBe(1);
    expect(ops[0]?.insight.source).toBe('fallback');
  });
});
