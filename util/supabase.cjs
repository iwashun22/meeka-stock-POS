const { createClient } = require('@supabase/supabase-js');

// console.log(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

module.exports = supabase;