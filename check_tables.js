import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wzhcnbbixmcjdtitztqn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6aGNuYmJpeG1jamR0aXR6dHFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NzMyOTAsImV4cCI6MjA5ODM0OTI5MH0.aRQKqgRGsTdMY1lqJWY7dmkbt2R8hbPW6dC-W9M0SFQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  // Try querying profiles
  console.log('Querying profiles...');
  const { data: profiles, error: err1 } = await supabase.from('profiles').select('phone').limit(1);
  if (err1) {
    console.error('Error profiles:', err1);
  } else {
    console.log('Phone column check success! Result:', profiles);
  }

  // Try querying cases
  console.log('Querying cases...');
  const { data: cases, error: err2 } = await supabase.from('cases').select('id').limit(5);
  if (err2) {
    console.error('Error cases:', err2);
  } else {
    console.log('Cases:', cases);
  }
}

main();
