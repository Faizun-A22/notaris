import { createClient } from '@supabase/supabase-js';
import readline from 'readline';
import fs from 'fs';

// Load environment variables from .env manually
let supabaseUrl = '';
let supabaseAnonKey = '';

if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  const urlMatch = envContent.match(/VITE_SUPABASE_URL\s*=\s*(.*)/);
  const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY\s*=\s*(.*)/);
  if (urlMatch) supabaseUrl = urlMatch[1].trim();
  if (keyMatch) supabaseAnonKey = keyMatch[1].trim();
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY tidak ditemukan di file .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('=== PEMBUATAN USER BARU SUPABASE ===');
  
  const email = await question('Masukkan Email: ');
  const password = await question('Masukkan Password (minimal 6 karakter): ');
  const fullName = await question('Masukkan Nama Lengkap: ');
  
  let role = '';
  while (role !== 'owner' && role !== 'staff') {
    role = (await question('Masukkan Role (owner/staff): ')).toLowerCase().trim();
  }

  console.log('\nMemproses pendaftaran...');
  
  // 1. Sign Up User di Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.error('Gagal mendaftarkan user di Supabase Auth:', authError.message);
    rl.close();
    return;
  }

  const user = authData.user;
  if (!user) {
    console.error('Gagal mendapatkan data user setelah sign up.');
    rl.close();
    return;
  }

  console.log(`User berhasil dibuat di Supabase Auth (ID: ${user.id})`);

  // 2. Insert Profile ke tabel public.profiles
  console.log('Membuat data profile di tabel public.profiles...');
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      full_name: fullName,
      role: role,
      is_active: true,
      title: role === 'owner' ? 'Notaris Utama' : 'Staf Administrasi'
    });

  if (profileError) {
    console.error('Gagal membuat profile di database:', profileError.message);
    console.log('Catatan: Anda mungkin perlu memasukkan data profile ini secara manual ke tabel public.profiles.');
  } else {
    console.log('Profile berhasil dibuat!');
    console.log('--------------------------------------------------');
    console.log(`Pendaftaran Selesai!`);
    console.log(`Email: ${email}`);
    console.log(`Role: ${role}`);
    console.log(`Nama: ${fullName}`);
    console.log('--------------------------------------------------');
    console.log('Catatan: Jika email confirmation aktif di Supabase Anda, silakan verifikasi email terlebih dahulu atau matikan opsi "Confirm email" di Dashboard Supabase -> Authentication -> Providers -> Email.');
  }

  rl.close();
}

main().catch(err => {
  console.error(err);
  rl.close();
});
