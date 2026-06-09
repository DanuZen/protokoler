"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { ShieldCheck, LayoutDashboard, Users, CalendarDays, ClipboardList, FileBarChart, LogOut, UserCircle2, Menu, Bell, Search } from "lucide-react";
// supabase import removed — frontend demo mode active
import { Button } from "@/components/ui/button";
import { useAuth, useRole } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type Role = "admin" | "mahasiswa" | "pimpinan";

const adminItems = [
  { to: "/dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { to: "/anggota",   label: "Anggota",    icon: Users },
  { to: "/kegiatan",  label: "Kegiatan",   icon: CalendarDays },
  { to: "/evaluasi",  label: "Evaluasi",   icon: ClipboardList },
  { to: "/laporan",   label: "Laporan",    icon: FileBarChart },
  { to: "/regulasi",  label: "Regulasi",   icon: ShieldCheck },
];

const pimpinanItems = [
  { to: "/dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { to: "/anggota",   label: "Anggota",    icon: Users },
  { to: "/kegiatan",  label: "Kegiatan",   icon: CalendarDays },
  { to: "/evaluasi",  label: "Evaluasi",   icon: ClipboardList },
  { to: "/laporan",   label: "Laporan",    icon: FileBarChart },
  { to: "/regulasi",  label: "Regulasi",   icon: ShieldCheck },
];

const mahasiswaItems = [
  { to: "/beranda",      label: "Beranda",      icon: LayoutDashboard },
  { to: "/kegiatan",    label: "Kegiatan",     icon: CalendarDays },
  { to: "/jadwal",      label: "Jadwal Tugas", icon: CalendarDays },
  { to: "/sertifikat",  label: "Sertifikat",   icon: ShieldCheck },
  { to: "/profil",      label: "Profil Saya",  icon: UserCircle2 },
  { to: "/regulasi",    label: "Regulasi",     icon: ShieldCheck },
];

function NavItem({ item, active }: { item: { to: string; label: string; icon: any }; active: boolean }) {
  return (
    <Link href={item.to} className="block outline-none group">
      <div
        className={cn(
          "relative flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150",
          active
            ? "text-white font-semibold"
            : "text-slate-500 hover:text-slate-300 font-medium"
        )}
      >
        {/* Gold left accent bar for active */}
        {active && (
          <motion.div
            layoutId="active-nav-bar"
            className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#C9A84C]"
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
        )}
        {/* Subtle active background */}
        {active && (
          <motion.div
            layoutId="active-nav-bg"
            className="absolute inset-0 bg-white/[0.06]"
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
        )}

        {/* Icon */}
        <div className={cn(
          "relative z-10 flex-shrink-0 h-8 w-8 flex items-center justify-center transition-all duration-150",
          active
            ? "bg-slate-800 text-[#C9A84C]"
            : "text-slate-500 group-hover:text-slate-300"
        )}>
          <item.icon className="h-[17px] w-[17px]" />
        </div>

        <span className="relative z-10 tracking-wide">{item.label}</span>
      </div>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const router = useRouter();
  const path = usePathname();

  const signOut = () => {
    // Demo Mode: langsung redirect ke halaman utama
    router.push("/");
  };

  const navItems =
    role === "admin"     ? adminItems :
    role === "pimpinan"  ? pimpinanItems :
    role === "mahasiswa" ? mahasiswaItems :
    adminItems; // fallback

  const displayName =
    user?.user_metadata?.nama_lengkap ||
    user?.email?.split("@")[0] ||
    "Demo Admin";

  const initials = displayName.charAt(0).toUpperCase();
  const isDashboard = path === "/dashboard";

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 font-sans relative">
      
      {/* ─── GLOBAL DASHBOARD BACKGROUND ─── */}
      <div className="fixed inset-0 z-0 opacity-80 pointer-events-none">
        <Image src="/rektorat.jpg" alt="UNP Rectorat" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-transparent to-slate-900"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-slate-900/60"></div>
      </div>

      {/* ─── SIDEBAR ─────────────────────────────────── */}
      <aside className="hidden w-[260px] flex-col bg-slate-900 md:flex z-20 fixed top-0 left-0 h-full border-r border-slate-800">

        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
          <div className="relative h-9 w-9 flex-shrink-0 bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center overflow-hidden">
            <Image
              src="/logo protokoler.png"
              alt="Logo Protokoler"
              fill
              sizes="36px"
              className="object-contain p-1"
            />
          </div>
          <div>
            <div className="font-display text-sm font-bold tracking-widest text-white uppercase">
              PROTOKOLER
            </div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-[#C9A84C]/70 font-semibold mt-0.5">
              Universitas Negeri Padang
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {/* Section label */}
          <div className="px-4 pt-2 pb-3">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
              {role === "mahasiswa" ? "Menu Protokoler" : "Menu Utama"}
            </span>
          </div>

          {navItems.map((item) => {
            const active = path === item.to || path.startsWith(item.to + "/");
            return <NavItem key={item.to} item={item} active={active} />;
          })}
        </nav>

        {/* User info + Logout */}
        <div className="border-t border-slate-800 p-4 space-y-3">
          {/* Mini profile */}
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 bg-[#C9A84C] flex-shrink-0 flex items-center justify-center text-slate-900 text-xs font-extrabold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{displayName}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                  {role || "..."}
                </span>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/8 transition-colors border border-transparent hover:border-red-500/20"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ────────────────────────────── */}
      <main className="flex min-w-0 flex-1 flex-col relative md:ml-[260px]">

        {/* Header */}
        <header className="flex h-16 items-center justify-between px-6 md:px-8 z-20 transition-all absolute top-0 left-0 right-0 bg-transparent border-none">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-3">
            <Button variant="ghost" size="icon" className="-ml-2 text-slate-400 hover:text-white">
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-display text-base font-bold text-white">PROTOKOLER</span>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center flex-1 max-w-xs">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Cari kegiatan, mahasiswa..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-none focus:outline-none transition-colors bg-slate-800/60 border border-slate-700 text-white placeholder:text-slate-500 focus:border-[#C9A84C]"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Bell */}
            <button className="relative h-9 w-9 flex items-center justify-center transition-colors rounded-none border bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border bg-red-500 border-slate-900" />
            </button>

            {/* User profile */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-none border bg-slate-800/60 border-slate-700">
              <div className="h-7 w-7 bg-[#C9A84C] flex items-center justify-center text-slate-900 text-[10px] font-extrabold flex-shrink-0">
                {initials}
              </div>
              <div>
                <div className="text-xs font-bold leading-tight text-white">{displayName}</div>
                <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  {role || "..."}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex-1 overflow-auto relative z-10 bg-transparent"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
