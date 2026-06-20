-- ============================================================
-- FIX RLS POLICIES — Jalankan di Supabase SQL Editor
-- ============================================================

-- MASALAH: Policy "Owner manage profiles" menyebabkan 
-- recursive loop karena query profiles di dalam policy profiles.
-- FIX: Gunakan security definer function untuk break recursion.
-- ============================================================

-- 1. Hapus semua policy profiles yang ada
DROP POLICY IF EXISTS "Auth users view profiles" ON profiles;
DROP POLICY IF EXISTS "Owner manage profiles" ON profiles;
DROP POLICY IF EXISTS "User update own profile" ON profiles;

-- 2. Buat helper function (SECURITY DEFINER = bypass RLS untuk fungsi ini)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 3. Buat ulang policies yang benar (tanpa recursive)
-- Semua user ter-autentikasi bisa baca profiles
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- User bisa baca dan update profile sendiri
CREATE POLICY "profiles_self_update" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Owner bisa insert profile baru (untuk tambah staf)
CREATE POLICY "profiles_owner_insert" ON profiles
  FOR INSERT WITH CHECK (public.get_my_role() = 'owner');

-- Owner bisa delete profile staf
CREATE POLICY "profiles_owner_delete" ON profiles
  FOR DELETE USING (public.get_my_role() = 'owner');

-- 4. Verifikasi
SELECT policyname, cmd, qual FROM pg_policies 
WHERE tablename = 'profiles';

SELECT 'RLS fix completed!' AS status;
