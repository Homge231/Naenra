require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

supabase.from('user_vocab_stats').select('*, questions(topic)').limit(1).then(r => console.log(JSON.stringify(r.data, null, 2)));
