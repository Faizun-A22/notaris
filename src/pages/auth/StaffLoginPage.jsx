import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const StaffLoginPage = () => {
  const { loginAsStaff } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg('');

    const res = await loginAsStaff(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/staff/dashboard');
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">

      {/* Background blobs */}
      <div className="absolute w-[500px] h-[500px] bg-secondary/8 rounded-full filter blur-[100px] -top-32 -right-32 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-primary/8 rounded-full filter blur-[120px] -bottom-20 -left-20 pointer-events-none" />

      <div className="w-full max-w-md z-10">

        {/* Role badge */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
            <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              engineering
            </span>
            <span className="text-secondary text-[12px] font-bold tracking-wider uppercase">
              Portal Staff Administrasi
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl p-8 text-center backdrop-blur-md">

          {/* Logo */}
          <div className="mx-auto w-16 h-16 bg-secondary text-on-secondary rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-secondary/20">
            <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              folder_open
            </span>
          </div>

          <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
            Notaris Digital
          </h1>
          <p className="text-[11px] text-on-surface-variant uppercase tracking-widest font-bold mt-1 mb-8">
            Masuk sebagai Staff
          </p>

          {/* Error message */}
          {errorMsg && (
            <div className="mb-6 p-3.5 bg-error/10 border border-error/30 text-error rounded-xl text-left text-[12px] font-semibold flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  mail
                </span>
                <input
                  id="staff_email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@notaris.com"
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  lock
                </span>
                <input
                  id="staff_password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="staff_login_btn"
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-secondary text-on-secondary rounded-xl font-bold text-[14px] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-secondary/20 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  <span>Masuk sebagai Staff</span>
                </>
              )}
            </button>
          </form>

          {/* Switch to owner */}
          <div className="mt-6 pt-6 border-t border-outline-variant">
            <p className="text-[12px] text-on-surface-variant">
              Anda Owner/Notaris?{' '}
              <Link
                to="/login/owner"
                className="text-primary font-bold hover:underline"
              >
                Login sebagai Owner →
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-6 text-[11px] text-on-surface-variant">
          Dikelola secara aman · Notaris Digital v3.0
        </p>
      </div>
    </div>
  );
};

export default StaffLoginPage;
