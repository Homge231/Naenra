// ── Core Synergy & Fusion Overdrive Registry (US-84) ──────────────────────────
import { getCoreFamily } from './families'

export interface CoreSynergy {
  id: string
  name: string
  families: [string, string] // The two core families that trigger this synergy
  icon: string
  description: string
  buffType: 'shield_velocity' | 'bounty_oracle' | 'chaos_rebirth' | 'overdrive_pulse'
}

export const SYNERGY_LIST: CoreSynergy[] = [
  {
    id: 'shield_velocity',
    name: 'Shield Velocity',
    families: ['speedster', 'aegis'],
    icon: '⚡🛡️',
    description: 'Sub-2.0s answers automatically generate +1 Aegis Shield (up to max).',
    buffType: 'shield_velocity'
  },
  {
    id: 'bounty_oracle',
    name: 'Bounty Oracle',
    families: ['oracle', 'high_roller'],
    icon: '🔮🎰',
    description: 'Answers submitted within 1.5s of an Oracle hint reveal grant a +300% score multiplier.',
    buffType: 'bounty_oracle'
  },
  {
    id: 'chaos_rebirth',
    name: 'Chaos Rebirth',
    families: ['phoenix', 'pandora'],
    icon: '🔥🌀',
    description: 'Shapeshifting automatically forgives 1 wrong answer penalty.',
    buffType: 'chaos_rebirth'
  },
  {
    id: 'overdrive_pulse',
    name: 'Overdrive Pulse',
    families: ['combo', 'power'],
    icon: '⚡💥',
    description: 'Reaching a 5-combo streak applies a +50% score boost to the Power Core flat buff.',
    buffType: 'overdrive_pulse'
  }
]

/**
 * Detects if a player's core history and active core form a valid cross-family Fusion Synergy.
 */
export function detectSynergy(coreHistoryNames: string[], activeCoreName?: string): CoreSynergy | null {
  const familiesPresent = new Set<string>()

  for (const name of coreHistoryNames) {
    const family = getCoreFamily(name)
    if (family) familiesPresent.add(family.toLowerCase())
  }

  if (activeCoreName) {
    const activeFamily = getCoreFamily(activeCoreName)
    if (activeFamily) familiesPresent.add(activeFamily.toLowerCase())
  }

  for (const synergy of SYNERGY_LIST) {
    const [famA, famB] = synergy.families
    if (familiesPresent.has(famA) && familiesPresent.has(famB)) {
      return synergy
    }
  }

  return null
}
