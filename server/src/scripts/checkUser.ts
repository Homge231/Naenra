import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function check() {
  const email = 'giabao.0411.04@gmail.com'
  console.log(`Checking email: ${email}`)

  const { data: authUser, error: authError } = await supabase.auth.admin.listUsers()
  if (authError) {
    console.error('List users error:', authError)
  } else {
    const user = authUser.users.find(u => u.email === email)
    console.log('auth.users:', user ? user : 'NOT FOUND')
  }

  const { data: player, error: playerError } = await supabase
    .from('players')
    .select('*')
    .eq('email', email)
  
  if (playerError) {
    console.error('players error:', playerError)
  } else {
    console.log('public.players:', player)
  }
}

check().catch(console.error)
