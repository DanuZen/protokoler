'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldCheck, LayoutDashboard, Users, CalendarDays, ClipboardList, FileBarChart, LogOut, UserCircle2, Menu, Camera, Bell, Settings, Home, CalendarCheck, BarChart3, Award, BookOpen, UploadCloud, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth, useRole } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type Role = 'admin' | 'mahasiswa' | 'dokumentasi';

const adminItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/anggota', icon: Users, label: 'Anggota' },
  { to: '/kegiatan', icon: CalendarDays, label: 'Kegiatan' },
  { to: '/dokumentasi/dashboard', icon: Camera, label: 'Dokumentasi' },
  { to: '/sertifikat', icon: Award, label: 'Sertifikat' },
  { to: '/evaluasi/dashboard', icon: BarChart3, label: 'Evaluasi' },
  { to: '/laporan', icon: FileBarChart, label: 'Laporan' },
];

const mahasiswaItems = [
  { to: '/beranda', icon: Home, label: 'Beranda' },
  { to: '/kegiatan', icon: CalendarDays, label: 'Kegiatan' },
  { to: '/evaluasi/dashboard', icon: BarChart3, label: 'Evaluasi' },
  { to: '/sertifikat', icon: Award, label: 'Sertifikat' },
];

const dokumentasiItems = [
  { to: '/dokumentasi/dashboard', icon: Camera, label: 'Dashboard' },
  { to: '/kegiatan', icon: CalendarDays, label: 'Kegiatan' },
  { to: '/dokumentasi/berita', icon: BookOpen, label: 'Berita' },
  { to: '/evaluasi/dashboard', icon: BarChart3, label: 'Evaluasi' },
];

