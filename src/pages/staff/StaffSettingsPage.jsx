import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const SaveButton = ({ section, savedSection, onSave }) => (
  <button
    onClick={() => onSave(section)}
    className="px-5 py-2.5 bg-primary text-on-primary rounded-lg text-[13px] font-bold hover:opacity-90 active:scale-[0.97] transition-all flex items-center gap-2"
  >
    {savedSection === section ? (
      <>
        <span className="material-symbols-outlined text-[16px]">check</span>
        Tersimpan!
      </>
    ) : (
      <>
        <span className="material-symbols-outlined text-[16px]">save</span>
        Simpan
      </>
    )}
  </button>
);

export const StaffSettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Form state — pre-filled from user data
  const [name, setName] = useState(user?.name || '');
  const [title, setTitle] = useState(user?.title || '');
  const [email, setEmail] = useState(`${user?.username || 'staff'}@notaris.id`);
  const [phone, setPhone] = useState('+62 812 3456 7890');



  // Security
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Feedback
  const [savedSection, setSavedSection] = useState('');

  const handleSave = (section) => {
    setSavedSection(section);
    setTimeout(() => setSavedSection(''), 2500);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };



  return (
    <div className="max-w-3xl space-y-stack-lg text-left">
      {/* Header */}
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold">Pengaturan Akun</h2>
        <p className="text-body-lg text-on-surface-variant mt-1">
          Kelola profil dan keamanan akun Anda.
        </p>
      </div>

      {/* ─── Profile Card ─── */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        {/* Section Header */}
        <div className="px-6 py-4 border-b border-outline-variant flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[20px]">manage_accounts</span>
          <h3 className="font-bold text-on-surface text-[15px]">Profil Pengguna</h3>
        </div>

        <div className="p-6 space-y-5">
          {/* Avatar row */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={user?.avatar}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-4 border-primary-container"
              />
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md hover:opacity-90 transition-all">
                <span className="material-symbols-outlined text-[14px]">edit</span>
              </button>
            </div>
            <div>
              <p className="font-bold text-on-surface text-[16px]">{user?.name}</p>
              <p className="text-[12px] text-primary font-semibold">{user?.title}</p>
              <p className="text-[11px] text-on-surface-variant mt-0.5">{email}</p>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'NAMA LENGKAP', value: name, setter: setName, icon: 'person' },
              { label: 'JABATAN', value: title, setter: setTitle, icon: 'work' },
              { label: 'EMAIL', value: email, setter: setEmail, icon: 'mail', type: 'email' },
              { label: 'NO. TELEPON', value: phone, setter: setPhone, icon: 'call', type: 'tel' },
            ].map(({ label, value, setter, icon, type = 'text' }) => (
              <div key={label}>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  {label}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">
                    {icon}
                  </span>
                  <input
                    type={type}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <SaveButton section="profile" savedSection={savedSection} onSave={handleSave} />
          </div>
        </div>
      </div>

      {/* ─── Security ─── */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[20px]">lock</span>
          <h3 className="font-bold text-on-surface text-[15px]">Keamanan Akun</h3>
        </div>

        <div className="p-6 space-y-4">
          {[
            { label: 'KATA SANDI SAAT INI', value: currentPass, setter: setCurrentPass },
            { label: 'KATA SANDI BARU', value: newPass, setter: setNewPass },
            { label: 'KONFIRMASI KATA SANDI BARU', value: confirmPass, setter: setConfirmPass },
          ].map(({ label, value, setter }) => (
            <div key={label}>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                {label}
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
          ))}

          {/* Strength indicator */}
          {newPass && (
            <div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Kekuatan Password</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((lvl) => {
                  const strength = Math.min(newPass.length / 4, 1) * 4;
                  return (
                    <div
                      key={lvl}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        lvl <= strength
                          ? strength <= 1 ? 'bg-error' : strength <= 2 ? 'bg-amber-500' : strength <= 3 ? 'bg-secondary' : 'bg-primary'
                          : 'bg-surface-container-high'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <SaveButton section="security" savedSection={savedSection} onSave={handleSave} />
          </div>
        </div>
      </div>

      {/* ─── Danger Zone ─── */}
      <div className="bg-error-container/10 border border-error-container/40 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-error-container/30 flex items-center gap-3">
          <span className="material-symbols-outlined text-error text-[20px]">dangerous</span>
          <h3 className="font-bold text-error text-[15px]">Zona Berbahaya</h3>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="font-semibold text-on-surface text-[14px]">Keluar dari Sistem</p>
            <p className="text-[12px] text-on-surface-variant mt-0.5">Anda akan diarahkan kembali ke halaman login.</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-error text-on-error rounded-lg text-[13px] font-bold hover:opacity-90 active:scale-[0.97] transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffSettingsPage;
