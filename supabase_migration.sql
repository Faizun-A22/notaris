-- ============================================================
-- NOTARIS DIGITAL — SUPABASE DATABASE MIGRATION
-- Jalankan file ini di: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- ============================================================
-- 1. EXTENSION
-- ============================================================
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- ============================================================
-- 2. TABEL PROFILES (user data, linked to auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  title       TEXT,
  role        TEXT NOT NULL CHECK (role IN ('owner', 'staff')),
  avatar_url  TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- ============================================================
-- 3. TABEL CASES (berkas notaris)
-- ============================================================
CREATE TABLE IF NOT EXISTS cases (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number       TEXT UNIQUE NOT NULL,
  client_name       TEXT NOT NULL,
  client_id         TEXT NOT NULL,
  client_phone      TEXT,
  client_email      TEXT,
  category          TEXT NOT NULL DEFAULT 'ppat' CHECK (category IN ('ppat', 'notaris')),
  service_type      TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'Pemeriksaan Dokumen',
  current_stage_id  INTEGER DEFAULT 1,
  is_complete       BOOLEAN DEFAULT FALSE,
  documents_ready   BOOLEAN DEFAULT FALSE,
  notes             TEXT,
  fees              BIGINT DEFAULT 0,
  property_location TEXT,
  bank_partner      TEXT,
  entry_date        DATE DEFAULT CURRENT_DATE,
  estimation_date   DATE,
  assigned_staff_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE INDEX IF NOT EXISTS idx_cases_assigned_staff ON cases(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_service_type ON cases(service_type);
CREATE INDEX IF NOT EXISTS idx_cases_is_complete ON cases(is_complete);

-- ============================================================
-- 4. TABEL CHECKLIST_TEMPLATES (default per service type)
-- ============================================================
CREATE TABLE IF NOT EXISTS checklist_templates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type TEXT NOT NULL,
  order_num    INTEGER NOT NULL,
  name         TEXT NOT NULL,
  description  TEXT,
  UNIQUE(service_type, order_num)
);

-- ============================================================
-- 5. TABEL CHECKLIST_ITEMS (dokumen per berkas)
-- ============================================================
CREATE TABLE IF NOT EXISTS checklist_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  order_num   INTEGER NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'Belum Ada'
              CHECK (status IN ('Belum Ada', 'Sudah Diterima', 'Perlu Verifikasi')),
  file_url    TEXT,
  file_name   TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_by  UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_checklist_case_id ON checklist_items(case_id);

-- ============================================================
-- 6. TABEL ACTIVITY_LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     UUID REFERENCES cases(id) ON DELETE SET NULL,
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_name   TEXT NOT NULL,
  user_role   TEXT,
  category    TEXT CHECK (category IN ('ppat', 'notaris', 'system')),
  action      TEXT NOT NULL,
  icon        TEXT DEFAULT 'history',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_case_id ON activity_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================================
-- 7. TABEL SERVICES (referensi jenis layanan)
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  category     TEXT NOT NULL CHECK (category IN ('ppat', 'notaris')),
  average_time TEXT,
  base_fee     BIGINT DEFAULT 0,
  description  TEXT,
  is_active    BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users view profiles" ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Owner manage profiles" ON profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'owner'));

CREATE POLICY "User update own profile" ON profiles FOR UPDATE
  USING (id = auth.uid());

-- CASES
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner select all cases" ON cases FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'));

CREATE POLICY "Staff select assigned cases" ON cases FOR SELECT
  USING (assigned_staff_id = auth.uid());

CREATE POLICY "Auth users insert cases" ON cases FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Owner update all cases" ON cases FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'));

CREATE POLICY "Staff update assigned cases" ON cases FOR UPDATE
  USING (assigned_staff_id = auth.uid());

CREATE POLICY "Owner delete cases" ON cases FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'));

-- CHECKLIST_ITEMS
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Checklist access follows case" ON checklist_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = checklist_items.case_id
      AND (
        c.assigned_staff_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
      )
    )
  );

-- CHECKLIST_TEMPLATES (read-only untuk semua authenticated)
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users read templates" ON checklist_templates FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Owner manage templates" ON checklist_templates FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'));

-- ACTIVITY_LOGS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users view logs" ON activity_logs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Auth users insert logs" ON activity_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- SERVICES (read-only untuk semua)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone read services" ON services FOR SELECT
  USING (true);

CREATE POLICY "Owner manage services" ON services FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'));

