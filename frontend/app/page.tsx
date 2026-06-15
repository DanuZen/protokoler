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
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-orange-500/20 overflow-x-hidden font-sans">
      {/* Interactive Dynamic Navbar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-300', isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/60 py-3' : 'bg-transparent py-5')}
      >
        <div className="container mx-auto flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-12 w-12 overflow-hidden transition-transform group-hover:scale-105">
              <Image src="/logo protokoler.png" alt="Logo Protokoler" fill sizes="48px" className="object-contain" priority />
            </div>
            <div className="flex flex-col">
              <span className={cn('font-display text-xl font-bold tracking-tight leading-none mb-1', isScrolled ? 'text-slate-900' : 'text-white')}>PROTOKOLER</span>
              <span className={cn('text-[9px] font-bold uppercase tracking-[0.2em]', isScrolled ? 'text-slate-400' : 'text-slate-300')}>UNIVERSITAS NEGERI PADANG</span>
            </div>
          </Link>
          <nav className="hidden gap-8 lg:flex items-center">
            {[{ label: 'Jadwal', href: '#jadwal' }, { label: 'Galeri', href: '#galeri' }].map((item) => (
              <a key={item.label} href={item.href} className={cn('text-sm font-semibold transition-colors', isScrolled ? 'text-slate-600 hover:text-orange-500' : 'text-slate-200 hover:text-orange-400')}>
                {item.label}
              </a>
            ))}
            <Link href="/faq" className={cn('text-sm font-semibold transition-colors', isScrolled ? 'text-slate-600 hover:text-orange-500' : 'text-slate-200 hover:text-orange-400')}>
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-5">
                <div className="hidden md:flex flex-col items-end mr-1">
                  <span className={cn('text-sm font-bold leading-tight', isScrolled ? 'text-slate-900' : 'text-slate-100')}>{user.user_metadata?.nama_lengkap || user.email}</span>
                  <span className="text-[10px] text-white/70 uppercase tracking-[0.2em] font-bold">{role === 'admin' ? 'Pimpinan' : role === 'dokumentasi' ? 'Dokumentasi' : 'Protokoler'}</span>
                </div>
                <Link href={dashboardHref}>
                  <Button className="rounded-xl shadow-sm transition-all px-6 bg-orange-500 text-white hover:bg-orange-600 h-10 font-bold">Dashboard</Button>
                </Link>
              </div>
            ) : (
              <Link href="/auth">
                <Button className="rounded-xl shadow-sm transition-all px-6 bg-orange-500 text-white hover:bg-orange-600 h-10 font-bold">Masuk Sistem</Button>
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
        <section id="jadwal" className="py-24 md:py-32 bg-[#0f0a0a] relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #6b0000 0%, transparent 50%), radial-gradient(circle at 80% 20%, #1e293b 0%, transparent 50%)' }} />
          <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
            {/* Header */}
            <div className="mb-16 text-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-xs font-bold text-orange-400 mb-3 uppercase tracking-[0.3em]">
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
              <div className="flex items-center justify-center py-20 text-slate-400">
                <span className="animate-pulse">Memuat jadwal kegiatan...</span>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={fadeUp}
                className="grid md:grid-cols-[420px_1fr] gap-6"
              >
                {/* Left: Calendar Card */}
                <div className="bg-gradient-to-br from-[#2a0a0a] to-[#1a0505] p-8 md:p-10 flex flex-col gap-6 rounded-3xl border border-white/10 shadow-2xl">
                  <div>
                    <p className="text-xs font-bold text-orange-400 uppercase tracking-[0.2em] mb-1">Kalender</p>
                    <p className="text-white font-bold text-2xl">Pilih Tanggal</p>
                  </div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={id}
                    className="bg-white/5 rounded-2xl border border-white/10 p-4 text-white w-full"
                  />
                  <div className="mt-auto pt-4 border-t border-white/10">
                    <p className="text-slate-400 text-sm">
                      Tanggal dipilih:{' '}
                      <span className="text-orange-400 font-bold">
                        {selectedDate?.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) ?? '—'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Right: Event Details Card */}
                <div className="bg-gradient-to-br from-[#111827] to-[#0f172a] p-8 md:p-12 flex flex-col rounded-3xl border border-white/10 shadow-2xl">
                  {(() => {
                    const event = kegiatanPublik?.find((k: any) => selectedDate && new Date(k.tanggal).toDateString() === selectedDate.toDateString());

                    if (!event) {
                      return (
                        <div className="h-full flex flex-col items-center justify-center text-center py-16 text-slate-500">
                          <CalendarDays className="h-20 w-20 mx-auto mb-6 opacity-10" />
                          <p className="font-bold text-xl text-slate-400">Tidak ada agenda pada tanggal ini.</p>
                          <p className="text-sm mt-2 text-slate-500">Pilih tanggal lain di kalender untuk melihat jadwal kegiatan.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="flex flex-col gap-6">
                        <div>
                          <p className="text-xs font-bold text-orange-400 uppercase tracking-[0.2em] mb-1">Detail Acara</p>
                          <h3 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">{event.nama_kegiatan}</h3>
                          <p className="text-slate-400 mt-2">
                            {selectedDate?.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-transparent rounded-full" />
                        <div className="grid sm:grid-cols-2 gap-4">
                          {[
                            { icon: MapPin, label: 'Lokasi', value: event.lokasi },
                            { icon: Clock, label: 'Waktu Mulai', value: `${event.jam_mulai?.slice(0, 5)} WIB` },
                            { icon: Users, label: 'Pimpinan', value: event.tamu_vvip?.join(', ') || 'Pimpinan Universitas' },
                            { icon: Megaphone, label: 'Status', value: event.status?.toUpperCase() },
                          ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.08] transition-colors">
                              <div className="flex items-center gap-2 mb-2">
                                <Icon className="h-4 w-4 text-orange-400" />
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
                              </div>
                              <p className={`font-bold text-base ${label === 'Status' && event.status === 'berlangsung' ? 'text-emerald-400' : 'text-white'}`}>
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
        <section id="galeri" className="py-24 md:py-32 bg-white relative border-t border-slate-200">
          <div className="container mx-auto px-6">
            <div className="mb-16 max-w-3xl text-center mx-auto">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-xs font-bold text-orange-500 mb-2 uppercase tracking-[0.2em]">
                Galeri
              </motion.div>
              <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                Dedikasi di Lapangan
              </motion.h2>
              <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-6 text-slate-600 text-lg md:text-xl">
                Potret momen-momen penting tim protokoler dalam menyukseskan berbagai kegiatan universitas tingkat tinggi.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { src: '/gallery_1.png', alt: 'Persiapan Acara VIP', caption: 'Persiapan Acara VIP' },
                { src: '/gallery_2.png', alt: 'Pengarahan Tamu', caption: 'Pengarahan Tamu Resmi' },
                { src: '/gallery_3.png', alt: 'Wisuda', caption: 'Upacara Wisuda Universitas' },
              ].map((img, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                  key={i}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl bg-slate-100 border border-slate-200"
                >
                  <Image src={img.src} alt={img.alt} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-4 transition-transform duration-500 group-hover:translate-y-0">
                    <p className="text-white font-bold text-2xl mb-1">{img.caption}</p>
                    <div className="w-12 h-1 bg-orange-500 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* Regulasi & SOP — Card Grid Style */}
        <section className="py-24 md:py-32 bg-white relative border-t border-slate-200">
          <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12">
            <div className="mb-16 max-w-3xl text-center mx-auto">
              <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                Panduan Praktis Protokol
              </motion.h2>
              <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-4 text-slate-500 text-lg">
                Temukan SOP penting dan mendasar untuk kelancaran kegiatan Anda.
              </motion.p>
            </div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-6 lg:gap-10 w-full mx-auto"
            >
              {regulasiMockData.map((reg: any, i: number) => (
                <motion.a
                  href={reg.link_dokumen}
                  key={reg.id}
                  variants={zoomIn}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="group block rounded-2xl overflow-hidden shadow-lg border border-slate-200 hover:shadow-2xl hover:border-orange-300 transition-all duration-300 bg-white cursor-pointer relative"
                >
                  {/* Card Header — Dark background with text */}
                  <div className="relative h-64 p-6 flex flex-col justify-center items-center text-center overflow-visible" style={{ background: reg.accentGradient }}>
                    {/* Background pattern dots */}
                    <div className="absolute inset-0 opacity-10"
                      style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                    />

                    {/* Centered Text */}
                    <div className="relative z-10 px-4">
                      <p className="text-white/80 text-sm font-bold uppercase tracking-widest mb-2">
                        STANDAR OPERASIONAL PROSEDUR
                      </p>
                      <h3 className="font-display font-black text-white text-3xl md:text-4xl leading-tight uppercase drop-shadow-md">
                        {reg.judul}
                      </h3>
                    </div>

                    {/* Floating Document Icon (Half inside header, half inside body) */}
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 z-20">
                      <div className="flex items-center justify-center h-14 w-14 rounded-full bg-white shadow-md border-4 border-slate-50 text-slate-700 group-hover:text-orange-600 transition-colors duration-300">
                        <FileText className="h-6 w-6 fill-current opacity-20" />
                        <FileText className="h-6 w-6 absolute" strokeWidth={2} />
                      </div>
                    </div>
                  </div>

                  {/* Card Body — Description */}
                  <div className="p-8 pt-12 bg-white flex flex-col items-center text-center">
                    <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-[90%]">
                      {reg.deskripsi}
                    </p>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          </div>
        </section>


        {/* Testimoni */}
        <section className="py-24 md:py-32 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-3 gap-16 items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeLeft} className="lg:col-span-1">
                <div className="text-xs font-bold text-orange-500 mb-2 uppercase tracking-[0.2em]">Testimoni</div>
                <h2 className="font-display text-4xl font-bold text-white md:text-5xl mb-6 leading-tight">
                  Suara dari <br />
                  <span className="text-orange-400">Tim & Tamu</span>
                </h2>
                <p className="text-slate-300 mb-10 text-lg md:text-xl leading-relaxed">Dampak langsung dari penggunaan sistem terpadu keprotokolan, dinilai langsung oleh tim lapangan dan tamu VVIP.</p>
                <div className="flex gap-2">
                  <Star className="fill-orange-400 text-orange-400 h-7 w-7" />
                  <Star className="fill-orange-400 text-orange-400 h-7 w-7" />
                  <Star className="fill-orange-400 text-orange-400 h-7 w-7" />
                  <Star className="fill-orange-400 text-orange-400 h-7 w-7" />
                  <Star className="fill-orange-400 text-orange-400 h-7 w-7" />
                </div>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="lg:col-span-2 grid md:grid-cols-2 gap-8">
                {[
                  { name: 'Dr. Budi Santoso', role: 'Pembina Protokoler', text: 'Fitur evaluasi 3 Tata Protokol memastikan tidak ada celah di lapangan. Modul gamifikasi juga memacu mahasiswa untuk terus aktif.' },
                  { name: 'Siti Nurhaliza', role: 'Protokoler (Gold)', text: 'Absensi selfie membuat kami lebih teratur dan adil. Poin kegiatan langsung terakumulasi untuk mengejar sertifikat tertinggi!' },
                ].map((testi, i) => (
                  <motion.div whileHover={{ scale: 1.02, y: -5 }} variants={fadeUp} key={i} className="p-10 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 relative hover:bg-white/20 transition-all duration-300 shadow-xl">
                    <Quote className="absolute top-8 right-8 h-12 w-12 text-white/10" />
                    <p className="text-slate-200 italic relative z-10 leading-relaxed mb-8 text-lg font-medium">"{testi.text}"</p>
                    <div>
                      <h4 className="font-bold text-white text-xl">{testi.name}</h4>
                      <p className="text-sm text-orange-400 font-bold mt-1 uppercase tracking-wider">{testi.role}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      </main>


      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-900 py-12 relative z-20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image src="/logo protokoler.png" alt="Logo Protokoler" fill sizes="40px" className="object-contain grayscale opacity-50" />
            </div>
            <span className="font-display text-xl font-bold text-white tracking-widest">PROTOKOLER</span>
          </div>
          <p className="text-sm text-slate-500 font-medium">© {new Date().getFullYear()} Unit Protokoler Universitas. Hak Cipta Dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
