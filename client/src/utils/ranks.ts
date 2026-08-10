export interface RankTier {
  name: string;
  min: number;
  max: number;
  color: string;
}

export const RANK_TIERS: RankTier[] = [
  { name: 'Bronze', min: 0, max: 100, color: '#cd7f32' },
  { name: 'Silver', min: 101, max: 200, color: '#c0c0c0' },
  { name: 'Gold', min: 201, max: 300, color: '#ffd700' },
  { name: 'Platinum', min: 301, max: 400, color: '#e5e4e2' },
  { name: 'Diamond', min: 401, max: 600, color: '#b9f2ff' },
  { name: 'Master', min: 601, max: 800, color: '#a855f7' },
  { name: 'Grandmaster', min: 801, max: 999999, color: '#ef4444' }
];

export function getTierForElo(elo: number): RankTier {
  for (const tier of RANK_TIERS) {
    if (elo >= tier.min && elo <= tier.max) {
      return tier;
    }
  }
  return RANK_TIERS[RANK_TIERS.length - 1];
}

export function getRankFromElo(elo: number): string {
  return getTierForElo(elo).name;
}
