require('dotenv').config({path: 'server/.env'});
const { createClient } = require('@supabase/supabase-js');
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
s.from('user_vocab_stats').select('*').limit(1).then(r => console.log(Object.keys(r.data[0] || {})))
