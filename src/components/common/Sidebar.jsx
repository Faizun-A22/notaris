import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../constants/roles';

export const Sidebar = ({ isOpen, onClose }) => {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Dark Mode State and Logic
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Close drawer on path change (mobile)
  useEffect(() => {
    if (onClose) onClose();
  }, [location.pathname]);

  const role = profile?.role === 'owner' ? ROLES.OWNER : ROLES.STAFF;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Avatar initials
  const getInitials = (name) => {
    if (!name) return 'SW';
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Sidebar Menu Items based on Screenshot
  const menuItems = [
    {
      label: 'Dashboard',
      path: role === ROLES.OWNER ? '/owner/dashboard' : '/staff/dashboard',
      icon: 'dashboard',
    },
    ...(role === ROLES.STAFF ? [
      {
        label: 'File Baru',
        path: '/staff/buat-berkas',
        icon: 'add_box',
      }
    ] : []),
    {
      label: 'Semua File',
      path: role === ROLES.OWNER ? '/owner/documents' : '/staff/documents',
      icon: 'folder_open',
    },
    {
      label: 'Klien',
      path: role === ROLES.OWNER ? '/owner/clients' : '/staff/clients',
      icon: 'group',
    },
    {
      label: 'Aktivitas Staf',
      path: role === ROLES.OWNER ? '/owner/activity' : '/staff/activity',
      icon: 'bar_chart',
    },
    {
      label: 'Pelacakan Publik',
      path: '/track',
      icon: 'public',
    }
  ];

  return (
    <>
      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      <aside
        className={`h-full w-[260px] bg-white border-r border-[#E2E8F0] flex flex-col p-5 shrink-0 z-50
          fixed inset-y-0 left-0 lg:static transition-transform duration-300 lg:translate-x-0 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Brand Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                gavel
              </span>
            </div>
            <div className="text-left">
              <h1 className="text-[17px] font-extrabold text-on-surface leading-none tracking-tight flex items-center gap-1">
                NotaryDoc
              </h1>
            </div>
          </div>

          {/* Close Sidebar Drawer Button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden text-on-surface-variant hover:text-primary transition-colors p-1"
            aria-label="Close Sidebar"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* MENU Group */}
        <div className="flex flex-col flex-1">
          <div className="text-left mb-2">
            <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">
              MENU
            </span>
          </div>

          {/* Menu Items List */}
          <nav className="space-y-1.5 mb-6 text-left">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-body-md ${
                    isActive
                      ? 'bg-primary-soft text-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container-low transition-colors'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{
                      fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[13px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* SISTEM Group */}
          <div className="mt-auto border-t border-[#F1F5F9] pt-4 text-left">
            <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest block mb-2">
              SISTEM
            </span>
            <div className="space-y-1.5">
              {/* Mode Gelap Toggle Link */}
              <div 
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">
                    {darkMode ? 'light_mode' : 'dark_mode'}
                  </span>
                  <span className="text-[13px] font-medium">Mode Gelap</span>
                </div>
                {/* Switch UI */}
                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${darkMode ? 'bg-primary' : 'bg-outline-variant'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 ease-in-out ${darkMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
              </div>

              {/* Pengaturan */}
              <Link
                to={role === ROLES.OWNER ? '/owner/settings' : '/staff/settings'}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-body-md ${
                  location.pathname.includes('settings')
                    ? 'bg-primary-soft text-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-low transition-colors'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  settings
                </span>
                <span className="text-[13px] font-medium">Pengaturan</span>
              </Link>
            </div>
          </div>
        </div>

        {/* User profile card at the absolute bottom */}
        <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar Circle */}
            <div className="w-9 h-9 rounded-full bg-[#E2E8F0] flex items-center justify-center flex-shrink-0 overflow-hidden">
              <span className="text-on-surface font-extrabold text-[12px]">
                {getInitials(profile?.full_name || 'Sarah Wijaya')}
              </span>
            </div>
            <div className="text-left min-w-0">
              <p className="font-label-bold text-on-surface text-[12.5px] leading-tight font-bold truncate max-w-[120px]">
                {profile?.full_name || 'Sarah W.'}
              </p>
              <p className="text-[10px] text-on-surface-variant leading-none mt-1 font-medium truncate max-w-[120px]">
                {profile?.role === 'owner' ? 'Notaris Utama' : 'Staf Administrasi'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-on-surface-variant hover:text-error transition-colors flex-shrink-0 p-1"
            title="Keluar"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
