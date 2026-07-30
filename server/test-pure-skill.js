const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: player, error: playerErr } = await supabase.from('players').select('id').limit(1).single();
  if (playerErr) { console.error('Player fetch error:', playerErr); return; }
  
  const { data: question } = await supabase.from('questions').select('id, target_word').limit(1).single();
  
  const token = jwt.sign({ id: player.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  // Need node fetch or native fetch (Node 18+)
  const sessRes = await fetch('http://localhost:3000/api/game/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ active_core_id: "", is_pure_skill: true })
  });
  
  const sessData = await sessRes.json();
  console.log('Session creation response:', sessRes.status, sessData);
  
  if (!sessRes.ok) return;
  
  const sessionId = sessData.session_id;
  
  const submitRes = await fetch('http://localhost:3000/api/game/submit-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      session_id: sessionId,
      question_id: question.id,
      answer: question.target_word,
      current_combo: 0,
      active_core_id: "",
      time_taken: 1500
    })
  });
  
  const submitData = await submitRes.json();
  console.log('Submit answer response:', submitRes.status, submitData);
}
test();
