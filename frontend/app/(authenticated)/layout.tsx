"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const AppShell = dynamic(() => import("@/components/app-shell").then((mod) => mod.AppShell), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh w-full flex-col items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 animate-ping rounded-full bg-red-700/20" />
          <Loader2 className="h-8 w-8 animate-spin text-red-700 relative z-10" />
        </div>
        <p className="text-sm font-bold text-slate-500 animate-pulse">Memuat workspace...</p>
      </div>
    </div>
  ),
});

// ─────────────────────────────────────────────────────────────────────────────
// FRONTEND DEMO MODE — Auth guard dinonaktifkan sementara.
// Layout langsung merender AppShell secara Client-Side untuk mencegah FOUC.
// ─────────────────────────────────────────────────────────────────────────────
export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
