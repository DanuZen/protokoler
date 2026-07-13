import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error && (error.message.includes('Refresh Token Not Found') || error.message.includes('Invalid Refresh Token'))) {
        await supabase.auth.signOut();
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, user, loading };
}

export function useRole(user?: User | null) {
  const [role, setRole] = useState<'superadmin' | 'pimpinan' | 'admin' | 'mahasiswa' | 'dokumentasi' | null>(() => {
    if (typeof window !== 'undefined') {
      const cached = window.localStorage.getItem('cached_role');
      if (cached) return cached as 'superadmin' | 'pimpinan' | 'admin' | 'mahasiswa' | 'dokumentasi';
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchRole = async (currentSession?: Session | null) => {
      try {
        let activeSession = currentSession;
        if (activeSession === undefined) {
          const { data, error } = await supabase.auth.getSession();
          if (error && (error.message.includes('Refresh Token Not Found') || error.message.includes('Invalid Refresh Token'))) {
            await supabase.auth.signOut();
          }
          activeSession = data?.session;
        }

        if (!activeSession) {
          if (mounted) {
            setRole(null);
            setLoading(false);
          }
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('cached_role');
            window.localStorage.removeItem('demo_role');
            window.localStorage.removeItem('demo_name');
            window.localStorage.removeItem('demo_avatar');
            window.dispatchEvent(new Event('demo_name_updated'));
            window.dispatchEvent(new Event('demo_avatar_updated'));
          }
          return;
        }

        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${activeSession.access_token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          let mappedRole: 'admin' | 'mahasiswa' | 'dokumentasi' = 'mahasiswa';
          
          if (data.role === 'admin') {
            mappedRole = 'admin';
          } else if (data.role === 'dokumentasi') {
            mappedRole = 'dokumentasi';
          }
          
          if (mounted) {
            setRole(mappedRole);
            setLoading(false);
          }
          
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('cached_role', mappedRole);
            if (data.nama_lengkap) {
              window.localStorage.setItem('demo_name', data.nama_lengkap);
              window.dispatchEvent(new Event('demo_name_updated'));
            }
            if (data.foto_setengah_badan_url) {
              window.localStorage.setItem('demo_avatar', data.foto_setengah_badan_url);
              window.dispatchEvent(new Event('demo_avatar_updated'));
            }
          }
        } else {
          if (mounted) {
            setRole(null);
            setLoading(false);
          }
          if (typeof window !== 'undefined') window.localStorage.removeItem('cached_role');
        }
      } catch (err) {
        console.error('Failed to fetch role from backend:', err);
        if (mounted) setLoading(false);
      }
    };

    fetchRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchRole(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { data: role, loading };
}
