import dotenv from 'dotenv'
dotenv.config()

import { supabase } from '../server/src/config/supabase'

async function run() {
  const updates = [
    {
      name: 'Phoenix',
      description: 'Accumulates all lost penalty points from skipped/wrong answers into a debt pool. Answering the next question correctly refunds 100% of accumulated debt + base points.'
    },
    {
      name: 'Phoenix Flame',
      description: 'Refunds 100% of accumulated penalty debt + 30% extra debt bonus + 50 flat rebirth points on next correct answer.'
    },
    {
      name: 'Rebirth',
      description: 'Refunds 100% of accumulated penalty debt + 75 flat rebirth points + grants 1 protective Aegis Shield upon rebirth.'
    },
    {
      name: 'Ashes to Ashes',
      description: 'Refunds 100% of accumulated penalty debt + gains +0.4x score multiplier per miss (Max 2.6x).'
    },
    {
      name: 'Immortal Phoenix',
      description: 'Refunds 100% of accumulated penalty debt + 50% extra debt bonus + 150 flat rebirth points on next correct answer.'
    },
    {
      name: 'Eternal Rebirth',
      description: 'Refunds 100% of accumulated penalty debt + 25% extra debt bonus + 150 flat rebirth points + grants 2 protective Aegis Shields upon rebirth.'
    },
    {
      name: 'Supernova Ashes',
      description: 'Refunds 100% of accumulated penalty debt + 25% extra debt bonus + gains +0.8x score multiplier per miss (Max 4.2x) + 100 flat rebirth points.'
    }
  ]

  for (const update of updates) {
    const { error } = await supabase
      .from('cores')
      .update({ description: update.description })
      .ilike('name', update.name)
    
    if (error) {
      console.error(`❌ Failed to update ${update.name}:`, error)
    } else {
      console.log(`✅ Updated ${update.name} description.`)
    }
  }
}

run()
