import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export const OwnerStaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [role, setRole] = useState('Staf Akta Utama');
  const [email, setEmail] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      // Fetch all staff profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'staff');

      if (profilesError) throw profilesError;

      // Fetch all cases to calculate active cases
      const { data: casesData, error: casesError } = await supabase
        .from('cases')
        .select('assigned_staff_id, is_complete');

      const activeCasesMap = {};
      if (!casesError && casesData) {
        casesData.forEach(c => {
          if (!c.is_complete && c.assigned_staff_id) {
            activeCasesMap[c.assigned_staff_id] = (activeCasesMap[c.assigned_staff_id] || 0) + 1;
          }
        });
      }

      if (profilesData) {
        const formatted = profilesData.map(p => ({
          id: p.id,
          name: p.full_name,
          role: p.title || 'Staf Administrasi',
          email: p.email || 'staf@notaris.id', // fallback if email column is empty
          avatar: p.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPGyqHBRQ4Nje0e7-gzJko10e19dOIFMF9nuNg_WURANlkj9Wc_9sHHLP5X8N78VTNI8s1n2r_tB2PlahsY_cBGWS7jyagWZAbCqLOpS_KGKxBMOHaiiDM6kijAAQUtwR_MA82z7htVqDosq_u_-o6lP7iajqqSDJlZT0WUQcii2_mzi745G_Dv7pSJakRcMolNQg0AQrt5EY1vB2zac-aSl1spStnsm9l_6rPXVg-rWKDQaaobvTYJY1D7Oo_4iYgxn5AN8dGLe8',
          activeCases: activeCasesMap[p.id] || 0
        }));
        setStaffList(formatted);
      }
    } catch (err) {
      console.error('Error loading staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleInvite = (e) => {
    e.preventDefault();
    if (!name || !email) return;

    alert('Untuk menambah staf baru secara permanen di Supabase, silakan gunakan menu Dashboard Supabase atau jalankan script create_user.js di terminal.');
    setName('');
    setEmail('');
    setShowInviteModal(false);
  };

  return (
    <div className="space-y-stack-lg text-left">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold">Staff Management</h2>
          <p className="text-body-lg text-on-surface-variant mt-1">Manage office staff credentials, permissions, and workloads.</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-primary text-on-primary font-label-bold py-2.5 px-6 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 font-bold text-[13px] shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Invite Staff
        </button>
      </div>

      {/* Grid of staff list cards */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <span className="material-symbols-outlined animate-spin text-primary text-[32px]">sync</span>
          <span className="ml-2 text-on-surface-variant font-medium">Memuat data staf...</span>
        </div>
      ) : staffList.length === 0 ? (
        <div className="text-center py-12 bg-surface-container-lowest border border-outline-variant rounded-xl p-8 card-shadow">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-2">group_off</span>
          <p className="text-on-surface-variant font-bold">Belum ada staf terdaftar di database.</p>
          <p className="text-on-surface-variant text-[12px] mt-1">Gunakan script `create_user.js` untuk menambahkan staf baru ke database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-grid">
          {staffList.map((st) => (
            <div key={st.id} className="bg-surface-container-lowest border border-outline-variant p-card-padding rounded-xl card-shadow flex flex-col justify-between group relative">
              <div className="flex items-start gap-4">
                <img
                  alt={st.name}
                  className="w-14 h-14 rounded-full object-cover grayscale border-2 border-primary-container"
                  src={st.avatar}
                />
                <div>
                  <h4 className="font-bold text-on-surface text-[15px]">{st.name}</h4>
                  <p className="text-[12px] text-primary font-semibold mt-0.5">{st.role}</p>
                  <p className="text-[11px] text-on-surface-variant mt-1">{st.email}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-outline-variant flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Active Cases</span>
                  <p className="font-headline-sm text-[16px] text-on-surface font-extrabold mt-0.5">{st.activeCases} Berkas</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  st.activeCases > 2 
                    ? 'bg-error-container text-on-error-container' 
                    : st.activeCases > 0 
                    ? 'bg-secondary-container text-on-secondary-container' 
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {st.activeCases > 2 ? 'Kapasitas Penuh' : st.activeCases > 0 ? 'Aktif' : 'Standby'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal overlay dialog */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleInvite} className="bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-md p-6 relative shadow-xl text-left animate-in fade-in zoom-in-95 duration-200">
            <button 
              type="button"
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>

            <h3 className="font-headline-sm text-headline-sm font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">person_add</span>
              Undang Staf Baru
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block font-label-bold text-on-surface mb-1.5 text-[11px] font-bold">NAMA LENGKAP STAF</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-primary focus:border-primary"
                  placeholder="Contoh: Ani Lestari, S.H."
                />
              </div>

              <div>
                <label className="block font-label-bold text-on-surface mb-1.5 text-[11px] font-bold">ALAMAT EMAIL</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-primary focus:border-primary"
                  placeholder="Contoh: staff@notaris.id"
                />
              </div>

              <div>
                <label className="block font-label-bold text-on-surface mb-1.5 text-[11px] font-bold">JABATAN / PERAN</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-primary focus:border-primary"
                >
                  <option value="Staf Akta Utama">Staf Akta Utama</option>
                  <option value="Staf Administrasi">Staf Administrasi</option>
                  <option value="Notaris Rekanan">Notaris Rekanan</option>
                  <option value="Magang">Magang</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-primary text-on-primary rounded-lg font-label-bold hover:opacity-90 active:scale-[0.98] transition-all font-bold"
            >
              Kirim Undangan Akses
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default OwnerStaffManagement;
