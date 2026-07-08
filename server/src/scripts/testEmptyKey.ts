import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

try {
  const supabase = createClient(process.env.SUPABASE_URL!, '')
  console.log('Client created with valid URL and empty key!')
} catch (err: any) {
  console.log('Error creating client:', err.message)
}
