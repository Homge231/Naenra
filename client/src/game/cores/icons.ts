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
  'mission impossible': 'mission-core',
  'perfect combo': 'combo-core',
  'balance': 'balanced-core',
  'speedster': 'speedster',
  'pandora\'s box': 'pandoras-box',
  'high roller': 'high-roller'
}

/** Convert a core name to a filesystem-safe slug */
function toSlug(name: string): string {
  const key = name.toLowerCase()
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

export const DEFAULT_ICON = '/icons/cores/default.svg'

/**
 * Get the icon path for a core by name.
 * Prefers `icon_url` from DB if available, falls back to local path.
 */
export function getCoreIconPath(coreName: string, iconUrl?: string | null): string {
  if (!coreName) return DEFAULT_ICON
  const key = coreName.trim().toLowerCase()
  if (CORE_ICON_MAP[key]) {
    return CORE_ICON_MAP[key]
  }
  if (iconUrl && iconUrl.startsWith('http')) {
    return iconUrl
  }
  return DEFAULT_ICON
}
