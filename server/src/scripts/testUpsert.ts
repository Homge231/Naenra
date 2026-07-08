import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function testUpsert() {
  const { data, error } = await supabase
    .from('players')
    .upsert({
      id: 'c2c83239-21c1-4f80-a6a8-83dfa98fb241', // The user ID from auth.users
      email: 'giabao.0411.04@gmail.com',
      username: 'test_upsert',
      elo: 100
    }, { onConflict: 'id' })

  console.log('Upsert result:', { data, error })
}
testUpsert().catch(console.error)
