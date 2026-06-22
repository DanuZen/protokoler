'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth, useRole } from '@/hooks/use-auth';

export function LandingNavbar({ alwaysDark = false }: { alwaysDark?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(alwaysDark);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const dashboardHref = role === 'admin' ? '/dashboard' : role === 'dokumentasi' ? '/dokumentasi/dashboard' : '/beranda';

  useEffect(() => {
    if (alwaysDark) return;
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    // Set initial state on mount in case the page is already scrolled (e.g., hash navigation)
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [alwaysDark]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-500', (isScrolled || alwaysDark || isMobileMenuOpen) ? `bg-[#4A0000]/95 backdrop-blur-lg shadow-2xl py-3 ${isMobileMenuOpen ? '' : 'border-b border-[#D2AD5C]/20'}` : 'bg-[#4A0000]/20 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none py-4 lg:py-6')}
      >
        <div className="container mx-auto flex items-center justify-between px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative h-10 w-10 lg:h-12 lg:w-12 overflow-hidden transition-transform duration-500 group-hover:scale-110">
                <Image src="/logo protokoler.png" alt="Logo Protokoler" fill sizes="48px" className="object-contain drop-shadow-md" priority />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-lg lg:text-xl font-bold tracking-widest leading-none mb-1 text-white group-hover:text-[#D2AD5C] transition-colors">PROTOKOLER</span>
                <span className="text-[8px] lg:text-[9px] font-bold uppercase tracking-[0.2em] text-[#D2AD5C]/80">Universitas Negeri Padang</span>
              </div>
            </Link>
          </motion.div>

          <nav className="hidden lg:flex items-center gap-10">
            {[{ label: 'Profil', href: '/#profil' }, { label: 'Jadwal', href: '/#jadwal' }, { label: 'Prosedur', href: '/#prosedur' }, { label: 'Berita', href: '/#postingan' }, { label: 'Persyaratan', href: '/persyaratan' }].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 + (i * 0.1) }}>
                <Link 
                  href={item.href} 
                  className="text-xs font-bold text-white/90 hover:text-[#D2AD5C] transition-all duration-300 relative group uppercase tracking-widest"
                >
                  {item.label}
                  <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-[#D2AD5C] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.7 }}>
              <Link href="/faq" className="text-xs font-bold text-white/90 hover:text-[#D2AD5C] transition-all duration-300 relative group uppercase tracking-widest">
                FAQ
                <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-[#D2AD5C] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </motion.div>
          </nav>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="hidden lg:flex items-center gap-5">
            {user ? (
              <div className="flex items-center gap-5">
                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="text-sm font-bold leading-tight text-white">{user.user_metadata?.nama_lengkap || user.email}</span>
                  <span className="text-[10px] text-[#D2AD5C] uppercase tracking-[0.2em] font-bold mt-0.5">{role === 'admin' ? 'Pimpinan' : role === 'dokumentasi' ? 'Dokumentasi' : 'Protokoler'}</span>
                </div>
                <Link href={dashboardHref}>
                  <Button className="rounded-full shadow-[0_0_20px_rgba(210,173,92,0.2)] transition-all px-5 lg:px-7 bg-gradient-to-r from-[#D2AD5C] to-[#b39045] text-white hover:shadow-[0_0_25px_rgba(210,173,92,0.4)] hover:-translate-y-0.5 border-none h-10 lg:h-11 font-bold tracking-wider uppercase text-[9px] lg:text-[10px]">Dashboard</Button>
                </Link>
              </div>
            ) : (
              <Link href="/auth">
                <Button className="rounded-full shadow-[0_0_20px_rgba(210,173,92,0.2)] transition-all px-5 lg:px-7 bg-gradient-to-r from-[#D2AD5C] to-[#b39045] text-white hover:shadow-[0_0_25px_rgba(210,173,92,0.4)] hover:-translate-y-0.5 border-none h-10 lg:h-11 font-bold tracking-wider uppercase text-[9px] lg:text-[10px]">Masuk Sistem</Button>
              </Link>
            )}
          </motion.div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white hover:text-[#D2AD5C] transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#4A0000] pt-[100px] pb-6 px-8 lg:hidden flex flex-col gap-2 overflow-y-auto"
          >
            {[{ label: 'Profil', href: '/#profil' }, { label: 'Jadwal', href: '/#jadwal' }, { label: 'Prosedur', href: '/#prosedur' }, { label: 'Berita', href: '/#postingan' }, { label: 'Persyaratan', href: '/persyaratan' }, { label: 'FAQ', href: '/faq' }].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-bold text-white/90 hover:text-[#D2AD5C] transition-colors uppercase tracking-[0.2em] py-5 border-b border-white/10 text-center"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-6 mt-auto flex flex-col items-center">
              {user ? (
                <>
                  <div className="flex flex-col items-center mb-4 text-center">
                    <span className="text-base font-bold leading-tight text-white/90">{user.user_metadata?.nama_lengkap || user.email}</span>
                    <span className="text-xs text-[#D2AD5C] uppercase tracking-[0.2em] font-bold mt-1">{role === 'admin' ? 'Pimpinan' : role === 'dokumentasi' ? 'Dokumentasi' : 'Protokoler'}</span>
                  </div>
                  <Link href={dashboardHref} onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                    <Button className="w-full rounded-full shadow-[0_0_20px_rgba(210,173,92,0.2)] bg-gradient-to-r from-[#D2AD5C] to-[#b39045] text-white hover:shadow-[0_0_25px_rgba(210,173,92,0.4)] border-none h-14 font-bold tracking-widest uppercase text-xs">Dashboard</Button>
                  </Link>
                </>
              ) : (
                <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <Button className="w-full rounded-full shadow-[0_0_20px_rgba(210,173,92,0.2)] bg-gradient-to-r from-[#D2AD5C] to-[#b39045] text-white hover:shadow-[0_0_25px_rgba(210,173,92,0.4)] border-none h-14 font-bold tracking-widest uppercase text-xs">Masuk Sistem</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
