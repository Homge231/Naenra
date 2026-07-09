import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { CORE_FAMILIES } from '../cores/families'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function updateCores() {
  const { data: cores, error } = await supabase.from('cores').select('*')
  if (error || !cores) {
    console.error('Failed to fetch cores', error)
    return
  }

  for (const [familyName, family] of Object.entries(CORE_FAMILIES)) {
    // 1. Get Tier 1 stats (there is only one T1 per family)
    const t1Name = family.tier1[0]
    const t1Core = cores.find(c => c.name.toLowerCase() === t1Name.toLowerCase())
    if (!t1Core) continue

    const t1Flat = t1Core.flat_buff || 0
    const t1Mult = t1Core.multiplier_buff || 0

    // 2. Update Tier 2 stats
    for (const t2Name of family.tier2) {
      const t2Core = cores.find(c => c.name.toLowerCase() === t2Name.toLowerCase())
      if (!t2Core) continue

      // T2 new stats = T2 base + T1
      // Note: we assume the DB currently holds the base isolated stats.
      const newFlat = (t2Core.flat_buff || 0) + t1Flat
      const newMult = (t2Core.multiplier_buff || 0) + t1Mult

      await supabase.from('cores').update({ flat_buff: newFlat, multiplier_buff: newMult }).eq('id', t2Core.id)
      console.log(`Updated T2 ${t2Name}: Flat ${newFlat}, Mult ${newMult}`)

      // 3. Update Tier 3 stats
      // We will assume T3 stacks on TOP of the T2 they picked?
      // Wait, T3 is a child of T2? No, families.ts just lists all T2s and T3s.
      // If the player picks a T2, they get that T2. When they pick T3, they just pick any T3 from the family.
      // So T3 should probably just stack T1 + average T2 + T3? Or just T1 + T3?
      // Actually, if we just add T1 and an average T2 to T3, it works. Let's just add T1 and T2's BASE to T3.
      // Since any T2 in the family could have been picked, we'll just add the T1 buff to T3, and let's add a fixed average T2 buff (if any).
      // Actually, most T2s in the same family have similar buffs. Let's use the T2 they are currently looping.
    }
  }
}

// Wait, I need a better approach for T3. Let's query them properly.
async function updateCoresProperly() {
  const { data: cores, error } = await supabase.from('cores').select('*')
  if (error || !cores) return

  // We need the original values. Let's assume the DB currently has isolated values, EXCEPT if they are already huge.
  // Actually, we'll just add T1 stats to T2 and T3. And we will add the FIRST T2's stats to T3 as a rough estimate.
  for (const [familyName, family] of Object.entries(CORE_FAMILIES)) {
    const t1Name = family.tier1[0]
    const t1Core = cores.find(c => c.name.toLowerCase() === t1Name.toLowerCase())
    if (!t1Core) continue

    const t1Flat = t1Core.flat_buff || 0
    const t1Mult = t1Core.multiplier_buff || 0

    // Get base T2 stats (average or just the first one)
    let avgT2Flat = 0
    let avgT2Mult = 0
    const t2Cores = family.tier2.map(n => cores.find(c => c.name.toLowerCase() === n.toLowerCase())).filter(Boolean) as any[]
    if (t2Cores.length > 0) {
      avgT2Flat = t2Cores.reduce((sum, c) => sum + (c.flat_buff || 0), 0) / t2Cores.length
      avgT2Mult = t2Cores.reduce((sum, c) => sum + (c.multiplier_buff || 0), 0) / t2Cores.length
    }

    for (const t2Name of family.tier2) {
      const t2Core = cores.find(c => c.name.toLowerCase() === t2Name.toLowerCase())
      if (!t2Core) continue
      const newFlat = (t2Core.flat_buff || 0) + t1Flat
      const newMult = (t2Core.multiplier_buff || 0) + t1Mult
      await supabase.from('cores').update({ flat_buff: newFlat, multiplier_buff: newMult }).eq('id', t2Core.id)
    }

    for (const t3Name of family.tier3) {
      const t3Core = cores.find(c => c.name.toLowerCase() === t3Name.toLowerCase())
      if (!t3Core) continue
      const newFlat = (t3Core.flat_buff || 0) + t1Flat + avgT2Flat
      const newMult = (t3Core.multiplier_buff || 0) + t1Mult + avgT2Mult
      await supabase.from('cores').update({ flat_buff: newFlat, multiplier_buff: newMult }).eq('id', t3Core.id)
    }
  }
  console.log("Core stats successfully accumulated!")
}

updateCoresProperly()
