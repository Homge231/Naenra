const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: player, error: playerErr } = await supabase.from('players').select('id').limit(1).single();
  if (playerErr) { console.error('Player fetch error:', playerErr); return; }
  
  const { data, error } = await supabase
    .from('game_sessions')
    .insert({
      player_id: player.id,
      status: 'active',
      active_core_id: null
    })
    .select('id')
    .single();
    
  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('Insert success! Session ID:', data.id);
  }
}
test();
