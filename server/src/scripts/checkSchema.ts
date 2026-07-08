import dotenv from 'dotenv'
dotenv.config()
import { supabase } from '../config/supabase'

async function run() {
  // Try to query the is_first_play column
  const { data, error } = await supabase.from('players').select('is_first_play').limit(1)
  
  if (error) {
    console.error('Column might not exist:', error.message)
    // We would need to add it via a SQL query or Supabase dashboard
  } else {
    console.log('Column exists:', data)
  }
}
run()
