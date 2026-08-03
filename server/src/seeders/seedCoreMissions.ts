import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

// Mission definitions mapping core name (case-insensitive) to its unlock requirement
const MISSION_SEEDS: Record<string, { mission_type: string; target_value: number; description: string }> = {
  // Aegis Branch Upgrades
  'reflective aegis': { mission_type: 'shields_used', target_value: 5, description: 'Absorb 5 typing mistake penalties using Aegis Shields.' },
  'shield battery': { mission_type: 'matches_played', target_value: 3, description: 'Complete 3 single-player or multiplayer typing matches.' },
  'fortress aegis': { mission_type: 'shields_used', target_value: 10, description: 'Absorb 10 typing mistake penalties using Aegis Shields.' },
  'shield synergy': { mission_type: 'max_combo', target_value: 10, description: 'Reach a 10-word typing streak in a single match.' },
  'shield burst': { mission_type: 'words_typed', target_value: 50, description: 'Type 50 correct words in competitive matches.' },
  'bastion of light': { mission_type: 'shields_used', target_value: 20, description: 'Absorb 20 typing mistake penalties across matches.' },
  'spiked shield': { mission_type: 'matches_played', target_value: 10, description: 'Complete 10 typing matches with Aegis Shield equipped.' },
  'indomitable': { mission_type: 'max_combo', target_value: 20, description: 'Achieve a 20-word typing streak without missing a word.' },
  'aegis nova': { mission_type: 'words_typed', target_value: 100, description: 'Type 100 correct words across matches.' },
  'guardian angel': { mission_type: 'matches_played', target_value: 15, description: 'Play 15 competitive typing matches.' },

  // Combo Branch Upgrades
  'radiant combo': { mission_type: 'max_combo', target_value: 5, description: 'Achieve a 5-word typing streak in a single match.' },
  'combo shield': { mission_type: 'max_combo', target_value: 8, description: 'Achieve an 8-word typing streak.' },
  'combo time': { mission_type: 'matches_played', target_value: 5, description: 'Complete 5 matches using Perfect Combo core.' },
  'combo multiplier': { mission_type: 'words_typed', target_value: 40, description: 'Type 40 correct words in competitive matches.' },
  'combo focus': { mission_type: 'max_combo', target_value: 12, description: 'Reach a 12-word typing streak.' },
  'prismatic combo': { mission_type: 'max_combo', target_value: 15, description: 'Achieve a 15-word typing streak.' },
  'golden combo': { mission_type: 'words_typed', target_value: 150, description: 'Type 150 correct words in competitive matches.' },
  'chain lightning': { mission_type: 'max_combo', target_value: 10, description: 'Reach a 10-word streak without making a single mistake.' },
  'combo mastery': { mission_type: 'matches_played', target_value: 12, description: 'Complete 12 matches using Combo cores.' },
  'super combo': { mission_type: 'max_combo', target_value: 25, description: 'Achieve an epic 25-word typing streak!' },

  // Speedster Branch Upgrades
  'time warp': { mission_type: 'words_typed', target_value: 30, description: 'Type 30 words in under 3 seconds each.' },
  'speed shield': { mission_type: 'matches_played', target_value: 4, description: 'Complete 4 matches with Speedster core.' },
  'mach speed': { mission_type: 'words_typed', target_value: 60, description: 'Type 60 correct words rapidly.' },
  'overdrive': { mission_type: 'max_combo', target_value: 10, description: 'Reach a 10-word streak at high speed.' },
  'speed demon': { mission_type: 'matches_played', target_value: 8, description: 'Complete 8 competitive speed matches.' },
  'chronobreak': { mission_type: 'words_typed', target_value: 100, description: 'Type 100 fast words across matches.' },
  'time freeze': { mission_type: 'matches_played', target_value: 15, description: 'Complete 15 speedster typing matches.' },
  'warp speed': { mission_type: 'max_combo', target_value: 20, description: 'Reach a 20-word fast typing streak.' },
  'grand prix': { mission_type: 'matches_played', target_value: 20, description: 'Win or complete 20 typing matches.' },
  'sonic boom': { mission_type: 'words_typed', target_value: 200, description: 'Type 200 correct words rapidly.' },

  // Oracle Branch Upgrades
  'clairvoyance': { mission_type: 'words_typed', target_value: 25, description: 'Type 25 words using Argus Eyes hint assistance.' },
  'third eye': { mission_type: 'matches_played', target_value: 3, description: 'Complete 3 matches using Oracle core.' },
  'future sight': { mission_type: 'words_typed', target_value: 50, description: 'Type 50 correct words using Oracle hints.' },
  'divine guidance': { mission_type: 'max_combo', target_value: 8, description: 'Reach an 8-word typing streak with Oracle guidance.' },
  'oracle blessing': { mission_type: 'matches_played', target_value: 7, description: 'Complete 7 matches using Oracle cores.' },
  'omniscience': { mission_type: 'words_typed', target_value: 120, description: 'Type 120 words with Oracle assistance.' },
  'mind reader': { mission_type: 'max_combo', target_value: 15, description: 'Reach a 15-word typing streak.' },
  'predictive strike': { mission_type: 'matches_played', target_value: 10, description: 'Complete 10 matches using Oracle cores.' },
  'cosmic wisdom': { mission_type: 'words_typed', target_value: 150, description: 'Type 150 correct words.' },
  'divine eye': { mission_type: 'matches_played', target_value: 15, description: 'Complete 15 Oracle typing matches.' },

  // Mission Branch Upgrades
  'bounty hunter': { mission_type: 'words_typed', target_value: 35, description: 'Complete 35 target word missions.' },
  'daily quest': { mission_type: 'matches_played', target_value: 5, description: 'Complete 5 matches with Mission Impossible core.' },
  'shield mission': { mission_type: 'shields_used', target_value: 3, description: 'Absorb 3 mistake penalties.' },
  'time mission': { mission_type: 'words_typed', target_value: 50, description: 'Complete 50 mission objectives.' },
  'swift mission': { mission_type: 'max_combo', target_value: 10, description: 'Reach a 10-word streak during missions.' },
  'exodia': { mission_type: 'words_typed', target_value: 100, description: 'Complete 100 mission targets across matches.' },
  'bounty overlord': { mission_type: 'matches_played', target_value: 10, description: 'Complete 10 matches with Mission cores.' },
  'apex predator': { mission_type: 'max_combo', target_value: 18, description: 'Reach an 18-word typing streak.' },
  'mission specialist': { mission_type: 'words_typed', target_value: 150, description: 'Type 150 correct mission words.' },
  'mission master': { mission_type: 'matches_played', target_value: 20, description: 'Complete 20 matches with Mission cores.' },

  // Power Branch Upgrades
  'overclock': { mission_type: 'words_typed', target_value: 30, description: 'Type 30 correct words with Power Strike core.' },
  'hypercharge': { mission_type: 'matches_played', target_value: 5, description: 'Complete 5 matches with Power Strike core.' },
  'power surge': { mission_type: 'max_combo', target_value: 8, description: 'Achieve an 8-word streak with Power core.' },
  'brute force': { mission_type: 'words_typed', target_value: 60, description: 'Type 60 correct words with Power cores.' },
  'overload': { mission_type: 'matches_played', target_value: 8, description: 'Complete 8 high-powered matches.' },
  'supernova': { mission_type: 'words_typed', target_value: 120, description: 'Type 120 words with Power Strike multiplier.' },
  'gigawatt': { mission_type: 'max_combo', target_value: 15, description: 'Reach a 15-word high-power streak.' },
  'desperado': { mission_type: 'matches_played', target_value: 12, description: 'Complete 12 matches using Power cores.' },
  'absolute power': { mission_type: 'words_typed', target_value: 200, description: 'Type 200 correct words under high multiplier.' },
  'supermassive': { mission_type: 'max_combo', target_value: 25, description: 'Achieve a 25-word streak with Power cores.' },

  // Balanced Branch Upgrades
  'harmony': { mission_type: 'matches_played', target_value: 3, description: 'Complete 3 matches with Balance core.' },
  'equilibrium': { mission_type: 'words_typed', target_value: 40, description: 'Type 40 correct words with Balance core.' },
  'yin yang': { mission_type: 'max_combo', target_value: 7, description: 'Reach a 7-word streak in balanced mode.' },
  'steady pace': { mission_type: 'matches_played', target_value: 6, description: 'Complete 6 matches using Balanced cores.' },
  'harmony wave': { mission_type: 'words_typed', target_value: 80, description: 'Type 80 words with steady accuracy.' },
  'perfect harmony': { mission_type: 'max_combo', target_value: 15, description: 'Achieve a 15-word balanced streak.' },
  'zenith': { mission_type: 'matches_played', target_value: 10, description: 'Complete 10 matches using Balanced cores.' },
  'nirvana': { mission_type: 'words_typed', target_value: 150, description: 'Type 150 correct words.' },
  'cosmic balance': { mission_type: 'matches_played', target_value: 15, description: 'Complete 15 balanced typing matches.' },
  'universal harmony': { mission_type: 'max_combo', target_value: 20, description: 'Reach a 20-word balanced streak.' },

  // Pandora Branch Upgrades
  'tricksters glass': { mission_type: 'matches_played', target_value: 3, description: 'Complete 3 matches with Pandora\'s Box core.' },
  'chaos prism': { mission_type: 'words_typed', target_value: 30, description: 'Type 30 words under Pandora chaos.' },
  'warp reality': { mission_type: 'matches_played', target_value: 6, description: 'Complete 6 matches with Pandora cores.' },
  'pandoras curse': { mission_type: 'max_combo', target_value: 8, description: 'Reach an 8-word streak during chaotic events.' },
  'pandoras mirror': { mission_type: 'words_typed', target_value: 70, description: 'Type 70 correct words under Pandora mechanics.' },
  'chaos theory': { mission_type: 'max_combo', target_value: 15, description: 'Achieve a 15-word chaotic streak.' },
  'butterfly effect': { mission_type: 'matches_played', target_value: 10, description: 'Complete 10 matches with Pandora cores.' },
  'pandoras wrath': { mission_type: 'words_typed', target_value: 120, description: 'Type 120 words in Pandora matches.' },
  'cosmic entropy': { mission_type: 'matches_played', target_value: 15, description: 'Complete 15 matches under Pandora chaos.' },
  'reality collapse': { mission_type: 'max_combo', target_value: 20, description: 'Reach a 20-word streak under Pandora mechanics.' },

  // Phoenix Branch Upgrades
  'phoenix flame': { mission_type: 'matches_played', target_value: 3, description: 'Complete 3 matches with Phoenix core.' },
  'rebirth': { mission_type: 'words_typed', target_value: 30, description: 'Recover lost momentum 30 times.' },
  'ashes to ashes': { mission_type: 'matches_played', target_value: 6, description: 'Complete 6 matches using Phoenix core.' },
  'solar ember': { mission_type: 'words_typed', target_value: 40, description: 'Convert 40 mistake penalties into bonus points.' },
  'feather shield': { mission_type: 'shields_used', target_value: 5, description: 'Recover 5 mistake penalties to gain Aegis Shields.' },
  'immortal phoenix': { mission_type: 'max_combo', target_value: 12, description: 'Reach a 12-word Phoenix streak.' },
  'eternal rebirth': { mission_type: 'words_typed', target_value: 80, description: 'Type 80 words under Phoenix rebirth.' },
  'supernova ashes': { mission_type: 'max_combo', target_value: 18, description: 'Reach an 18-word Phoenix streak.' },
  'blazing resurrection': { mission_type: 'words_typed', target_value: 120, description: 'Maintain a 3-streak after recovering from mistake debt.' },
  'phoenix overlord': { mission_type: 'matches_played', target_value: 15, description: 'Complete 15 Phoenix typing matches.' },

  // High Roller Branch Upgrades
  'jackpot': { mission_type: 'matches_played', target_value: 3, description: 'Complete 3 matches with High Roller core.' },
  'safe bet': { mission_type: 'words_typed', target_value: 30, description: 'Type 30 words in gambling mode.' },
  'double or nothing': { mission_type: 'matches_played', target_value: 6, description: 'Complete 6 High Roller matches.' },
  'lucky seven': { mission_type: 'max_combo', target_value: 7, description: 'Trigger 7th-word 3x multiplier streaks.' },
  'high stakes': { mission_type: 'words_typed', target_value: 50, description: 'Type 50 correct words under high stakes.' },
  'all in': { mission_type: 'max_combo', target_value: 10, description: 'Reach a 10-word streak while gambling.' },
  'house advantage': { mission_type: 'words_typed', target_value: 80, description: 'Type 80 correct words under High Roller mode.' },
  'russian roulette': { mission_type: 'max_combo', target_value: 15, description: 'Reach a 15-word High Roller streak.' },
  'royal flush': { mission_type: 'max_combo', target_value: 20, description: 'Achieve a 5-streak in gamble mode for +2000 jackpot.' },
  'casino empire': { mission_type: 'matches_played', target_value: 15, description: 'Complete 15 High Roller competitive matches.' },

  // Pandora Branch Upgrades
  'wild card': { mission_type: 'words_typed', target_value: 40, description: 'Type 40 words under Wild Card shape-shifting.' },
  'pandora overdrive': { mission_type: 'max_combo', target_value: 15, description: 'Achieve a 15-word streak during Pandora Overdrive.' },

  // Additional New Upgrades Across All Families
  'combo burst': { mission_type: 'max_combo', target_value: 5, description: 'Trigger 5-streak point bursts.' },
  'hyper combo': { mission_type: 'max_combo', target_value: 10, description: 'Maintain a 10-word streak for double combo points.' },
  'reflective barrier': { mission_type: 'shields_used', target_value: 5, description: 'Reflect 5 mistake penalties with Aegis Shields.' },
  'aegis sanctuary': { mission_type: 'shields_used', target_value: 10, description: 'Generate 10 Aegis Shields from correct answers.' },
  'overcharge': { mission_type: 'words_typed', target_value: 40, description: 'Type 40 words rapidly in under 3 seconds.' },
  'cataclysm': { mission_type: 'words_typed', target_value: 100, description: 'Type 100 correct words under Cataclysm multiplier.' },
  'velocity shield': { mission_type: 'words_typed', target_value: 30, description: 'Type 30 fast words to generate protective shields.' },
  'hyperdrive': { mission_type: 'max_combo', target_value: 15, description: 'Reach a 15-word hyper-speed typing streak.' },
  'inner eye': { mission_type: 'words_typed', target_value: 30, description: 'Type 30 words using Inner Eye length indicators.' },
  'prophecy': { mission_type: 'words_typed', target_value: 80, description: 'Type 80 words with Oracle Prophecy hints.' },
  'contract hunter': { mission_type: 'words_typed', target_value: 40, description: 'Complete 40 target contract word missions.' },
  'mission legend': { mission_type: 'max_combo', target_value: 15, description: 'Complete an 8-streak mission objective.' },
  'zen momentum': { mission_type: 'max_combo', target_value: 8, description: 'Reach an 8-word steady pace streak.' },
  'serenity': { mission_type: 'matches_played', target_value: 10, description: 'Complete 10 matches with Serenity core.' }
}

