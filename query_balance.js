require('dotenv').config({ path: 'server/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function main() {
  const { data, error } = await supabase.from('cores').select('name, flat_buff, multiplier_buff').ilike('name', 'balance%');
  console.log(data);
}
main();
