'use client';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, ClipboardList, Users, ShieldCheck, ArrowRight, ChevronDown, Star, ArrowUpRight, Megaphone, Quote, Play, Camera, Trophy, MessageSquare, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { kegiatanApi } from '@/lib/api';
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

const faqs = [
  {
    q: 'Bagaimana cara menjadi anggota protokoler di sistem baru ini?',
    a: "Pendaftaran dapat dilakukan kapan saja melalui portal registrasi. Lengkapi data diri beserta pas foto resmi. Setelah diajukan, akun Anda akan masuk status 'Menunggu Verifikasi' dan akan ditinjau oleh Admin.",
  },
  {
    q: 'Bagaimana sistem perhitungan poin gamifikasi bekerja?',
    a: 'Setiap kegiatan yang berhasil Anda ikuti (hadir dan mengisi evaluasi tepat waktu) akan menambah poin kegiatan Anda. Capai 10 kegiatan untuk medali Silver, dan 20 kegiatan untuk medali Gold.',
  },
  { q: 'Apakah absensi kegiatan harus menggunakan foto selfie?', a: 'Ya. Untuk memastikan transparansi dan kehadiran di lapangan, sistem absensi SiProto v1.2 mewajibkan setiap protokoler dan LO untuk melakukan absensi selfie.' },
  {
    q: 'Bagaimana cara mendapatkan sertifikat elektronik?',
    a: "Sertifikat elektronik akan otomatis diterbitkan di profil Anda jika Anda berstatus 'Hadir' pada kegiatan tersebut dan mengisi form evaluasi 3 Tata Protokol dalam batas waktu 1x24 jam.",
  },
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isScrolled, setIsScrolled] = useState(false);

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
            {['Jadwal', 'Galeri', 'Pengumuman', 'FAQ'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className={cn('text-sm font-semibold transition-colors', isScrolled ? 'text-slate-600 hover:text-orange-500' : 'text-slate-200 hover:text-orange-400')}>
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-5">
                <div className="hidden md:flex flex-col items-end mr-1">
                  <span className={cn('text-sm font-bold leading-tight', isScrolled ? 'text-slate-900' : 'text-slate-100')}>{user.user_metadata?.nama_lengkap || user.email}</span>
                  <span className="text-[10px] text-orange-500 uppercase tracking-[0.2em] font-bold">{role === 'admin' ? 'Pimpinan' : role === 'dokumentasi' ? 'Dokumentasi' : 'Protokoler'}</span>
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
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden min-h-[95vh] flex items-center justify-center">
          {/* Background Image & Overlays */}
          <div className="absolute inset-0 z-0">
            <Image src="/rektorat.jpg" alt="Gedung Rektorat UNP" fill className="object-cover object-top" priority />
            <div className="absolute inset-0 bg-slate-950/80 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-orange-900/20 to-transparent mix-blend-overlay"></div>
          </div>

          {/* Glowing Accents */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/20 rounded-full blur-[150px] pointer-events-none z-0"></div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col items-center justify-center max-w-5xl mx-auto">
              <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center text-center">
                {/* Modern Badge */}
                <motion.div variants={fadeUp} className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-5 py-2 text-sm font-semibold text-orange-200 backdrop-blur-md shadow-lg shadow-orange-500/5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  Sistem Informasi Keprotokolan v1.2
                </motion.div>

                {/* Main Headline */}
                <motion.h1 variants={fadeUp} className="font-display text-5xl font-extrabold leading-[1.1] tracking-tight md:text-6xl lg:text-[5.5rem] text-white drop-shadow-xl">
                  Platform Modern <br />
                  <span className="relative inline-block mt-3">
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-orange-500">PROTOKOLER UNP</span>
                    {/* Soft glow behind text */}
                    <div className="absolute inset-0 bg-orange-500/30 blur-3xl -z-10 rounded-full" />
                  </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p variants={fadeUp} className="mt-10 max-w-2xl text-lg md:text-xl text-slate-300 leading-relaxed font-medium drop-shadow-md">
                  Platform manajemen keprotokolan terintegrasi. Dilengkapi sistem <span className="text-white font-bold">absensi geotagging</span>, <span className="text-white font-bold">gamifikasi kinerja</span>, dan penerbitan{' '}
                  <span className="text-white font-bold">e-Sertifikat</span> otomatis.
                </motion.p>

                {/* Call to Action */}
                <motion.div variants={fadeUp} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                  <Link href={user ? dashboardHref : '/auth'} className="w-full sm:w-auto group">
                    <Button
                      size="lg"
                      className="relative w-full sm:w-auto h-14 rounded-full px-10 text-base shadow-[0_0_40px_-10px_rgba(249,115,22,0.6)] transition-all bg-orange-500 text-white hover:bg-orange-600 hover:scale-105 hover:-translate-y-1 font-bold tracking-wide"
                    >
                      {user ? 'Buka Dashboard' : 'Mulai Sekarang'} <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  {!user && (
                    <a href="#jadwal" className="w-full sm:w-auto group">
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full sm:w-auto h-14 rounded-full px-10 text-base transition-all bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md font-bold"
                      >
                        Lihat Agenda
                      </Button>
                    </a>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Live Stats */}
        <section className="bg-gradient-to-br from-orange-500 to-orange-600 py-16 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-2 gap-10 md:grid-cols-4 divide-x divide-white/20 text-white py-4">
              {[
                { label: 'Anggota Verifikasi', value: '214', suffix: '' },
                { label: 'Kegiatan Terdaftar', value: '84', suffix: '+' },
                { label: 'Medali Gold', value: '12', suffix: '' },
                { label: 'Sertifikat Terbit', value: '940', suffix: '' },
              ].map((s, i) => (
                <motion.div initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1, type: 'spring' }} key={i} className="text-center px-4">
                  <div className="text-4xl md:text-5xl font-display font-bold mb-3 text-white">
                    {s.value}
                    <span className="text-orange-100 text-2xl md:text-3xl ml-1">{s.suffix}</span>
                  </div>
                  <div className="text-sm font-semibold text-orange-100 uppercase tracking-widest">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Jadwal Kegiatan */}
        <section id="jadwal" className="py-24 md:py-32 bg-slate-50 relative">
          <div className="container mx-auto px-6">
            <div className="mb-16 max-w-3xl text-center mx-auto">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-xs font-bold text-orange-500 mb-2 uppercase tracking-[0.2em]">
                Agenda Publik
              </motion.div>
              <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                Kegiatan Mendatang
              </motion.h2>
              <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-6 text-slate-600 text-lg md:text-xl">
                Jadwal kegiatan resmi tingkat universitas yang akan dan sedang berlangsung.
              </motion.p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-slate-400">
                <span className="animate-pulse">Memuat jadwal kegiatan...</span>
              </div>
            ) : kegiatanPublik && kegiatanPublik.length > 0 ? (
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={staggerContainer} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {kegiatanPublik.map((k: any, i: number) => (
                  <motion.div whileHover={{ scale: 1.02, y: -5 }} variants={zoomIn} key={k.id || i} className="group bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-orange-50 flex flex-col justify-between">
                    <div>
                      <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-orange-50 text-orange-600 px-3 py-1 text-xs font-bold uppercase tracking-widest border border-orange-100">
                        {k.bentuk_kegiatan?.replace(/_/g, ' ')}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4 leading-snug group-hover:text-orange-500 transition-colors">{k.nama_kegiatan}</h3>
                      <div className="space-y-2 text-sm text-slate-600 mb-6">
                        <div className="flex items-start gap-2">
                          <CalendarDays className="h-4 w-4 shrink-0 mt-0.5 text-orange-400" />
                          <span>{new Date(k.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 shrink-0 mt-0.5 text-orange-400" />
                          <span>{k.jam_mulai?.slice(0, 5)} - {k.jam_selesai?.slice(0, 5)} WIB</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-orange-400" />
                          <span>{k.lokasi}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className={cn('text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest', k.status === 'berlangsung' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700')}>{k.status}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-20 bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl">
                <CalendarDays className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium text-lg">Belum ada kegiatan publik yang dijadwalkan.</p>
              </div>
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

        {/* Berita & Pengumuman */}
        <section id="pengumuman" className="bg-slate-50 py-24 md:py-32 relative border-t border-slate-200">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeLeft} className="max-w-2xl">
                <div className="text-xs font-bold text-orange-500 mb-2 uppercase tracking-[0.2em]">Informasi</div>
                <h2 className="font-display text-4xl font-bold text-slate-900 md:text-5xl">Pengumuman Terbaru</h2>
                <p className="mt-6 text-slate-600 text-lg md:text-xl">Informasi dan agenda penting terkait kegiatan keprotokolan.</p>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeRight}>
                <Button variant="outline" className="shrink-0 bg-white border-slate-300 h-12 px-6 rounded-none font-bold hover:bg-slate-100 transition-colors">
                  Lihat Semua <ArrowUpRight className="ml-2 h-4 w-4 text-slate-400" />
                </Button>
              </motion.div>
            </div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: 'Sistem Baru Protokoler v1.2 Resmi Diluncurkan',
                  date: '10 Juni 2026',
                  desc: 'Pembaruan besar-besaran dengan penambahan fitur absensi mandiri dan sertifikasi digital otomatis berdasarkan kinerja. Wajib dibaca panduan terbarunya!',
                },
                { title: 'Open Recruitment Anggota Baru', date: '01 Juni 2026', desc: 'Pendaftaran calon anggota baru keprotokolan telah dibuka melalui modul registrasi baru. Lengkapi berkas dan foto resmi Anda.' },
              ].map((news, i) => (
                <motion.div whileHover={{ scale: 1.02, y: -5 }} variants={fadeUp} key={i} className="flex flex-col sm:flex-row gap-6 sm:gap-8 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 hover:shadow-xl hover:shadow-orange-50 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-orange-50 border border-orange-100 text-orange-500">
                    <Megaphone className="h-8 w-8 sm:h-10 sm:w-10" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-orange-500 mb-2 uppercase tracking-widest">{news.date}</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug">{news.title}</h3>
                    <p className="text-slate-600 text-base leading-relaxed">{news.desc}</p>
                  </div>
                </motion.div>
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

        {/* FAQ Section */}
        <section id="faq" className="py-24 md:py-32 bg-white relative">
          <div className="container mx-auto px-6 max-w-4xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
              <div className="text-xs font-bold text-orange-500 mb-2 uppercase tracking-[0.2em]">FAQ</div>
              <h2 className="font-display text-4xl font-bold text-slate-900 md:text-5xl">Pertanyaan Sering Diajukan</h2>
              <p className="mt-6 text-slate-600 text-lg md:text-xl">Informasi mengenai fitur dan alur baru pada SiProto v1.2.</p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-4">
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <motion.div variants={fadeUp} key={i} className={cn('bg-white/60 backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-300 border', isOpen ? 'border-orange-200 shadow-md shadow-orange-50' : 'border-white/80 hover:border-orange-100')}>
                    <button onClick={() => setOpenFaq(isOpen ? null : i)} className="w-full flex items-center justify-between p-6 text-left focus:outline-none">
                      <span className={cn('font-bold text-lg md:text-xl pr-8 transition-colors duration-300', isOpen ? 'text-slate-900' : 'text-slate-700')}>{faq.q}</span>
                      <div className={cn('shrink-0 h-10 w-10 flex items-center justify-center transition-all duration-500 rounded-xl', isOpen ? 'bg-orange-500 text-white rotate-180' : 'bg-slate-100 text-slate-500')}>
                        <ChevronDown className="h-5 w-5" />
                      </div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                          <div className="p-6 pt-0 text-slate-600 text-base md:text-lg leading-relaxed border-t border-slate-100 mt-2">{faq.a}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
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
