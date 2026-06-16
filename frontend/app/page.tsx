'use client';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, ClipboardList, Users, ShieldCheck, ArrowRight, ChevronDown, Star, ArrowUpRight, Megaphone, Quote, Play, Camera, Trophy, MessageSquare, MapPin, Clock, BookOpen, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { kegiatanApi, regulasiMockData } from '@/lib/api';
import { Calendar } from '@/components/ui/calendar';
import { id } from 'date-fns/locale';
import { useAuth, useRole } from '@/hooks/use-auth';

// Varied Animation Variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

const zoomIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};



export default function Landing() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { user } = useAuth();
  const { data: role } = useRole(user);
  const dashboardHref = role === 'admin' ? '/dashboard' : role === 'dokumentasi' ? '/dokumentasi/dashboard' : '/beranda';

  const { data: kegiatanPublik, isLoading } = useQuery({
    queryKey: ['kegiatan-publik-landing'],
    queryFn: () => kegiatanApi.list({ status: 'publik' }),
  });

  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#040206] text-slate-100 selection:bg-red-900/30 overflow-x-hidden font-sans">
      {/* Interactive Dynamic Navbar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-300', isScrolled ? 'bg-slate-950/95 backdrop-blur-xl shadow-lg border-b border-white/10 py-3' : 'bg-transparent py-5')}
      >
        <div className="container mx-auto flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-12 w-12 overflow-hidden transition-transform group-hover:scale-105">
              <Image src="/logo protokoler.png" alt="Logo Protokoler" fill sizes="48px" className="object-contain" priority />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-tight leading-none mb-1 text-white">PROTOKOLER</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">UNIVERSITAS NEGERI PADANG</span>
            </div>
          </Link>
          <nav className="hidden gap-8 lg:flex items-center">
            {[{ label: 'Jadwal', href: '#jadwal' }, { label: 'Galeri', href: '#galeri' }].map((item) => (
              <a key={item.label} href={item.href} className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                {item.label}
              </a>
            ))}
            <Link href="/faq" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-5">
                <div className="hidden md:flex flex-col items-end mr-1">
                  <span className="text-sm font-bold leading-tight text-white">{user.user_metadata?.nama_lengkap || user.email}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">{role === 'admin' ? 'Pimpinan' : role === 'dokumentasi' ? 'Dokumentasi' : 'Protokoler'}</span>
                </div>
                <Link href={dashboardHref}>
                  <Button className="rounded-xl shadow-sm transition-all px-6 bg-[#8B0A1A] text-white hover:bg-[#6B0814] h-10 font-bold">Dashboard</Button>
                </Link>
              </div>
            ) : (
              <Link href="/auth">
                <Button className="rounded-xl shadow-sm transition-all px-6 bg-[#8B0A1A] text-white hover:bg-[#6B0814] h-10 font-bold">Masuk Sistem</Button>
              </Link>
            )}
          </div>
        </div>
      </motion.header>

      <main className="relative z-10">
        {/* Redesigned Premium Hero Section */}
        <section className="relative pt-28 overflow-hidden min-h-[95vh] flex flex-col">
          {/* Background Video (YouTube) & Overlays */}
          <div className="absolute inset-0 z-0 overflow-hidden bg-slate-900">
            <iframe 
              src="https://www.youtube.com/embed/t6gKixOHNuc?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=t6gKixOHNuc&playsinline=1" 
              allow="autoplay; encrypted-media"
              className="absolute top-1/2 left-1/2 w-[250vw] md:w-[150vw] h-[250vh] md:h-[150vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-90"
              style={{ border: 'none' }}
            />
            {/* Overlays */}
            <div className="absolute inset-0 bg-slate-900/30 pointer-events-none"></div>
            {/* Dark gradient at the bottom to blend with the next section */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent pointer-events-none"></div>
            {/* Dark gradient at the top specifically for Navbar text legibility */}
            <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-slate-950/90 via-slate-900/50 to-transparent pointer-events-none z-10"></div>
          </div>

          <div className="container mx-auto px-8 md:px-16 relative z-10 flex-1 flex items-end pb-16">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-start text-left max-w-4xl">
              {/* Main Headline */}
              <motion.h1 variants={fadeUp} className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl lg:text-[3rem] text-white drop-shadow-xl">
                PROTOKOLER UNP
              </motion.h1>

              {/* Subtitle */}
              <motion.p variants={fadeUp} className="mt-5 max-w-xl text-base md:text-lg text-slate-300 leading-relaxed font-medium drop-shadow-md">
                Platform manajemen keprotokolan terintegrasi. Dilengkapi sistem <span className="text-white font-bold">absensi geotagging</span>, <span className="text-white font-bold">gamifikasi kinerja</span>, dan penerbitan{' '}
                <span className="text-white font-bold">e-Sertifikat</span> otomatis.
              </motion.p>
            </motion.div>
          </div>
        </section>


        {/* Jadwal Kegiatan */}
        <section id="jadwal" className="py-24 md:py-32 relative overflow-hidden bg-mesh-dark">
          {/* Decorative orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #8B0A1A 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #C9942A 0%, transparent 70%)' }} />
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />

          <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
            {/* Header */}
            <div className="mb-16 text-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/50 border border-red-900/30 text-[11px] font-bold text-red-400 mb-4 uppercase tracking-[0.25em]">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Agenda Publik
              </motion.div>
              <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
                Kegiatan Mendatang
              </motion.h2>
              <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-4 text-slate-400 text-lg max-w-2xl mx-auto">
                Jadwal kegiatan resmi tingkat universitas yang akan dan sedang berlangsung.
              </motion.p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-slate-500">
                <span className="animate-pulse text-sm tracking-widest uppercase">Memuat jadwal kegiatan...</span>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={fadeUp}
                className="grid md:grid-cols-[400px_1fr] gap-5"
              >
                {/* Left: Calendar Card */}
                <div className="glass-red p-7 md:p-9 flex flex-col gap-5 rounded-3xl">
                  <div>
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-[0.3em] mb-1">Kalender Acara</p>
                    <p className="text-white font-bold text-xl">Pilih Tanggal</p>
                  </div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={id}
                    className="rounded-2xl border border-white/10 p-3 text-white w-full" style={{ background: 'rgba(255,255,255,0.03)' }}
                  />
                  <div className="mt-auto pt-4 border-t border-white/10">
                    <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Tanggal Dipilih</p>
                    <p className="text-red-300 font-bold text-sm">
                      {selectedDate?.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) ?? '—'}
                    </p>
                  </div>
                </div>

                {/* Right: Event Details Card */}
                <div className="glass-dark p-8 md:p-10 flex flex-col rounded-3xl">
                  {(() => {
                    const event = kegiatanPublik?.find((k: any) => selectedDate && new Date(k.tanggal).toDateString() === selectedDate.toDateString());

                    if (!event) {
                      return (
                        <div className="h-full flex flex-col items-center justify-center text-center py-16">
                          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <CalendarDays className="h-9 w-9 text-slate-600" />
                          </div>
                          <p className="font-bold text-lg text-slate-300">Tidak ada agenda pada tanggal ini.</p>
                          <p className="text-sm mt-2 text-slate-600">Pilih tanggal lain di kalender untuk melihat jadwal kegiatan.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="flex flex-col gap-6">
                        <div>
                          <p className="text-[10px] font-bold text-red-400 uppercase tracking-[0.3em] mb-2">Detail Acara</p>
                          <h3 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">{event.nama_kegiatan}</h3>
                          <p className="text-slate-500 text-sm mt-2">
                            {selectedDate?.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(to right, #8B0A1A, transparent)' }} />
                        <div className="grid sm:grid-cols-2 gap-3">
                          {[
                            { icon: MapPin, label: 'Lokasi', value: event.lokasi },
                            { icon: Clock, label: 'Waktu Mulai', value: `${event.jam_mulai?.slice(0, 5)} WIB` },
                            { icon: Users, label: 'Pimpinan', value: event.tamu_vvip?.join(', ') || 'Pimpinan Universitas' },
                            { icon: Megaphone, label: 'Status', value: event.status?.toUpperCase() },
                          ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="rounded-2xl p-4 transition-all duration-200 hover:scale-[1.02]" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,10,26,0.25)' }}>
                                  <Icon className="h-3.5 w-3.5 text-red-400" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
                              </div>
                              <p className={`font-bold text-sm ${label === 'Status' && event.status === 'berlangsung' ? 'text-emerald-400' : 'text-white'}`}>
                                {value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Galeri Kegiatan */}
        <section id="galeri" className="py-24 md:py-32 relative overflow-hidden bg-mesh-indigo">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.025]" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="mb-16 max-w-3xl text-center mx-auto">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-[0.25em] mb-4" style={{ background: 'rgba(80,0,120,0.2)', borderColor: 'rgba(120,0,180,0.2)', color: '#c084fc' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                Galeri
              </motion.div>
              <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
                Dedikasi di Lapangan
              </motion.h2>
              <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-6 text-slate-400 text-lg md:text-xl">
                Potret momen-momen penting tim protokoler dalam menyukseskan berbagai kegiatan universitas tingkat tinggi.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { src: '/gallery_1.png', alt: 'Persiapan Acara VIP', caption: 'Persiapan Acara VIP', tag: 'Seremonial' },
                { src: '/gallery_2.png', alt: 'Pengarahan Tamu', caption: 'Pengarahan Tamu Resmi', tag: 'Protokol VIP' },
                { src: '/gallery_3.png', alt: 'Wisuda', caption: 'Upacara Wisuda Universitas', tag: 'Wisuda' },
              ].map((img, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                  key={i}
                  whileHover={{ scale: 1.02, y: -6 }}
                  className="group relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer"
                  style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)' }}
                >
                  <Image src={img.src} alt={img.alt} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw" className="object-cover transition-transform duration-1000 group-hover:scale-108" />
                  {/* Multi-layer overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-70 group-hover:opacity-85 transition-opacity duration-500" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, rgba(139,10,26,0.25) 0%, transparent 60%)' }} />
                  {/* Border glow on hover */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: 'inset 0 0 0 1px rgba(139,10,26,0.5)' }} />
                  {/* Tag */}
                  <div className="absolute top-5 left-5">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}>{img.tag}</span>
                  </div>
                  {/* Caption */}
                  <div className="absolute bottom-0 left-0 right-0 p-7 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-white font-bold text-xl mb-2 drop-shadow-lg">{img.caption}</p>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="w-8 h-0.5 rounded-full bg-red-500" />
                      <span className="text-red-300 text-xs font-bold uppercase tracking-widest">Lihat Detail</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* Regulasi & SOP — Card Grid Style */}
        <section className="py-24 md:py-32 relative overflow-hidden bg-mesh-gold">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.025]" />
          <div className="absolute top-1/4 right-0 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #C9942A 0%, transparent 70%)' }} />
          <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
            <div className="mb-16 max-w-3xl text-center mx-auto">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-[0.25em] mb-4" style={{ background: 'rgba(201,148,42,0.1)', borderColor: 'rgba(201,148,42,0.25)', color: '#C9942A' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Panduan & Regulasi
              </motion.div>
              <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
                Panduan Praktis Protokol
              </motion.h2>
              <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-4 text-slate-400 text-lg">
                Temukan SOP penting dan mendasar untuk kelancaran kegiatan Anda.
              </motion.p>
            </div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-3 gap-6 w-full mx-auto">
              {regulasiMockData.map((reg: any, i: number) => (
                <motion.a
                  href={reg.link_dokumen}
                  key={reg.id}
                  variants={zoomIn}
                  whileHover={{ y: -8, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="group block rounded-3xl overflow-hidden cursor-pointer relative glass-dark hover:border-amber-900/40 transition-all duration-300"
                >
                  {/* Card Header */}
                  <div className="relative h-52 p-6 flex flex-col justify-center items-center text-center overflow-hidden" style={{ background: reg.accentGradient }}>
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.4) 100%)' }} />
                    <div className="relative z-10 px-4">
                      <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] mb-2">SOP</p>
                      <h3 className="font-display font-black text-white text-2xl md:text-3xl leading-tight uppercase drop-shadow-md">{reg.judul}</h3>
                    </div>
                    {/* Floating icon */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20">
                      <div className="flex items-center justify-center h-12 w-12 rounded-2xl shadow-xl transition-all duration-300 group-hover:scale-110" style={{ background: 'rgba(201,148,42,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(201,148,42,0.3)' }}>
                        <FileText className="h-5 w-5 text-amber-300" strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                  {/* Card Body */}
                  <div className="p-6 pt-10 flex flex-col items-center text-center">
                    <p className="text-slate-400 text-sm leading-relaxed max-w-[90%]">{reg.deskripsi}</p>
                    <div className="mt-5 flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Buka Dokumen</span>
                    </div>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimoni */}
        <section className="py-24 md:py-32 relative overflow-hidden bg-mesh-dark">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl" style={{ background: 'radial-gradient(circle, #8B0A1A 0%, transparent 70%)' }} />

          <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-3 gap-16 items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeLeft} className="lg:col-span-1">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/50 border border-red-900/30 text-[11px] font-bold text-red-400 mb-5 uppercase tracking-[0.25em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Testimoni
                </div>
                <h2 className="font-display text-4xl font-bold text-white md:text-5xl mb-6 leading-tight">
                  Suara dari <br />
                  <span className="bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">Tim &amp; Tamu</span>
                </h2>
                <p className="text-slate-400 mb-10 text-base leading-relaxed">Dampak langsung dari penggunaan sistem terpadu keprotokolan, dinilai langsung oleh tim lapangan dan tamu VVIP.</p>
                <div className="flex gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="fill-amber-400 text-amber-400 h-6 w-6" />
                  ))}
                </div>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="lg:col-span-2 grid md:grid-cols-2 gap-5">
                {[
                  { name: 'Dr. Budi Santoso', role: 'Pembina Protokoler', initial: 'BS', text: 'Fitur evaluasi 3 Tata Protokol memastikan tidak ada celah di lapangan. Modul gamifikasi juga memacu mahasiswa untuk terus aktif.' },
                  { name: 'Siti Nurhaliza', role: 'Protokoler (Gold)', initial: 'SN', text: 'Absensi selfie membuat kami lebih teratur dan adil. Poin kegiatan langsung terakumulasi untuk mengejar sertifikat tertinggi!' },
                ].map((testi, i) => (
                  <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    variants={fadeUp}
                    key={i}
                    className="p-8 rounded-3xl glass-dark relative transition-all duration-300"
                  >
                    {/* Big decorative quote */}
                    <div className="absolute top-5 right-6 font-display text-8xl font-black leading-none select-none" style={{ color: 'rgba(139,10,26,0.12)' }}>&ldquo;</div>
                    <p className="text-slate-300 leading-relaxed mb-8 text-base relative z-10">&ldquo;{testi.text}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #8B0A1A, #C9942A)' }}>
                        {testi.initial}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{testi.name}</h4>
                        <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">{testi.role}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      </main>


      {/* Footer */}
      <footer className="relative z-20 py-12" style={{ background: '#020104', borderTop: '1px solid rgba(139,10,26,0.15)' }}>
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image src="/logo protokoler.png" alt="Logo Protokoler" fill sizes="40px" className="object-contain opacity-60" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold text-white tracking-widest">PROTOKOLER</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">Universitas Negeri Padang</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 font-medium">© {new Date().getFullYear()} Unit Protokoler Universitas. Hak Cipta Dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
