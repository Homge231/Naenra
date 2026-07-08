import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function checkRow() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('email', 'giabao.0411.04@gmail.com')
  console.log(data, error)
}
checkRow().catch(console.error)
