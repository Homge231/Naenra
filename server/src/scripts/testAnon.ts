import { createClient } from '@supabase/supabase-js'

// Need to find the anon key to test. It's not in .env.
// But we can just use a fake token to see the error format.
const supabase = createClient(
  'https://zowxktrpfqwpzckpnytu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvd3hrdHJwZnF3cHpja3BueXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NjkzNzUsImV4cCI6MjA5NzA0NTM3NX0.invalid-signature'
)

async function testAnon() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'test_anon@example.com',
    password: 'password123'
  })
  console.log('Result:', data, error?.message)
}

testAnon().catch(console.error)
