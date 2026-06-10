/**
 * Verda seed (spec §6). Populates reference data only — no user rows.
 * Emission factors are sourced from credible public datasets and the `source`
 * field is surfaced in the app's "How we calculate" tooltip for traceability.
 *
 * Run: npm run prisma:seed
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REGION = 'IN';

const categories = [
  { key: 'transport', label: 'Transport', icon: 'car' },
  { key: 'energy', label: 'Energy', icon: 'zap' },
  { key: 'food', label: 'Food', icon: 'utensils' },
  { key: 'shopping', label: 'Shopping', icon: 'shopping-bag' },
  { key: 'travel', label: 'Travel', icon: 'plane' },
] as const;

// kg CO2e per unit. Sources cited per spec §6 — surfaced in the UI tooltip.
const factors: Array<{
  categoryKey: (typeof categories)[number]['key'];
  activityKey: string;
  label: string;
  unit: string;
  co2ePerUnit: number;
  source: string;
}> = [
  // Transport
  { categoryKey: 'transport', activityKey: 'petrol_car_km', label: 'Petrol car', unit: 'km', co2ePerUnit: 0.17, source: 'DEFRA 2023' },
  { categoryKey: 'transport', activityKey: 'public_bus_km', label: 'Public bus', unit: 'km', co2ePerUnit: 0.1, source: 'DEFRA 2023' },
  { categoryKey: 'transport', activityKey: 'train_km', label: 'Train', unit: 'km', co2ePerUnit: 0.035, source: 'DEFRA 2023' },
  { categoryKey: 'transport', activityKey: 'motorbike_km', label: 'Motorbike', unit: 'km', co2ePerUnit: 0.1, source: 'DEFRA 2023' },
  // Energy
  { categoryKey: 'energy', activityKey: 'grid_electricity_kwh', label: 'Grid electricity', unit: 'kWh', co2ePerUnit: 0.71, source: 'India CEA 2023' },
  { categoryKey: 'energy', activityKey: 'lpg_kg', label: 'LPG (cooking gas)', unit: 'kg', co2ePerUnit: 2.98, source: 'DEFRA 2023' },
  // Food
  { categoryKey: 'food', activityKey: 'beef_meal', label: 'Beef meal', unit: 'meal', co2ePerUnit: 6.0, source: 'Our World in Data' },
  { categoryKey: 'food', activityKey: 'chicken_meal', label: 'Chicken meal', unit: 'meal', co2ePerUnit: 1.8, source: 'Our World in Data' },
  { categoryKey: 'food', activityKey: 'veg_meal', label: 'Vegetarian meal', unit: 'meal', co2ePerUnit: 0.5, source: 'Our World in Data' },
  // Shopping
  { categoryKey: 'shopping', activityKey: 'new_clothing_item', label: 'New clothing item', unit: 'item', co2ePerUnit: 8.0, source: 'DEFRA / industry avg' },
  { categoryKey: 'shopping', activityKey: 'new_electronics_item', label: 'New electronics item', unit: 'item', co2ePerUnit: 55.0, source: 'Industry avg' },
  // Travel
  { categoryKey: 'travel', activityKey: 'domestic_flight_pkm', label: 'Domestic flight', unit: 'passenger-km', co2ePerUnit: 0.25, source: 'DEFRA 2023' },
  { categoryKey: 'travel', activityKey: 'intl_flight_pkm', label: 'International flight', unit: 'passenger-km', co2ePerUnit: 0.15, source: 'DEFRA 2023' },
];

// Recommendations pool — ~3 per category. Powers the deterministic insight
// fallback (spec §7) and the Actions "Suggested for you" list (always a fresh
// one to surface as you complete others).
const recommendations = [
  // Transport
  { categoryKey: 'transport', title: 'Swap 2 car commutes a week for the bus', description: 'Two bus trips instead of driving keeps roughly 32 kg CO₂e out of the air each month — about 190 km not driven.', avgSavingKg: 32, effort: 'low' },
  { categoryKey: 'transport', title: 'Cycle or walk trips under 3 km', description: 'Short hops are the most polluting per km when cold-starting a car. Replacing a few a week saves around 18 kg CO₂e a month.', avgSavingKg: 18, effort: 'medium' },
  { categoryKey: 'transport', title: 'Carpool one commute a week', description: 'Sharing a ride halves its emissions — roughly 14 kg CO₂e saved each month.', avgSavingKg: 14, effort: 'low' },
  // Energy
  { categoryKey: 'energy', title: 'Switch to LED bulbs and cut standby power', description: 'LEDs and switching off idle electronics trims home electricity meaningfully — around 15 kg CO₂e a month.', avgSavingKg: 15, effort: 'low' },
  { categoryKey: 'energy', title: 'Set the AC 1°C warmer', description: 'Each degree cuts cooling energy noticeably — about 12 kg CO₂e a month on a hot-climate grid.', avgSavingKg: 12, effort: 'low' },
  { categoryKey: 'energy', title: 'Wash clothes in cold water', description: 'Heating water is most of a wash cycle’s energy. Going cold saves roughly 9 kg CO₂e a month.', avgSavingKg: 9, effort: 'low' },
  // Food
  { categoryKey: 'food', title: 'Try 3 plant-based dinners a week', description: 'Swapping three meat dinners for vegetarian ones saves about 24 kg CO₂e a month — the easiest big win on your plate.', avgSavingKg: 24, effort: 'medium' },
  { categoryKey: 'food', title: 'Cut food waste with a weekly meal plan', description: 'Wasted food is wasted emissions. Planning meals trims roughly 10 kg CO₂e a month.', avgSavingKg: 10, effort: 'low' },
  { categoryKey: 'food', title: 'Swap beef for chicken twice a week', description: 'Beef is far more carbon-dense than poultry — this swap saves about 17 kg CO₂e a month.', avgSavingKg: 17, effort: 'low' },
  // Shopping
  { categoryKey: 'shopping', title: 'Buy one less new clothing item a month', description: 'Skipping a single new garment avoids roughly 8 kg CO₂e — and a bit of clutter too.', avgSavingKg: 8, effort: 'low' },
  { categoryKey: 'shopping', title: 'Choose second-hand or repair first', description: 'Extending the life of clothes and gadgets avoids their embedded carbon — around 12 kg CO₂e a month.', avgSavingKg: 12, effort: 'medium' },
  { categoryKey: 'shopping', title: 'Keep your phone a year longer', description: 'New electronics carry large manufacturing emissions. Delaying an upgrade saves roughly 6 kg CO₂e a month, amortized.', avgSavingKg: 6, effort: 'low' },
  // Travel
  { categoryKey: 'travel', title: 'Replace one short domestic flight with rail', description: 'Taking the train instead of a short flight can save around 40 kg CO₂e per trip.', avgSavingKg: 40, effort: 'medium' },
  { categoryKey: 'travel', title: 'Combine trips into fewer, longer stays', description: 'Fewer take-offs and landings cut the most carbon. Consolidating travel saves roughly 25 kg CO₂e a month.', avgSavingKg: 25, effort: 'medium' },
  { categoryKey: 'travel', title: 'Choose economy and direct routes', description: 'Direct flights and economy seating cut per-passenger emissions — about 15 kg CO₂e a month for a frequent traveller.', avgSavingKg: 15, effort: 'low' },
];

const achievements = [
  { key: 'first_log', label: 'First Step', description: 'Logged your first activity', icon: 'footprints' },
  { key: 'week_streak', label: 'On a Roll', description: 'Reached a 7-day logging streak', icon: 'flame' },
  { key: 'goal_hit', label: 'Goal Smasher', description: 'Hit a monthly reduction goal', icon: 'target' },
  { key: 'under_avg', label: 'Lighter Than Most', description: 'Stayed below the national per-capita average', icon: 'leaf' },
];

async function main() {
  console.warn('🌱 Seeding Verda reference data...');

  // Categories
  const categoryIdByKey = new Map<string, string>();
  for (const c of categories) {
    const row = await prisma.category.upsert({
      where: { key: c.key },
      update: { label: c.label, icon: c.icon },
      create: c,
    });
    categoryIdByKey.set(c.key, row.id);
  }
  console.warn(`  ✓ ${categories.length} categories`);

  // Emission factors (unique on [activityKey, region])
  for (const f of factors) {
    const categoryId = categoryIdByKey.get(f.categoryKey);
    if (!categoryId) throw new Error(`Missing category ${f.categoryKey}`);
    await prisma.emissionFactor.upsert({
      where: { activityKey_region: { activityKey: f.activityKey, region: REGION } },
      update: {
        categoryId,
        label: f.label,
        unit: f.unit,
        co2ePerUnit: f.co2ePerUnit,
        source: f.source,
      },
      create: {
        categoryId,
        activityKey: f.activityKey,
        label: f.label,
        unit: f.unit,
        co2ePerUnit: f.co2ePerUnit,
        region: REGION,
        source: f.source,
      },
    });
  }
  console.warn(`  ✓ ${factors.length} emission factors`);

  // Recommendations — keyed by (categoryKey, title) to stay idempotent without
  // a unique constraint. Find-or-create.
  for (const r of recommendations) {
    const existing = await prisma.recommendation.findFirst({
      where: { categoryKey: r.categoryKey, title: r.title },
    });
    if (existing) {
      await prisma.recommendation.update({
        where: { id: existing.id },
        data: { description: r.description, avgSavingKg: r.avgSavingKg, effort: r.effort },
      });
    } else {
      await prisma.recommendation.create({ data: r });
    }
  }
  console.warn(`  ✓ ${recommendations.length} recommendations`);

  // Achievements
  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { key: a.key },
      update: { label: a.label, description: a.description, icon: a.icon },
      create: a,
    });
  }
  console.warn(`  ✓ ${achievements.length} achievements`);

  console.warn('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
