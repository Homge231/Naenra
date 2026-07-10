import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const DESCRIPTION_PATCHES: Record<string, string> = {
  // Balanced family (all flat_buff = 0, multiplier_buff = 1.0)
  'Balanced Core': '1.0× multiplier. Basic balanced core.',
  'Harmony Core': '1.0× multiplier. Harmony in play.',
  'Perfect Harmony': 'Mistakes are completely forgiven (0 points lost).',
  'Equilibrium': 'Both correct and incorrect answers score closer to average.',
  'Yin Yang': 'Harmony in play. Mistakes deduct only 5 points.',
  'Steady Pace': 'Correct answers add +1 second to the timer.',
  'Harmony Wave': 'Mistakes do not subtract points for the next 2 errors.',
  'Zenith Core': 'Reaching a peak. Standard scoring.',
  'Nirvana': 'Wrong answers do not break your combo streaks.',
  'Cosmic Balance': 'Wrong answers deduct a flat 10 points.',
  'Universal Harmony': 'Wrong answers cost only 10 points.',

  // Power family (T1 = 1.5x, T2 = 2.0x, T3 = 2.5x)
  'Power Core': '1.5x multiplier on every score calculation.',
  'Overclock Core': '2.0x multiplier on every score calculation.',
  'Hypercharge': 'Unleash raw power. 2.0x multiplier, but the match timer runs 15% faster.',
  'Power Surge': 'Surging energy. 2.0x multiplier, and wrong answers deduct double points.',
  'Brute Force': 'Raw power. 2.0x multiplier, but wrong answers subtract 50 points.',
  'Overload': '2.0x multiplier, but mistakes lock typing board input for 2 seconds.',
  'Supernova Core': 'Star-shattering power. 2.5x multiplier on correct answers.',
  'Absolute Power': 'Grants a 2.5x multiplier, but mistakes subtract 100 points.',
  'Supermassive Core': 'Grants a massive 2.5x multiplier, but mistakes deduct 200 points.',
  'Gigawatt Core': 'Insane power. 2.5x multiplier, but match duration is reduced by 15 seconds.',
  'Desperado': 'All-or-nothing. 2.5x multiplier, but a single wrong answer ends the match.'
}

async function run() {
  console.log('🔧 Fetching cores to patch descriptions...\n')
  const { data: cores, error } = await supabase
    .from('cores')
    .select('id, name, description')

  if (error || !cores) {
    console.error('Failed to fetch cores:', error)
    return
  }

  let patched = 0
  for (const core of cores) {
    const newDesc = DESCRIPTION_PATCHES[core.name]
    if (newDesc) {
      console.log(`✏️  Patching "${core.name}":`)
      console.log(`   Old: "${core.description}"`)
      console.log(`   New: "${newDesc}"`)
      
      const { error: updateErr } = await supabase
        .from('cores')
        .update({ description: newDesc })
        .eq('id', core.id)

      if (updateErr) {
        console.error(`   ❌ Failed:`, updateErr.message)
      } else {
        console.log(`   ✅ Success`)
        patched++
      }
    }
  }

  console.log(`\n📊 Done. Patched ${patched} descriptions successfully.`)
}

run().catch(console.error)
