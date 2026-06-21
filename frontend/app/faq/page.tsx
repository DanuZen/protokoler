'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { ChevronDown, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LandingNavbar } from '@/components/landing-navbar';
import { LandingFooter } from '@/components/landing-footer';
const faqs = [
  {
    q: 'Apa saja tugas utama seorang anggota Protokoler Universitas?',
    a: 'Tugas utama meliputi tata tempat (seating arrangement), tata upacara, tata penghormatan, pendampingan pimpinan universitas, serta penyambutan tamu VIP/VVIP dalam acara resmi institusi.',
  },
  {
    q: 'Bagaimana standar pakaian (dress code) saat bertugas?',
    a: 'Anggota protokoler wajib mengenakan Pakaian Sipil Lengkap (PSL) atau seragam resmi protokoler dengan rapi, sepatu pantofel hitam, serta atribut resmi yang telah ditetapkan untuk menjaga citra profesional universitas.',
  },
  {
    q: 'Apakah ada pelatihan khusus untuk anggota baru?',
    a: 'Ya, setiap anggota baru diwajibkan mengikuti Pendidikan dan Pelatihan (Diklat) Dasar Keprotokolan yang mencakup materi public speaking, table manner, etika pergaulan, dan manajemen acara.',
  },
  {
    q: 'Apa perbedaan tugas Protokoler dan Liaison Officer (LO)?',
    a: 'Protokoler berfokus pada manajemen acara secara keseluruhan, termasuk tata letak dan upacara resmi. Sedangkan LO bertugas mendampingi dan melayani kebutuhan personal tamu kehormatan atau delegasi secara spesifik selama kegiatan berlangsung.',
  },
  {
    q: 'Bagaimana alur penugasan anggota dalam suatu acara resmi?',
    a: 'Penugasan akan diumumkan secara internal. Anggota yang memenuhi kualifikasi dapat mendaftar untuk bertugas. Setelah ditunjuk, anggota wajib mengikuti gladi kotor dan gladi bersih sebelum hari pelaksanaan acara.',
  },
  {
    q: 'Apakah mahasiswa dari semua fakultas dapat bergabung?',
    a: 'Tentu. Pendaftaran terbuka bagi seluruh mahasiswa aktif Universitas Negeri Padang tanpa memandang fakultas, asalkan memenuhi persyaratan dasar seperti postur proporsional dan kemampuan komunikasi yang baik.',
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function FAQPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
        <div className="container mx-auto px-6 max-w-4xl">

          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-3 md:gap-4 mb-6">
              <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C]"></div>
              <span className="text-[10px] sm:text-xs md:text-sm font-bold text-[#6B0000] uppercase tracking-widest md:tracking-[0.25em] whitespace-nowrap">Pusat Bantuan</span>
              <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C]"></div>
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-display text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
              Pertanyaan <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">Sering Diajukan</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Temukan jawaban atas pertanyaan umum seputar fitur dan alur kerja platform <span className="text-slate-900 font-semibold">Protokoler</span>.
            </motion.p>
          </motion.div>

          {/* FAQ Accordion */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="space-y-4"
          >
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <motion.div
                  variants={fadeUp}
                  key={i}
                  className={cn(
                    'rounded-2xl overflow-hidden transition-all duration-300 border',
                    isOpen
                      ? 'border-red-200 bg-red-50/50 shadow-sm shadow-red-100'
                      : 'border-slate-200 bg-white hover:border-red-200 hover:bg-slate-50'
                  )}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  >
                    <span className={cn('font-bold text-lg pr-8 transition-colors duration-300', isOpen ? 'text-red-700' : 'text-slate-900')}>
                      {faq.q}
                    </span>
                    <div
                      className={cn(
                        'shrink-0 h-10 w-10 flex items-center justify-center transition-all duration-500 rounded-xl',
                        isOpen ? 'bg-red-100 text-red-700 rotate-180' : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      <ChevronDown className="h-5 w-5" />
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-slate-600 text-base leading-relaxed border-t border-red-100/50 pt-4">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-20 relative overflow-hidden text-center p-10 md:p-14 rounded-3xl bg-gradient-to-br from-[#6B0000] to-red-950 shadow-2xl border border-red-800/50"
          >
            {/* Background decoration for the card */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-white opacity-5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-red-500 opacity-20 blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/5 backdrop-blur-sm">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-white font-display text-2xl md:text-3xl font-bold mb-3">Masih ada pertanyaan lain?</h2>
              <p className="text-red-100/90 text-sm md:text-base mb-8 max-w-lg mx-auto leading-relaxed">
                Tim kami siap membantu. Jangan ragu untuk menghubungi divisi kami secara langsung apabila Anda membutuhkan informasi lebih spesifik.
              </p>
              <Link
                href="mailto:protokoler@unp.ac.id"
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-[#6B0000] font-bold px-8 py-4 rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:-translate-y-1 group"
              >
                Kirim Pesan Sekarang
                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
