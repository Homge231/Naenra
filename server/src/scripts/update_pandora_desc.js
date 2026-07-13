require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function main() {
  const updates = [
    { name: "Trickster's Glass", desc: "Shape-shifts every 20 seconds. Trickster's evasion: Skipping a question (submitting empty) no longer deducts any points." },
    { name: "Chaos Theory", desc: "Shape-shifts every 15 seconds. Embrace the chaos: Every correct answer grants a random bonus between +100 and +500 points." },
    { name: "Butterfly Effect", desc: "Shape-shifts every 15 seconds. The butterfly flaps its wings: Your score multiplier increases by +0.1x for every consecutive correct answer." }
  ];

  for (const update of updates) {
    const { data, error } = await supabase
      .from('cores')
      .update({ description: update.desc })
      .eq('name', update.name)
      .select('name, description');
    if (error) console.error(error);
    else console.log(data);
  }
}
main();
