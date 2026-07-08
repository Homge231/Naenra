import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function checkUnique() {
  const { data, error } = await supabase.rpc('get_constraints')
  console.log('RPC result:', data, error)
}
checkUnique().catch(console.error)
