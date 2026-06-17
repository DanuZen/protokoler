'use client';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, ClipboardList, Users, ShieldCheck, ArrowRight, ChevronDown, Star, ArrowUpRight, Megaphone, Quote, Play, Camera, Trophy, MessageSquare, MapPin, Clock, BookOpen, FileText, ExternalLink, X, ChevronLeft, ChevronRight, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { kegiatanApi, postinganApi, regulasiMockData } from '@/lib/api';
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
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  const { user } = useAuth();
  const { data: role } = useRole(user);
  const dashboardHref = role === 'admin' ? '/dashboard' : role === 'dokumentasi' ? '/dokumentasi/dashboard' : '/beranda';

  const { data: kegiatanPublik, isLoading } = useQuery({
    queryKey: ['kegiatan-publik-landing'],
    queryFn: () => kegiatanApi.list({ status: 'publik' }),
  });

  const { data: postinganDokumentasi } = useQuery({
    queryKey: ['postingan-dokumentasi'],
    queryFn: () => postinganApi.list(),
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
    <div className="min-h-screen bg-white text-slate-900 selection:bg-red-100 overflow-x-hidden font-sans">
      {/* Interactive Dynamic Navbar */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-500', isScrolled ? 'bg-[#4A0000]/95 backdrop-blur-lg shadow-2xl border-b border-[#D2AD5C]/20 py-3' : 'bg-transparent py-6')}
      >
        <div className="container mx-auto flex items-center justify-between px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative h-12 w-12 overflow-hidden transition-transform duration-500 group-hover:scale-110">
                <Image src="/logo protokoler.png" alt="Logo Protokoler" fill sizes="48px" className="object-contain drop-shadow-md" priority />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold tracking-widest leading-none mb-1 text-white group-hover:text-[#D2AD5C] transition-colors">PROTOKOLER</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D2AD5C]/80">Universitas Negeri Padang</span>
              </div>
            </Link>
          </motion.div>

          <nav className="hidden lg:flex items-center gap-10">
            {[{ label: 'Profil', href: '#profil' }, { label: 'Jadwal', href: '#jadwal' }, { label: 'SOP', href: '#sop' }, { label: 'Berita', href: '#postingan' }].map((item, i) => (
              <motion.a 
                key={item.label} 
                href={item.href} 
                initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 + (i * 0.1) }}
                className="text-xs font-bold text-white/90 hover:text-[#D2AD5C] transition-all duration-300 relative group uppercase tracking-widest"
              >
                {item.label}
                <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-[#D2AD5C] transition-all duration-300 group-hover:w-full"></span>
              </motion.a>
            ))}
            <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.7 }}>
              <Link href="/faq" className="text-xs font-bold text-white/90 hover:text-[#D2AD5C] transition-all duration-300 relative group uppercase tracking-widest">
                FAQ
                <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-[#D2AD5C] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </motion.div>
          </nav>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="flex items-center gap-5">
            {user ? (
              <div className="flex items-center gap-5">
                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="text-sm font-bold leading-tight text-white">{user.user_metadata?.nama_lengkap || user.email}</span>
                  <span className="text-[10px] text-[#D2AD5C] uppercase tracking-[0.2em] font-bold mt-0.5">{role === 'admin' ? 'Pimpinan' : role === 'dokumentasi' ? 'Dokumentasi' : 'Protokoler'}</span>
                </div>
                <Link href={dashboardHref}>
                  <Button className="rounded-full shadow-[0_0_20px_rgba(210,173,92,0.2)] transition-all px-7 bg-gradient-to-r from-[#D2AD5C] to-[#b39045] text-white hover:shadow-[0_0_25px_rgba(210,173,92,0.4)] hover:-translate-y-0.5 border-none h-11 font-bold tracking-wider uppercase text-[10px]">Dashboard</Button>
                </Link>
              </div>
            ) : (
              <Link href="/auth">
                <Button className="rounded-full shadow-[0_0_20px_rgba(210,173,92,0.2)] transition-all px-7 bg-gradient-to-r from-[#D2AD5C] to-[#b39045] text-white hover:shadow-[0_0_25px_rgba(210,173,92,0.4)] hover:-translate-y-0.5 border-none h-11 font-bold tracking-wider uppercase text-[10px]">Masuk Sistem</Button>
              </Link>
            )}
          </motion.div>
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

        {/* Profil & Nilai Inti (About Us) */}
        <section id="profil" className="py-24 md:py-32 relative overflow-hidden bg-white">
          <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
              
              {/* Left: Image Collage */}
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeRight}
                className="w-full lg:w-[45%] relative"
              >
                <div className="relative w-full aspect-[4/5] md:aspect-[3/4] lg:aspect-square max-w-[500px] mx-auto lg:mx-0">
                   {/* Main Image */}
                   <div className="absolute top-0 right-0 w-[85%] h-[85%] rounded-[2rem] overflow-hidden shadow-2xl">
                     <Image src="/team-collab.png" alt="Tim Protokoler" fill className="object-cover" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                   </div>
                   {/* Secondary Image */}
                   <motion.div 
                     whileHover={{ y: -10 }}
                     className="absolute bottom-0 left-0 w-[55%] h-[55%] rounded-3xl overflow-hidden shadow-2xl border-8 border-white"
                   >
                     <Image src="/rektorat.jpg" alt="Rektorat UNP" fill className="object-cover" />
                   </motion.div>
                </div>
              </motion.div>

              {/* Right: Content */}
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeLeft}
                className="w-full lg:w-[55%] flex flex-col justify-center"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-[2px] bg-[#D2AD5C]"></div>
                  <span className="text-sm font-bold text-[#6B0000] uppercase tracking-[0.25em]">Tentang Kami</span>
                </div>
                
                <h2 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-slate-900 leading-[1.2] tracking-tight mb-6 text-balance">
                  Menjaga Kehormatan, Memastikan <span className="text-[#6B0000]">Kesempurnaan</span> Acara.
                </h2>
                
                <p className="text-slate-600 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl">
                  Unit Protokoler Universitas Negeri Padang adalah garda terdepan dalam menjaga <span className="font-semibold text-slate-800">tata aturan, tata tempat, tata upacara, dan tata penghormatan</span>. Kami memastikan standar tertinggi dalam penyambutan VVIP dan kesuksesan agenda institusi.
                </p>

                <div className="space-y-6 mb-10">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-[#6B0000]">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Disiplin & Ketepatan Waktu</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">Eksekusi tata acara yang presisi dan disiplin tinggi dalam setiap penugasan lapangan.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 text-amber-600">
                      <Star className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Pelayanan Prima (Service Excellence)</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">Memberikan layanan VVIP yang hangat, profesional, dan berstandar nasional.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Sinergi & Kekompakan Tim</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">Kolaborasi solid antar anggota dan pimpinan demi mewujudkan acara yang sukses dan berkesan.</p>
                    </div>
                  </div>
                </div>

                <Button className="w-fit bg-[#6B0000] hover:bg-[#6A0814] text-white rounded-full px-8 py-6 text-sm font-bold tracking-wide shadow-lg shadow-red-900/20 group">
                  Kenali Kami Lebih Dekat <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
              
            </div>
          </div>
        </section>

        {/* Jadwal Kegiatan */}
        <section id="jadwal" className="py-24 md:py-32 relative overflow-hidden bg-slate-50">
          {/* Decorative orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-[0.07] blur-3xl" style={{ background: 'radial-gradient(circle, #6B0000 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-[0.05] blur-3xl" style={{ background: 'radial-gradient(circle, #D2AD5C 0%, transparent 70%)' }} />

          <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
            {/* Header */}
            <div className="mb-16 text-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex items-center justify-center gap-3 mb-4">
                <div className="w-8 h-[2px] bg-[#D2AD5C]"></div>
                <span className="text-sm font-bold text-[#6B0000] uppercase tracking-[0.25em]">Agenda</span>
                <div className="w-8 h-[2px] bg-[#D2AD5C]"></div>
              </motion.div>
              <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                Kegiatan <span className="text-[#6B0000]">Mendatang</span>
              </motion.h2>
              <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-4 text-slate-500 text-lg max-w-2xl mx-auto">
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
                <div className="bg-white p-7 md:p-9 flex flex-col gap-5 rounded-3xl border border-slate-200 shadow-lg">
                  <div>
                    <p className="text-[10px] font-bold text-[#6B0000] uppercase tracking-[0.3em] mb-1">Kalender Acara</p>
                    <p className="text-slate-900 font-bold text-xl">Pilih Tanggal</p>
                  </div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={id}
                    className="rounded-2xl border border-slate-100 p-3 text-slate-900 w-full bg-slate-50"
                    modifiers={{
                      hasEvent: kegiatanPublik?.map((k: any) => new Date(k.tanggal)) || [],
                    }}
                  />
                  <div className="mt-auto pt-4 border-t border-white/10">
                    <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Tanggal Dipilih</p>
                    <p className="text-[#6B0000] font-bold text-sm">
                      {selectedDate?.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) ?? '—'}
                    </p>
                  </div>
                </div>

                {/* Right: Event Details Card */}
                <div className="bg-white p-8 md:p-10 flex flex-col rounded-3xl border border-slate-200 shadow-lg">
                  {(() => {
                    const event = kegiatanPublik?.find((k: any) => selectedDate && new Date(k.tanggal).toDateString() === selectedDate.toDateString());

                    if (!event) {
                      return (
                        <div className="h-full flex flex-col items-center justify-center text-center py-16">
                          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-slate-100 border border-slate-200">
                            <CalendarDays className="h-9 w-9 text-slate-400" />
                          </div>
                          <p className="font-bold text-lg text-slate-700">Tidak ada agenda pada tanggal ini.</p>
                          <p className="text-sm mt-2 text-slate-400">Pilih tanggal lain di kalender untuk melihat jadwal kegiatan.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="flex flex-col gap-6">
                        <div>
                          <p className="text-[10px] font-bold text-[#6B0000] uppercase tracking-[0.3em] mb-2">Detail Acara</p>
                          <h3 className="font-display text-3xl md:text-4xl font-bold text-slate-900 leading-tight">{event.nama_kegiatan}</h3>
                          <p className="text-slate-500 text-sm mt-2">
                            {selectedDate?.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(to right, #6B0000, transparent)' }} />
                        <div className="grid sm:grid-cols-2 gap-3">
                          {[
                            { icon: MapPin, label: 'Lokasi', value: event.lokasi },
                            { icon: Clock, label: 'Waktu Mulai', value: `${event.jam_mulai?.slice(0, 5)} WIB` },
                            { icon: Users, label: 'Pimpinan', value: event.tamu_vvip?.join(', ') || 'Pimpinan Universitas' },
                            { icon: Megaphone, label: 'Status', value: event.status?.toUpperCase() },
                          ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="rounded-2xl p-4 transition-all duration-200 hover:scale-[1.02] bg-slate-50 border border-slate-200">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-red-50">
                                  <Icon className="h-3.5 w-3.5 text-[#6B0000]" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
                              </div>
                              <p className={`font-bold text-sm ${label === 'Status' && event.status === 'berlangsung' ? 'text-emerald-600' : 'text-slate-900'}`}>
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

        {/* Regulasi & SOP — Split Layout Style */}
        <section className="py-24 md:py-32 relative overflow-hidden bg-slate-50 border-t border-slate-100">
          {/* Decorative mesh */}
          <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6B0000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row gap-16 lg:items-start">
              
              {/* Left Side: Sticky Intro */}
              <div className="lg:w-1/3 lg:sticky lg:top-32 lg:pt-4">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-[2px] bg-[#D2AD5C]"></div>
                  <span className="text-sm font-bold text-[#6B0000] uppercase tracking-[0.25em]">Prosedur</span>
                </motion.div>
                <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl mb-6 leading-tight">
                  SOP Praktis <span className="text-[#6B0000]">Protokol</span>
                </motion.h2>
                <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-slate-500 text-lg mb-10 leading-relaxed">
                  Temukan Standard Operating Procedure (SOP) penting dan mendasar untuk menjamin kelancaran setiap kegiatan resmi Universitas.
                </motion.p>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                   <Button className="rounded-xl bg-[#6B0000] text-white hover:bg-red-900 h-14 px-8 font-bold shadow-lg shadow-red-900/20 text-sm tracking-wide flex items-center gap-3 group transition-all duration-300">
                     Lihat Semua SOP
                     <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                   </Button>
                </motion.div>
              </div>

              {/* Right Side: Interactive List */}
              <div className="lg:w-2/3 flex flex-col gap-5">
                {regulasiMockData.map((reg: any, i: number) => (
                  <motion.a
                    href={reg.link_dokumen}
                    key={reg.id}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    whileHover={{ scale: 1.02, x: -8 }}
                    className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-8 p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-2xl hover:border-red-200 transition-all duration-500 overflow-hidden cursor-pointer"
                  >
                    {/* Hover Glow Effect */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 bg-red-100 rounded-full opacity-0 group-hover:opacity-30 blur-3xl transition-opacity duration-500 pointer-events-none" />
                    
                    {/* Icon Block */}
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-inner relative z-10 transition-transform duration-500 group-hover:scale-105" style={{ background: reg.accentGradient }}>
                       <FileText className="h-8 w-8 text-white/90 drop-shadow-md" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 relative z-10">
                       <div className="flex items-center gap-3 mb-3">
                         <span className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:bg-red-50 group-hover:text-red-700 transition-colors">SOP Resmi</span>
                         <span className="text-xs text-slate-400 font-medium tracking-wide">{reg.tanggal_berlaku}</span>
                       </div>
                       <h3 className="font-display font-bold text-2xl text-slate-900 group-hover:text-[#6B0000] transition-colors mb-2">{reg.judul}</h3>
                       <p className="text-slate-500 text-sm leading-relaxed">{reg.deskripsi}</p>
                    </div>

                    {/* Action Button */}
                    <div className="hidden md:flex w-14 h-14 rounded-full border-2 border-slate-100 items-center justify-center flex-shrink-0 text-slate-400 group-hover:bg-[#6B0000] group-hover:text-white group-hover:border-[#6B0000] transition-all duration-300 relative z-10">
                       <ArrowUpRight className="h-6 w-6 group-hover:rotate-45 transition-transform duration-300" />
                    </div>
                  </motion.a>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* Testimoni */}
        <section className="py-24 md:py-32 relative overflow-hidden bg-mesh-dark">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl" style={{ background: 'radial-gradient(circle, #6B0000 0%, transparent 70%)' }} />

          <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-3 gap-16 items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeLeft} className="lg:col-span-1">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-[2px] bg-[#D2AD5C]/50"></div>
                  <span className="text-sm font-bold text-[#D2AD5C] uppercase tracking-[0.25em]">Apa Kata Mereka</span>
                </div>
                <h2 className="font-display text-4xl font-bold text-white md:text-5xl mb-6 leading-tight">
                  Suara dari <br />
                  <span className="bg-gradient-to-r from-[#D2AD5C] to-amber-300 bg-clip-text text-transparent drop-shadow-sm">Tim &amp; Tamu</span>
                </h2>
                <p className="text-slate-400 text-base leading-relaxed">Dampak langsung dari penggunaan sistem terpadu keprotokolan, dinilai langsung oleh tim lapangan dan tamu VVIP.</p>
                
                {/* Glowing Animated Stars */}
                <div className="flex gap-2 mt-10">
                  {[...Array(5)].map((_, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, scale: 0, rotate: -45 }} 
                      whileInView={{ opacity: 1, scale: 1, rotate: 0 }} 
                      transition={{ delay: 0.2 + (i * 0.1), type: 'spring', stiffness: 200 }} 
                      viewport={{ once: true }}
                    >
                      <Star className="fill-amber-400 text-amber-400 h-7 w-7 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="lg:col-span-2 grid md:grid-cols-2 gap-5">
                {[
                  { name: 'Dr. Budi Santoso', role: 'Pembina Protokoler', initial: 'BS', text: 'Fitur evaluasi 3 Tata Protokol memastikan tidak ada celah di lapangan. Modul gamifikasi juga memacu mahasiswa untuk terus aktif.' },
                  { name: 'Siti Nurhaliza', role: 'Protokoler (Gold)', initial: 'SN', text: 'Absensi selfie membuat kami lebih teratur dan adil. Poin kegiatan langsung terakumulasi untuk mengejar sertifikat tertinggi!' },
                ].map((testi, i) => (
                  <motion.div
                    whileHover={{ scale: 1.03, y: -8 }}
                    variants={fadeUp}
                    key={i}
                    className="p-8 rounded-[2rem] bg-gradient-to-br from-[#2A0000]/90 to-[#1A0000]/90 backdrop-blur-xl border border-white/5 relative transition-all duration-300 shadow-2xl hover:shadow-[#D2AD5C]/10 hover:border-[#D2AD5C]/30 group"
                  >
                    {/* Big decorative quote */}
                    <div className="absolute top-4 right-6 font-display text-8xl font-black leading-none select-none text-[#D2AD5C]/10 group-hover:text-[#D2AD5C]/20 transition-colors duration-300">&ldquo;</div>
                    <p className="text-slate-300 leading-relaxed mb-10 text-base relative z-10 font-medium tracking-wide">&ldquo;{testi.text}&rdquo;</p>
                    <div className="flex items-center gap-4 mt-auto relative z-10 pt-4 border-t border-white/5 group-hover:border-white/10 transition-colors">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black text-white flex-shrink-0 shadow-lg shadow-black/50" style={{ background: 'linear-gradient(135deg, #8B0A1A, #D2AD5C)' }}>
                        {testi.initial}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-[15px] tracking-wide">{testi.name}</h4>
                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-[0.2em] mt-0.5">{testi.role}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
        {/* Berita & Dokumentasi (Postingan) */}
        <section id="postingan" className="py-24 md:py-32 relative overflow-hidden bg-white border-t border-slate-100">
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-2xl">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-[2px] bg-[#D2AD5C]"></div>
                  <span className="text-sm font-bold text-[#6B0000] uppercase tracking-[0.25em]">Postingan Terkini</span>
                </motion.div>
                <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                  Postingan <span className="text-[#6B0000]">Terbaru</span>
                </motion.h2>
              </div>
              <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-slate-500 text-lg md:text-xl max-w-lg md:text-right">
                Informasi, berita, dan dokumentasi kegiatan resmi terbaru yang dirangkum langsung oleh tim Protokoler.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:auto-rows-[380px]">
              {(postinganDokumentasi || []).map((post: any, i: number) => {
                const isFeatured = i === 0;
                
                // Distribusi 5 item Bento Grid
                let gridClass = "";
                if (i === 0) gridClass = "lg:col-span-7 lg:row-span-2 h-[450px] lg:h-full";
                else if (i === 1 || i === 2) gridClass = "lg:col-span-5 lg:row-span-1 h-[380px] lg:h-full";
                else if (i === 3) gridClass = "lg:col-span-7 lg:row-span-1 h-[380px] lg:h-full";
                else gridClass = "lg:col-span-5 lg:row-span-1 h-[380px] lg:h-full";

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6, delay: i * 0.15 }}
                    key={post.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedPost(post)}
                    className={cn(
                      "group relative overflow-hidden cursor-pointer rounded-3xl w-full",
                      gridClass
                    )}
                    style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)' }}
                  >
                    <Image src={post.gambar} alt={post.judul} fill sizes={isFeatured ? "(max-width: 1024px) 100vw, 60vw" : "(max-width: 1024px) 100vw, 40vw"} className="object-cover transition-transform duration-1000 group-hover:scale-108" />
                    {/* Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, rgba(139,10,26,0.4) 0%, transparent 60%)' }} />
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: 'inset 0 0 0 2px rgba(139,10,26,0.6)' }} />
                    
                    {/* Tag */}
                    <div className="absolute top-6 left-6 flex gap-2 z-20">
                      <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#6B0000]/90 backdrop-blur-md text-white shadow-lg">
                        {post.kategori}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-10 z-20 flex flex-col justify-end">
                      <p className="text-[#D2AD5C] text-xs font-bold uppercase tracking-widest mb-3">
                        {new Date(post.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <h3 className={cn("text-white font-bold drop-shadow-lg leading-tight mb-4", isFeatured ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl")}>
                        {post.judul}
                      </h3>
                      
                      <p className={cn("text-white/80 transition-all duration-500 line-clamp-2", isFeatured ? "text-base md:text-lg mb-6 opacity-100" : "text-sm mb-0 h-0 opacity-0 group-hover:h-auto group-hover:mb-4 group-hover:opacity-100")}>
                        {post.ringkasan}
                      </p>

                      <div className={cn("flex items-center gap-3 transition-opacity duration-500", isFeatured ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                        <div className="w-10 h-0.5 rounded-full bg-[#D2AD5C]" />
                        <span className="text-white text-xs font-bold uppercase tracking-widest group-hover:text-[#D2AD5C] transition-colors">Baca Selengkapnya</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>


        {/* Instagram-style Modal for Postingan */}
        <AnimatePresence>
          {selectedPost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedPost(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white w-[95vw] max-w-[1400px] max-h-[90vh] md:h-[85vh] rounded-2xl md:rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Left Side: Image (Instagram style) */}
                <div className="w-full md:w-[60%] h-[40vh] md:h-full bg-slate-950 relative flex items-center justify-center overflow-hidden group/image">
                   {/* Blur Background */}
                   <Image src={selectedPost.gambar} alt={selectedPost.judul} fill className="object-cover opacity-30 blur-2xl pointer-events-none scale-110" />
                   {/* Main Image */}
                   <Image src={selectedPost.gambar} alt={selectedPost.judul} fill className="object-contain drop-shadow-2xl z-10" />

                   {/* Navigation Arrows */}
                   {postinganDokumentasi && (
                     <>
                        {postinganDokumentasi.findIndex((p:any) => p.id === selectedPost.id) > 0 && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedPost(postinganDokumentasi[postinganDokumentasi.findIndex((p:any) => p.id === selectedPost.id) - 1]); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all md:opacity-0 group-hover/image:opacity-100"
                          >
                             <ChevronLeft className="w-6 h-6" />
                          </button>
                        )}
                        {postinganDokumentasi.findIndex((p:any) => p.id === selectedPost.id) < postinganDokumentasi.length - 1 && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedPost(postinganDokumentasi[postinganDokumentasi.findIndex((p:any) => p.id === selectedPost.id) + 1]); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all md:opacity-0 group-hover/image:opacity-100"
                          >
                             <ChevronRight className="w-6 h-6" />
                          </button>
                        )}
                     </>
                   )}
                </div>

                {/* Right Side: Content */}
                <div className="w-full md:w-[40%] h-[50vh] md:h-full flex flex-col bg-white overflow-hidden">
                   {/* Header Sticky */}
                   <div className="px-6 py-5 md:px-8 md:py-6 border-b border-slate-100 flex items-center justify-between bg-white z-10 shadow-sm">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 border border-red-100 overflow-hidden">
                          <Image src="/logo protokoler.png" width={28} height={28} alt="Protokoler" className="object-contain" />
                       </div>
                       <div>
                         <p className="font-bold text-sm text-slate-900 leading-tight">Protokoler UNP</p>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{selectedPost.kategori}</p>
                       </div>
                     </div>
                     <button onClick={() => setSelectedPost(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                       <X className="w-4 h-4" />
                     </button>
                   </div>

                   {/* Scrollable Content */}
                   <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                       {new Date(selectedPost.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                     </p>
                     <h2 className="text-2xl font-bold text-slate-900 mb-4 leading-tight">{selectedPost.judul}</h2>
                     <p className="text-slate-600 leading-relaxed mb-6">{selectedPost.ringkasan}</p>
                     <div className="flex items-center gap-3 py-4 border-y border-slate-100 my-6">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                           <Megaphone className="w-4 h-4 text-slate-500" />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pengumuman Resmi Divisi Dokumentasi</span>
                     </div>
                   </div>

                   {/* Footer Sticky */}
                   <div className="p-6 md:px-8 md:py-5 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-medium">Postingan ini dikelola oleh Dokumentasi</span>
                      <Button variant="outline" className="rounded-full text-xs h-8 border-slate-200" onClick={() => setSelectedPost(null)}>Tutup</Button>
                   </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>


      {/* Footer */}
      <footer className="relative z-20 pt-20 pb-10" style={{ background: '#020104', borderTop: '1px solid rgba(210,173,92,0.15)' }}>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
            
            {/* Column 1: Brand & About */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative h-14 w-14">
                  <Image src="/logo protokoler.png" alt="Logo Protokoler" fill sizes="56px" className="object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-2xl font-bold text-white tracking-widest leading-none mb-1">PROTOKOLER</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D2AD5C]">Universitas Negeri Padang</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-8">
                Garda terdepan dalam menjaga tata aturan, tata tempat, tata upacara, dan tata penghormatan di lingkungan institusi Universitas Negeri Padang.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-[#6B0000] hover:text-white hover:border-[#6B0000] transition-all duration-300">
                  <Camera className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-[#6B0000] hover:text-white hover:border-[#6B0000] transition-all duration-300">
                  <Play className="w-4 h-4 ml-0.5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-[#6B0000] hover:text-white hover:border-[#6B0000] transition-all duration-300">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Column 2: Tautan Cepat */}
            <div>
              <h3 className="text-white font-bold tracking-widest uppercase text-sm mb-6 flex items-center gap-2">
                <div className="w-4 h-[2px] bg-[#D2AD5C]"></div>
                Tautan Cepat
              </h3>
              <ul className="space-y-4">
                <li><a href="#profil" className="text-slate-400 hover:text-[#D2AD5C] text-sm transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Tentang Kami</a></li>
                <li><a href="#jadwal" className="text-slate-400 hover:text-[#D2AD5C] text-sm transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Jadwal Kegiatan</a></li>
                <li><a href="#sop" className="text-slate-400 hover:text-[#D2AD5C] text-sm transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> SOP & Regulasi</a></li>
                <li><a href="#postingan" className="text-slate-400 hover:text-[#D2AD5C] text-sm transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Berita Terbaru</a></li>
              </ul>
            </div>

            {/* Column 3: Kontak */}
            <div>
              <h3 className="text-white font-bold tracking-widest uppercase text-sm mb-6 flex items-center gap-2">
                <div className="w-4 h-[2px] bg-[#D2AD5C]"></div>
                Hubungi Kami
              </h3>
              <ul className="space-y-5">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#D2AD5C] flex-shrink-0 mt-0.5" />
                  <span className="text-slate-400 text-sm leading-relaxed">Gedung Rektorat UNP Lantai 1, Jl. Prof. Dr. Hamka, Air Tawar Padang, Sumatera Barat.</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#D2AD5C] flex-shrink-0" />
                  <span className="text-slate-400 text-sm">(0751) 7051147</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#D2AD5C] flex-shrink-0" />
                  <span className="text-slate-400 text-sm">protokoler@unp.ac.id</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 font-medium">© {new Date().getFullYear()} Unit Protokoler Universitas Negeri Padang. Hak Cipta Dilindungi.</p>
            <div className="flex items-center gap-6 text-xs text-slate-500">
              <Link href="/tim-pengembang" className="hover:text-white transition-colors font-bold text-[#D2AD5C]">Tim Pengembang</Link>
              <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
