import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

// ─────────────────────────────────────────────────────────────────────────────
// FRONTEND DEMO MODE — Semua koneksi Supabase dinonaktifkan sementara.
// Ganti nilai DEMO_ROLE di bawah untuk mengubah tampilan berdasarkan peran:
//   "admin"      → akses penuh (kelola anggota, kegiatan, laporan)
//   "mahasiswa"  → akses terbatas (kegiatan saya, sertifikat, profil)
//   "pimpinan"   → akses read-only laporan & dashboard
// ─────────────────────────────────────────────────────────────────────────────
const DEMO_ROLE: "admin" | "mahasiswa" | "pimpinan" = "admin";

const MOCK_USER = {
  id: "demo-user-id",
  email: `demo@${DEMO_ROLE}.siproto.id`,
  user_metadata: {
    nama_lengkap: DEMO_ROLE === "admin" ? "Admin Demo" : DEMO_ROLE === "pimpinan" ? "Pimpinan Demo" : "Mahasiswa Demo",
  },
} as unknown as User;

const MOCK_SESSION = { user: MOCK_USER } as Session;

export function useAuth() {
  const [session] = useState<Session | null>(MOCK_SESSION);
  const [loading]  = useState(false);
  return { session, user: MOCK_USER, loading };
}

export function useRole(_user?: User | null) {
  return useQuery({
    queryKey: ["user_role", "demo"],
    queryFn: async () => DEMO_ROLE,
    initialData: DEMO_ROLE,
  });
}
