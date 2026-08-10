// ── Client-side Fusion Synergy Utility (US-84) ────────────────────────────────
import { getCoreFamily } from './families'

export interface CoreSynergy {
  id: string
  name: string
  families: [string, string]
  icon: string
  description: string
  buffType: string
}

export const SYNERGY_LIST: CoreSynergy[] = [
  {
    id: 'shield_velocity',
    name: 'Shield Velocity',
    families: ['speedster', 'aegis'],
    icon: '⚡🛡️',
    description: 'Sub-2.0s answers automatically generate +1 Aegis Shield.',
    buffType: 'shield_velocity'
  },
  {
    id: 'bounty_oracle',
    name: 'Bounty Oracle',
    families: ['oracle', 'high_roller'],
    icon: '🔮🎰',
    description: 'Answers within 1.5s of an Oracle reveal grant +300% score bonus.',
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
    description: '5-combo streak grants +50% boost to Power Core flat buff.',
    buffType: 'overdrive_pulse'
  }
]

export function detectSynergy(coreHistoryNames: string[], candidateCoreName?: string): CoreSynergy | null {
  const familiesPresent = new Set<string>()

  for (const name of coreHistoryNames) {
    const family = getCoreFamily(name)
    if (family) familiesPresent.add(family.toLowerCase())
  }

  if (candidateCoreName) {
    const activeFamily = getCoreFamily(candidateCoreName)
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
