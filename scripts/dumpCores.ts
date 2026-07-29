import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function run() {
  const { data: cores, error } = await supabase.from('cores').select('name, description, tier').order('tier', { ascending: true })
  if (error || !cores) { console.error(error); return }
  cores.forEach(c => console.log(`[Tier ${c.tier}] ${c.name}: ${c.description}`))
}
run()
