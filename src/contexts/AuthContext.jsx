import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ambil profile dari tabel profiles berdasarkan user id
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[AuthContext] Error fetching profile:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId,
      });
      return null;
    }
    return data;
  };

  useEffect(() => {
    // Cek session yang sudah ada saat app pertama kali load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        const prof = await fetchProfile(session.user.id);
        setProfile(prof);
      }
      setLoading(false);
    });

    // Dengarkan perubahan auth state (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const prof = await fetchProfile(session.user.id);
          setProfile(prof);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Login untuk Owner — hanya role 'owner' yang diperbolehkan masuk
   */
  const loginAsOwner = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('[AuthContext] Login error:', error);
      // Email belum dikonfirmasi
      if (error.message?.includes('Email not confirmed')) {
        return { success: false, message: 'Email belum dikonfirmasi. Cek kotak masuk email Anda atau hubungi admin.' };
      }
      return { success: false, message: 'Email atau password salah.' };
    }

    // Verifikasi role harus 'owner'
    const prof = await fetchProfile(data.user.id);
    console.log('[AuthContext] Profile fetched:', prof);
    
    if (!prof) {
      await supabase.auth.signOut();
      return {
        success: false,
        message: 'Profil akun tidak ditemukan. Pastikan data profile sudah diisi di database.',
      };
    }
    
    if (prof.role !== 'owner') {
      await supabase.auth.signOut();
      return {
        success: false,
        message: 'Akun ini bukan akun Owner. Silakan gunakan halaman login Staff.',
      };
    }

    setUser(data.user);
    setProfile(prof);
    return { success: true, profile: prof };
  };

  /**
   * Login untuk Staff — hanya role 'staff' yang diperbolehkan masuk
   */
  const loginAsStaff = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('[AuthContext] Login error:', error);
      if (error.message?.includes('Email not confirmed')) {
        return { success: false, message: 'Email belum dikonfirmasi. Cek kotak masuk email Anda atau hubungi admin.' };
      }
      return { success: false, message: 'Email atau password salah.' };
    }

    // Verifikasi role harus 'staff'
    const prof = await fetchProfile(data.user.id);
    console.log('[AuthContext] Profile fetched:', prof);
    
    if (!prof) {
      await supabase.auth.signOut();
      return {
        success: false,
        message: 'Profil akun tidak ditemukan. Pastikan data profile sudah diisi di database.',
      };
    }
    
    if (prof.role !== 'staff') {
      await supabase.auth.signOut();
      return {
        success: false,
        message: 'Akun ini bukan akun Staff. Silakan gunakan halaman login Owner.',
      };
    }

    setUser(data.user);
    setProfile(prof);
    return { success: true, profile: prof };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, setProfile, loading, loginAsOwner, loginAsStaff, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
