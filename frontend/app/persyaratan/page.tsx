'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Ruler, Mic, Users, HeartHandshake, BookOpen } from 'lucide-react';
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
            <motion.div variants={fadeUp} className="inline-flex items-center gap-4 mb-6">
              <div className="w-8 h-[2px] bg-[#D2AD5C]"></div>
              <span className="text-sm font-bold text-[#6B0000] uppercase tracking-[0.25em]">Rekrutmen 2026</span>
              <div className="w-8 h-[2px] bg-[#D2AD5C]"></div>
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-display text-3xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
              Persyaratan <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D2AD5C] to-[#997a3d]">Pendaftaran</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Pastikan Anda memenuhi kriteria dasar di bawah ini sebelum mengajukan pendaftaran sebagai calon anggota Protokoler Universitas.
            </motion.p>
          </motion.div>

          {/* Requirements Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
          >
            {requirements.map((req, i) => (
              <motion.div
                variants={fadeUp}
                key={i}
                className="p-8 rounded-[2rem] bg-white border border-slate-200 hover:border-[#D2AD5C] transition-all duration-300 hover:bg-slate-50 shadow-sm hover:shadow-md group"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-6 group-hover:bg-[#6B0000] transition-colors duration-300">
                  <req.icon className="h-6 w-6 text-[#D2AD5C] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{req.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {req.desc}
                </p>
              </motion.div>
            ))}
            
            {/* Final Highlight Card */}
            <motion.div
              variants={fadeUp}
              className="p-8 rounded-[2rem] bg-gradient-to-br from-[#6B0000] to-[#3a0000] border border-red-500/30 flex flex-col justify-center relative overflow-hidden"
            >
              <div className="absolute -right-10 -bottom-10 opacity-20">
                <CheckCircle2 className="w-48 h-48 text-white" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-2">Penuhi Syarat?</h3>
                <p className="text-red-100/80 text-sm mb-6">Jika Anda memenuhi seluruh kriteria, Anda adalah kandidat yang kami cari!</p>
                <Link href="/auth">
                  <Button className="w-full bg-white text-[#6B0000] hover:bg-slate-100 rounded-full font-bold uppercase tracking-widest text-[10px] h-12 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-all">
                    Ke Halaman Pendaftaran
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
            className="rounded-[3rem] bg-white border border-slate-200 shadow-sm p-8 md:p-12"
          >
            <motion.h2 variants={fadeUp} className="text-2xl font-bold text-slate-900 mb-8 text-center">Berkas yang Perlu Disiapkan</motion.h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {['Pas Foto Resmi', 'KTM / Bukti Mahasiswa', 'Curriculum Vitae', 'Surat Izin Orang Tua'].map((item, i) => (
                <motion.div variants={fadeUp} key={i} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-sm font-semibold text-slate-700">{item}</span>
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