-- ============================================================
-- 9. SEED DATA — SERVICES
-- ============================================================
INSERT INTO services (id, name, category, average_time, base_fee, description) VALUES
  ('AJB',     'Akta Jual Beli',                              'ppat',    '3-5 Hari Kerja',   12000000, 'Akta otentik yang membuktikan peralihan hak atas tanah dan bangunan karena transaksi jual beli.'),
  ('SKMHT',   'Surat Kuasa Membebankan Hak Tanggungan',      'notaris', '2-3 Hari Kerja',    4500000, 'Surat kuasa untuk membebankan Hak Tanggungan guna jaminan pelunasan hutang debitur.'),
  ('HT',      'Hak Tanggungan',                              'ppat',    '5-7 Hari Kerja',    8000000, 'Pendaftaran hak jaminan atas tanah/bangunan untuk menjamin utang klien.'),
  ('APHT',    'Akta Pemberian Hak Tanggungan',               'ppat',    '5-7 Hari Kerja',    8000000, 'Akta pemberian hak tanggungan atas objek tanah/bangunan.'),
  ('HIBAH',   'Akta Hibah',                                  'ppat',    '3-5 Hari Kerja',   10000000, 'Akta pemberian hak atas tanah/bangunan kepada penerima hibah.'),
  ('APHB',    'Akta Pembagian Hak Bersama',                  'ppat',    '5-7 Hari Kerja',   10000000, 'Akta pembagian hak atas tanah/bangunan yang dimiliki secara bersama.'),
  ('WARIS',   'Waris',                                       'ppat',    '7-10 Hari Kerja',  12000000, 'Proses peralihan hak atas tanah kepada ahli waris yang sah.'),
  ('ROYA',    'Roya Hak Tanggungan',                         'ppat',    '3-5 Hari Kerja',    5000000, 'Penghapusan catatan hak tanggungan dari sertifikat tanah.'),
  ('PECAH',   'Pemecahan Sertifikat',                        'ppat',    '14-21 Hari Kerja',  8000000, 'Pemecahan satu sertifikat tanah menjadi beberapa sertifikat baru.'),
  ('GANTI',   'Sertifikat Pengganti',                        'ppat',    '14-21 Hari Kerja',  8000000, 'Penerbitan sertifikat tanah baru sebagai pengganti sertifikat yang hilang/rusak.'),
  ('KONVERSI','Konversi Letter C',                           'ppat',    '30-60 Hari Kerja', 10000000, 'Konversi bukti kepemilikan tanah lama (Letter C) menjadi sertifikat modern.'),
  ('FIDUSIA', 'Akta Jaminan Fidusia',                        'notaris', '3-5 Hari Kerja',    6000000, 'Akta penyerahan hak kepemilikan atas benda bergerak sebagai jaminan utang.'),
  ('APJB',    'Akta Pengikatan Jual Beli',                   'notaris', '3-5 Hari Kerja',    8000000, 'Akta perjanjian pengikatan jual beli sebelum AJB definitif.'),
  ('APPJB',   'Akta Perjanjian Pengikatan Jual Beli',        'notaris', '3-5 Hari Kerja',    8000000, 'Akta perjanjian lebih rinci sebelum proses AJB dilaksanakan.'),
  ('SKUM',    'Akta Surat Kuasa Untuk Menjual',              'notaris', '2-3 Hari Kerja',    5000000, 'Surat kuasa resmi yang memberikan kewenangan untuk menjual properti.'),
  ('SEWA',    'Akta Perjanjian Sewa Menyewa',                'notaris', '2-3 Hari Kerja',    5000000, 'Akta perjanjian sewa menyewa properti antara pemilik dan penyewa.'),
  ('CONSEN',  'Akta Consen Roya',                            'notaris', '3-5 Hari Kerja',    5000000, 'Akta persetujuan roya untuk penghapusan hak tanggungan.'),
  ('APK',     'Akta Perjanjian Kredit',                      'notaris', '3-5 Hari Kerja',    6000000, 'Akta perjanjian kredit antara debitur dan kreditur.'),
  ('YAYASAN', 'Akta Pendirian Yayasan',                      'notaris', '7-10 Hari Kerja',  15000000, 'Akta pendirian yayasan lengkap dengan pengesahan Kemenkumham.'),
  ('PT',      'Akta Pendirian PT',                           'notaris', '7-10 Hari Kerja',  25000000, 'Akta pendirian Perseroan Terbatas lengkap dengan pengesahan Kemenkumham.'),
  ('CV',      'Akta Pendirian/Perubahan CV',                 'notaris', '5-7 Hari Kerja',   15000000, 'Akta pendirian atau perubahan Commanditaire Vennootschap dengan pendaftaran Kemenkumham.')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 10. SEED DATA — CHECKLIST TEMPLATES (AJB)
