require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
supabase.from('cores').select('name, flat_buff, multiplier_buff').ilike('name', 'balance%').then(r => console.log(r.data));
