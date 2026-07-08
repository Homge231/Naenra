import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function testDup() {
  const { data, error } = await supabase
    .from('players')
    .insert({
      id: 'd2c83239-21c1-4f80-a6a8-83dfa98fb242',
      email: 'dup_test@example.com',
      username: '1', // '1' is already taken
      elo: 0
    })
  console.log('Duplicate Insert:', error?.message)
}
testDup().catch(console.error)
