import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function testSequence() {
  const email = 'test_seq_' + Date.now() + '@example.com'
  
  // 1. Create User
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: 'password123',
    email_confirm: true,
    user_metadata: { full_name: 'test' }
  })

  if (authError) {
    console.log('createUser error:', authError)
    return
  }

  console.log('User created:', authData.user.id)

  // 2. Upsert
  const { error: upsertError } = await supabase
    .from('players')
    .upsert({
      id: authData.user.id,
      email: email,
      username: 'test',
      hashed_password: 'hash',
      elo: 0,
      wins: 0,
      losses: 0,
      total_matches: 0
    }, { onConflict: 'id' })

  console.log('Upsert Error:', upsertError?.message || 'Success!')
}

testSequence().catch(console.error)
