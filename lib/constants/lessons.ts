import type { CategoryKey } from '@/lib/types';

/**
 * 60-second micro-lessons (spec §16.4). Static content — surfaced contextually
 * (e.g. after a high-emission log) and listed on /learn.
 */
export interface Lesson {
  key: string;
  title: string;
  body: string;
  relatedCategory?: CategoryKey;
  relatedActivityKeys?: string[];
}

export const LESSONS: Lesson[] = [
  {
    key: 'what_is_co2e',
    title: 'What is CO₂e?',
    body: 'CO₂e ("carbon dioxide equivalent") puts all greenhouse gases on one scale by converting them to the warming effect of CO₂. Methane from food or refrigerants, for example, are folded in — so one number captures your whole climate impact.',
  },
  {
    key: 'diet_beats_recycling',
    title: 'Why diet often beats recycling',
    body: 'Recycling matters, but food choices usually move the needle far more. A single beef meal (~6 kg CO₂e) can outweigh a week of diligent recycling. Swapping a few red-meat meals for plant-based ones is one of the highest-leverage personal changes.',
    relatedCategory: 'food',
    relatedActivityKeys: ['beef_meal', 'chicken_meal'],
  },
  {
    key: 'standby_power',
    title: 'Standby power adds up',
    body: 'Devices left plugged in still sip electricity — often 5–10% of a home’s power. On a carbon-heavy grid that’s real emissions. Switching off idle electronics and using LED lighting is a quiet, steady win.',
    relatedCategory: 'energy',
    relatedActivityKeys: ['grid_electricity_kwh'],
  },
  {
    key: 'flying_math',
    title: 'One flight can outweigh a year of small wins',
    body: 'Aviation is carbon-dense: a single domestic flight can emit more than weeks of careful daily choices. Where rail or video calls can replace a short flight, the saving is large and immediate.',
    relatedCategory: 'travel',
    relatedActivityKeys: ['domestic_flight_pkm', 'intl_flight_pkm'],
  },
  {
    key: 'fast_fashion',
    title: 'The hidden cost of a new garment',
    body: 'A new clothing item carries ~8 kg CO₂e from growing fibres, manufacturing and shipping. Buying less, choosing durable pieces, and second-hand shopping all cut that embedded carbon.',
    relatedCategory: 'shopping',
    relatedActivityKeys: ['new_clothing_item'],
  },
  {
    key: 'car_vs_bus',
    title: 'Why swapping car trips is high-leverage',
    body: 'A petrol car emits ~0.17 kg CO₂e per km; a bus, about 0.10 — and a train far less. Shifting even a couple of weekly commutes to public transport compounds into a meaningful monthly cut.',
    relatedCategory: 'transport',
    relatedActivityKeys: ['petrol_car_km', 'motorbike_km'],
  },
];
