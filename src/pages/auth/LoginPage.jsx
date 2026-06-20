import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../constants/roles';

export const LoginPage = () => {
  const { loginAsOwner, loginAsStaff } = useAuth();
  const navigate = useNavigate();

  // Role selections
  const [selectedRole, setSelectedRole] = useState(ROLES.STAFF); // default to staff
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setErrorMsg('');
    // Auto-fill demo credentials for convenience
    if (role === ROLES.OWNER) {
      setEmail('habini@notaris.com');
      setPassword('PasswordOwner123!');
    } else if (role === ROLES.STAFF) {
      setEmail('jamal@staff.com');
      setPassword('PasswordStaff123!');
    } else {
      // Client
      setEmail('klien@demo.com');
      setPassword('PasswordKlien123!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg('');

    try {
      if (selectedRole === ROLES.OWNER) {
        const res = await loginAsOwner(email, password);
        if (res.success) {
          navigate('/owner/dashboard');
        } else {
          setErrorMsg(res.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.');
        }
      } else if (selectedRole === ROLES.STAFF) {
        const res = await loginAsStaff(email, password);
        if (res.success) {
          navigate('/staff/dashboard');
        } else {
          setErrorMsg(res.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.');
        }
      } else {
        // Client login
        // Simulate client check and redirect to tracking with standard demo case number
        setTimeout(() => {
          setLoading(false);
          navigate('/track?case=2026/05/001');
        }, 800);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan jaringan atau server. Silakan coba lagi.');
    } finally {
      if (selectedRole !== 'client') {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Subtle atmospheric design accents */}
      <div className="absolute w-[450px] h-[450px] bg-primary/5 rounded-full filter blur-[80px] -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-[450px] h-[450px] bg-purple/5 rounded-full filter blur-[100px] -bottom-20 -right-20 pointer-events-none" />

      <div className="w-full max-w-lg z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-primary text-on-primary rounded-xl flex items-center justify-center mb-3 shadow-sm">
            <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              gavel
            </span>
          </div>
          <h1 className="font-headline-md text-headline-md text-text font-bold">NotaryDoc Pro</h1>
          <p className="text-[11px] text-muted uppercase tracking-widest font-bold mt-1">
            Sistem Manajemen Berkas Hukum & Akta Terintegrasi
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-surface border border-outline-variant rounded-2xl shadow-xl p-8 backdrop-blur-md">
          
          {/* Role Selection Label */}
          <p className="text-[11px] font-bold text-text uppercase tracking-wider text-left mb-3">
            Pilih Peran Anda / Select Role
          </p>

          {/* Role Selector Grid (Three Roles) */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            
            {/* Ketua Notaris */}
            <div
              onClick={() => handleRoleSelect(ROLES.OWNER)}
              className={`p-3 rounded-xl border-2 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[92px] ${
                selectedRole === ROLES.OWNER
                  ? 'border-primary bg-primary-soft text-primary font-bold'
                  : 'border-outline-variant hover:bg-background text-muted'
              }`}
            >
              <span className="material-symbols-outlined text-[24px] mb-1.5">admin_panel_settings</span>
              <span className="text-[11px] font-bold leading-tight">Ketua Notaris</span>
            </div>

            {/* Staff Administrasi */}
            <div
              onClick={() => handleRoleSelect(ROLES.STAFF)}
              className={`p-3 rounded-xl border-2 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[92px] ${
                selectedRole === ROLES.STAFF
                  ? 'border-primary bg-primary-soft text-primary font-bold'
                  : 'border-outline-variant hover:bg-background text-muted'
              }`}
            >
              <span className="material-symbols-outlined text-[24px] mb-1.5">engineering</span>
              <span className="text-[11px] font-bold leading-tight">Staff Admin</span>
            </div>

            {/* Klien */}
            <div
              onClick={() => handleRoleSelect('client')}
              className={`p-3 rounded-xl border-2 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[92px] ${
                selectedRole === 'client'
                  ? 'border-primary bg-primary-soft text-primary font-bold'
                  : 'border-outline-variant hover:bg-background text-muted'
              }`}
            >
              <span className="material-symbols-outlined text-[24px] mb-1.5">person</span>
              <span className="text-[11px] font-bold leading-tight">Klien</span>
            </div>

          </div>

          {/* Error Message Section */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-error-container/20 border border-error text-alert rounded-xl text-left text-[12px] font-semibold flex items-start gap-2 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            
            {/* Email Field */}
            <div>
              <label htmlFor="login_email" className="block text-[11px] font-bold text-text uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted text-[18px]">
                  mail
                </span>
                <input
                  id="login_email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@notaris.com"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-outline-variant rounded-xl text-[13.5px] text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="login_password" className="block text-[11px] font-bold text-text uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted text-[18px]">
                  lock
                </span>
                <input
                  id="login_password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-background border border-outline-variant rounded-xl text-[13.5px] text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                  aria-label={showPassword ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi"}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-[12px] text-muted font-medium">Ingat saya / Perangkat tepercaya</span>
              </label>
              <a href="#help" className="text-[12px] text-primary hover:underline font-bold">Lupa Sandi?</a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3.5 bg-primary text-on-primary rounded-xl font-bold text-[14px] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  <span>Masuk Ke Dashboard</span>
                </>
              )}
            </button>

          </form>

          {/* Explicit Demo Credentials Box */}
          <div className="mt-6 pt-5 border-t border-outline-variant bg-background/40 -mx-8 -mb-8 p-6 rounded-b-2xl">
            <div className="text-left space-y-2">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                Kredensial Akun Demo (Aktif)
              </span>
              
              {selectedRole === ROLES.OWNER && (
                <div className="bg-primary-soft border border-primary/20 p-2.5 rounded-lg text-[11px] text-primary-dark">
                  <p><strong>Email:</strong> habini@notaris.com</p>
                  <p><strong>Sandi:</strong> PasswordOwner123!</p>
                </div>
              )}

              {selectedRole === ROLES.STAFF && (
                <div className="bg-primary-soft border border-primary/20 p-2.5 rounded-lg text-[11px] text-primary-dark">
                  <p><strong>Email:</strong> jamal@staff.com</p>
                  <p><strong>Sandi:</strong> PasswordStaff123!</p>
                </div>
              )}

              {selectedRole === 'client' && (
                <div className="bg-primary-soft border border-primary/20 p-2.5 rounded-lg text-[11px] text-primary-dark">
                  <p><strong>Akses Demo Klien:</strong> Otomatis dialihkan ke halaman pelacakan berkas klien (No. Berkas: 2026/05/001).</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Secondary Navigation Links */}
        <div className="flex justify-between text-[11.5px] text-muted px-2">
          <Link to="/register" className="hover:text-primary hover:underline font-semibold">
            Belum punya akun? Aktivasi / Daftar
          </Link>
          <a href="#support" className="hover:text-primary hover:underline font-semibold">
            Bantuan Support & FAQ
          </a>
        </div>

        <p className="text-center text-[10px] text-muted font-medium">
          NotaryDoc Pro v3.1.2 stable · Dilindungi Enkripsi SSL & AES-256
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
