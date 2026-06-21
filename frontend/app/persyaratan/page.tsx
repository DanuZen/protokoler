'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Ruler, Mic, Users, HeartHandshake, BookOpen, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LandingNavbar } from '@/components/landing-navbar';
import { LandingFooter } from '@/components/landing-footer';
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const requirements = [
  {
    icon: BookOpen,
    title: 'Mahasiswa Aktif',
    desc: 'Tercatat sebagai mahasiswa aktif Universitas Negeri Padang maksimal semester 3 pada saat pendaftaran.',
  },
  {
    icon: Ruler,
    title: 'Postur Proporsional',
    desc: 'Tinggi badan minimal: Pria 165 cm dan Wanita 160 cm dengan berat badan proporsional.',
  },
  {
    icon: Mic,
    title: 'Public Speaking',
    desc: 'Memiliki dasar kemampuan komunikasi publik yang baik, jelas, dan berani tampil di depan umum.',
  },
  {
    icon: Users,
    title: 'Team Player',
    desc: 'Mampu bekerja sama dalam tim, memiliki kedisiplinan tinggi, dan tahan terhadap tekanan saat bertugas.',
  },
  {
    icon: HeartHandshake,
    title: 'Berdedikasi',
    desc: 'Berkomitmen tinggi untuk menjaga nama baik institusi serta bersedia mengikuti seluruh masa pelatihan (Diklat).',
  },
  {
    icon: Zap,
    title: 'Cekatan & Tanggap',
    desc: 'Mampu berpikir cepat, mengambil keputusan taktis, dan responsif terhadap perubahan situasi mendadak di lapangan.',
  },
];

export default function PersyaratanPage() {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Navbar */}
      <LandingNavbar alwaysDark={true} />

      {/* Very subtle clean background decoration */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #ffffff 0%, transparent 70%)' }}
      />

      {/* Page Content */}
      <main className="relative z-10 pt-32 pb-16 md:pb-24">
        <div className="container mx-auto px-6 max-w-5xl">

          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-3 md:gap-4 mb-6">
              <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C]"></div>
              <span className="text-[10px] sm:text-xs md:text-sm font-bold text-[#6B0000] uppercase tracking-widest md:tracking-[0.25em] whitespace-nowrap">Rekrutmen 2026</span>
              <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C]"></div>
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-display text-3xl sm:text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-4 sm:mb-6">
              Syarat <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-900">Pendaftaran</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-slate-500 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
              Pastikan Anda memenuhi kriteria dasar di bawah ini sebelum mengajukan pendaftaran sebagai calon anggota Protokoler Universitas.
            </motion.p>
          </motion.div>

          {/* Requirements Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-16"
          >
            {requirements.map((req, i) => (
              <motion.div
                variants={fadeUp}
                key={i}
                className="p-5 md:p-8 rounded-3xl md:rounded-[2rem] bg-white border border-slate-200 hover:border-[#D2AD5C] transition-all duration-300 hover:bg-slate-50 shadow-sm hover:shadow-md group flex flex-col items-center text-center md:items-start md:text-left"
              >
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-3 md:mb-6 group-hover:bg-[#6B0000] transition-colors duration-300">
                  <req.icon className="h-5 w-5 md:h-6 md:w-6 text-[#D2AD5C] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-sm md:text-xl font-bold text-slate-900 mb-2 md:mb-3">{req.title}</h3>
                <p className="text-[10px] md:text-sm text-slate-600 leading-relaxed">
                  {req.desc}
                </p>
              </motion.div>
            ))}
            
            {/* Final Highlight Card */}
            <motion.div
              variants={fadeUp}
              className="col-span-2 md:col-span-2 lg:col-span-3 p-8 md:p-12 rounded-3xl md:rounded-[2rem] bg-gradient-to-br from-[#6B0000] to-[#3a0000] border border-red-500/30 flex flex-col md:flex-row items-center justify-between relative overflow-hidden text-center md:text-left gap-6 md:gap-10"
            >
              <div className="absolute -right-10 -bottom-10 opacity-20 pointer-events-none">
                <CheckCircle2 className="w-48 h-48 md:w-64 md:h-64 text-white" />
              </div>
              <div className="relative z-10 flex-1">
                <h3 className="text-xl md:text-3xl font-display font-bold text-white mb-2 md:mb-3">Sudah Penuhi Syarat?</h3>
                <p className="text-red-100/90 text-sm md:text-base max-w-xl mx-auto md:mx-0">
                  Jika Anda merasa memiliki seluruh kriteria di atas, berarti Anda adalah kandidat unggulan yang sedang kami cari untuk bergabung bersama kami!
                </p>
              </div>
              <div className="relative z-10 shrink-0 w-full md:w-auto">
                <Link href="/auth">
                  <Button className="w-full md:w-auto bg-white text-[#6B0000] hover:bg-slate-50 rounded-full font-bold uppercase tracking-widest text-[10px] md:text-xs px-8 h-12 md:h-14 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-all">
                    Lanjut Ke Pendaftaran
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>

          {/* Timeline / Berkas Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="rounded-3xl md:rounded-[3rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 p-6 sm:p-10 md:p-12 relative overflow-hidden"
          >
            {/* Dekorasi halus */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4 pointer-events-none" />

            <motion.div variants={fadeUp} className="text-center mb-8 sm:mb-12 relative z-10">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">Berkas yang Perlu Disiapkan</h2>
            </motion.div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
              {['Pas Foto Resmi', 'KTM / Bukti Mahasiswa', 'Curriculum Vitae', 'Surat Izin Orang Tua'].map((item, i) => (
                <motion.div variants={fadeUp} key={i} className="group flex items-center gap-4 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-slate-800">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
