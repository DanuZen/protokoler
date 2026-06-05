"use client";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, ClipboardList, Users, BarChart3, ShieldCheck, Bell, ArrowRight, CheckCircle2, ChevronDown, Star, ArrowUpRight, Megaphone, Quote, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Varied Animation Variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } }
};

const fadeLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" as const } }
};

const fadeRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" as const } }
};

const zoomIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const floatAnim = {
  initial: { y: 0 },
  animate: { 
    y: [-10, 10, -10],
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const }
  }
};

const faqs = [
  { q: "Bagaimana cara menjadi anggota protokoler?", a: "Rekrutmen anggota protokoler biasanya dibuka di awal semester ganjil. Mahasiswa yang berminat dapat mendaftar melalui sistem ini saat pengumuman rekrutmen diturunkan oleh tim admin." },
  { q: "Apakah saya bisa menolak penugasan?", a: "Anda dapat menolak penugasan jika jadwal bentrok dengan perkuliahan, dengan melampirkan keterangan saat menekan tombol 'Tolak' di menu Konfirmasi." },
  { q: "Berapa lama poin kegiatan akan masuk ke riwayat?", a: "Poin kegiatan atau jam tugas akan otomatis terekap ke riwayat Anda dalam waktu 1x24 jam setelah status kegiatan diubah menjadi 'Selesai' oleh Administrator." },
  { q: "Bagaimana jika lupa password akun?", a: "Anda dapat menghubungi Administrator secara langsung melalui Unit Protokoler untuk melakukan reset password akun Anda." }
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // For parallax effect
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-primary/20 overflow-x-hidden font-sans">
      
      {/* Interactive Dynamic Navbar */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled 
            ? "bg-slate-900/95 backdrop-blur-lg shadow-xl border-b border-white/10 py-3" 
            : "bg-transparent py-5"
        )}
      >
        <div className="container mx-auto flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-12 w-12 overflow-hidden transition-transform group-hover:scale-105">
              <Image src="/logo protokoler.png" alt="Logo Protokoler" fill sizes="48px" className="object-contain" priority />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-tight text-white leading-none mb-1">PROTOKOLER</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300">UNIVERSITAS NEGERI PADANG</span>
            </div>
          </Link>
          <nav className="hidden gap-8 lg:flex items-center">
            {["Fitur", "Galeri", "Berita", "FAQ"].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`} 
                className="text-sm font-semibold text-slate-200 transition-colors hover:text-gold"
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-300">Sistem Online</span>
            </div>
            <Link href="/auth">
              <Button className="rounded-none shadow-lg hover:shadow-xl transition-all px-8 bg-gold text-slate-900 hover:bg-yellow-500 h-11 font-bold">
                Masuk Sistem
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      <main className="relative z-10">
        {/* Redesigned Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden min-h-[90vh] flex items-center justify-center">
          {/* Background Image Elements */}
          <div className="absolute inset-0 z-0">
            <Image src="/gallery_3.png" alt="Hero Background" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-slate-900/75 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col items-center justify-center max-w-4xl mx-auto">
              <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center text-center">
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-none border border-blue-500/30 bg-slate-900/60 backdrop-blur-md px-5 py-2 text-xs font-bold text-blue-300 mb-6 shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
                  Sistem Informasi Keprotokolan v2.0
                </motion.div>
                
                <motion.h1 variants={fadeUp} className="font-display text-5xl font-extrabold leading-[1.1] tracking-tight md:text-6xl lg:text-[5.5rem] text-white">
                  Manajemen <br />
                  <span className="relative inline-block mt-4">
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-blue-100">Protokoler Profesional</span>
                    <motion.span 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 1, duration: 0.8, ease: "circOut" }}
                      className="absolute bottom-2 left-0 h-4 bg-gold/50 -z-0 -rotate-1"
                    />
                  </span>
                </motion.h1>
                
                <motion.p variants={fadeUp} className="mt-8 max-w-2xl text-lg md:text-xl text-slate-200 leading-relaxed">
                  Tingkatkan efisiensi tata kelola kegiatan resmi universitas. Platform terintegrasi untuk penjadwalan, penugasan LO, dan rekapitulasi data secara otomatis.
                </motion.p>
                
                <motion.div variants={fadeUp} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                  <Link href="/auth" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full h-14 rounded-none px-8 text-base shadow-xl shadow-primary/25 transition-all hover:shadow-primary/40 hover:-translate-y-1">
                      Akses Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <a href="#fitur" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full h-14 rounded-none px-8 text-base border-slate-600 text-white bg-slate-900/50 backdrop-blur hover:bg-slate-800 transition-all">
                      <Play className="mr-2 h-4 w-4 fill-white" /> Pelajari Modul
                    </Button>
                  </a>
                </motion.div>
                
                <motion.div variants={fadeUp} className="mt-10 flex items-center justify-center gap-4 text-sm font-medium text-slate-300">
                  <div className="flex -space-x-2">
                    {["#3B82F6","#8B5CF6","#10B981","#F59E0B"].map((color, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: color }}>
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <span>Dipercaya oleh 120+ anggota aktif</span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Live Stats */}
        <section className="bg-slate-900 py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-2 gap-10 md:grid-cols-4 divide-x divide-slate-800 text-white">
              {[
                { label: "Anggota Terdaftar", value: "124", suffix: "" },
                { label: "Kegiatan Sukses", value: "840", suffix: "+" },
                { label: "Total Jam Terbang", value: "12.5", suffix: "k" },
                { label: "Tingkat Kehadiran", value: "98", suffix: "%" },
              ].map((s, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1, type: "spring" }}
                  key={i} className="text-center px-4"
                >
                  <div className="text-4xl md:text-6xl font-display font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">{s.value}<span className="text-gold text-2xl md:text-3xl ml-1">{s.suffix}</span></div>
                  <div className="text-sm md:text-base font-semibold text-slate-400 uppercase tracking-widest">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Galeri Kegiatan */}
        <section id="galeri" className="py-24 md:py-32 bg-white relative">
          <div className="container mx-auto px-6">
            <div className="mb-20 max-w-3xl text-center mx-auto">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="inline-flex items-center gap-2 rounded-none border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-bold text-yellow-700 mb-6 uppercase tracking-widest">
                Dokumentasi
              </motion.div>
              <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">Dedikasi di Lapangan</motion.h2>
              <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-6 text-slate-600 text-lg md:text-xl">
                Potret momen-momen penting tim protokoler dalam menyukseskan berbagai kegiatan universitas tingkat tinggi.
              </motion.p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { src: "/gallery_1.png", alt: "Persiapan Acara VIP", caption: "Persiapan Acara VIP" },
                { src: "/gallery_2.png", alt: "Pengarahan Tamu", caption: "Pengarahan Tamu Resmi" },
                { src: "/gallery_3.png", alt: "Wisuda", caption: "Upacara Wisuda Universitas" },
              ].map((img, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 50, rotate: -5 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: i * 0.2 }}
                  key={i} className="group relative aspect-[4/5] rounded-none overflow-hidden shadow-xl bg-slate-100 border border-slate-200"
                >
                  <Image src={img.src} alt={img.alt} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-4 transition-transform duration-500 group-hover:translate-y-0">
                    <p className="text-white font-bold text-2xl mb-1">{img.caption}</p>
                    <div className="w-12 h-1 bg-gold rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features - Clean Grid */}
        <section id="fitur" className="py-24 md:py-32 bg-slate-50 relative border-t border-slate-200">
          <div className="container mx-auto px-6">
            <div className="mb-20 max-w-3xl text-center mx-auto">
              <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">Modul Fungsional Utama</motion.h2>
              <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-6 text-slate-600 text-lg md:text-xl">
                Sistem yang dirancang khusus untuk memenuhi standar operasional keprotokolan.
              </motion.p>
            </div>
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: CalendarDays, title: "Manajemen Kegiatan", desc: "Perencanaan dan penjadwalan kegiatan resmi (wisuda, rapat senat) dalam kalender terpadu." },
                { icon: ClipboardList, title: "Penugasan Otomatis", desc: "Distribusi tugas LO dan staf dengan sistem deteksi konflik jadwal otomatis." },
                { icon: Users, title: "Database Anggota", desc: "Pengelolaan data mahasiswa keprotokolan mencakup program studi, angkatan, dan riwayat." },
                { icon: BarChart3, title: "Laporan & Rekapitulasi", desc: "Pembuatan laporan otomatis mengenai jam tugas mahasiswa dan frekuensi kegiatan." },
                { icon: Bell, title: "Sistem Notifikasi", desc: "Pemberitahuan real-time kepada mahasiswa ketika mendapatkan penugasan baru." },
                { icon: ShieldCheck, title: "Hak Akses Bertingkat", desc: "Keamanan data terjamin melalui pemisahan hak akses Administrator, Pimpinan, & Mahasiswa." },
              ].map((f, i) => (
                <motion.div variants={zoomIn} key={i} className="group rounded-none border border-slate-200 bg-white p-10 transition-all duration-300 hover:border-primary/30 hover:shadow-2xl hover:-translate-y-2">
                  <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-none bg-slate-50 border border-slate-100 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:rotate-6">
                    <f.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{f.title}</h3>
                  <p className="text-base leading-relaxed text-slate-600">{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Berita & Pengumuman */}
        <section id="pengumuman" className="bg-white py-24 md:py-32 relative border-t border-slate-200">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeLeft} className="max-w-2xl">
                <h2 className="font-display text-4xl font-bold text-slate-900 md:text-5xl">Pengumuman Terbaru</h2>
                <p className="mt-6 text-slate-600 text-lg md:text-xl">Informasi dan agenda penting terkait kegiatan keprotokolan.</p>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeRight}>
                <Button variant="outline" className="shrink-0 bg-white border-slate-300 h-12 px-6 rounded-none font-bold hover:bg-slate-50">
                  Lihat Semua <ArrowUpRight className="ml-2 h-4 w-4 text-slate-400"/>
                </Button>
              </motion.div>
            </div>
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-2 gap-8">
              {[
                { title: "Persiapan Wisuda Gelombang II Tahun 2026", date: "05 Juni 2026", desc: "Seluruh anggota protokoler diwajibkan menghadiri gladi bersih pada hari Jumat pukul 13.00 WIB di Balairung Utama." },
                { title: "Open Recruitment Anggota Baru", date: "01 Juni 2026", desc: "Pendaftaran calon anggota baru keprotokolan telah dibuka. Silakan mendaftar dan melengkapi berkas melalui portal sistem." },
              ].map((news, i) => (
                <motion.div variants={fadeUp} key={i} className="flex flex-col sm:flex-row gap-6 sm:gap-8 rounded-none bg-slate-50 p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 hover:bg-white hover:-translate-y-1">
                  <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-none bg-white shadow-sm border border-slate-100 text-primary">
                    <Megaphone className="h-8 w-8 sm:h-10 sm:w-10" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-primary mb-3 uppercase tracking-widest">{news.date}</div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-snug">{news.title}</h3>
                    <p className="text-slate-600 text-base leading-relaxed">{news.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimoni */}
        <section className="py-24 md:py-32 bg-primary text-white relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[500px] h-[500px] rounded-none bg-blue-500/20 blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[600px] h-[600px] rounded-none bg-indigo-500/10 blur-[100px]"></div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-3 gap-16 items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeLeft} className="lg:col-span-1">
                <h2 className="font-display text-4xl font-bold text-white md:text-5xl mb-6 leading-tight">Suara dari <br/><span className="text-gold">Tim Kami</span></h2>
                <p className="text-primary-foreground/80 mb-10 text-lg md:text-xl leading-relaxed">Pengalaman para anggota dan pimpinan menggunakan SiProto dalam keseharian operasional keprotokolan.</p>
                <div className="flex gap-2">
                  <Star className="fill-gold text-gold h-7 w-7" /><Star className="fill-gold text-gold h-7 w-7" /><Star className="fill-gold text-gold h-7 w-7" /><Star className="fill-gold text-gold h-7 w-7" /><Star className="fill-gold text-gold h-7 w-7" />
                </div>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="lg:col-span-2 grid md:grid-cols-2 gap-8">
                {[
                  { name: "Dr. Budi Santoso", role: "Pembina Protokoler", text: "Sejak menggunakan SiProto, manajemen penugasan menjadi jauh lebih rapi. Tidak ada lagi miskomunikasi jadwal." },
                  { name: "Siti Nurhaliza", role: "Koordinator Lapangan", text: "Sistem konfirmasinya sangat membantu saya mengecek siapa yang siap bertugas secara real-time. Sangat direkomendasikan!" },
                ].map((testi, i) => (
                  <motion.div variants={fadeUp} key={i} className="p-10 rounded-none bg-white/10 backdrop-blur-md border border-white/10 relative hover:bg-white/15 transition-colors duration-300">
                    <Quote className="absolute top-8 right-8 h-12 w-12 text-white/10" />
                    <p className="text-primary-foreground/90 italic relative z-10 leading-relaxed mb-8 text-lg font-medium">"{testi.text}"</p>
                    <div>
                      <h4 className="font-bold text-white text-xl">{testi.name}</h4>
                      <p className="text-sm text-gold font-semibold mt-1 uppercase tracking-wider">{testi.role}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 md:py-32 bg-slate-50 relative">
          <div className="container mx-auto px-6 max-w-4xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-20">
              <h2 className="font-display text-4xl font-bold text-slate-900 md:text-5xl">Pertanyaan Sering Diajukan</h2>
              <p className="mt-6 text-slate-600 text-lg md:text-xl">Informasi yang mungkin sedang Anda cari tentang sistem kami.</p>
            </motion.div>
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-6">
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <motion.div variants={fadeUp} key={i} className={cn("border bg-white rounded-none overflow-hidden transition-all duration-300", isOpen ? "border-primary/30 shadow-lg shadow-primary/5" : "border-slate-200 shadow-sm hover:shadow-md")}>
                    <button onClick={() => setOpenFaq(isOpen ? null : i)} className="w-full flex items-center justify-between p-8 text-left focus:outline-none">
                      <span className={cn("font-bold text-xl pr-8 transition-colors duration-300", isOpen ? "text-primary" : "text-slate-900")}>{faq.q}</span>
                      <div className={cn("shrink-0 h-12 w-12 rounded-full flex items-center justify-center transition-all duration-500", isOpen ? "bg-primary text-white rotate-180" : "bg-slate-100 text-slate-500")}>
                        <ChevronDown className="h-6 w-6" />
                      </div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                          <div className="p-8 pt-0 text-slate-600 text-lg leading-relaxed mt-2">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 relative z-20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image src="/logo protokoler.png" alt="Logo Protokoler" fill sizes="40px" className="object-contain grayscale opacity-70" />
            </div>
            <span className="font-display text-xl font-bold text-slate-700">PROTOKOLER</span>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            © {new Date().getFullYear()} Unit Protokoler Universitas. Hak Cipta Dilindungi Undang-Undang.
          </p>
        </div>
      </footer>
    </div>
  );
}