-- ============================================================
INSERT INTO checklist_templates (service_type, order_num, name, description) VALUES
  ('AJB',  1,  'Sertifikat Asli',                        'Sertifikat asli (HM/HGB/HP) dari BPN'),
  ('AJB',  2,  'Fotokopi KTP Pemegang Hak',              'Valid E-KTP photocopy or scan of seller'),
  ('AJB',  3,  'Fotokopi KTP Persetujuan Pemegang Hak',  'Required for married individuals'),
  ('AJB',  4,  'Fotokopi Surat Nikah Pemegang Hak',      'Marriage certificate of seller'),
  ('AJB',  5,  'Fotokopi KK Pemegang Hak',               'Family Registry card of seller'),
  ('AJB',  6,  'Fotokopi KTP Pembeli',                   'Valid E-KTP photocopy or scan of buyer'),
  ('AJB',  7,  'Fotokopi KK Pembeli',                    'Family Registry card of buyer'),
  ('AJB',  8,  'Nomor Telepon dan Email Pembeli',         'Contact details of buyer'),
  ('AJB',  9,  'Fotokopi PBB Tahun Berjalan',            'Latest property tax receipt'),
  ('AJB', 10,  'Share Lokasi Tanah',                     'Location coordinates or map link'),
  ('AJB', 11,  'Foto Lokasi Tanah (GPS Maps Camera)',    'Physical photo with coordinate stamp'),

-- SKMHT
  ('SKMHT', 1, 'Sertifikat Asli',                        'Must be physical original document'),
  ('SKMHT', 2, 'KTP AN. Pemegang Hak',                   'Valid E-KTP photocopy or scan'),
  ('SKMHT', 3, 'KTP Persetujuan Pemegang Hak',           'Required for married individuals'),
  ('SKMHT', 4, 'Fotokopi Kartu Keluarga',                'Family Registry card'),
  ('SKMHT', 5, 'Fotokopi Surat Nikah',                   'Marriage certificate'),
  ('SKMHT', 6, 'Fotokopi PBB Tahun Berjalan',            'Latest property tax receipt'),
  ('SKMHT', 7, 'Fotokopi Perjanjian Kredit',             'Credit agreement from bank'),
  ('SKMHT', 8, 'Fotokopi KTP Pihak Bank',                'Bank officer representative ID'),
  ('SKMHT', 9, 'Fotokopi SK Pihak Bank',                 'Officer''s letter of appointment'),

-- HIBAH
  ('HIBAH',  1, 'Sertifikat Asli',                                  'Sertifikat asli tanah/bangunan'),
  ('HIBAH',  2, 'Fotokopi KTP Pemegang Hak',                        'Fotokopi KTP pemberi hibah'),
  ('HIBAH',  3, 'Fotokopi KTP Persetujuan Istri Pemegang Hak',      'Persetujuan istri pemberi hibah'),
  ('HIBAH',  4, 'Fotokopi Surat Nikah Pemegang Hak',                'Surat nikah pemberi hibah'),
  ('HIBAH',  5, 'Fotokopi KK Pemegang Hak',                         'Kartu Keluarga pemberi hibah'),
  ('HIBAH',  6, 'Fotokopi KTP Persetujuan Seluruh Anak',            'Fotokopi KTP persetujuan seluruh anak kandung'),
  ('HIBAH',  7, 'Fotokopi KK Persetujuan Seluruh Anak',             'Kartu Keluarga persetujuan anak'),
  ('HIBAH',  8, 'Fotokopi Akta Kelahiran Seluruh Anak',             'Akta kelahiran anak kandung'),
  ('HIBAH',  9, 'Surat Keterangan Anak dari Desa',                  'Surat keterangan anak/silsilah waris'),
  ('HIBAH', 10, 'Fotokopi KTP Penerima Hibah',                      'Fotokopi KTP penerima hibah'),
  ('HIBAH', 11, 'Fotokopi KK Penerima Hibah',                       'Kartu Keluarga penerima hibah'),
  ('HIBAH', 12, 'Fotokopi Akta Kelahiran Penerima Hibah',           'Akta kelahiran penerima hibah'),
  ('HIBAH', 13, 'Nomor Telepon dan Email Penerima Hibah',           'Kontak penerima hibah'),
  ('HIBAH', 14, 'Fotokopi PBB Tahun Berjalan',                      'PBB tahun berjalan pemberi hibah'),
  ('HIBAH', 15, 'Share Lokasi Tanah',                               'Share lokasi tanah/objek hibah'),
  ('HIBAH', 16, 'Foto Lokasi Tanah (GPS Maps Camera)',              'Foto objek hibah dari kamera GPS'),

