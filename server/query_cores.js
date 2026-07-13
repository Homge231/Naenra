require('dotenv').config({path: 'server/.env'});
const { createClient } = require('@supabase/supabase-js');
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
s.from('cores').select('name, classification, tier').eq('tier', 1).then(r => console.log(r.data))
