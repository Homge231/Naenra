import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function test() {
  const email = 'giabao.0411.04@gmail.com'
  console.log(`Testing with email: ${email}`)

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: 'password123',
    email_confirm: true,
    user_metadata: { full_name: 'test' }
  })
  
  if (authError) {
    console.log('createUser error:', authError.message)
  } else {
    console.log('createUser success:', authData.user.id)
  }
}

test().catch(console.error)