-- APHB
  ('APHB',  1, 'Sertifikat Asli',                                          'Sertifikat tanah asli HM/HGB/HP'),
  ('APHB',  2, 'Surat Keterangan Ahli Waris Asli',                         'Surat keterangan ahli waris asli'),
  ('APHB',  3, 'Fotokopi Legalisir Kepala Desa untuk surat keterangan ahli waris', 'Fotokopi legalisir Kades'),
  ('APHB',  4, 'Fotokopi Surat/Akta Kematian',                             'Fotokopi surat/akta kematian pewaris'),
  ('APHB',  5, 'Surat Nikah atau Surat Keterangan Nikah dari desa (alm)',  'Surat nikah alm'),
  ('APHB',  6, 'Surat Keterangan Anak dari Desa',                          'Surat keterangan anak/silsilah waris'),
  ('APHB',  7, 'Fotokopi KTP Seluruh Ahli Waris',                          'KTP seluruh ahli waris'),
  ('APHB',  8, 'Fotokopi KK Seluruh Ahli Waris',                           'KK seluruh ahli waris'),
  ('APHB',  9, 'Nomor Telepon dan Email Penerima APHB',                    'Kontak penerima APHB'),
  ('APHB', 10, 'Fotokopi PBB Tahun Berjalan',                              'Fotokopi PBB tahun berjalan'),
  ('APHB', 11, 'Share Lokasi Tanah',                                       'Share lokasi tanah/objek APHB'),
  ('APHB', 12, 'Foto Lokasi Tanah (GPS Maps Camera)',                      'Foto objek APHB dari kamera GPS'),

-- APHT
  ('APHT',  1, 'Sertifikat Asli',                'Sertifikat tanah asli HM/HGB/HP'),
  ('APHT',  2, 'KTP Pemegang Hak',               'Valid E-KTP photocopy or scan of owner'),
  ('APHT',  3, 'KTP Persetujuan Pemegang Hak',   'Required for married individuals'),
  ('APHT',  4, 'Fotokopi KK',                    'Family Registry card'),
  ('APHT',  5, 'Fotokopi Surat Nikah',            'Marriage certificate'),
  ('APHT',  6, 'Fotokopi PBB Tahun Berjalan',    'Latest property tax receipt'),
  ('APHT',  7, 'Fotokopi Perjanjian Kredit',     'Credit agreement from bank'),
  ('APHT',  8, 'Fotokopi KTP Pihak Bank',        'Bank officer representative ID'),
  ('APHT',  9, 'Fotokopi SK Pihak Bank',         'Officer''s letter of appointment'),
  ('APHT', 10, 'Kode Bank',                      'Unique bank code identifier'),

-- WARIS
  ('WARIS',  1, 'Sertifikat Asli',                                         'Sertifikat tanah asli HM/HGB/HP'),
  ('WARIS',  2, 'Surat Keterangan Ahli Waris Asli',                        'Surat keterangan ahli waris asli'),
  ('WARIS',  3, 'Fotokopi Legalisir Kepala Desa untuk surat ahli waris',   'Fotokopi legalisir Kades'),
  ('WARIS',  4, 'Fotokopi Surat/Akta Kematian',                            'Fotokopi surat/akta kematian pewaris'),
  ('WARIS',  5, 'Surat Nikah atau Surat Keterangan Nikah dari desa (alm)', 'Surat nikah alm'),
  ('WARIS',  6, 'Surat Keterangan Anak dari Desa',                         'Surat keterangan anak/silsilah waris'),
  ('WARIS',  7, 'Fotokopi KTP Seluruh Ahli Waris',                         'KTP seluruh ahli waris'),
  ('WARIS',  8, 'Surat Pernyataan Pembagian Hak Waris',                    'Surat pernyataan pembagian hak waris'),
  ('WARIS',  9, 'Fotokopi KK Seluruh Ahli Waris',                          'KK seluruh ahli waris'),
  ('WARIS', 10, 'Nomor Telepon dan Email Salah Satu Ahli Waris',           'Kontak salah satu ahli waris'),
  ('WARIS', 11, 'Fotokopi PBB Tahun Berjalan',                             'Fotokopi PBB tahun berjalan'),
  ('WARIS', 12, 'Share Lokasi Tanah',                                      'Share lokasi tanah/objek waris'),
  ('WARIS', 13, 'Foto Lokasi Tanah (GPS Maps Camera)',                     'Foto objek waris dari kamera GPS'),

