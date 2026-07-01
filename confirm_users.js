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

async function main() {
  console.log('=== MENGONFIRMASI EMAIL SEMUA USER DI AUTH ===');
  
  // 1. Ambil list semua user
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Gagal mengambil daftar user:', listError.message);
    return;
  }

  if (!users || users.length === 0) {
    console.log('Tidak ada user ditemukan.');
    return;
  }

  console.log(`Ditemukan ${users.length} user. Memproses konfirmasi email...`);

  for (const user of users) {
    console.log(`Mengonfirmasi email untuk: ${user.email} (ID: ${user.id})...`);
    
    // 2. Update user agar email_confirm: true
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true
    });

    if (updateError) {
      console.error(`Gagal mengonfirmasi email untuk ${user.email}:`, updateError.message);
    } else {
      console.log(`Sukses mengonfirmasi email untuk ${user.email}!`);
      
      // 3. Pastikan profil database dibuat/diperbarui juga
      const role = user.email.includes('ketua') ? 'owner' : 'staff';
      const fullName = user.email.includes('ketua') ? 'Budi Santoso, S.H., M.Kn.' : 'Siti Rahma';
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          role: role,
          email: user.email,
          is_active: true,
          title: role === 'owner' ? 'Notaris Utama' : 'Staf Administrasi'
        }, { onConflict: 'id' });

      if (profileError) {
        console.error(`Gagal membuat profil untuk ${user.email}:`, profileError.message);
      } else {
        console.log(`Profil database terbuat/terupdate.`);
      }
    }
  }

  console.log('\nSemua user berhasil terkonfirmasi! Silakan coba login kembali.');
}

main().catch(err => {
  console.error('Terjadi kesalahan:', err);
});
