'use client';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, ClipboardList, Users, ShieldCheck, ArrowRight, ChevronDown, Star, ArrowUpRight, Megaphone, Quote, Play, Camera, Trophy, MessageSquare, MapPin, Clock, BookOpen, FileText, ExternalLink, X, ChevronLeft, ChevronRight, Mail, Phone, Download, Mic, UserCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { kegiatanApi, postinganApi, regulasiMockData } from '@/lib/api';
import { Calendar } from '@/components/ui/calendar';
import { id } from 'date-fns/locale';
import { useAuth, useRole } from '@/hooks/use-auth';
import { LandingNavbar } from '@/components/landing-navbar';
import { LandingFooter } from '@/components/landing-footer';
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

function PostCard({ post, isFeatured, onClick }: { post: any, isFeatured: boolean, onClick: () => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const images = post.images || [post.gambar || '/gallery_1.png'];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  let gridClass = "h-[360px] md:h-[400px]";
  if (isFeatured) {
    gridClass += " md:col-span-2 lg:col-span-2";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden cursor-pointer rounded-3xl w-full",
        gridClass
      )}
      style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)' }}
    >
      {/* Slider Images */}
      {images.map((img: string, idx: number) => (
        <motion.div
          key={img + idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: idx === activeIdx ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 z-0"
        >
          <Image 
            src={img} 
            alt={post.judul} 
            fill 
            sizes={isFeatured ? "(max-width: 1024px) 100vw, 60vw" : "(max-width: 1024px) 100vw, 40vw"} 
            className="object-cover transition-transform duration-1000 group-hover:scale-108" 
          />
        </motion.div>
      ))}

      {/* Slide Navigation Buttons */}
      {images.length > 1 && (
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-20 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={handlePrev} 
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={handleNext} 
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}


      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500 z-10" />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" style={{ background: 'linear-gradient(135deg, rgba(139,10,26,0.4) 0%, transparent 60%)' }} />
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" style={{ boxShadow: 'inset 0 0 0 2px rgba(139,10,26,0.6)' }} />
      
      {/* Tag */}
      <div className="absolute top-6 left-6 flex gap-2 z-20">
        <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#6B0000]/90 backdrop-blur-md text-white shadow-lg">
          {post.kategori}
        </span>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 z-20 flex flex-col justify-end">
        <p className="text-[#D2AD5C] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2">
          {new Date(post.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <h3 className={cn("text-white font-bold drop-shadow-lg leading-tight mb-3", isFeatured ? "text-2xl md:text-3xl" : "text-xl md:text-2xl")}>
          {post.judul}
        </h3>
        
        <p className={cn("text-white/80 transition-all duration-500 line-clamp-2", isFeatured ? "text-sm md:text-base mb-5 opacity-100" : "text-sm mb-0 h-0 opacity-0 group-hover:h-auto group-hover:mb-4 group-hover:opacity-100")}>
          {post.ringkasan}
        </p>

        <div className={cn("flex items-center gap-3 transition-opacity duration-500", isFeatured ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
          <div className="w-8 h-[2px] rounded-full bg-[#D2AD5C]" />
          <span className="text-white text-[10px] md:text-xs font-bold uppercase tracking-widest group-hover:text-[#D2AD5C] transition-colors">Baca Selengkapnya</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [modalPhotoIdx, setModalPhotoIdx] = useState(0);

  const handleSelectPost = (post: any) => {
    setSelectedPost(post);
    setModalPhotoIdx(0);
  };


  const { user } = useAuth();
  const { data: role } = useRole(user);
  const dashboardHref = role === 'admin' ? '/dashboard' : role === 'dokumentasi' ? '/dokumentasi/dashboard' : '/beranda';

  const { data: kegiatanPublik, isLoading } = useQuery({
    queryKey: ['kegiatan-publik-landing'],
    queryFn: () => kegiatanApi.list(),
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
      <LandingNavbar />

      <main className="relative z-10">
        {/* Redesigned Premium Hero Section */}
        <section className="relative min-h-dvh flex items-center justify-center overflow-hidden">
          {/* Background Video (YouTube) & Overlays */}
          <div className="absolute inset-0 z-0 bg-slate-950">
            <iframe 
              src="https://www.youtube.com/embed/t6gKixOHNuc?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=t6gKixOHNuc&playsinline=1&start=43&cc_load_policy=0&iv_load_policy=3" 
              className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-60 mix-blend-luminosity"
              style={{ border: 'none' }}
            />
            
            {/* Sophisticated Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#4A0000]/80 via-black/60 to-[#020104] pointer-events-none z-10"></div>
            
            {/* Glowing Orbs for Depth */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/30 rounded-full blur-[120px] pointer-events-none mix-blend-screen z-10"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D2AD5C]/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen z-10"></div>
          </div>

          <div className="container mx-auto px-6 relative z-20 flex flex-col items-center text-center mt-16 pb-24 md:pb-0">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center max-w-5xl">
              
              {/* Premium Badge */}
              <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 md:gap-4 mb-8">
                <div className="w-6 md:w-12 h-[2px] bg-[#D2AD5C]"></div>
                <span className="text-[10px] sm:text-xs md:text-sm font-bold text-[#D2AD5C] uppercase tracking-widest md:tracking-[0.25em] whitespace-nowrap">Garda Terdepan Universitas</span>
                <div className="w-6 md:w-12 h-[2px] bg-[#D2AD5C]"></div>
              </motion.div>

              {/* Main Headline */}
              <motion.h1 variants={fadeUp} className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-[5.5rem] font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-2xl mb-8">
                Protokoler <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D2AD5C] via-[#eecf83] to-[#D2AD5C]">Universitas Negeri Padang</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p variants={fadeUp} className="text-sm sm:text-base md:text-xl text-slate-300 leading-relaxed font-medium max-w-3xl drop-shadow-md mb-12 px-4 sm:px-0">
                Menjaga kehormatan institusi melalui <span className="text-white font-bold">tata tempat, tata upacara, dan tata penghormatan</span> yang presisi. Kami adalah garda terdepan dalam pelayanan prima.
              </motion.p>
              
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-6 sm:px-0 sm:w-auto">
                <a href="#profil" className="w-full sm:w-auto flex justify-center">
                  <Button className="w-auto sm:w-auto h-11 md:h-14 px-8 md:px-10 rounded-full bg-gradient-to-r from-[#6B0000] to-[#8B0A1A] hover:from-[#8B0A1A] hover:to-[#6B0000] text-white font-bold uppercase tracking-widest text-[11px] shadow-[0_0_30px_rgba(107,0,0,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(107,0,0,0.7)] border-none">
                    Eksplorasi Profil
                  </Button>
                </a>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll Down Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20"
          >
            <span className="text-[9px] text-white/50 uppercase tracking-[0.4em] font-bold">Gulir Ke Bawah</span>
            <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center p-1 relative bg-black/20 backdrop-blur-sm">
              <motion.div 
                animate={{ y: [0, 12, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="w-1.5 h-3 bg-[#D2AD5C] rounded-full shadow-[0_0_10px_rgba(210,173,92,0.8)]"
              />
            </div>
          </motion.div>
        </section>

        {/* Profil & Nilai Inti (About Us) */}
        <section id="profil" className="py-16 md:py-32 relative overflow-hidden bg-white">
          <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
            <div className="flex flex-col-reverse lg:flex-row-reverse items-center gap-12 lg:gap-20">
              
              {/* Left: Image Collage */}
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeRight}
                className="w-full lg:w-[45%] relative mt-4 lg:mt-0"
              >
                <div className="relative w-full max-w-[300px] sm:max-w-[400px] lg:max-w-[500px] aspect-square mx-auto lg:mx-0">
                   {/* Main Image */}
                   <div className="absolute top-0 right-0 w-[85%] h-[85%] rounded-[2rem] overflow-hidden shadow-2xl">
                     <Image src="/team-collab.png" alt="Tim Protokoler" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                   </div>
                   {/* Secondary Image */}
                   <motion.div 
                     whileHover={{ y: -10 }}
                     className="absolute bottom-0 left-0 w-[55%] h-[55%] rounded-3xl overflow-hidden shadow-2xl border-8 border-white"
                   >
                     <Image src="/rektorat.jpg" alt="Rektorat UNP" fill sizes="(max-width: 1024px) 50vw, 30vw" className="object-cover" />
                   </motion.div>
                </div>
                
                {/* Mobile Action Button (Bottom of Image) */}
                <div className="flex lg:hidden justify-center mt-10">
                   <Link href="/tentang" className="w-full max-w-[260px] sm:max-w-none sm:w-auto">
                     <Button className="w-full bg-[#6B0000] hover:bg-[#6A0814] text-white rounded-full px-8 py-6 text-sm font-bold tracking-wide shadow-lg shadow-red-900/20 group">
                       Kenali Kami Lebih Dekat <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                     </Button>
                   </Link>
                </div>
              </motion.div>

              {/* Right: Content */}
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeLeft}
                className="w-full lg:w-[55%] flex flex-col justify-center"
              >
                <div className="flex items-center justify-center lg:justify-start gap-3 md:gap-4 mb-3">
                  <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C]"></div>
                  <span className="text-[10px] sm:text-xs md:text-sm font-bold text-[#6B0000] uppercase tracking-widest md:tracking-[0.25em] whitespace-nowrap">Tentang Kami</span>
                  <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C] block lg:hidden"></div>
                </div>
                
                <h2 className="font-display text-2xl sm:text-3xl md:text-5xl lg:text-[3.5rem] font-bold text-slate-900 leading-[1.3] md:leading-[1.2] tracking-tight mb-6 text-balance text-center lg:text-left">
                  Menjaga Kehormatan,<br className="block md:hidden" /> Memastikan<br className="block md:hidden" /> <span className="text-[#6B0000]">Kesempurnaan</span> Acara.
                </h2>
                
                <p className="text-slate-600 text-sm sm:text-base md:text-xl leading-relaxed mb-10 max-w-2xl text-center lg:text-left px-4 lg:px-0">
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
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-[#6B0000]">
                      <Star className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Pelayanan Prima (Service Excellence)</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">Memberikan layanan VVIP yang hangat, profesional, dan berstandar nasional.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-[#6B0000]">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Sinergi & Kekompakan Tim</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">Kolaborasi solid antar anggota dan pimpinan demi mewujudkan acara yang sukses dan berkesan.</p>
                    </div>
                  </div>
                </div>

                <Link href="/tentang" className="hidden lg:block w-fit">
                  <Button className="w-fit bg-[#6B0000] hover:bg-[#6A0814] text-white rounded-full px-8 py-6 text-sm font-bold tracking-wide shadow-lg shadow-red-900/20 group">
                    Kenali Kami Lebih Dekat <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
              
            </div>
          </div>
        </section>

        {/* Jadwal Kegiatan */}
        <section id="jadwal" className="py-16 md:py-32 relative overflow-hidden bg-slate-50">
          {/* Decorative orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-[0.07] blur-3xl" style={{ background: 'radial-gradient(circle, #6B0000 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-[0.05] blur-3xl" style={{ background: 'radial-gradient(circle, #D2AD5C 0%, transparent 70%)' }} />

          <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
            {/* Header */}
            <div className="mb-16 text-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex items-center justify-center gap-3 md:gap-4 mb-4">
                <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C]"></div>
                <span className="text-[10px] sm:text-xs md:text-sm font-bold text-[#6B0000] uppercase tracking-widest md:tracking-[0.25em] whitespace-nowrap">Agenda</span>
                <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C]"></div>
              </motion.div>
              <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                Kegiatan <span className="text-[#6B0000]">Mendatang</span>
              </motion.h2>
              <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-2 sm:mt-4 text-slate-500 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4 sm:px-0">
                Jadwal kegiatan resmi tingkat universitas yang akan dan sedang berlangsung.
              </motion.p>
            </div>

            {isLoading ? (
              <div className="grid lg:grid-cols-[360px_1fr] xl:grid-cols-[400px_1fr] gap-5 md:gap-8 animate-pulse">
                {/* Skeleton Left: Calendar */}
                <div className="bg-white p-5 sm:p-7 md:p-9 flex flex-col gap-5 rounded-3xl border border-slate-200 shadow-lg w-full h-[400px]">
                  <div>
                    <div className="h-3 bg-slate-200 rounded w-1/3 mb-3"></div>
                    <div className="h-6 bg-slate-200 rounded w-1/2 mb-6"></div>
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-xl"></div>
                </div>
                {/* Skeleton Right: Details */}
                <div className="bg-white p-6 sm:p-8 md:p-10 flex flex-col rounded-[2rem] border border-slate-200 shadow-lg w-full h-[400px]">
                  <div className="h-3 bg-slate-200 rounded w-1/4 mb-4"></div>
                  <div className="h-10 bg-slate-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-10"></div>
                  <div className="grid sm:grid-cols-2 gap-4 mt-auto">
                    <div className="h-24 bg-slate-100 rounded-2xl"></div>
                    <div className="h-24 bg-slate-100 rounded-2xl"></div>
                    <div className="h-24 bg-slate-100 rounded-2xl"></div>
                    <div className="h-24 bg-slate-100 rounded-2xl"></div>
                  </div>
                </div>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={fadeUp}
                className="grid lg:grid-cols-[360px_1fr] xl:grid-cols-[400px_1fr] gap-5 md:gap-8"
              >
                {/* Left: Calendar Card */}
                <div className="bg-white p-5 sm:p-7 md:p-9 flex flex-col gap-5 rounded-3xl border border-slate-200 shadow-lg w-full max-w-full overflow-hidden">
                  <div>
                    <p className="text-[10px] font-bold text-[#6B0000] uppercase tracking-[0.3em] mb-1">Kalender Acara</p>
                    <p className="text-slate-900 font-bold text-xl">Pilih Tanggal</p>
                  </div>
                  <div className="w-full overflow-x-auto pb-1 flex justify-center custom-scrollbar">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      locale={id}
                      className="rounded-2xl border border-slate-100 p-2 sm:p-3 text-slate-900 bg-slate-50"
                      modifiers={{
                        hasEvent: kegiatanPublik?.map((k: any) => new Date(k.tanggal)) || [],
                      }}
                    />
                  </div>
                  <div className="mt-auto pt-4 border-t border-white/10">
                    <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Tanggal Dipilih</p>
                    <p className="text-[#6B0000] font-bold text-sm">
                      {selectedDate?.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) ?? '—'}
                    </p>
                  </div>
                </div>

                {/* Right: Event Details Card */}
                <div className="bg-white p-6 sm:p-8 md:p-10 flex flex-col rounded-[2rem] border border-slate-200 shadow-lg w-full max-w-full overflow-hidden">
                  {(() => {
                    const event = kegiatanPublik?.find((k: any) => selectedDate && new Date(k.tanggal).toDateString() === selectedDate.toDateString());

                    if (!event) {
                      return (
                        <div className="h-full flex flex-col">
                          <div>
                            <p className="text-[10px] font-bold text-[#6B0000] uppercase tracking-[0.3em] mb-1">Detail Acara</p>
                            <p className="text-slate-900 font-bold text-xl">
                              {selectedDate?.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) ?? 'Belum ada tanggal dipilih'}
                            </p>
                          </div>
                          <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-slate-50 border border-slate-100 shadow-sm">
                              <CalendarDays className="h-10 w-10 text-slate-300" />
                            </div>
                            <p className="font-bold text-lg text-slate-700">Tidak ada agenda</p>
                            <p className="text-sm mt-2 text-slate-400 max-w-[250px] mx-auto">Tidak ada kegiatan yang dijadwalkan pada tanggal ini.</p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="flex flex-col h-full">
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-4">
                             <p className="text-[10px] font-bold text-[#6B0000] uppercase tracking-[0.3em]">Detail Acara</p>
                             <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${event.status === 'berlangsung' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                               {event.status}
                             </span>
                          </div>
                          <h3 className="font-display text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-3">{event.nama_kegiatan}</h3>
                          <p className="text-slate-500 text-sm flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-slate-400" />
                            {selectedDate?.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>

                        <div className="w-full h-px bg-slate-100 my-2" />

                        <div className="flex-1 mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-6">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                              <Clock className="w-4 h-4 text-[#6B0000]" />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Waktu</p>
                              <p className="font-bold text-slate-900 text-sm">{event.jam_mulai?.slice(0, 5) || '--:--'} - {event.jam_selesai?.slice(0, 5) || 'Selesai'} WIB</p>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                              <MapPin className="w-4 h-4 text-[#6B0000]" />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lokasi</p>
                              <p className="font-bold text-slate-900 text-sm line-clamp-2">{event.lokasi}</p>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                              <Users className="w-4 h-4 text-[#6B0000]" />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tamu / Pimpinan</p>
                              <p className="font-bold text-slate-900 text-sm line-clamp-2">
                                {event.tamu_vvip && Array.isArray(event.tamu_vvip) && event.tamu_vvip.length > 0 
                                  ? event.tamu_vvip.map((t: any) => t.nama_tamu).filter(Boolean).join(', ') 
                                  : 'Pimpinan Universitas'}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                              <Megaphone className="w-4 h-4 text-[#6B0000]" />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bentuk Kegiatan</p>
                              <p className="font-bold text-slate-900 text-sm capitalize">{event.bentuk_kegiatan ? event.bentuk_kegiatan.replace('_', ' ') : '-'}</p>
                            </div>
                          </div>

                          {event.audience && (
                            <div className="flex gap-4">
                              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                <UserCheck className="w-4 h-4 text-[#6B0000]" />
                              </div>
                              <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Peserta</p>
                                <p className="font-bold text-slate-900 text-sm line-clamp-2">{event.audience}</p>
                              </div>
                            </div>
                          )}

                          {event.keynote && (
                            <div className="flex gap-4">
                              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                <Mic className="w-4 h-4 text-[#6B0000]" />
                              </div>
                              <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Narasumber / Keynote</p>
                                <p className="font-bold text-slate-900 text-sm line-clamp-2">{event.keynote}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {event.rundown_url && (
                          <div className="mt-8 pt-4 border-t border-slate-100">
                             <a href={event.rundown_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200 transition-colors">
                                <ExternalLink className="w-4 h-4" /> Lihat Rundown Acara
                             </a>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Regulasi & SOP — Split Layout Style */}
        <section id="prosedur" className="py-16 md:py-32 relative overflow-hidden bg-slate-50 border-t border-slate-100">
          {/* Decorative mesh */}
          <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6B0000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col items-center gap-12 lg:gap-16">
              
              {/* Top Side: Intro (Centered) */}
              <div className="flex flex-col items-center text-center max-w-3xl">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex items-center justify-center gap-3 md:gap-4 mb-5">
                  <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C]"></div>
                  <span className="text-[10px] sm:text-xs md:text-sm font-bold text-[#6B0000] uppercase tracking-widest md:tracking-[0.25em] whitespace-nowrap">Prosedur</span>
                  <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C]"></div>
                </motion.div>
                <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4 sm:mb-6 leading-tight">
                  SOP Praktis <span className="text-[#6B0000]">Protokol</span>
                </motion.h2>
                <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-slate-500 text-sm sm:text-base md:text-lg leading-relaxed px-4 lg:px-0">
                  Temukan Standard Operating Procedure (SOP) penting dan mendasar untuk menjamin kelancaran setiap kegiatan resmi Universitas.
                </motion.p>
              </div>

              {/* Bottom Side: Interactive Cards */}
              <div className="w-full flex flex-col lg:grid lg:grid-cols-3 gap-5 lg:gap-8">
                {regulasiMockData.map((reg: any, i: number) => (
                  <motion.a
                    href={reg.link_dokumen}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    key={reg.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    whileHover={{ scale: 1.02, y: -8 }}
                    className="group relative flex flex-row lg:flex-col items-start sm:items-center lg:items-start gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-2xl hover:border-red-200 transition-all duration-500 overflow-hidden cursor-pointer"
                  >
                    {/* Hover Glow Effect */}
                    <div className="absolute right-0 top-0 w-48 h-48 bg-red-100 rounded-full opacity-0 group-hover:opacity-30 blur-3xl transition-opacity duration-500 pointer-events-none" />
                    
                    {/* Watermark Logo Background */}
                    <div className="absolute -right-8 -bottom-8 w-40 h-40 sm:w-56 sm:h-56 lg:w-64 lg:h-64 opacity-[0.02] group-hover:opacity-[0.06] transition-all duration-700 pointer-events-none transform group-hover:scale-110 group-hover:-rotate-6 z-0">
                      <Image src="/logo protokoler.png" alt="Watermark" fill sizes="(max-width: 768px) 256px, 320px" className="object-contain" />
                    </div>

                    {/* Icon Block */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center shadow-inner relative z-10 transition-transform duration-500 group-hover:scale-105 mt-1 sm:mt-0" style={{ background: reg.accentGradient }}>
                       <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white/90 drop-shadow-md" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 relative z-10 min-w-0 flex flex-col justify-center">
                       <h3 className="font-display font-bold text-lg sm:text-xl md:text-2xl text-slate-900 group-hover:text-[#6B0000] transition-colors mb-2 truncate sm:whitespace-normal">{reg.judul}</h3>
                       <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-2 lg:line-clamp-none">{reg.deskripsi}</p>
                    </div>

                    {/* Action Button */}
                    <div className="hidden lg:flex mt-auto w-12 h-12 rounded-full border-2 border-slate-100 items-center justify-center text-slate-400 group-hover:bg-[#6B0000] group-hover:text-white group-hover:border-[#6B0000] transition-all duration-300 relative z-10">
                       <Download className="h-5 w-5 group-hover:-translate-y-1 transition-transform duration-300" />
                    </div>
                    {/* Desktop/Tablet Arrow for row layout */}
                    <div className="hidden md:flex lg:hidden w-14 h-14 rounded-full border-2 border-slate-100 items-center justify-center flex-shrink-0 text-slate-400 group-hover:bg-[#6B0000] group-hover:text-white group-hover:border-[#6B0000] transition-all duration-300 relative z-10">
                       <Download className="h-6 w-6 group-hover:-translate-y-1 transition-transform duration-300" />
                    </div>
                  </motion.a>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* Testimoni */}
        <section className="py-16 md:py-32 relative overflow-hidden bg-mesh-dark">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl" style={{ background: 'radial-gradient(circle, #6B0000 0%, transparent 70%)' }} />

          <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-3 gap-16 items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeLeft} className="lg:col-span-1">
                <div className="flex items-center justify-center lg:justify-start gap-3 md:gap-4 mb-5">
                  <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C]/50"></div>
                  <span className="text-[10px] sm:text-xs md:text-sm font-bold text-[#D2AD5C] uppercase tracking-widest md:tracking-[0.25em] whitespace-nowrap">Apa Kata Mereka</span>
                  <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C]/50 block lg:hidden"></div>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight text-center lg:text-left">
                  Suara dari <br />
                  <span className="bg-gradient-to-r from-[#D2AD5C] to-amber-300 bg-clip-text text-transparent drop-shadow-sm">Tim &amp; Pimpinan</span>
                </h2>
                <p className="text-slate-400 text-sm sm:text-base md:text-lg mb-8 sm:mb-10 leading-relaxed text-center lg:text-left px-4 lg:px-0">Dampak langsung dari penggunaan sistem terpadu keprotokolan, dinilai langsung oleh tim lapangan dan pimpinan.</p>
                
                {/* Glowing Animated Stars */}
                <div className="flex gap-2 mt-10 justify-center lg:justify-start">
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
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="lg:col-span-2 min-w-0 w-full">
                {/* Testimonial: Looping Carousel (All Screens) */}
                <div className="-mx-6 sm:-mx-8 lg:mx-0 overflow-hidden mt-8 lg:mt-0">
                  <Carousel opts={{ loop: true, align: 'center' }} plugins={[Autoplay({ delay: 4000 })]} className="w-full">
                    <CarouselContent className="ml-0 lg:-ml-4">
                      {[
                        { name: 'Dr. Budi Santoso', role: 'Pembina Protokoler', image: '/tim_pengembang/danu.webp', text: 'Fitur evaluasi 3 Tata Protokol memastikan tidak ada celah di lapangan. Modul gamifikasi juga memacu mahasiswa untuk terus aktif.' },
                        { name: 'Siti Nurhaliza', role: 'Protokoler (Gold)', image: '/tim_pengembang/hafiz.webp', text: 'Absensi selfie membuat kami lebih teratur dan adil. Poin kegiatan langsung terakumulasi untuk mengejar sertifikat tertinggi!' },
                        { name: 'Ahmad Fauzi', role: 'Ketua Pelaksana', image: '/tim_pengembang/danu.webp', text: 'Koordinasi tim jauh lebih mudah berkat sistem terpusat. Informasi jadwal dan SOP bisa diakses secara real-time kapan pun.' },
                      ].map((testi, i) => (
                        <CarouselItem key={i} className="pl-0 basis-full lg:pl-4">
                          <div className="w-full px-6 lg:px-0">
                            <motion.div
                              variants={fadeUp}
                              className="p-6 sm:p-10 lg:p-12 rounded-[2rem] bg-gradient-to-br from-[#2A0000]/90 to-[#1A0000]/90 backdrop-blur-xl border border-white/10 relative shadow-2xl group flex flex-col lg:flex-row-reverse items-center gap-6 lg:gap-12 w-full lg:max-w-5xl lg:mx-auto mt-8 lg:mt-16 transition-all duration-500"
                            >
                              <div className="absolute top-4 right-6 lg:right-auto lg:left-8 font-display text-8xl font-black leading-none select-none text-[#D2AD5C]/10 transition-colors duration-300 z-0">&ldquo;</div>
                            
                            {/* Pop-out Image Section */}
                            <div className="relative w-36 h-36 sm:w-40 sm:h-40 lg:w-64 lg:h-64 shrink-0 z-20 mx-auto lg:mx-0">
                               <div className="absolute inset-0 bg-[#3A0000] scale-x-[1.15] rounded-[2rem] shadow-inner flex flex-col items-center justify-center border border-white/5 transition-transform duration-500">
                                 <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5" />
                               </div>
                               <Image src={testi.image} alt={testi.name} fill sizes="(max-width: 1024px) 160px, 300px" className="object-contain object-bottom relative z-20 grayscale-0 scale-[1.35] lg:scale-[1.45] drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] origin-bottom transition-transform duration-500" />
                            </div>

                            {/* Text Section */}
                            <div className="flex-1 flex flex-col justify-center relative z-10 w-full mt-2 lg:mt-0 text-center lg:text-left">
                              <p className="text-slate-300/90 leading-relaxed mb-6 text-sm sm:text-base lg:text-lg italic font-medium tracking-wide">&ldquo;{testi.text}&rdquo;</p>
                              <div className="border-t border-white/10 pt-5 mt-auto">
                                <h4 className="font-bold text-white text-[15px] sm:text-lg tracking-wide">{testi.name}</h4>
                                <p className="text-[10px] sm:text-xs text-[#D2AD5C] font-bold uppercase tracking-[0.2em] mt-1">{testi.role}</p>
                              </div>
                            </div>
                          </motion.div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        {/* Berita & Dokumentasi (Postingan) */}
        <section id="postingan" className="py-16 md:py-32 relative overflow-hidden bg-white border-t border-slate-100">
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 md:mb-16 gap-6 text-center md:text-left">
              <div className="max-w-2xl">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex items-center justify-center md:justify-start gap-3 md:gap-4 mb-4">
                  <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C]"></div>
                  <span className="text-[10px] sm:text-xs md:text-sm font-bold text-[#6B0000] uppercase tracking-widest md:tracking-[0.25em] whitespace-nowrap">Postingan Terkini</span>
                  <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C] block md:hidden"></div>
                </motion.div>
                <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                  Postingan <span className="text-[#6B0000]">Terbaru</span>
                </motion.h2>
              </div>
              <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-slate-500 text-sm sm:text-base md:text-xl max-w-lg md:text-right px-4 md:px-0 mt-2 md:mt-0">
                Informasi, berita, dan dokumentasi kegiatan resmi terbaru yang dirangkum langsung oleh tim Protokoler.
              </motion.p>
            </div>

            {postinganDokumentasi && postinganDokumentasi.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {postinganDokumentasi.map((post: any, i: number) => {
                  const isFeatured = i === 0;
                  return (
                    <PostCard
                      key={post.id}
                      post={post}
                      isFeatured={isFeatured}
                      onClick={() => handleSelectPost(post)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <Megaphone className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Belum ada postingan</h3>
                <p className="text-slate-500 max-w-sm">Informasi, berita, dan dokumentasi terbaru akan segera hadir di sini.</p>
              </div>
            )}
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
                {/* Left Side: Image (Instagram style slideable) */}
                <div className="w-full md:w-[60%] h-[40%] md:h-full bg-slate-950 relative flex items-center justify-center overflow-hidden group/image">
                   {/* Blur Background */}
                   <Image 
                     src={selectedPost.images?.[modalPhotoIdx] || selectedPost.gambar} 
                     alt={selectedPost.judul} 
                     fill 
                     className="object-cover opacity-30 blur-2xl pointer-events-none scale-110" 
                   />
                   {/* Main Image */}
                   <Image 
                     src={selectedPost.images?.[modalPhotoIdx] || selectedPost.gambar} 
                     alt={selectedPost.judul} 
                     fill 
                     className="object-contain drop-shadow-2xl z-10" 
                   />

                   {/* Navigation Arrows for Slider */}
                   {selectedPost.images && selectedPost.images.length > 1 && (
                     <>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setModalPhotoIdx((prev) => (prev === 0 ? selectedPost.images.length - 1 : prev - 1)); 
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md animate-in fade-in"
                        >
                           <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setModalPhotoIdx((prev) => (prev === selectedPost.images.length - 1 ? 0 : prev + 1)); 
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md animate-in fade-in"
                        >
                           <ChevronRight className="w-6 h-6" />
                        </button>
                     </>
                   )}
                </div>

                {/* Right Side: Content */}
                <div className="w-full md:w-[40%] h-[60%] md:h-full flex flex-col bg-white overflow-hidden">
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
                     {(() => {
                       const activePhotoUrl = selectedPost.images?.[modalPhotoIdx];
                       const activeDoc = (selectedPost.dokumentasi || []).find((d: any) => d.file_url === activePhotoUrl);
                       const description = activeDoc?.keterangan || selectedPost.ringkasan;
                       return <p className="text-slate-600 leading-relaxed mb-6 whitespace-pre-wrap">{description}</p>;
                     })()}
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

        {/* Call to Action (Recruitment) */}
        <section className="relative py-16 md:py-32 overflow-hidden bg-[#5a0000]">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#D2AD5C]/15 rounded-full blur-[150px] mix-blend-screen pointer-events-none translate-y-1/3 -translate-x-1/3"></div>
          
          <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="max-w-4xl mx-auto flex flex-col items-center"
            >
              <div className="flex items-center justify-center gap-3 md:gap-4 mb-8">
                <div className="w-6 md:w-12 h-[2px] bg-[#D2AD5C]"></div>
                <span className="text-[10px] sm:text-xs md:text-sm font-bold text-[#D2AD5C] uppercase tracking-widest md:tracking-[0.25em] whitespace-nowrap">Pendaftaran Dibuka</span>
                <div className="w-6 md:w-12 h-[2px] bg-[#D2AD5C]"></div>
              </div>
              
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-4 sm:mb-6 px-4 sm:px-0">
                Siap Menjadi <span className="text-[#D2AD5C]">Garda Terdepan</span> Universitas?
              </h2>
              
              <p className="text-sm sm:text-base md:text-lg text-white/70 max-w-2xl leading-relaxed mb-8 sm:mb-10 font-medium px-4 sm:px-0">
                Asah kemampuan kepemimpinan, tingkatkan keterampilan <span className="text-white italic">public speaking</span>, dan pelajari standar pelayanan VVIP tingkat nasional dengan bergabung bersama Unit Protokoler Universitas Negeri Padang.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-6 sm:px-0">
                <Button className="w-full max-w-[260px] sm:max-w-none sm:w-auto h-12 md:h-14 px-8 rounded-full bg-gradient-to-r from-[#D2AD5C] to-[#b39045] hover:from-[#eecf83] hover:to-[#D2AD5C] text-slate-900 font-bold uppercase tracking-widest text-[11px] shadow-[0_0_30px_rgba(210,173,92,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(210,173,92,0.5)] border-none">
                  Daftar Sekarang
                </Button>
                <Link href="/persyaratan" className="w-full max-w-[260px] sm:max-w-none sm:w-auto flex justify-center">
                  <Button className="w-full h-12 md:h-14 px-8 rounded-full bg-transparent border-2 border-white/20 text-white hover:bg-white hover:text-[#5a0000] font-bold uppercase tracking-widest text-[11px] transition-all shadow-none">
                    Pelajari Persyaratan
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

      </main>


      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