-- ROYA
  ('ROYA', 1, 'Sertifikat Asli',                  'Sertifikat tanah asli HM/HGB/HP'),
  ('ROYA', 2, 'Fotokopi KTP Pemegang Hak',        'Fotokopi KTP pemegang hak'),
  ('ROYA', 3, 'Fotokopi KK Pemegang Hak',         'Fotokopi KK pemegang hak'),
  ('ROYA', 4, 'Surat Roya Asli dari Bank',        'Surat roya asli dari bank kreditur'),
  ('ROYA', 5, 'Sertifikat Hak Tanggungan Asli',   'Sertifikat Hak Tanggungan asli'),
  ('ROYA', 6, 'Share Lokasi Tanah',               'Share lokasi tanah/objek roya'),
  ('ROYA', 7, 'Foto Lokasi Tanah (GPS Maps Camera)', 'Foto objek roya dari kamera GPS'),

-- PECAH
  ('PECAH', 1, 'Sertifikat Asli',                     'Sertifikat asli (HM/HGB/HP) dari BPN'),
  ('PECAH', 2, 'Fotokopi KTP Pemegang Hak',            'Fotokopi KTP pemegang hak milik'),
  ('PECAH', 3, 'Fotokopi KK Pemegang Hak',             'Fotokopi Kartu Keluarga pemegang hak milik'),
  ('PECAH', 4, 'Fotokopi PBB Tahun Berjalan',          'Fotokopi Pajak Bumi dan Bangunan tahun berjalan'),
  ('PECAH', 5, 'Share Lokasi Tanah',                   'Titik koordinat share lokasi tanah objek pemecahan'),
  ('PECAH', 6, 'Foto Lokasi Tanah (GPS Maps Camera)', 'Foto lokasi tanah fisik menggunakan kamera GPS Maps'),

-- GANTI
  ('GANTI', 1, 'Sertifikat Asli',                     'Sertifikat asli (HM/HGB/HP) dari BPN'),
  ('GANTI', 2, 'Fotokopi KTP Pemegang Hak',            'Fotokopi KTP pemegang hak milik'),
  ('GANTI', 3, 'Fotokopi KK Pemegang Hak',             'Fotokopi Kartu Keluarga pemegang hak milik'),
  ('GANTI', 4, 'Fotokopi PBB Tahun Berjalan',          'Fotokopi Pajak Bumi dan Bangunan tahun berjalan'),
  ('GANTI', 5, 'Share Lokasi Tanah',                   'Titik koordinat share lokasi tanah objek pengganti'),
  ('GANTI', 6, 'Foto Lokasi Tanah (GPS Maps Camera)', 'Foto lokasi tanah fisik menggunakan kamera GPS Maps'),

-- KONVERSI
  ('KONVERSI',  1, 'Fotokopi Legalisir Letter C Desa',                      'Fotokopi Letter C desa dilegalisir'),
  ('KONVERSI',  2, 'Fotokopi KTP Pemegang Hak',                             'Fotokopi KTP pemegang hak milik'),
  ('KONVERSI',  3, 'Fotokopi KK Pemegang Hak',                              'Fotokopi Kartu Keluarga pemegang hak milik'),
  ('KONVERSI',  4, 'Fotokopi PBB Tahun Berjalan',                           'Fotokopi Pajak Bumi dan Bangunan tahun berjalan'),
  ('KONVERSI',  5, 'Share Lokasi Tanah',                                    'Titik koordinat share lokasi tanah objek'),
  ('KONVERSI',  6, 'Foto Lokasi Tanah (GPS Maps Camera)',                  'Foto lokasi tanah fisik menggunakan kamera GPS Maps'),
  ('KONVERSI',  7, 'Blangko Konversi',                                      'Formulir blangko konversi resmi'),
  ('KONVERSI',  8, 'Fotokopi KTP Carik/Lurah/Polo',                        'Fotokopi KTP pejabat desa Carik/Lurah/Polo'),
  ('KONVERSI',  9, 'Surat Keterangan Riwayat Tanah',                       'Surat keterangan riwayat kepemilikan tanah asli'),
  ('KONVERSI', 10, 'Fotokopi Bukti Perolehan Hak Letter C Sejak Tahun 1960','Fotokopi bukti perolehan hak Letter C runut sejak 1960'),

