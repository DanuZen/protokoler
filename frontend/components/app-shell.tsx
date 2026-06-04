"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { ShieldCheck, LayoutDashboard, Users, CalendarDays, ClipboardList, FileBarChart, LogOut, UserCircle2, Menu, Bell, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth, useRole } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type Role = "admin" | "mahasiswa" | "pimpinan";

const items: { to: string; label: string; icon: typeof Users; roles: Role[] }[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "mahasiswa", "pimpinan"] },
  { to: "/kegiatan", label: "Kegiatan", icon: CalendarDays, roles: ["admin", "mahasiswa", "pimpinan"] },
  { to: "/mahasiswa", label: "Mahasiswa", icon: Users, roles: ["admin", "pimpinan"] },
  { to: "/jadwal-saya", label: "Jadwal Saya", icon: ClipboardList, roles: ["admin", "mahasiswa"] },
  { to: "/laporan", label: "Laporan", icon: FileBarChart, roles: ["admin", "pimpinan"] },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const router = useRouter();
  const path = usePathname();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const visible = items.filter((i) => !role || i.roles.includes(role));

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="hidden w-64 flex-col bg-sidebar text-sidebar-foreground md:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
        <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="relative h-10 w-10 overflow-hidden bg-white/10 rounded-lg p-1">
            <Image 
              src="/logo protokoler.png" 
              alt="Logo Protokoler" 
              fill
              sizes="40px"
              className="object-contain p-1"
            />
          </div>
          <div>
            <div className="font-display text-xl font-bold tracking-tight text-primary">SiProto</div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60 font-semibold">Protokoler Universitas</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1.5 p-4">
          {visible.map((i) => {
            const active = path === i.to || path.startsWith(i.to + "/");
            return (
              <Link
                key={i.to}
                href={i.to}
                className="block outline-none"
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors relative",
                    active
                      ? "text-primary font-semibold"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                >
                  {active && (
                    <motion.div 
                      layoutId="active-nav" 
                      className="absolute inset-0 bg-primary/10 rounded-lg"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <i.icon className={cn("h-5 w-5 relative z-10", active ? "text-primary" : "opacity-70")} />
                  <span className="relative z-10">{i.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4 bg-sidebar-accent/30">
          <div className="flex items-center gap-3 rounded-xl p-2 bg-white shadow-sm border border-slate-100">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <UserCircle2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-slate-800">{user?.email || "Memuat..."}</div>
              <Badge variant="secondary" className="mt-1 text-[9px] px-1.5 py-0 capitalize bg-slate-100 text-slate-600">{role ?? "..."}</Badge>
            </div>
            <button onClick={signOut} title="Keluar" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col relative">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 sticky top-0 z-10 shadow-sm">
          <div className="md:hidden flex items-center gap-3">
            <Button variant="ghost" size="icon" className="-ml-2 text-slate-500">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative h-8 w-8">
              <Image src="/logo protokoler.png" alt="Logo" fill sizes="32px" className="object-contain" />
            </div>
            <span className="font-display text-lg font-bold text-primary">SiProto</span>
          </div>
          {/* Search bar */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kegiatan, mahasiswa..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-bold text-green-600 capitalize">{role ?? "..."}</span>
            </div>
            <button className="relative h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl px-4 gap-2">
              <LogOut className="h-4 w-4" /> Keluar
            </Button>
          </div>
        </header>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 overflow-auto p-6 md:p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
