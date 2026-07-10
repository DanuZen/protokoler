'use client';
import { LandingNavbar } from '@/components/landing-navbar';
import { LandingFooter } from '@/components/landing-footer';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Star, Users, Flag, Target, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

export default function TentangKami() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-red-100 font-sans flex flex-col">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <Image src="/rektorat.webp" alt="UNP Rektorat" fill sizes="100vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent opacity-30"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-3xl mx-auto flex flex-col items-center">
            <motion.div variants={fadeUp} className="flex items-center gap-3 md:gap-4 mb-6">
              <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C]"></div>
              <span className="text-[10px] sm:text-xs md:text-sm font-bold text-[#D2AD5C] uppercase tracking-widest md:tracking-[0.25em] whitespace-nowrap">Mengenal Kami</span>
              <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C]"></div>
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-display text-3xl sm:text-4xl md:text-6xl font-bold text-white leading-tight mb-4 sm:mb-6 drop-shadow-lg px-4 sm:px-0">
              Garda Terdepan <span className="text-[#D2AD5C]">Institusi</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-sm sm:text-base md:text-xl text-slate-300 leading-relaxed text-justify px-4 sm:px-0">
              Unit Protokoler Universitas Negeri Padang (UNP) berdiri untuk menjaga kehormatan, ketertiban, dan keagungan dalam setiap agenda resmi universitas.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 relative z-20 -mt-10 mb-20">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 p-8 md:p-16 lg:p-20 overflow-hidden relative">
            {/* Dekorasi Air Terjun */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Kolom Teks */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-8">
                <motion.div variants={fadeUp}>
                  <div className="flex items-center justify-center lg:justify-start gap-3 md:gap-4 mb-3 sm:mb-4">
                    <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C]"></div>
                    <span className="text-[10px] sm:text-xs md:text-sm font-bold text-[#6B0000] uppercase tracking-widest md:tracking-[0.25em] whitespace-nowrap">Pengenalan</span>
                    <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C] block lg:hidden"></div>
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4 sm:mb-6 leading-tight text-center lg:text-left">Apa itu Protokoler?</h2>
                  <div className="flex flex-col gap-4 text-slate-500 text-sm sm:text-base md:text-lg leading-relaxed text-justify">
                    <p>
                      Keprotokolan adalah serangkaian aturan dalam acara kenegaraan atau acara resmi yang meliputi tata tempat, tata upacara, dan tata penghormatan sebagai bentuk penghormatan kepada seseorang sesuai dengan jabatan atau kedudukannya.
                    </p>
                    <p>
                      Sebagai bagian tak terpisahkan dari Universitas Negeri Padang, kami menjamin kelancaran setiap kegiatan VVIP dan acara seremonial tingkat universitas. Tim kami dilatih secara profesional untuk memiliki kesigapan tinggi, sikap sopan santun, dan ketahanan mental dalam menghadapi berbagai dinamika lapangan.
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="pt-6 border-t border-slate-100 flex justify-center lg:justify-start gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-black text-[#6B0000]">50+</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Anggota Aktif</p>
                  </div>
                  <div className="w-px h-12 bg-slate-200 my-auto"></div>
                  <div className="text-center">
                    <p className="text-4xl font-black text-[#6B0000]">100+</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Agenda Sukses</p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Kolom Visual (Logo Besar) */}
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative h-[400px] lg:h-[500px] flex items-center justify-center">
                 <div className="absolute inset-0 bg-gradient-to-tr from-red-50 to-amber-50 rounded-[3rem] transform rotate-3"></div>
                 <div className="relative w-64 h-64 md:w-80 md:h-80 drop-shadow-2xl">
                   <Image src="/logo-protokoler-new.webp" alt="Logo Protokoler" fill sizes="(max-width: 768px) 256px, 320px" className="object-contain" />
                 </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Visi & Misi Section */}
        <section className="py-24 md:py-32 bg-slate-50 relative overflow-hidden">
          {/* Latar Belakang Dekoratif Terang */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-100/50 rounded-full blur-[100px] -z-0"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-100/50 rounded-full blur-[100px] -z-0"></div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex items-center justify-center gap-3 md:gap-4 mb-4">
                <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C]"></div>
                <span className="text-[10px] sm:text-xs md:text-sm font-bold text-[#6B0000] uppercase tracking-widest md:tracking-[0.25em] whitespace-nowrap">Tujuan Kami</span>
                <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C]"></div>
              </motion.div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4 sm:mb-6 leading-tight">Visi & Misi</h2>
              <p className="text-slate-500 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-16 px-4">Landasan utama pergerakan Unit Protokoler Universitas Negeri Padang.</p>

              {/* Kolase Foto Interaktif */}
              <div className="flex flex-col md:flex-row items-center justify-center -space-y-8 md:space-y-0 md:-space-x-8 mb-20 max-w-5xl mx-auto px-4">
                <motion.div initial={{ opacity: 0, y: 20, rotate: -5 }} whileInView={{ opacity: 1, y: 0, rotate: -3 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative w-72 h-52 md:w-64 md:h-48 rounded-3xl overflow-hidden shadow-xl hover:rotate-0 hover:scale-105 hover:z-20 transition-all duration-500 border-4 border-white z-0">
                  <Image src="/gallery_1.webp" alt="Protokoler 1" fill className="object-cover" />
                  <div className="absolute inset-0 bg-[#6B0000]/10 hover:bg-transparent transition-colors duration-500"></div>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="relative w-80 h-64 md:w-72 md:h-60 rounded-3xl overflow-hidden shadow-2xl hover:-translate-y-2 hover:scale-105 hover:z-20 transition-all duration-500 border-4 border-white z-10 md:-mt-8">
                  <Image src="/gallery_2.webp" alt="Protokoler 2" fill className="object-cover" />
                  <div className="absolute inset-0 bg-[#D2AD5C]/10 hover:bg-transparent transition-colors duration-500"></div>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 20, rotate: 5 }} whileInView={{ opacity: 1, y: 0, rotate: 3 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="relative w-72 h-52 md:w-64 md:h-48 rounded-3xl overflow-hidden shadow-xl hover:rotate-0 hover:scale-105 hover:z-20 transition-all duration-500 border-4 border-white z-0">
                  <Image src="/gallery_3.webp" alt="Protokoler 3" fill className="object-cover" />
                  <div className="absolute inset-0 bg-blue-900/10 hover:bg-transparent transition-colors duration-500"></div>
                </motion.div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-7xl mx-auto items-stretch">
              {/* Visi */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-12 border border-slate-200 shadow-xl relative overflow-hidden group flex flex-col h-full hover:shadow-2xl hover:border-[#D2AD5C]/50 transition-all duration-500">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-50 to-transparent rounded-bl-full -z-0 transition-transform duration-700 group-hover:scale-150"></div>
                
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-[#D2AD5C] to-amber-500 rounded-xl md:rounded-2xl flex items-center justify-center text-white mb-6 md:mb-8 shadow-lg shadow-amber-500/20 relative z-10 shrink-0 transform group-hover:rotate-12 transition-transform duration-500">
                  <Target className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-900 mb-4 md:mb-6 relative z-10">Visi Kami</h3>
                <p className="text-slate-600 text-base md:text-xl leading-relaxed relative z-10 font-medium italic text-justify">
                  "Menjadi unit layanan keprotokolan yang profesional, terpercaya, dan berstandar nasional dalam mendukung visi Universitas Negeri Padang sebagai institusi pendidikan yang bermartabat."
                </p>
              </motion.div>

              {/* Misi */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-gradient-to-br from-[#6B0000] to-[#4A0000] text-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-12 shadow-xl shadow-red-900/20 relative overflow-hidden group flex flex-col h-full border border-red-900/50 hover:shadow-2xl hover:shadow-[#6B0000]/40 transition-all duration-500 lg:translate-y-8">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full -z-0 transition-transform duration-700 group-hover:scale-125"></div>
                
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center text-white mb-6 md:mb-8 backdrop-blur-md relative z-10 shrink-0 border border-white/20 transform group-hover:-rotate-12 transition-transform duration-500">
                  <Flag className="w-6 h-6 md:w-8 md:h-8 drop-shadow-sm" />
                </div>
                <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-6 md:mb-8 relative z-10">Misi Kami</h3>
                <ul className="space-y-4 md:space-y-6 text-white/90 relative z-10 font-medium flex-1">
                  <li className="flex gap-4 items-start group/item">
                    <div className="mt-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover/item:bg-[#D2AD5C] transition-colors duration-300 shadow-inner">
                      <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#D2AD5C] group-hover/item:text-white transition-colors" />
                    </div>
                    <span className="leading-relaxed text-sm md:text-lg group-hover/item:text-white transition-colors text-justify">Memberikan pelayanan keprotokolan prima (Service Excellence) pada setiap kegiatan.</span>
                  </li>
                  <li className="flex gap-4 items-start group/item">
                    <div className="mt-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover/item:bg-[#D2AD5C] transition-colors duration-300 shadow-inner">
                      <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#D2AD5C] group-hover/item:text-white transition-colors" />
                    </div>
                    <span className="leading-relaxed text-sm md:text-lg group-hover/item:text-white transition-colors text-justify">Mengembangkan kapasitas anggota melalui pelatihan berkelanjutan dan berjenjang.</span>
                  </li>
                  <li className="flex gap-4 items-start group/item">
                    <div className="mt-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover/item:bg-[#D2AD5C] transition-colors duration-300 shadow-inner">
                      <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#D2AD5C] group-hover/item:text-white transition-colors" />
                    </div>
                    <span className="leading-relaxed text-sm md:text-lg group-hover/item:text-white transition-colors text-justify">Menjaga kedisiplinan, etika, dan kehormatan almamater Universitas Negeri Padang.</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Nilai-Nilai Inti (Core Values) */}
        <section className="py-20 bg-slate-50 relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex items-center justify-center gap-3 md:gap-4 mb-4">
                <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C]"></div>
                <span className="text-[10px] sm:text-xs md:text-sm font-bold text-[#6B0000] uppercase tracking-widest md:tracking-[0.25em] whitespace-nowrap">Prinsip Kami</span>
                <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C]"></div>
              </motion.div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4 sm:mb-6 leading-tight">Nilai-Nilai <span className="text-[#6B0000]">Inti</span></h2>
              <p className="text-slate-500 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">Prinsip dasar yang kami pegang teguh saat menjalankan setiap tugas keprotokolan.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12 max-w-7xl mx-auto px-4 md:px-0">
              {[
                { icon: ShieldCheck, title: "Integritas & Kedisiplinan", desc: "Taat aturan dan tepat waktu adalah kunci utama operasional kami.", color: "from-[#6B0000] to-[#8B0000]" },
                { icon: Star, title: "Profesionalisme", desc: "Bekerja dengan standar tinggi dan menjaga kesempurnaan acara.", color: "from-[#4A0000] to-[#6B0000]" },
                { icon: Heart, title: "Service Excellence", desc: "Melayani tamu dan pimpinan dengan keramahan dan etika terbaik.", color: "from-[#5a0000] to-[#7a0000]" }
              ].map((val, i) => (
                <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className={`bg-white p-6 md:p-12 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200 hover:border-transparent transition-all duration-500 shadow-xl hover:shadow-2xl group relative overflow-hidden ${i === 1 ? 'lg:-translate-y-8' : 'lg:translate-y-8'}`}>
                  {/* Latar Belakang Gradien saat Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${val.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0`}></div>
                  
                  {/* Dekorasi Nomor Raksasa */}
                  <div className="absolute -bottom-6 md:-bottom-10 -right-4 md:-right-6 text-[8rem] md:text-[12rem] font-black text-slate-100 group-hover:text-white/10 transition-colors duration-700 z-0 pointer-events-none leading-none select-none">
                    0{i + 1}
                  </div>
                  
                  {/* Konten Kartu */}
                  <div className="relative z-10 transition-colors duration-500">
                    <div className="flex items-center justify-between mb-6 md:mb-10">
                      <div className="w-14 h-14 md:w-20 md:h-20 bg-slate-50 group-hover:bg-white/20 backdrop-blur-sm rounded-2xl md:rounded-3xl flex items-center justify-center text-slate-700 group-hover:text-white transition-colors duration-500 shadow-sm group-hover:shadow-inner">
                        <val.icon className="w-7 h-7 md:w-10 md:h-10" />
                      </div>
                    </div>
                    <h4 className="text-xl md:text-3xl font-display font-bold text-slate-900 mb-3 md:mb-4 group-hover:text-white transition-colors duration-500 leading-tight">{val.title}</h4>
                    <p className="text-slate-600 leading-relaxed font-medium group-hover:text-white/90 transition-colors duration-500 text-sm md:text-lg text-justify">{val.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Struktur Organisasi Section */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className="flex items-center justify-center gap-3 md:gap-4 mb-4">
                  <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C]"></div>
                  <span className="text-[10px] sm:text-xs md:text-sm font-bold text-[#6B0000] uppercase tracking-widest md:tracking-[0.25em] whitespace-nowrap">Tim Kami</span>
                  <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C]"></div>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4 sm:mb-6 leading-tight">Struktur Organisasi</h2>
                <p className="text-slate-500 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">Susunan kepengurusan Unit Protokoler Universitas Negeri Padang.</p>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="w-full pb-16 pt-8 px-4">
              
              {/* DESKTOP LAYOUT (Hidden on Mobile) */}
              <div className="hidden md:flex flex-col items-center mx-auto select-none font-sans min-w-[1000px] overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                
                {/* Level 1: Kepala Kantor */}
                <div className="flex flex-col items-center relative z-20">
                  <div className="flex flex-col items-center w-[240px] relative px-2 hover:-translate-y-2 transition-transform duration-300 cursor-pointer group">
                    <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-[4px] border-primary bg-white shadow-lg z-10 relative">
                       <Image src="/gallery_1.webp" alt="Kepala Kantor" fill sizes="120px" className="object-cover" />
                    </div>
                    <div className="-mt-8 pt-12 pb-5 px-4 w-full flex flex-col items-center justify-center text-center rounded-[1.2rem] bg-primary text-white shadow-md z-0 min-h-[110px] group-hover:shadow-lg transition-shadow">
                      <h4 className="font-black text-[14px] leading-tight mb-1 uppercase tracking-tight">Nama Kepala, S.E., M.Si.</h4>
                      <p className="text-[10px] font-bold uppercase opacity-80 leading-tight">Kepala Kantor</p>
                    </div>
                  </div>
                  <div className="w-[3px] h-10 bg-primary"></div>
                </div>
            
                {/* Level 2 & 3 */}
                <div className="flex w-full justify-center relative">
                  
                  {/* Node SEKRETARIS */}
                  <div className="flex flex-col items-center flex-1 relative">
                    <div className="absolute top-0 left-1/2 right-0 h-[3px] bg-primary"></div>
                    <div className="w-[3px] h-8 bg-primary"></div>
                    <div className="flex flex-col items-center w-[150px] relative px-1 hover:-translate-y-2 transition-transform duration-300 cursor-pointer group">
                      <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-[4px] border-primary bg-white shadow-md z-10 relative">
                         <Image src="/gallery_2.webp" alt="Sekretaris" fill sizes="100px" className="object-cover" />
                      </div>
                      <div className="-mt-6 pt-10 pb-4 px-2 w-full flex flex-col items-center justify-center text-center rounded-[1rem] bg-primary text-white shadow-sm z-0 min-h-[90px] group-hover:shadow-md transition-shadow">
                        <h4 className="font-black text-[12px] leading-tight mb-1 uppercase tracking-tight">Nama Lengkap</h4>
                        <p className="text-[9px] font-bold uppercase opacity-80 leading-tight">Sekretaris</p>
                      </div>
                    </div>
                  </div>
            
                  {/* Node DIVISI SDM */}
                  <div className="flex flex-col items-center flex-1 relative">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary"></div>
                    <div className="w-[3px] h-8 bg-primary"></div>
                    <div className="flex flex-col items-center w-[150px] relative px-1 hover:-translate-y-2 transition-transform duration-300 cursor-pointer group">
                      <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-[4px] border-primary bg-white shadow-md z-10 relative">
                         <Image src="/gallery_2.webp" alt="Divisi SDM" fill sizes="100px" className="object-cover" />
                      </div>
                      <div className="-mt-6 pt-10 pb-4 px-2 w-full flex flex-col items-center justify-center text-center rounded-[1rem] bg-primary text-white shadow-sm z-0 min-h-[90px] group-hover:shadow-md transition-shadow">
                        <h4 className="font-black text-[12px] leading-tight mb-1 uppercase tracking-tight">Nama Lengkap</h4>
                        <p className="text-[9px] font-bold uppercase opacity-80 leading-tight">Divisi SDM</p>
                      </div>
                    </div>
                  </div>
            
                  {/* Node KOORDINATOR */}
                  <div className="flex flex-col items-center flex-[1.5] relative">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary"></div>
                    <div className="w-[3px] h-8 bg-primary"></div>
                    <div className="flex flex-col items-center w-[180px] relative px-1 hover:-translate-y-2 transition-transform duration-300 cursor-pointer group z-10">
                      <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-[4px] border-primary bg-white shadow-md z-10 relative">
                         <Image src="/gallery_2.webp" alt="Koordinator" fill sizes="100px" className="object-cover" />
                      </div>
                      <div className="-mt-6 pt-10 pb-4 px-2 w-full flex flex-col items-center justify-center text-center rounded-[1rem] bg-primary text-white shadow-sm z-0 min-h-[105px] group-hover:shadow-md transition-shadow">
                        <h4 className="font-black text-[12px] leading-tight mb-1 uppercase tracking-tight">Nama Lengkap</h4>
                        <p className="text-[9px] font-bold uppercase opacity-80 leading-tight">Koordinator<br/>Protokoler Mahasiswa</p>
                      </div>
                    </div>
                    <div className="flex w-[180px] -mt-1">
                      <div className="w-full ml-[50px]">
                         <div className="flex flex-col pt-6 relative">
                            <div className="flex items-center relative group">
                              <div className="absolute top-[-1.5rem] bottom-1/2 left-0 w-[3px] bg-primary"></div>
                              <div className="w-6 h-[3px] bg-primary"></div>
                              <div className="flex flex-col items-center w-[140px] relative px-1 hover:-translate-y-2 transition-transform duration-300 cursor-pointer group">
                                <div className="w-[80px] h-[80px] rounded-full overflow-hidden border-[4px] border-primary bg-white shadow-md z-10 relative">
                                   <Image src="/gallery_2.webp" alt="Protokoler" fill sizes="80px" className="object-cover" />
                                </div>
                                <div className="-mt-5 pt-8 pb-3 px-2 w-full flex flex-col items-center justify-center text-center rounded-xl bg-primary text-white shadow-sm z-0 min-h-[85px] group-hover:shadow-md transition-shadow">
                                  <h4 className="font-black text-[10px] leading-tight mb-1 uppercase tracking-tight">Nama Lengkap</h4>
                                  <p className="text-[8px] font-bold uppercase opacity-80 leading-tight">Protokoler<br/>Mahasiswa</p>
                                </div>
                              </div>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
            
                  {/* Node DIVISI ACARA */}
                  <div className="flex flex-col items-center flex-[1.2] relative">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary"></div>
                    <div className="w-[3px] h-8 bg-primary"></div>
                    <div className="flex flex-col items-center w-[150px] relative px-1 hover:-translate-y-2 transition-transform duration-300 cursor-pointer group z-10">
                      <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-[4px] border-primary bg-white shadow-md z-10 relative">
                         <Image src="/gallery_2.webp" alt="Divisi Acara" fill sizes="100px" className="object-cover" />
                      </div>
                      <div className="-mt-6 pt-10 pb-4 px-2 w-full flex flex-col items-center justify-center text-center rounded-[1rem] bg-primary text-white shadow-sm z-0 min-h-[90px] group-hover:shadow-md transition-shadow">
                        <h4 className="font-black text-[12px] leading-tight mb-1 uppercase tracking-tight">Nama Lengkap</h4>
                        <p className="text-[9px] font-bold uppercase opacity-80 leading-tight">Divisi Acara</p>
                      </div>
                    </div>
                    <div className="flex w-[150px] -mt-1">
                      <div className="w-full ml-[25px]">
                         <div className="flex flex-col gap-6 pt-6 relative">
                            <div className="flex items-center relative group">
                              <div className="absolute top-[-1.5rem] bottom-[-1.5rem] left-0 w-[3px] bg-primary"></div>
                              <div className="w-6 h-[3px] bg-primary"></div>
                              <div className="flex flex-col items-center w-[130px] relative px-1 hover:-translate-y-2 transition-transform duration-300 cursor-pointer group">
                                <div className="w-[80px] h-[80px] rounded-full overflow-hidden border-[4px] border-primary bg-white shadow-md z-10 relative">
                                   <Image src="/gallery_2.webp" alt="MC" fill sizes="80px" className="object-cover" />
                                </div>
                                <div className="-mt-5 pt-8 pb-3 px-2 w-full flex flex-col items-center justify-center text-center rounded-xl bg-primary text-white shadow-sm z-0 min-h-[75px] group-hover:shadow-md transition-shadow">
                                  <h4 className="font-black text-[10px] leading-tight mb-1 uppercase tracking-tight">Nama Lengkap</h4>
                                  <p className="text-[8px] font-bold uppercase opacity-80 leading-tight">MC</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center relative group">
                              <div className="absolute top-0 bottom-1/2 left-0 w-[3px] bg-primary"></div>
                              <div className="w-6 h-[3px] bg-primary"></div>
                              <div className="flex flex-col items-center w-[130px] relative px-1 hover:-translate-y-2 transition-transform duration-300 cursor-pointer group">
                                <div className="w-[80px] h-[80px] rounded-full overflow-hidden border-[4px] border-primary bg-white shadow-md z-10 relative">
                                   <Image src="/gallery_2.webp" alt="Operator" fill sizes="80px" className="object-cover" />
                                </div>
                                <div className="-mt-5 pt-8 pb-3 px-2 w-full flex flex-col items-center justify-center text-center rounded-xl bg-primary text-white shadow-sm z-0 min-h-[75px] group-hover:shadow-md transition-shadow">
                                  <h4 className="font-black text-[10px] leading-tight mb-1 uppercase tracking-tight">Nama Lengkap</h4>
                                  <p className="text-[8px] font-bold uppercase opacity-80 leading-tight">Operator</p>
                                </div>
                              </div>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
            
                  {/* Node ADMIN */}
                  <div className="flex flex-col items-center flex-1 relative">
                    <div className="absolute top-0 left-0 right-1/2 h-[3px] bg-primary"></div>
                    <div className="w-[3px] h-8 bg-primary"></div>
                    <div className="flex flex-col items-center w-[150px] relative px-1 hover:-translate-y-2 transition-transform duration-300 cursor-pointer group">
                      <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-[4px] border-primary bg-white shadow-md z-10 relative">
                         <Image src="/gallery_2.webp" alt="Admin" fill sizes="100px" className="object-cover" />
                      </div>
                      <div className="-mt-6 pt-10 pb-4 px-2 w-full flex flex-col items-center justify-center text-center rounded-[1rem] bg-primary text-white shadow-sm z-0 min-h-[90px] group-hover:shadow-md transition-shadow">
                        <h4 className="font-black text-[12px] leading-tight mb-1 uppercase tracking-tight">Nama Lengkap</h4>
                        <p className="text-[9px] font-bold uppercase opacity-80 leading-tight">Admin</p>
                      </div>
                    </div>
                  </div>
            
                </div>
              </div>

              {/* MOBILE LAYOUT (Vertical Tree) */}
              <div className="flex md:hidden flex-col w-full max-w-[340px] mx-auto select-none font-sans mt-2">
                {/* Kepala Kantor */}
                <div className="flex items-center relative z-10 mb-8">
                  <div className="w-[80px] h-[80px] rounded-full overflow-hidden border-[3px] border-primary bg-white shadow-md z-10 flex-shrink-0 relative">
                     <Image src="/gallery_1.webp" alt="Kepala Kantor" fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="ml-4 flex flex-col justify-center bg-primary text-white py-3 px-5 rounded-2xl shadow-md w-full relative group">
                    <h4 className="font-black text-[12px] leading-tight mb-0.5 uppercase tracking-tight">Nama Kepala, S.E., M.Si.</h4>
                    <p className="text-[10px] font-bold uppercase opacity-80 leading-tight">Kepala Kantor</p>
                  </div>
                </div>

                {/* Child nodes container */}
                <div className="flex flex-col relative ml-[40px] pl-6 pt-6 gap-6">
                  {/* Main Vertical Stem */}
                  <div className="absolute left-[-1.5px] top-0 bottom-[30px] w-[3px] bg-primary z-0"></div>
                  
                  {/* Node SEKRETARIS */}
                  <div className="flex flex-col relative w-full">
                    <div className="flex items-center relative w-full z-10">
                      <div className="absolute left-[-24px] top-1/2 w-6 h-[3px] bg-primary -translate-y-1/2 z-0"></div>
                      <div className="w-[60px] h-[60px] rounded-full overflow-hidden border-[3px] border-primary bg-white shadow-sm z-10 flex-shrink-0 relative">
                         <Image src="/gallery_2.webp" alt="Sekretaris" fill sizes="60px" className="object-cover" />
                      </div>
                      <div className="ml-3 flex flex-col justify-center bg-primary text-white py-2 px-4 rounded-xl shadow-sm w-full">
                        <h4 className="font-black text-[11px] leading-tight mb-0.5 uppercase tracking-tight">Nama Lengkap</h4>
                        <p className="text-[9px] font-bold uppercase opacity-80 leading-tight">Sekretaris</p>
                      </div>
                    </div>
                  </div>

                  {/* Node DIVISI SDM */}
                  <div className="flex flex-col relative w-full">
                    <div className="flex items-center relative w-full z-10">
                      <div className="absolute left-[-24px] top-1/2 w-6 h-[3px] bg-primary -translate-y-1/2 z-0"></div>
                      <div className="w-[60px] h-[60px] rounded-full overflow-hidden border-[3px] border-primary bg-white shadow-sm z-10 flex-shrink-0 relative">
                         <Image src="/gallery_2.webp" alt="Divisi SDM" fill sizes="60px" className="object-cover" />
                      </div>
                      <div className="ml-3 flex flex-col justify-center bg-primary text-white py-2 px-4 rounded-xl shadow-sm w-full">
                        <h4 className="font-black text-[11px] leading-tight mb-0.5 uppercase tracking-tight">Nama Lengkap</h4>
                        <p className="text-[9px] font-bold uppercase opacity-80 leading-tight">Divisi SDM</p>
                      </div>
                    </div>
                  </div>

                  {/* Node KOORDINATOR */}
                  <div className="flex flex-col relative w-full">
                    <div className="flex items-center relative w-full z-10">
                      <div className="absolute left-[-24px] top-1/2 w-6 h-[3px] bg-primary -translate-y-1/2 z-0"></div>
                      <div className="w-[60px] h-[60px] rounded-full overflow-hidden border-[3px] border-primary bg-white shadow-sm z-10 flex-shrink-0 relative">
                         <Image src="/gallery_2.webp" alt="Koordinator" fill sizes="60px" className="object-cover" />
                      </div>
                      <div className="ml-3 flex flex-col justify-center bg-primary text-white py-2 px-4 rounded-xl shadow-sm w-full">
                        <h4 className="font-black text-[11px] leading-tight mb-0.5 uppercase tracking-tight">Nama Lengkap</h4>
                        <p className="text-[9px] font-bold uppercase opacity-80 leading-tight">Koordinator</p>
                      </div>
                    </div>
                    {/* Sub-node Protokoler */}
                    <div className="flex flex-col relative ml-[30px] pl-5 mt-[-20px] pt-[36px] gap-4 z-0">
                      <div className="absolute left-[-1.5px] top-0 bottom-[22.5px] w-[3px] bg-primary z-0"></div>
                      <div className="flex items-center relative w-full z-10">
                        <div className="absolute left-[-20px] top-1/2 w-5 h-[3px] bg-primary -translate-y-1/2 z-0"></div>
                        <div className="w-[45px] h-[45px] rounded-full overflow-hidden border-[2px] border-primary bg-white shadow-sm z-10 flex-shrink-0 relative">
                           <Image src="/gallery_2.webp" alt="Protokoler" fill sizes="45px" className="object-cover" />
                        </div>
                        <div className="ml-3 flex flex-col justify-center bg-primary text-white py-1.5 px-3 rounded-lg shadow-sm w-full">
                          <h4 className="font-black text-[10px] leading-tight mb-0.5 uppercase tracking-tight">Nama Lengkap</h4>
                          <p className="text-[8px] font-bold uppercase opacity-80 leading-tight">Protokoler Mahasiswa</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Node DIVISI ACARA */}
                  <div className="flex flex-col relative w-full">
                    <div className="flex items-center relative w-full z-10">
                      <div className="absolute left-[-24px] top-1/2 w-6 h-[3px] bg-primary -translate-y-1/2 z-0"></div>
                      <div className="w-[60px] h-[60px] rounded-full overflow-hidden border-[3px] border-primary bg-white shadow-sm z-10 flex-shrink-0 relative">
                         <Image src="/gallery_2.webp" alt="Divisi Acara" fill sizes="60px" className="object-cover" />
                      </div>
                      <div className="ml-3 flex flex-col justify-center bg-primary text-white py-2 px-4 rounded-xl shadow-sm w-full">
                        <h4 className="font-black text-[11px] leading-tight mb-0.5 uppercase tracking-tight">Nama Lengkap</h4>
                        <p className="text-[9px] font-bold uppercase opacity-80 leading-tight">Divisi Acara</p>
                      </div>
                    </div>
                    {/* Sub-node MC & Operator */}
                    <div className="flex flex-col relative ml-[30px] pl-5 mt-[-20px] pt-[36px] gap-4 z-0">
                      <div className="absolute left-[-1.5px] top-0 bottom-[22.5px] w-[3px] bg-primary z-0"></div>
                      <div className="flex items-center relative w-full z-10">
                        <div className="absolute left-[-20px] top-1/2 w-5 h-[3px] bg-primary -translate-y-1/2 z-0"></div>
                        <div className="w-[45px] h-[45px] rounded-full overflow-hidden border-[2px] border-primary bg-white shadow-sm z-10 flex-shrink-0 relative">
                           <Image src="/gallery_2.webp" alt="MC" fill sizes="45px" className="object-cover" />
                        </div>
                        <div className="ml-3 flex flex-col justify-center bg-primary text-white py-1.5 px-3 rounded-lg shadow-sm w-full">
                          <h4 className="font-black text-[10px] leading-tight mb-0.5 uppercase tracking-tight">Nama Lengkap</h4>
                          <p className="text-[8px] font-bold uppercase opacity-80 leading-tight">MC</p>
                        </div>
                      </div>
                      <div className="flex items-center relative w-full z-10">
                        <div className="absolute left-[-20px] top-1/2 w-5 h-[3px] bg-primary -translate-y-1/2 z-0"></div>
                        <div className="w-[45px] h-[45px] rounded-full overflow-hidden border-[2px] border-primary bg-white shadow-sm z-10 flex-shrink-0 relative">
                           <Image src="/gallery_2.webp" alt="Operator" fill sizes="45px" className="object-cover" />
                        </div>
                        <div className="ml-3 flex flex-col justify-center bg-primary text-white py-1.5 px-3 rounded-lg shadow-sm w-full">
                          <h4 className="font-black text-[10px] leading-tight mb-0.5 uppercase tracking-tight">Nama Lengkap</h4>
                          <p className="text-[8px] font-bold uppercase opacity-80 leading-tight">Operator</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Node ADMIN */}
                  <div className="flex flex-col relative w-full">
                    <div className="flex items-center relative w-full z-10">
                      <div className="absolute left-[-24px] top-1/2 w-6 h-[3px] bg-primary -translate-y-1/2 z-0"></div>
                      <div className="w-[60px] h-[60px] rounded-full overflow-hidden border-[3px] border-primary bg-white shadow-sm z-10 flex-shrink-0 relative">
                         <Image src="/gallery_2.webp" alt="Admin" fill sizes="60px" className="object-cover" />
                      </div>
                      <div className="ml-3 flex flex-col justify-center bg-primary text-white py-2 px-4 rounded-xl shadow-sm w-full">
                        <h4 className="font-black text-[11px] leading-tight mb-0.5 uppercase tracking-tight">Nama Lengkap</h4>
                        <p className="text-[9px] font-bold uppercase opacity-80 leading-tight">Admin</p>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}