-- FIDUSIA
  ('FIDUSIA',  1, 'Fotokopi BPKB Kendaraan Bermotor',        'Fotokopi Bukti Pemilik Kendaraan Bermotor'),
  ('FIDUSIA',  2, 'Fotokopi STNK Kendaraan Bermotor',        'Fotokopi Surat Tanda Nomor Kendaraan'),
  ('FIDUSIA',  3, 'KTP Debitur',                             'Kartu Tanda Penduduk pihak Debitur'),
  ('FIDUSIA',  4, 'KTP Persetujuan Debitur',                 'Fotokopi KTP penjamin persetujuan debitur'),
  ('FIDUSIA',  5, 'Fotokopi Kartu Keluarga',                 'Fotokopi Kartu Keluarga debitur'),
  ('FIDUSIA',  6, 'Fotokopi Surat Nikah',                    'Fotokopi Surat Nikah/Buku Nikah debitur'),
  ('FIDUSIA',  7, 'Fotokopi Perjanjian Kredit',              'Fotokopi Perjanjian Kredit pendukung'),
  ('FIDUSIA',  8, 'Fotokopi Kwitansi Pembelian Kendaraan',   'Diperlukan apabila BPKB + STNK bukan atas nama debitur'),
  ('FIDUSIA',  9, 'Surat Pernyataan Kepemilikan Jaminan',    'Diperlukan apabila BPKB + STNK bukan atas nama debitur'),
  ('FIDUSIA', 10, 'Fotokopi KTP Pihak Bank',                 'ID perwakilan pejabat bank'),
  ('FIDUSIA', 11, 'Fotokopi SK Pihak Bank',                  'Surat Keputusan perwakilan pejabat bank'),

-- APJB / APPJB
  ('APJB',  1, 'Sertifikat Asli',                    'Sertifikat tanah asli (HM/HGB) dari BPN'),
  ('APJB',  2, 'KTP AN. Pemegang Hak',               'Kartu Tanda Penduduk atas nama pemegang hak'),
  ('APJB',  3, 'KTP Persetujuan Pemegang Hak',       'Fotokopi KTP persetujuan suami/istri pemegang hak'),
  ('APJB',  4, 'Fotokopi Kartu Keluarga',            'Fotokopi Kartu Keluarga pemegang hak'),
  ('APJB',  5, 'Fotokopi Surat Nikah',               'Fotokopi Surat Nikah pemegang hak'),
  ('APJB',  6, 'Fotokopi PBB Tahun Berjalan',        'Fotokopi Pajak Bumi dan Bangunan tahun berjalan'),
  ('APJB',  7, 'Fotokopi KTP Pembeli',               'Fotokopi Kartu Tanda Penduduk pihak pembeli'),
  ('APJB',  8, 'Fotokopi Kartu Keluarga Pembeli',    'Fotokopi Kartu Keluarga pihak pembeli'),
  ('APJB',  9, 'Nomor Telepon + Email Pembeli',      'Nomor telepon dan email aktif pembeli'),
  ('APJB', 10, 'Share Lokasi Tanah',                 'Titik koordinat share lokasi tanah objek'),
  ('APJB', 11, 'Foto Lokasi',                        'Foto fisik lokasi tanah objek'),

  ('APPJB',  1, 'Sertifikat Asli',                    'Sertifikat tanah asli (HM/HGB) dari BPN'),
  ('APPJB',  2, 'KTP AN. Pemegang Hak',               'Kartu Tanda Penduduk atas nama pemegang hak'),
  ('APPJB',  3, 'KTP Persetujuan Pemegang Hak',       'Fotokopi KTP persetujuan suami/istri pemegang hak'),
  ('APPJB',  4, 'Fotokopi Kartu Keluarga',            'Fotokopi Kartu Keluarga pemegang hak'),
  ('APPJB',  5, 'Fotokopi Surat Nikah',               'Fotokopi Surat Nikah pemegang hak'),
  ('APPJB',  6, 'Fotokopi PBB Tahun Berjalan',        'Fotokopi Pajak Bumi dan Bangunan tahun berjalan'),
  ('APPJB',  7, 'Fotokopi KTP Pembeli',               'Fotokopi Kartu Tanda Penduduk pihak pembeli'),
  ('APPJB',  8, 'Fotokopi Kartu Keluarga Pembeli',    'Fotokopi Kartu Keluarga pihak pembeli'),
  ('APPJB',  9, 'Nomor Telepon + Email Pembeli',      'Nomor telepon dan email aktif pembeli'),
  ('APPJB', 10, 'Share Lokasi Tanah',                 'Titik koordinat share lokasi tanah objek'),
  ('APPJB', 11, 'Foto Lokasi',                        'Foto fisik lokasi tanah objek'),

