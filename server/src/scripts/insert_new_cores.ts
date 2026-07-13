import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const newCores = [
  // PHOENIX BRANCH
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Phoenix Core',
    description: 'Rise from the ashes. Grants +200 bonus points on your first correct answer immediately following a mistake.',
    flat_buff: 0, multiplier_buff: 1, tier: 1, core_type: 'main', classification: 'main',
    icon_url: '/icons/cores/phoenix/phoenix-core.svg'
  },
  {
    id: '11111111-1111-1111-1111-222222222222',
    name: 'Phoenix Flame',
    description: 'Grants +400 bonus points on your first correct answer immediately following a mistake.',
    flat_buff: 0, multiplier_buff: 1, tier: 2, core_type: 'main', classification: 'main',
    icon_url: '/icons/cores/phoenix/phoenix-flame.svg'
  },
  {
    id: '11111111-1111-1111-1111-333333333333',
    name: 'Rebirth Core',
    description: 'Grants +200 bonus points after a mistake, and that mistake costs no penalty points.',
    flat_buff: 0, multiplier_buff: 1, tier: 2, core_type: 'main', classification: 'main',
    icon_url: '/icons/cores/phoenix/rebirth-core.svg'
  },
  {
    id: '11111111-1111-1111-1111-444444444444',
    name: 'Ashes to Ashes',
    description: 'If you make 2 consecutive mistakes, your next correct answer grants +800 bonus points.',
    flat_buff: 0, multiplier_buff: 1, tier: 2, core_type: 'main', classification: 'main',
    icon_url: '/icons/cores/phoenix/ashes-to-ashes.svg'
  },
  {
    id: '11111111-1111-1111-1111-555555555555',
    name: 'Immortal Phoenix',
    description: 'Grants +800 bonus points on your first correct answer immediately following a mistake.',
    flat_buff: 0, multiplier_buff: 1, tier: 3, core_type: 'main', classification: 'main',
    icon_url: '/icons/cores/phoenix/immortal-phoenix.svg'
  },
  {
    id: '11111111-1111-1111-1111-666666666666',
    name: 'Eternal Rebirth',
    description: 'Grants +400 bonus points after a mistake, and mistakes never cost penalty points.',
    flat_buff: 0, multiplier_buff: 1, tier: 3, core_type: 'main', classification: 'main',
    icon_url: '/icons/cores/phoenix/eternal-rebirth.svg'
  },
  {
    id: '11111111-1111-1111-1111-777777777777',
    name: 'Supernova Ashes',
    description: 'If you make 2 consecutive mistakes, your next correct answer grants +1500 bonus points.',
    flat_buff: 0, multiplier_buff: 1, tier: 3, core_type: 'main', classification: 'main',
    icon_url: '/icons/cores/phoenix/supernova-ashes.svg'
  },

  // HIGH ROLLER BRANCH
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'High Roller',
    description: 'Feeling lucky? Every correct answer has a 50% chance to grant 2x points, and a 50% chance to grant 0.5x points.',
    flat_buff: 0, multiplier_buff: 1, tier: 1, core_type: 'main', classification: 'main',
    icon_url: '/icons/cores/highroller/high-roller.svg'
  },
  {
    id: '22222222-2222-2222-2222-111111111111',
    name: 'Jackpot',
    description: '30% chance to grant 3x points, and a 70% chance to grant 0.5x points.',
    flat_buff: 0, multiplier_buff: 1, tier: 2, core_type: 'main', classification: 'main',
    icon_url: '/icons/cores/highroller/jackpot.svg'
  },
  {
    id: '22222222-2222-2222-2222-333333333333',
    name: 'Safe Bet',
    description: '80% chance to grant 1.5x points, and a 20% chance to grant 0.5x points.',
    flat_buff: 0, multiplier_buff: 1, tier: 2, core_type: 'main', classification: 'main',
    icon_url: '/icons/cores/highroller/safe-bet.svg'
  },
  {
    id: '22222222-2222-2222-2222-444444444444',
    name: 'Double or Nothing',
    description: '50% chance to grant 2x points. 50% chance to grant 0 points.',
    flat_buff: 0, multiplier_buff: 1, tier: 2, core_type: 'main', classification: 'main',
    icon_url: '/icons/cores/highroller/double-or-nothing.svg'
  },
  {
    id: '22222222-2222-2222-2222-555555555555',
    name: 'All In',
    description: '10% chance to grant 10x points, and a 90% chance to grant 0.1x points.',
    flat_buff: 0, multiplier_buff: 1, tier: 3, core_type: 'main', classification: 'main',
    icon_url: '/icons/cores/highroller/all-in.svg'
  },
  {
    id: '22222222-2222-2222-2222-666666666666',
    name: 'House Advantage',
    description: '70% chance to grant 2x points, and a 30% chance to grant 0.5x points.',
    flat_buff: 0, multiplier_buff: 1, tier: 3, core_type: 'main', classification: 'main',
    icon_url: '/icons/cores/highroller/house-advantage.svg'
  },
  {
    id: '22222222-2222-2222-2222-777777777777',
    name: 'Russian Roulette',
    description: '16.6% chance to grant 12x points. 83.4% chance to grant 0 points.',
    flat_buff: 0, multiplier_buff: 1, tier: 3, core_type: 'main', classification: 'main',
    icon_url: '/icons/cores/highroller/russian-roulette.svg'
  }
]

async function run() {
  console.log('Inserting 14 cores (including T1 updates)...')
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
