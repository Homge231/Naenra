import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_game_session_answers_schema').select('*')
  console.log("If RPC fails, trying simple select");

  const res = await supabase
    .from('game_session_answers')
    .select('*')
    .limit(1)
  
  if (res.error) {
    console.error(res.error)
  } else {
    console.log('Sample row:', res.data)
  }
}

checkSchema()
