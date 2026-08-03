export const CORE_FAMILIES: Record<string, { tier1: string[], tier2: string[], tier3: string[] }> = {
  'combo': {
    tier1: ['Perfect Combo'],
    tier2: ['Radiant Combo', 'Combo Shield', 'Combo Time', 'Combo Multiplier', 'Combo Focus', 'Combo Burst'],
    tier3: ['Prismatic Combo', 'Golden Combo', 'Chain Lightning', 'Combo Mastery', 'Super Combo', 'Hyper Combo']
  },
  'speedster': {
    tier1: ['Speedster'],
    tier2: ['Time Warp', 'Speed Shield', 'Mach Speed', 'Overdrive', 'Speed Demon', 'Velocity Shield'],
    tier3: ['Chronobreak', 'Time Freeze', 'Warp Speed', 'Grand Prix', 'Sonic Boom', 'Hyperdrive']
  },
  'oracle': {
    tier1: ['Argus Eyes'],
    tier2: ['Clairvoyance', 'Third Eye', 'Future Sight', 'Divine Guidance', 'Oracle Blessing', 'Inner Eye'],
    tier3: ['Omniscience', 'Mind Reader', 'Predictive Strike', 'Cosmic Wisdom', 'Divine Eye', 'Prophecy']
  },
  'mission': {
    tier1: ['Mission Impossible'],
    tier2: ['Bounty Hunter', 'Daily Quest', 'Shield Mission', 'Time Mission', 'Swift Mission', 'Contract Hunter'],
    tier3: ['Exodia', 'Bounty Overlord', 'Apex Predator', 'Mission Specialist', 'Mission Master', 'Mission Legend']
  },
  'aegis': {
    tier1: ['Aegis Shield'],
    tier2: ['Reflective Aegis', 'Shield Battery', 'Fortress Aegis', 'Shield Synergy', 'Shield Burst', 'Reflective Barrier'],
    tier3: ['Bastion of Light', 'Spiked Shield', 'Indomitable', 'Aegis Nova', 'Guardian Angel', 'Aegis Sanctuary']
  },
  'balanced': {
    tier1: ['Balance'],
    tier2: ['Harmony', 'Equilibrium', 'Yin Yang', 'Steady Pace', 'Harmony Wave', 'Zen Momentum'],
    tier3: ['Perfect Harmony', 'Zenith', 'Nirvana', 'Cosmic Balance', 'Universal Harmony', 'Serenity']
  },
  'power': {
    tier1: ['Power Strike'],
    tier2: ['Overclock', 'Hypercharge', 'Power Surge', 'Brute Force', 'Overload', 'Overcharge'],
    tier3: ['Supernova', 'Gigawatt', 'Desperado', 'Absolute Power', 'Supermassive', 'Cataclysm']
  },
  'pandora': {
    tier1: ["Pandora's Box"],
    tier2: ["Trickster's Glass", 'Chaos Prism', 'Warp Reality', "Pandora's Curse", "Pandora's Mirror", 'Wild Card'],
    tier3: ['Chaos Theory', 'Butterfly Effect', "Pandora's Wrath", 'Cosmic Entropy', 'Reality Collapse', 'Pandora Overdrive']
  },
  'phoenix': {
    tier1: ['Phoenix'],
    tier2: ['Phoenix Flame', 'Rebirth', 'Ashes to Ashes', 'Solar Ember', 'Feather Shield'],
    tier3: ['Immortal Phoenix', 'Eternal Rebirth', 'Supernova Ashes', 'Blazing Resurrection', 'Phoenix Overlord']
  },
  'highroller': {
    tier1: ['High Roller'],
    tier2: ['Jackpot', 'Safe Bet', 'Double or Nothing', 'Lucky Seven', 'High Stakes'],
    tier3: ['All In', 'House Advantage', 'Russian Roulette', 'Royal Flush', 'Casino Empire']
  }
}

export function getCoreFamily(coreName: string): string | null {
  const normalized = coreName.trim().toLowerCase()
  for (const [familyName, family] of Object.entries(CORE_FAMILIES)) {
    if (familyName.toLowerCase() === normalized) {
      return familyName
    }
    const allNames = [...family.tier1, ...family.tier2, ...family.tier3].map(n => n.toLowerCase())
    if (allNames.includes(normalized)) {
      return familyName
    }
  }
  return null
}

export function isPowerCore(coreName: string): boolean {
  const family = getCoreFamily(coreName)
  return family ? ['power', 'balanced', 'combo', 'speedster'].includes(family) : false
}

export function isEffectCore(coreName: string): boolean {
  const family = getCoreFamily(coreName)
  return family ? ['aegis', 'mission', 'oracle', 'pandora'].includes(family) : false
}

/**
 * Returns the trait classification of a core as a single string.
 * Used by UI components to render Power/Effect badges without
 * calling isPowerCore + isEffectCore separately.
 */
export function getCoreTraitLabel(coreName: string): 'power' | 'effect' | 'unknown' {
  if (isPowerCore(coreName)) return 'power'
  if (isEffectCore(coreName)) return 'effect'
  return 'unknown'
}
