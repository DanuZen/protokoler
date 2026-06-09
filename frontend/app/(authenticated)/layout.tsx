"use client";

import { AppShell } from "@/components/app-shell";

// ─────────────────────────────────────────────────────────────────────────────
// FRONTEND DEMO MODE — Auth guard dinonaktifkan sementara.
// Layout langsung merender AppShell tanpa mengecek sesi Supabase.
// ─────────────────────────────────────────────────────────────────────────────
export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