export async function seedCoreMissions() {
  console.log('🌱 Starting Core Missions Seeder...')

  const { data: cores, error: coresErr } = await supabase
    .from('cores')
    .select('id, name, core_type, tier')

  if (coresErr) {
    console.error('❌ Error fetching cores from DB:', coresErr)
    return
  }

  if (!cores || cores.length === 0) {
    console.warn('⚠️ No cores found in database.')
    return
  }

  console.log(`📦 Found ${cores.length} total cores in DB. Processing missions...`)

  let seededCount = 0

  for (const core of cores) {
    const isBaseCore = core.tier === 1 || core.core_type === 'main'
    if (isBaseCore) continue

    const nameKey = core.name.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]/g, ' ').trim()
    let seed = MISSION_SEEDS[nameKey] || MISSION_SEEDS[core.name.toLowerCase()]

    if (!seed) {
      seed = {
        mission_type: 'matches_played',
        target_value: 5,
        description: `Complete 5 competitive typing matches to unlock ${core.name}.`
      }
    }

    const { error: upsertErr } = await supabase
      .from('core_missions')
      .upsert({
        core_id: core.id,
        mission_type: seed.mission_type,
        target_value: seed.target_value,
        description: seed.description
      }, { onConflict: 'core_id' })

    if (upsertErr) {
      console.error(`❌ Failed to seed mission for "${core.name}":`, upsertErr.message)
    } else {
      seededCount++
      console.log(`✅ Seeded mission for "${core.name}" (${seed.mission_type}: ${seed.target_value})`)
    }
  }

  console.log(`🎉 Finished seeding! Successfully seeded ${seededCount} Upgrade Core missions.`)
}

// Execute if run directly via CLI
if (require.main === module) {
  seedCoreMissions().catch(console.error)
}
