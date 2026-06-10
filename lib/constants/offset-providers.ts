/**
 * Curated, reputable offset / reforestation providers (spec §16.3).
 * Honest framing: offsetting COMPLEMENTS reduction — it does not replace it.
 */
export interface OffsetProvider {
  key: string;
  name: string;
  url: string;
  blurb: string;
  kind: 'offset' | 'trees';
}

export const OFFSET_PROVIDERS: OffsetProvider[] = [
  {
    key: 'gold_standard',
    name: 'Gold Standard Marketplace',
    url: 'https://marketplace.goldstandard.org/',
    blurb: 'Buy verified carbon credits from Gold Standard–certified projects.',
    kind: 'offset',
  },
  {
    key: 'one_tree_planted',
    name: 'One Tree Planted',
    url: 'https://onetreeplanted.org/',
    blurb: 'Fund reforestation — roughly one tree planted per US$1 donated.',
    kind: 'trees',
  },
  {
    key: 'eden_reforestation',
    name: 'Eden: People+Planet',
    url: 'https://www.edenprojects.org/',
    blurb: 'Restore forests and provide fair-wage jobs in local communities.',
    kind: 'trees',
  },
];

export const OFFSET_DISCLAIMER =
  'Offsetting is a complement to reducing your footprint, not a substitute. Reduce first, then offset what’s left.';
