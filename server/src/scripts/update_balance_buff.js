require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function main() {
  const { data, error } = await supabase
    .from('cores')
    .update({ flat_buff: 50 })
    .in('name', ['Balance', 'Harmony Core', 'Perfect Harmony'])
    .select('name, flat_buff, multiplier_buff');
  
  if (error) {
    console.error('Error updating cores:', error);
  } else {
    console.log('Successfully updated cores:', data);
  }
}
main();
