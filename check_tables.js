import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://btalgqnmjthcqatogkvx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0YWxncW5tanRoY3FhdG9na3Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MDUyMjgsImV4cCI6MjA5NjQ4MTIyOH0.CAjDxRRGI-3ADILiCTBfSWbG_NT9PD4u3OynMKfRVSc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  // Try querying services
  console.log('Querying services...');
  const { data: services, error: err1 } = await supabase.from('services').select('id, name').limit(5);
  if (err1) {
    console.error('Error services:', err1);
  } else {
    console.log('Services (first 5):', services);
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
