import { createClient } from '@supabase/supabase-js'

try {
  const supabase = createClient('https://example.supabase.co', '')
  console.log('Client created successfully with empty key!')
} catch (err: any) {
  console.log('Error creating client:', err.message)
}
