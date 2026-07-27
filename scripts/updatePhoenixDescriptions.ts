import dotenv from 'dotenv'
dotenv.config()

import { supabase } from '../server/src/config/supabase'

async function run() {
  const updates = [
    {
      name: 'Phoenix',
      description: 'Accumulates all lost penalty points from skipped/wrong answers. Answering the next question correctly refunds 100% of accumulated debt + base points.'
    },
    {
      name: 'Phoenix Flame',
      description: 'Refunds 100% of accumulated penalty debt + 25% debt bonus + 50 flat rebirth points on next correct answer.'
    },
    {
      name: 'Rebirth',
      description: 'Refunds 100% of accumulated penalty debt + reduces wrong answer penalties by 50%.'
    },
    {
      name: 'Ashes to Ashes',
      description: 'Refunds 100% of accumulated penalty debt + gains +0.5x score multiplier per miss (Max 3.0x).'
    },
    {
      name: 'Immortal Phoenix',
      description: 'Refunds 100% of accumulated penalty debt + 50% debt bonus + 150 flat rebirth points on next correct answer.'
    },
    {
      name: 'Eternal Rebirth',
      description: 'Refunds 100% of accumulated penalty debt + 100% debt bonus + 100% wrong penalty immunity (0 pts lost on miss).'
    },
    {
      name: 'Supernova Ashes',
      description: 'Refunds 100% of accumulated penalty debt + 50% debt bonus + gains +1.0x score multiplier per miss (Max 5.0x) + 100 flat rebirth points.'
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
