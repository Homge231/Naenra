import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load .env from server/
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const newCores = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Phoenix Core',
    description: 'Rise from the ashes. Grants +200 bonus points on your first correct answer immediately following a mistake.',
    flat_buff: 0,
    multiplier_buff: 1,
    tier: 1,
    core_type: 'main',
    classification: 'main',
    icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=phoenix'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'High Roller',
    description: 'Feeling lucky? Every correct answer has a 50% chance to grant 2x points, and a 50% chance to grant 0.5x points.',
    flat_buff: 0,
    multiplier_buff: 1,
    tier: 1,
    core_type: 'main',
    classification: 'main',
    icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=highroller'
  }
]

async function run() {
  console.log('Inserting new cores...')
  const { data, error } = await supabase
    .from('cores')
    .upsert(newCores, { onConflict: 'id' })
    .select()

  if (error) {
    console.error('Error inserting cores:', error)
  } else {
    console.log('Successfully inserted cores:', data.map(c => c.name))
  }
}

run()
