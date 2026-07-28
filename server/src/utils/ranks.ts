export interface RankTier {
  name: string;
  min: number;
  max: number;
  color: string;
}

export const RANK_TIERS: RankTier[] = [
  { name: 'Bronze', min: 0, max: 500, color: '#cd7f32' },
  { name: 'Silver', min: 501, max: 1000, color: '#c0c0c0' },
  { name: 'Gold', min: 1001, max: 1500, color: '#ffd700' },
  { name: 'Platinum', min: 1501, max: 2000, color: '#e5e4e2' },
  { name: 'Diamond', min: 2001, max: 999999, color: '#b9f2ff' }
];

export function getTierForElo(elo: number): RankTier {
  for (const tier of RANK_TIERS) {
    if (elo >= tier.min && elo <= tier.max) {
      return tier;
    }
  }
  return RANK_TIERS[RANK_TIERS.length - 1];
}