function NavItem({ item, active, isOpen }: { item: { to: string; icon: any; label: string }; active: boolean; isOpen: boolean }) {
  return (
    <Link
      href={item.to}
      className={cn(
        "relative group flex items-center mb-1 rounded-xl transition-all duration-200 overflow-hidden",
        isOpen ? "w-full px-4 h-[46px] gap-3" : "justify-center w-12 h-12"
      )}
    >
      {/* Active BG */}
      {active && (
        <motion.div
          layoutId="active-nav-bg"
          className="absolute inset-0 bg-white rounded-xl shadow-sm"
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}

      {/* Hover BG */}
      {!active && (
        <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
      )}



      {/* Icon */}
      <div className={cn(
        'relative z-10 shrink-0 transition-colors duration-200',
        active ? 'text-[#6B0000]' : 'text-red-100 group-hover:text-white'
      )}>
        <item.icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.5 : 2} />
      </div>

      {/* Label */}
      {isOpen && (
        <span className={cn(
          'relative z-10 text-[13px] transition-colors duration-200 whitespace-nowrap overflow-hidden tracking-tight',
          active ? 'font-extrabold text-[#6B0000]' : 'font-medium text-red-100 group-hover:text-white'
        )}>
          {item.label}
        </span>
      )}

      {/* Collapsed: right tooltip */}
      {!isOpen && (
        <div className="absolute left-full ml-3 hidden group-hover:flex items-center whitespace-nowrap z-50">
          <div className="bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl border border-slate-700">
            {item.label}
          </div>
        </div>
      )}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const router = useRouter();
  const path = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const signOut = async () => {
    // Demo mode: hanya clear localStorage, tidak ada koneksi ke backend
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('demo_role');
      window.localStorage.removeItem('demo_name');
      window.localStorage.removeItem('demo_avatar');
      window.localStorage.removeItem('cached_role');
    }
    await supabase.auth.signOut();
    router.push('/auth');
  };

  const navItems = role === 'admin' ? adminItems : role === 'dokumentasi' ? dokumentasiItems : role === 'mahasiswa' ? mahasiswaItems : [];

  const [demoName, setDemoName] = useState<string | null>(null);
  const [demoAvatar, setDemoAvatar] = useState<string | null>(null);

  useEffect(() => {
    const syncDemoData = () => {
      setDemoName(window.localStorage.getItem('demo_name'));
      setDemoAvatar(window.localStorage.getItem('demo_avatar'));
    };
    syncDemoData();
    window.addEventListener('demo_name_updated', syncDemoData);
    window.addEventListener('demo_avatar_updated', syncDemoData);
    return () => {
      window.removeEventListener('demo_name_updated', syncDemoData);
      window.removeEventListener('demo_avatar_updated', syncDemoData);
    };
  }, []);

  const displayName = demoName || user?.user_metadata?.nama_lengkap || user?.email?.split('@')[0] || 'Demo Pimpinan';
  const initials = displayName.charAt(0).toUpperCase();
  


  return (
    <div className="flex min-h-dvh bg-white text-slate-800 font-sans">
      {/* ─── MAIN APP CONTAINER ─── */}
      <div className="flex flex-1 w-full h-dvh overflow-hidden">
        
        {/* ─── SIDEBAR ─────────────────────────────────── */}
        <aside className={cn("hidden md:flex flex-col transition-all duration-300 border-r border-[#4A0000] bg-[#6B0000] pt-5 pb-6 shadow-xl z-20", isSidebarOpen ? "w-[240px]" : "w-[90px] items-center")}>
          {/* Logo */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn("mb-8 flex items-center h-16 overflow-hidden w-full hover:opacity-80 transition-opacity cursor-pointer", isSidebarOpen ? "px-6 justify-start gap-3" : "justify-center")}
          >
            <div className="h-[52px] w-[52px] shrink-0 flex items-center justify-center overflow-hidden bg-white rounded-full shadow-lg">
              <img src="/logo protokoler.webp" alt="Protokoler Logo" className="w-[96%] h-[96%] object-contain drop-shadow-sm" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col justify-center text-left">
                <span className="font-black text-white text-[20px] leading-none tracking-tight whitespace-nowrap mb-1 drop-shadow-sm">Protokoler</span>
                <span className="text-[11px] font-semibold text-red-100 whitespace-nowrap drop-shadow-sm">Universitas Negeri Padang</span>
              </div>
            )}
          </button>

          {/* Nav */}
          <nav className={cn("flex-1 flex flex-col w-full gap-2 overflow-hidden", isSidebarOpen ? "px-4 items-stretch" : "px-4 items-center")}>
            {role === null ? (
              Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className={cn("mb-1 rounded-xl bg-white/20", isSidebarOpen ? "w-full h-[46px]" : "w-12 h-12")} />
              ))
            ) : navItems.map((item) => {
              const active = path === item.to || path.startsWith(item.to + '/');
              return <NavItem key={item.to} item={item} active={active} isOpen={isSidebarOpen} />;
            })}
          </nav>

          {/* Bottom Actions */}
          <div className={cn("flex flex-col gap-1 mt-auto overflow-hidden mb-4", isSidebarOpen ? "px-4 items-stretch" : "items-center")}>

            {/* Divider */}
            <div className="h-px bg-white/20 mb-2 mx-1" />

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className={cn("cursor-pointer group flex items-center rounded-xl transition-colors hover:bg-white/10", isSidebarOpen ? "gap-3 py-2.5 px-3 border border-transparent hover:border-white/20 shadow-sm" : "p-3 justify-center")}>
                  <div className="h-8 w-8 bg-white text-[#6B0000] rounded-full flex items-center justify-center font-extrabold overflow-hidden text-[13px] shrink-0 shadow-md ring-2 ring-white/50">
                    {demoAvatar || user?.user_metadata?.avatar_url || user?.user_metadata?.foto_setengah_badan_url ? (
                      <img src={demoAvatar || user?.user_metadata?.avatar_url || user?.user_metadata?.foto_setengah_badan_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  {isSidebarOpen && (
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-[13px] font-black text-white leading-tight truncate transition-colors">{displayName}</div>
                      <div className="text-[10px] font-semibold text-red-200 capitalize tracking-wide">{role ?? 'Admin'}</div>
                    </div>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent side={isSidebarOpen ? "top" : "right"} align="end" className="w-48 rounded-xl border-slate-200/80 shadow-2xl bg-white/90 backdrop-blur-xl mb-1">
                <DropdownMenuItem className="cursor-pointer font-medium text-sm text-slate-700 focus:bg-red-50 focus:text-[#6B0000] rounded-lg py-2 px-3" onClick={() => router.push('/profil')}>
                  <UserCircle2 className="mr-2 h-4 w-4" />
                  <span>Profil Saya</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer font-medium text-sm text-slate-700 focus:bg-red-50 focus:text-[#6B0000] rounded-lg py-2 px-3" onClick={signOut}>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Ganti Akun</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100 my-1" />
                <DropdownMenuItem className="cursor-pointer font-bold text-red-600 focus:bg-red-50 focus:text-red-700 rounded-lg py-2 px-3" onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Home */}
            <Link
              href="/"
              className={cn("text-red-100 hover:text-white transition-colors flex items-center rounded-xl mt-1", isSidebarOpen ? "gap-3 py-3 px-4 hover:bg-white/10" : "p-3 hover:bg-white/10 justify-center")}
            >
              <Home className="h-5 w-5 shrink-0" />
              {isSidebarOpen && <span className="text-sm font-semibold whitespace-nowrap">Beranda</span>}
            </Link>
          </div>
        </aside>

        {/* ─── MAIN CONTENT ────────────────────────────── */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative overflow-hidden">
          
          {/* Glassmorphism Background Blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-400/20 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none" />
          <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-emerald-400/10 blur-[100px] pointer-events-none" />
          

          {/* Page Content Area */}
          <div className={cn("flex-1 flex flex-col min-h-0 relative z-10 overflow-y-auto overflow-x-hidden pb-24 md:pb-8 md:overflow-hidden md:p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]", role === 'mahasiswa' && "md:pb-8 md:pt-8")}>
            <AnimatePresence mode="wait">
              <motion.div 
                key={path}
                className="flex-1 flex flex-col min-h-0 [&>div]:min-h-full md:[&>div]:!h-full" 
                initial={{ opacity: 0, y: 15, scale: 0.98 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

      </div>

      {/* ─── MOBILE BOTTOM NAVIGATION (Selalu ada kecuali untuk admin) ─── */}
      {mounted && role !== 'superadmin' && role !== 'admin' && role !== 'pimpinan' && (
        <motion.nav 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="md:hidden fixed bottom-5 left-4 right-4 z-[999] bg-gradient-to-r from-[#7a0000] via-[#5a0000] to-[#7a0000] shadow-[0_8px_30px_rgba(107,0,0,0.4)] rounded-[24px] px-2 py-1.5 flex items-center justify-between"
        >
          
          <Link href="/kegiatan" className="relative flex flex-col items-center justify-center gap-1 w-[19%] py-1.5 rounded-xl transition-all">
            {(path === '/kegiatan' || path.startsWith('/kegiatan/')) && <motion.div layoutId="nav-pill" className="absolute inset-0 bg-white/10 rounded-xl -z-10 shadow-inner" transition={{ type: "spring", stiffness: 300, damping: 25 }} />}
            <CalendarDays className={cn("h-5 w-5", (path === '/kegiatan' || path.startsWith('/kegiatan/')) ? "text-white" : "text-red-200")} strokeWidth={(path === '/kegiatan' || path.startsWith('/kegiatan/')) ? 2.5 : 2} />
            <span className={cn("text-[9px] font-bold tracking-wide", (path === '/kegiatan' || path.startsWith('/kegiatan/')) ? "text-white" : "text-red-200")}>Kegiatan</span>
          </Link>

          <Link href="/evaluasi/dashboard" className="relative flex flex-col items-center justify-center gap-1 w-[19%] py-1.5 rounded-xl transition-all">
            {path === '/evaluasi/dashboard' && <motion.div layoutId="nav-pill" className="absolute inset-0 bg-white/10 rounded-xl -z-10 shadow-inner" transition={{ type: "spring", stiffness: 300, damping: 25 }} />}
            <BarChart3 className={cn("h-5 w-5", path === '/evaluasi/dashboard' ? "text-white" : "text-red-200")} strokeWidth={path === '/evaluasi/dashboard' ? 2.5 : 2} />
            <span className={cn("text-[9px] font-bold tracking-wide", path === '/evaluasi/dashboard' ? "text-white" : "text-red-200")}>Evaluasi</span>
          </Link>

          {/* FAB Beranda */}
          <div className="relative w-[20%] flex flex-col items-center justify-center pt-1.5">
            <div className="absolute -top-7">
              <Link href="/beranda" className={cn("flex flex-col items-center justify-center h-[52px] w-[52px] md:h-14 md:w-14 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.3)] transition-transform active:scale-95 group border-4 border-slate-50", path === '/beranda' ? "bg-white" : "bg-slate-100")}>
                <Home className={cn("h-[22px] w-[22px] md:h-6 md:w-6", path === '/beranda' ? "text-[#8B0000]" : "text-slate-400")} strokeWidth={path === '/beranda' ? 2.5 : 2} />
              </Link>
            </div>
            <span className={cn("text-[9px] font-bold tracking-wide mt-7", path === '/beranda' ? "text-white" : "text-red-200")}>Beranda</span>
          </div>

          <Link href="/sertifikat" className="relative flex flex-col items-center justify-center gap-1 w-[19%] py-1.5 rounded-xl transition-all">
            {path === '/sertifikat' && <motion.div layoutId="nav-pill" className="absolute inset-0 bg-white/10 rounded-xl -z-10 shadow-inner" transition={{ type: "spring", stiffness: 300, damping: 25 }} />}
            <Award className={cn("h-5 w-5", path === '/sertifikat' ? "text-white" : "text-red-200")} strokeWidth={path === '/sertifikat' ? 2.5 : 2} />
            <span className={cn("text-[9px] font-bold tracking-wide", path === '/sertifikat' ? "text-white" : "text-red-200")}>Sertifikat</span>
          </Link>

          <Link href="/profil" className="relative flex flex-col items-center justify-center gap-1 w-[19%] py-1.5 rounded-xl transition-all">
            {path === '/profil' && <motion.div layoutId="nav-pill" className="absolute inset-0 bg-white/10 rounded-xl -z-10 shadow-inner" transition={{ type: "spring", stiffness: 300, damping: 25 }} />}
            <UserCircle2 className={cn("h-5 w-5", path === '/profil' ? "text-white" : "text-red-200")} strokeWidth={path === '/profil' ? 2.5 : 2} />
            <span className={cn("text-[9px] font-bold tracking-wide", path === '/profil' ? "text-white" : "text-red-200")}>Profil</span>
          </Link>

        </motion.nav>
      )}
    </div>
  );
}

