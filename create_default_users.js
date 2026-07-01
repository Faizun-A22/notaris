import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load environment variables dari .env
let supabaseUrl = '';
let serviceRoleKey = '';

if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  const urlMatch = envContent.match(/VITE_SUPABASE_URL\s*=\s*(.*)/);
  const keyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)/);
  if (urlMatch) supabaseUrl = urlMatch[1].trim();
  if (keyMatch) serviceRoleKey = keyMatch[1].trim();
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: VITE_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di file .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function registerUser(email, password, fullName, role) {
  console.log(`\nMendaftarkan ${role.toUpperCase()}: ${email}...`);
  
  // 1. Sign Up di Supabase Auth menggunakan Admin API (otomatis bypass konfirmasi email)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true // Otomatis mengonfirmasi email
  });

  if (authError) {
    const errorMsg = authError.message?.toLowerCase() || '';
    // Jika user sudah terdaftar di auth, coba cari user id-nya
    if (errorMsg.includes('already registered') || errorMsg.includes('exists') || errorMsg.includes('already been registered')) {
      console.log(`Akun ${email} sudah terdaftar di Auth. Melakukan pembaruan profil di database...`);
      
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
      if (!listError && usersData) {
        const existingUser = usersData.users.find(u => u.email === email);
        if (existingUser) {
          await supabase.auth.admin.updateUserById(existingUser.id, { email_confirm: true });
          await createOrUpdateProfile(existingUser.id, fullName, role, email);
          return;
        }
      }
    }
    console.error(`Gagal mendaftarkan ${email} di Auth:`, authError.message);
    return;
  }

  const user = authData.user;
  if (!user) {
    console.error(`Gagal mendapatkan objek user setelah sign up untuk ${email}.`);
    return;
  }

  console.log(`Berhasil terdaftar di Auth (ID: ${user.id}) dan terkonfirmasi.`);
  await createOrUpdateProfile(user.id, fullName, role, email);
}

async function createOrUpdateProfile(userId, fullName, role, email) {
  // 2. Insert/Update Profile ke public.profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: fullName,
      role: role,
      email: email,
      is_active: true,
      title: role === 'owner' ? 'Notaris Utama' : 'Staf Administrasi'
    }, { onConflict: 'id' });

  if (profileError) {
    console.error(`Gagal menyimpan profile ke database untuk ${fullName}:`, profileError.message);
  } else {
    console.log(`Sukses membuat/memperbarui profil database untuk ${fullName}!`);
  }
}

async function main() {
  console.log('=== PEMBUATAN AKUN DEFAULT NOTARIS & ADMIN (ADMIN MODE) ===');
  
  await registerUser(
    'ketua@notaris.com', 
    'ketua123notaris', 
    'Budi Santoso, S.H., M.Kn.', 
    'owner'
  );

  await registerUser(
    'admin@notaris.com', 
    'admin123notaris', 
    'Siti Rahma', 
    'staff'
  );

  console.log('\n--------------------------------------------------');
  console.log('Proses pendaftaran akun default selesai.');
  console.log('Kredensial Login:');
  console.log('1. KETUA NOTARIS (Akses via /login/owner):');
  console.log('   - Email: ketua@notaris.com');
  console.log('   - Sandi: ketua123notaris');
  console.log('2. ADMIN STAFF (Akses via /login):');
  console.log('   - Email: admin@notaris.com');
  console.log('   - Sandi: admin123notaris');
  console.log('--------------------------------------------------');
}

main().catch(err => {
  console.error('Terjadi kesalahan:', err);
});
