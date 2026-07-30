const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: player } = await supabase.from('players').select('id').limit(1).single();
  const { data: question } = await supabase.from('questions').select('id, target_word').limit(1).single();
  const { data: coreRow } = await supabase.from('cores').select('id').limit(1).single();
  
  const token = jwt.sign({ id: player.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const realCoreId = coreRow.id;
  
  const sessRes = await fetch('http://localhost:3000/api/game/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ active_core_id: realCoreId, is_pure_skill: true })
  });
  
  const sessData = await sessRes.json();
  console.log('Session response:', sessRes.status, sessData);
  
  if (!sessRes.ok) return;
  
  const submitRes = await fetch('http://localhost:3000/api/game/submit-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      session_id: sessData.session_id,
      question_id: question.id,
      answer: question.target_word, // correct
      current_combo: 0,
      active_core_id: realCoreId,
      time_taken: 1500
    })
  });
  
  console.log('Submit response:', submitRes.status, await submitRes.json());
}
test();