-- SKUM / APK
  ('SKUM', 1, 'Sertifikat Asli',                  'Sertifikat tanah asli (HM/HGB) dari BPN'),
  ('SKUM', 2, 'KTP AN. Pemegang Hak',             'Kartu Tanda Penduduk atas nama pemegang hak'),
  ('SKUM', 3, 'KTP Persetujuan Pemegang Hak',     'Fotokopi KTP persetujuan suami/istri pemegang hak'),
  ('SKUM', 4, 'Fotokopi Kartu Keluarga',          'Fotokopi Kartu Keluarga pemegang hak'),

  ('APK', 1, 'Sertifikat Asli',                   'Sertifikat tanah asli (HM/HGB) dari BPN'),
  ('APK', 2, 'KTP AN. Pemegang Hak',              'Kartu Tanda Penduduk atas nama pemegang hak'),
  ('APK', 3, 'KTP Persetujuan Pemegang Hak',      'Fotokopi KTP persetujuan suami/istri pemegang hak'),
  ('APK', 4, 'Fotokopi Kartu Keluarga',           'Fotokopi Kartu Keluarga pemegang hak'),

-- SEWA
  ('SEWA', 1, 'Sertifikat Asli',                  'Sertifikat tanah asli (HM/HGB) dari BPN'),
  ('SEWA', 2, 'KTP AN. Pemegang Hak',             'Kartu Tanda Penduduk atas nama pemegang hak'),
  ('SEWA', 3, 'KTP Persetujuan Pemegang Hak',     'Fotokopi KTP persetujuan suami/istri pemegang hak'),
  ('SEWA', 4, 'Fotokopi Kartu Keluarga',          'Fotokopi Kartu Keluarga pemegang hak'),
  ('SEWA', 5, 'Fotokopi Surat Nikah',             'Fotokopi Surat Nikah pemegang hak'),
  ('SEWA', 6, 'Fotokopi KTP Pihak Penyewa',       'Fotokopi Kartu Tanda Penduduk pihak penyewa'),
  ('SEWA', 7, 'Fotokopi Kartu Keluarga Penyewa',  'Fotokopi Kartu Keluarga pihak penyewa'),
  ('SEWA', 8, 'Fotokopi PBB Tahun Berjalan',      'Fotokopi Pajak Bumi dan Bangunan tahun berjalan'),

-- CONSEN
  ('CONSEN',  1, 'Sertifikat Asli',                                         'Sertifikat tanah asli (HM/HGB) dari BPN'),
  ('CONSEN',  2, 'KTP AN. Pemegang Hak',                                    'Kartu Tanda Penduduk atas nama pemegang hak'),
  ('CONSEN',  3, 'KTP Persetujuan Pemegang Hak',                            'Fotokopi KTP persetujuan suami/istri pemegang hak'),
  ('CONSEN',  4, 'Fotokopi Kartu Keluarga',                                 'Fotokopi Kartu Keluarga pemegang hak'),
  ('CONSEN',  5, 'Fotokopi Surat Nikah',                                    'Fotokopi Surat Nikah pemegang hak'),
  ('CONSEN',  6, 'Surat Keterangan Lunas dari Bank',                        'Surat keterangan lunas pelunasan pinjaman asli'),
  ('CONSEN',  7, 'Surat Kehilangan dari Desa',                              'Surat keterangan kehilangan resmi dari desa'),
  ('CONSEN',  8, 'Surat Kehilangan dari Polres Sesuai Domisili Obyek',     'Surat keterangan kehilangan dari Polres'),
  ('CONSEN',  9, 'Pengantar Roya dari Bank',                                'Surat pengantar roya resmi asli dari bank'),
  ('CONSEN', 10, 'Fotokopi PBB Tahun Berjalan',                            'Fotokopi Pajak Bumi dan Bangunan tahun berjalan'),

-- YAYASAN
  ('YAYASAN', 1, 'Fotokopi KTP Seluruh Anggota',                               'Fotokopi KTP pendiri, pembina, pengurus, dan pengawas'),
  ('YAYASAN', 2, 'Fotokopi Kartu Keluarga Seluruh Anggota',                    'Fotokopi KK seluruh pendiri/pengurus'),
  ('YAYASAN', 3, 'Susunan/Daftar Pengurus',                                    'Susunan Pengurus lengkap'),
  ('YAYASAN', 4, 'Surat Keterangan Domisili (dibuat setelah akta jadi)',       'Surat keterangan domisili dari kelurahan'),
  ('YAYASAN', 5, 'Fotokopi NPWP Pribadi Masing-Masing Pengurus',              'Fotokopi NPWP pengurus aktif'),
  ('YAYASAN', 6, 'Bidang Kegiatan Yayasan',                                    'Penjelasan bidang kegiatan yayasan'),
  ('YAYASAN', 7, 'Nama Yayasan (minimal 3 kata, tidak boleh singkatan)',       'Pengecekan nama yayasan'),
  ('YAYASAN', 8, 'Fotokopi NPWP Yayasan',                                      'Fotokopi NPWP atas nama yayasan'),
  ('YAYASAN', 9, 'Fotokopi Buku Tabungan AN. Yayasan',                        'Fotokopi buku rekening bank atas nama yayasan'),

