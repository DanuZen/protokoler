import { useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';

// ─────────────────────────────────────────────────────────────────────────────
// FRONTEND DEMO MODE — Semua koneksi Supabase dinonaktifkan sementara.
// Ganti nilai DEMO_ROLE di bawah untuk mengubah tampilan berdasarkan peran:
//   "admin"      → akses penuh (kelola anggota, kegiatan, laporan)
//   "admin"      → full access
//   "mahasiswa"  → akses protokoler/user biasa
//   "dokumentasi"→ akses khusus dokumentasi
// ─────────────────────────────────────────────────────────────────────────────
type DemoRole = 'admin' | 'mahasiswa' | 'dokumentasi';

const isDemoRole = (value: string | null): value is DemoRole => value === 'admin' || value === 'mahasiswa' || value === 'dokumentasi';

const getDemoRole = (): DemoRole => {
  if (typeof window === 'undefined') return 'admin';
  const stored = window.localStorage.getItem('demo_role');
  return isDemoRole(stored) ? stored : 'admin';
};

const createDemoUser = (role: DemoRole) =>
  ({
    id: 'demo-user-id',
    email: `demo@${role}.siproto.id`,
    user_metadata: {
      nama_lengkap: role === 'admin' ? 'Pimpinan Demo' : role === 'dokumentasi' ? 'Dokumentasi Demo' : 'Mahasiswa Demo',
    },
  }) as unknown as User;

export function useAuth() {
  const [role, setRole] = useState<DemoRole>('admin');
  const [loading] = useState(false);

  useEffect(() => {
    const syncRole = () => setRole(getDemoRole());
    syncRole();
    window.addEventListener('storage', syncRole);
    return () => window.removeEventListener('storage', syncRole);
  }, []);

  const user = useMemo(() => createDemoUser(role), [role]);
  const session = useMemo(() => ({ user }) as Session, [user]);

  return { session, user, loading };
}

export function useRole(_user?: User | null) {
  const [role, setRole] = useState<DemoRole>('admin');

  useEffect(() => {
    const syncRole = () => setRole(getDemoRole());
    syncRole();
    window.addEventListener('storage', syncRole);
    return () => window.removeEventListener('storage', syncRole);
  }, []);

  return { data: role };
}
