import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function getCores() {
  const { data, error } = await supabase
    .from('cores')
    .select('name, tier, flat_buff, multiplier_buff')
    .order('name')
    .order('tier')
    
  if (error) console.error(error)
  else console.table(data)
}

getCores()