-- PT
  ('PT',  1, 'Fotokopi KTP Direktur, Komisaris, Pemegang Saham',                  'Fotokopi KTP pendiri/pengurus PT'),
  ('PT',  2, 'Fotokopi KK Direktur, Komisaris, Pemegang Saham',                   'Fotokopi KK pendiri/pengurus PT'),
  ('PT',  3, 'Fotokopi NPWP Direktur, Komisaris, Pemegang Saham',                 'Fotokopi NPWP pribadi pendiri/pengurus'),
  ('PT',  4, 'Nomor Telepon + Email Direktur, Komisaris, Pemegang Saham',         'Kontak aktif telepon dan email para pengurus'),
  ('PT',  5, 'Modal Awal',                                                         'Detail nominal modal dasar perseroan'),
  ('PT',  6, 'Modal yang Ditempatkan',                                             'Detail nominal modal ditempatkan dan disetor'),
  ('PT',  7, 'Jumlah Saham',                                                       'Jumlah total lembar saham perseroan'),
  ('PT',  8, 'Jumlah Saham yang Ditempatkan',                                      'Jumlah lembar saham disetor/ditempatkan'),
  ('PT',  9, 'Nama PT (minimal 3 kata)',                                            'Pengecekan nama PT'),
  ('PT', 10, 'Alamat Lengkap PT',                                                  'Alamat lengkap kedudukan dan kantor PT'),
  ('PT', 11, 'Kegiatan Usaha (sesuai KBLI 2021)',                                 'Kode bidang usaha sesuai KBLI 2021'),
  ('PT', 12, 'Fotokopi NPWP PT',                                                   'Fotokopi NPWP atas nama perseroan'),
  ('PT', 13, 'Fotokopi Bukti Setor Modal',                                         'Bukti penyetoran modal ke rekening PT'),
  ('PT', 14, 'Surat Keterangan Domisili dari Desa (setelah akta jadi)',           'Surat keterangan domisili PT'),

-- CV
  ('CV',  1, 'Fotokopi KTP Direktur, Komanditer',           'Fotokopi KTP pendiri/pengurus CV'),
  ('CV',  2, 'Fotokopi KK Direktur, Komanditer',            'Fotokopi KK pendiri/pengurus CV'),
  ('CV',  3, 'Fotokopi NPWP Direktur, Komanditer',          'Fotokopi NPWP pribadi pendiri/pengurus CV'),
  ('CV',  4, 'Nomor Telepon + Email CV',                    'Kontak aktif telepon dan email CV'),
  ('CV',  5, 'Alamat Lengkap',                              'Alamat lengkap kedudukan dan kantor CV'),
  ('CV',  6, 'Nama CV (minimal 3 kata)',                    'Pengecekan nama CV'),
  ('CV',  7, 'Modal Awal Usaha',                            'Detail nominal modal awal usaha CV'),
  ('CV',  8, 'Kontribusi Modal Masing-Masing Persero',      'Detail kontribusi modal masing-masing sekutu'),
  ('CV',  9, 'Kegiatan Usaha (sesuai KBLI 2021)',           'Klasifikasi Baku Lapangan Usaha Indonesia CV'),
  ('CV', 10, 'Surat Keterangan Domisili (setelah akta jadi)', 'Surat keterangan domisili CV'),
  ('CV', 11, 'Fotokopi NPWP CV',                           'Fotokopi NPWP atas nama CV'),

-- HT
  ('HT', 1, 'Sertifikat Tanah Asli',                    'Sertifikat asli (HM/HGB) dari BPN'),
  ('HT', 2, 'Surat Kuasa Membebankan Hak Tanggungan',   'SKMHT pendukung asli'),
  ('HT', 3, 'KTP Pemberi & Penerima Hak',               'Valid photocopy or scan of IDs'),
  ('HT', 4, 'Fotokopi Kartu Keluarga',                  'Family Registry card'),
  ('HT', 5, 'Perjanjian Kredit Asli & Salinan',         'Credit agreement from bank'),
  ('HT', 6, 'Bukti Validasi PBB',                       'Latest property tax receipt'),
  ('HT', 7, 'Surat Pernyataan Pemasangan APHT',         'Required statement form'),
  ('HT', 8, 'Dokumen Pendukung Lainnya',                'Other required attachments')

ON CONFLICT (service_type, order_num) DO NOTHING;

-- ============================================================
-- SELESAI! Semua tabel dan data berhasil dibuat.
-- ============================================================
SELECT 'Migration completed successfully!' AS status;
