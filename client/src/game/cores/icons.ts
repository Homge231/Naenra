/**
 * Centralized icon path registry for all Support Cores.
 *
 * Icons are stored in Supabase Storage bucket `core-icons` and the URL
 * is persisted in the `cores.icon_url` column. This module provides a
 * **local fallback** mapping so the UI can still render an icon when the
 * DB value hasn't been populated yet (e.g. during development).
 */
import { CORE_FAMILIES } from './families'

/** Map of explicit slug overrides for icons on disk with custom filenames */
const SLUG_OVERRIDES: Record<string, string> = {
  'harmony': 'harmony-core',
  'zenith': 'zenith-core',
  'overclock': 'overclock-core',
  'supernova': 'supernova-core',
  'gigawatt': 'gigawatt-core',
  'supermassive': 'supermassive-core',
  'aegis shield': 'aegis-shield',
  'oracle': 'oracle-core',
  'oracle core': 'oracle-core',
  'argus eyes': 'oracle-core',
  'power strike': 'power-core',
  'power core': 'power-core',
  'mission impossible': 'mission-core',
  'mission core': 'mission-core',
  'perfect combo': 'combo-core',
  'combo core': 'combo-core',
  'balance': 'balanced-core',
  'balanced': 'balanced-core',
  'balanced core': 'balanced-core',
  'speedster': 'speedster',
  'speedster core': 'speedster',
  "pandora's box": 'pandoras-box',
  'pandoras box': 'pandoras-box',
  'pandora': 'pandoras-box',
  'high roller': 'high-roller',
  'highroller': 'high-roller',
  'phoenix': 'phoenix',
  'phoenix core': 'phoenix'
}

/** Convert a core name to a filesystem-safe slug */
function toSlug(name: string): string {
  const key = (name || '').trim().toLowerCase()
  if (SLUG_OVERRIDES[key]) {
    return SLUG_OVERRIDES[key]
  }
  return key
    .replace(/['']/g, '')   // remove apostrophes
    .replace(/[^a-z0-9]+/g, '-')   // spaces/special → hyphens
    .replace(/^-+|-+$/g, '')
}

/** Build the icon path from family + core name */
function toIconPath(family: string, name: string): string {
  return `/icons/cores/${family}/${toSlug(name)}.svg`
}

// Auto-build the full map from CORE_FAMILIES
export const CORE_ICON_MAP: Record<string, string> = {}

for (const [family, tiers] of Object.entries(CORE_FAMILIES)) {
  for (const name of [...tiers.tier1, ...tiers.tier2, ...tiers.tier3]) {
    CORE_ICON_MAP[name.toLowerCase()] = toIconPath(family, name)
  }
}

// Add common aliases so any core naming format works seamlessly
CORE_ICON_MAP['balance'] = '/icons/cores/balanced/balanced-core.svg'
CORE_ICON_MAP['balanced'] = '/icons/cores/balanced/balanced-core.svg'
CORE_ICON_MAP['balanced core'] = '/icons/cores/balanced/balanced-core.svg'
CORE_ICON_MAP['oracle'] = '/icons/cores/oracle/oracle-core.svg'
CORE_ICON_MAP['oracle core'] = '/icons/cores/oracle/oracle-core.svg'
CORE_ICON_MAP['argus eyes'] = '/icons/cores/oracle/oracle-core.svg'
CORE_ICON_MAP['combo'] = '/icons/cores/combo/combo-core.svg'
CORE_ICON_MAP['combo core'] = '/icons/cores/combo/combo-core.svg'
CORE_ICON_MAP['perfect combo'] = '/icons/cores/combo/combo-core.svg'
CORE_ICON_MAP['mission'] = '/icons/cores/mission/mission-core.svg'
CORE_ICON_MAP['mission core'] = '/icons/cores/mission/mission-core.svg'
CORE_ICON_MAP['mission impossible'] = '/icons/cores/mission/mission-core.svg'
CORE_ICON_MAP['power'] = '/icons/cores/power/power-core.svg'
CORE_ICON_MAP['power core'] = '/icons/cores/power/power-core.svg'
CORE_ICON_MAP['power strike'] = '/icons/cores/power/power-core.svg'
CORE_ICON_MAP['aegis'] = '/icons/cores/aegis/aegis-shield.svg'
CORE_ICON_MAP['aegis shield'] = '/icons/cores/aegis/aegis-shield.svg'
CORE_ICON_MAP['pandora'] = '/icons/cores/pandora/pandoras-box.svg'
CORE_ICON_MAP["pandora's box"] = '/icons/cores/pandora/pandoras-box.svg'
CORE_ICON_MAP['pandoras box'] = '/icons/cores/pandora/pandoras-box.svg'
CORE_ICON_MAP['speedster'] = '/icons/cores/speedster/speedster.svg'
CORE_ICON_MAP['speedster core'] = '/icons/cores/speedster/speedster.svg'
CORE_ICON_MAP['high roller'] = '/icons/cores/highroller/high-roller.svg'
CORE_ICON_MAP['highroller'] = '/icons/cores/highroller/high-roller.svg'
CORE_ICON_MAP['phoenix'] = '/icons/cores/phoenix/phoenix.svg'
CORE_ICON_MAP['phoenix core'] = '/icons/cores/phoenix/phoenix.svg'

export const DEFAULT_ICON = '/icons/cores/default.svg'

/**
 * Get the icon path for a core by name.
 * Prefers local SVG file if available, falls back to DB `icon_url` or default icon.
 */
export function getCoreIconPath(coreName?: string | null, iconUrl?: string | null): string {
  if (!coreName && !iconUrl) return DEFAULT_ICON
  
  // If coreName is already a valid path or URL
  if (coreName && (coreName.startsWith('/') || coreName.startsWith('http'))) {
    return coreName
  }

  const key = (coreName || '').trim().toLowerCase()
  if (key && CORE_ICON_MAP[key]) {
    return CORE_ICON_MAP[key]
  }

  // Check without ' core' suffix
  if (key && key.endsWith(' core')) {
    const withoutCore = key.substring(0, key.length - 5).trim()
    if (CORE_ICON_MAP[withoutCore]) {
      return CORE_ICON_MAP[withoutCore]
    }
  }

  // Check if iconUrl is a valid path or URL (not an emoji like '⚙️')
  if (iconUrl && (iconUrl.startsWith('/') || iconUrl.startsWith('http'))) {
    return iconUrl
  }

  return DEFAULT_ICON
}
