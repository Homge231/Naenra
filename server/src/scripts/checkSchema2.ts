import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function checkSchema() {
  const { data, error } = await supabase
    .rpc('get_schema_info')
    
  if (error) {
    // Fallback: try to select a single row to inspect columns
    const { data: row, error: selectError } = await supabase
      .from('players')
      .select('*')
      .limit(1)
    console.log('Row:', row, selectError)
  } else {
    console.log('Schema:', data)
  }
}

checkSchema().catch(console.error)
