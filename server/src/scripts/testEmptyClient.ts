import { createClient } from '@supabase/supabase-js'

try {
  const supabase = createClient('', '')
  console.log('Client created with empty url and key!')
} catch (err: any) {
  console.log('Error creating client:', err.message)
}
