import { createClient } from '@supabase/supabase-js';
import readline from 'readline';
import fs from 'fs';

// Load environment variables dari .env
let supabaseUrl = '';
let serviceRoleKey = '';
let useAdmin = false;

if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  const urlMatch = envContent.match(/VITE_SUPABASE_URL\s*=\s*(.*)/);
  const serviceKeyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)/);
  const anonKeyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY\s*=\s*(.*)/);
  
  if (urlMatch) supabaseUrl = urlMatch[1].trim();
  if (serviceKeyMatch) {
    serviceRoleKey = serviceKeyMatch[1].trim();
    useAdmin = true;
  } else if (anonKeyMatch) {
    serviceRoleKey = anonKeyMatch[1].trim();
    useAdmin = false;
  }
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Kredensial tidak ditemukan di file .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, useAdmin ? {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
} : {});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log(`=== PEMBUATAN USER BARU SUPABASE (${useAdmin ? 'ADMIN MODE' : 'ANON MODE'}) ===`);
  
  const email = await question('Masukkan Email: ');
  const password = await question('Masukkan Password (minimal 6 karakter): ');
  const fullName = await question('Masukkan Nama Lengkap: ');
  
  let role = '';
  while (role !== 'owner' && role !== 'staff') {
    role = (await question('Masukkan Role (owner/staff): ')).toLowerCase().trim();
  }

  console.log('\nMemproses pendaftaran...');
  
  let user;

  if (useAdmin) {
    // Registrasi menggunakan Admin API (otomatis terkonfirmasi)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      console.error('Gagal mendaftarkan user di Auth Admin:', authError.message);
      rl.close();
      return;
    }
    user = authData.user;
  } else {
    // Registrasi menggunakan Anon API
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error('Gagal mendaftarkan user di Supabase Auth:', authError.message);
      rl.close();
      return;
    }
    user = authData.user;
  }

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
    .upsert({
      id: user.id,
      full_name: fullName,
      role: role,
      is_active: true,
      title: role === 'owner' ? 'Notaris Utama' : 'Staf Administrasi'
    }, { onConflict: 'id' });

  if (profileError) {
    console.error('Gagal membuat profile di database:', profileError.message);
  } else {
    console.log('Profile berhasil dibuat!');
    console.log('--------------------------------------------------');
    console.log(`Pendaftaran Selesai!`);
    console.log(`Email: ${email}`);
    console.log(`Role: ${role}`);
    console.log(`Nama: ${fullName}`);
    console.log('--------------------------------------------------');
    if (!useAdmin) {
      console.log('PENTING: Karena mendaftar dalam Anon Mode, harap konfirmasi email user ini manual di Dashboard Supabase jika login ditolak.');
    }
  }

  rl.close();
}

main().catch(err => {
  console.error(err);
  rl.close();
});
