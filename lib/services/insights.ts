/**
 * Personalized insight service (spec §7).
 *
 * `generateInsight` asks Claude for the single highest-impact change. If no API
 * key is set, or the call fails, or the response fails validation, it falls back
 * to `ruleEngineInsight` — a deterministic engine that returns the SAME shape so
 * the demo never fails. `ruleEngineInsight` is pure and unit-tested.
 */
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

import { CATEGORY_KEYS } from '@/lib/types';
import type {
  CategoryKey,
  Difficulty,
  InsightContext,
  InsightResult,
} from '@/lib/types';
import { CATEGORY_META } from '@/lib/constants/categories';

export interface RecommendationLike {
  id?: string;
  categoryKey: string;
  title: string;
  description: string;
  avgSavingKg: number;
  effort: string;
}

/** An insight paired with the recommendation it maps to (for "adopt inline"). */
export interface Opportunity {
  insight: InsightResult;
  recommendationId: string | null;
}

const INSIGHT_MODEL = process.env.INSIGHT_MODEL ?? 'claude-haiku-4-5-20251001';

// spec §7 system prompt — verbatim intent.
const SYSTEM_PROMPT = `You are a carbon-reduction coach. Given a user's footprint breakdown, identify the SINGLE highest-impact change. Return JSON only: { "headline": "...", "action": "...", "estimatedSavingKg": number, "category": "...", "difficulty": "low|medium|high" }. Be specific, encouraging, never preachy. Quantify the saving. The "category" must be one of: transport, energy, food, shopping, travel.`;

const aiResponseSchema = z.object({
  headline: z.string().min(1).max(200),
  action: z.string().min(1).max(300),
  estimatedSavingKg: z.number().nonnegative().finite(),
  category: z.enum(CATEGORY_KEYS),
  difficulty: z.enum(['low', 'medium', 'high']),
});

function asDifficulty(effort: string): Difficulty {
  return effort === 'high' || effort === 'medium' ? effort : 'low';
}

function isCategoryKey(key: string): key is CategoryKey {
  return (CATEGORY_KEYS as readonly string[]).includes(key);
}

/**
 * Deterministic fallback: pick the largest category, map it to the best matching
 * recommendation, and quantify the saving. Pure — no I/O. (spec §7 fallback.)
 */
export function ruleEngineInsight(
  context: InsightContext,
  recommendations: RecommendationLike[]
): InsightResult {
  const entries = Object.entries(context.breakdownByCategory) as [
    CategoryKey,
    number,
  ][];

  // Largest-emitting category.
  let topCat: CategoryKey | null = null;
  let topKg = -Infinity;
  for (const [key, kg] of entries) {
    if (kg > topKg) {
      topKg = kg;
      topCat = key;
    }
  }

  // No data yet → gentle starter insight using the lowest-effort recommendation.
  if (!topCat || context.monthlyFootprintKg <= 0) {
    const starter =
      recommendations.find((r) => r.effort === 'low') ?? recommendations[0];
    return {
      headline: 'Log a few activities to unlock your personalized insight.',
      action:
        starter?.title ?? 'Start with one low-carbon swap this week.',
      estimatedSavingKg: starter?.avgSavingKg ?? 0,
      category: (starter && isCategoryKey(starter.categoryKey)
        ? starter.categoryKey
        : 'transport') as CategoryKey,
      difficulty: asDifficulty(starter?.effort ?? 'low'),
      source: 'fallback',
    };
  }

  // Best recommendation for the top category (highest expected saving),
  // falling back to the globally highest-saving recommendation.
  const forCategory = recommendations
    .filter((r) => r.categoryKey === topCat)
    .sort((a, b) => b.avgSavingKg - a.avgSavingKg);
  const rec =
    forCategory[0] ??
    [...recommendations].sort((a, b) => b.avgSavingKg - a.avgSavingKg)[0];

  const pct =
    context.monthlyFootprintKg > 0
      ? Math.round((topKg / context.monthlyFootprintKg) * 100)
      : 0;
  const label = CATEGORY_META[topCat].label;

  return {
    headline: `${label} is ${pct}% of your footprint — your biggest opportunity.`,
    action: rec?.title ?? `Reduce your ${label.toLowerCase()} footprint.`,
    estimatedSavingKg: rec?.avgSavingKg ?? 0,
    category: topCat,
    difficulty: asDifficulty(rec?.effort ?? 'medium'),
    source: 'fallback',
  };
}

/**
 * Ranked opportunities (spec §16 / insights upgrade). Pure & unit-tested.
 * Ranks emitting categories highest-first and maps each to its best unused
 * recommendation, returning up to `limit` insights paired with their
 * recommendation id (for the "adopt inline" button). Falls back to a single
 * starter insight when there's no data.
 */
export function rankedOpportunities(
  context: InsightContext,
  recommendations: RecommendationLike[],
  limit = 3
): Opportunity[] {
  const sorted = (
    Object.entries(context.breakdownByCategory) as [CategoryKey, number][]
  )
    .filter(([, kg]) => kg > 0)
    .sort((a, b) => b[1] - a[1]);

  const used = new Set<string>();
  const out: Opportunity[] = [];

  for (const [cat, kg] of sorted) {
    if (out.length >= limit) break;
    const rec = recommendations
      .filter((r) => r.categoryKey === cat && (!r.id || !used.has(r.id)))
      .sort((a, b) => b.avgSavingKg - a.avgSavingKg)[0];
    if (!rec) continue;
    if (rec.id) used.add(rec.id);

    const pct =
      context.monthlyFootprintKg > 0
        ? Math.round((kg / context.monthlyFootprintKg) * 100)
        : 0;

    out.push({
      insight: {
        headline: `${CATEGORY_META[cat].label} is ${pct}% of your footprint — a top opportunity.`,
        action: rec.title,
        estimatedSavingKg: rec.avgSavingKg,
        category: cat,
        difficulty: asDifficulty(rec.effort),
        source: 'fallback',
      },
      recommendationId: rec.id ?? null,
    });
  }

  if (out.length === 0) {
    const starter = ruleEngineInsight(context, recommendations);
    const rec = recommendations.find((r) => r.title === starter.action);
    out.push({ insight: starter, recommendationId: rec?.id ?? null });
  }

  return out.slice(0, limit);
}

/**
 * Generate an insight via Claude, with the rule engine as a guaranteed fallback.
 */
export async function generateInsight(
  context: InsightContext,
  recommendations: RecommendationLike[]
): Promise<InsightResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return ruleEngineInsight(context, recommendations);
  }

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: INSIGHT_MODEL,
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Here is the user's footprint context as JSON. Respond with ONLY the JSON object described in your instructions.\n\n${JSON.stringify(
            context
          )}`,
        },
      ],
    });

    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim();

    const json = extractJson(text);
    const parsed = aiResponseSchema.parse(json);

    return { ...parsed, source: 'ai' };
  } catch (err) {
    console.error('[insights] AI generation failed, using fallback:', err);
    return ruleEngineInsight(context, recommendations);
  }
}

/** Pull the first JSON object out of a model response (tolerates code fences). */
function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced?.[1] ?? text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('No JSON object found in model response');
  }
  return JSON.parse(candidate.slice(start, end + 1));
}
