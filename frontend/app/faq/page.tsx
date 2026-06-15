'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    q: 'Bagaimana cara menjadi anggota protokoler di sistem baru ini?',
    a: "Pendaftaran dapat dilakukan kapan saja melalui portal registrasi. Lengkapi data diri beserta pas foto resmi. Setelah diajukan, akun Anda akan masuk status 'Menunggu Verifikasi' dan akan ditinjau oleh Admin.",
  },
  {
    q: 'Bagaimana sistem perhitungan poin gamifikasi bekerja?',
    a: 'Setiap kegiatan yang berhasil Anda ikuti (hadir dan mengisi evaluasi tepat waktu) akan menambah poin kegiatan Anda. Capai 10 kegiatan untuk medali Silver, dan 20 kegiatan untuk medali Gold.',
  },
  {
    q: 'Apakah absensi kegiatan harus menggunakan foto selfie?',
    a: 'Ya. Untuk memastikan transparansi dan kehadiran di lapangan, sistem absensi SiProto v1.2 mewajibkan setiap protokoler dan LO untuk melakukan absensi selfie.',
  },
  {
    q: 'Bagaimana cara mendapatkan sertifikat elektronik?',
    a: "Sertifikat elektronik akan otomatis diterbitkan di profil Anda jika Anda berstatus 'Hadir' pada kegiatan tersebut dan mengisi form evaluasi 3 Tata Protokol dalam batas waktu 1x24 jam.",
  },
  {
    q: 'Apakah data kehadiran saya aman dan terlindungi?',
    a: 'Ya. Semua data kehadiran, termasuk foto selfie dan lokasi GPS, dienkripsi dan disimpan di server yang aman. Data hanya dapat diakses oleh anggota yang bersangkutan dan Admin yang berwenang.',
  },
  {
    q: 'Bagaimana jika saya lupa mengisi evaluasi kegiatan?',
    a: 'Sistem akan mengirimkan notifikasi pengingat. Jika batas waktu 1x24 jam terlewat, status kehadiran Anda tetap tercatat namun sertifikat elektronik tidak dapat diterbitkan secara otomatis. Hubungi Admin untuk penyelesaian.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function FAQPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#0f0a0a]">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-9 w-9">
              <Image src="/logo protokoler.png" alt="Logo Protokoler" fill sizes="36px" className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-tight leading-none mb-1 text-white">PROTOKOLER</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300">UNIVERSITAS NEGERI PADANG</span>
            </div>
          </Link>

          <nav className="hidden gap-8 lg:flex items-center">
            {[
              { label: 'Jadwal', href: '/#jadwal' },
              { label: 'Galeri', href: '/#galeri' },
              { label: 'FAQ', href: '/faq' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'text-sm font-semibold transition-colors',
                  item.href === '/faq' ? 'text-orange-400' : 'text-slate-300 hover:text-orange-400'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* Background decoration */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #6b0000 0%, transparent 40%), radial-gradient(circle at 10% 80%, #1e293b 0%, transparent 50%)' }}
      />

      {/* Page Content */}
      <main className="relative z-10 pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-4xl">

          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-5 py-2 text-xs font-bold text-orange-300 uppercase tracking-[0.25em] mb-6">
              Pusat Bantuan
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-display text-5xl font-extrabold text-white md:text-6xl leading-tight">
              Pertanyaan <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">Sering Diajukan</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Temukan jawaban atas pertanyaan umum seputar fitur dan alur kerja platform <span className="text-white font-semibold">SiProto v1.2</span>.
            </motion.p>
          </motion.div>

          {/* FAQ Accordion */}
          <motion.div
            initial="hidden"
            animate="visible"
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
                      ? 'border-orange-500/40 bg-white/5 shadow-lg shadow-orange-900/10'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                  )}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  >
                    <span className={cn('font-bold text-lg pr-8 transition-colors duration-300', isOpen ? 'text-white' : 'text-slate-300')}>
                      {faq.q}
                    </span>
                    <div
                      className={cn(
                        'shrink-0 h-10 w-10 flex items-center justify-center transition-all duration-500 rounded-xl',
                        isOpen ? 'bg-orange-500 text-white rotate-180' : 'bg-white/10 text-slate-400'
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
                        <div className="px-6 pb-6 text-slate-400 text-base leading-relaxed border-t border-white/10 pt-4">
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
            className="mt-16 text-center p-10 rounded-3xl border border-white/10 bg-white/[0.03]"
          >
            <p className="text-slate-400 text-lg mb-2">Masih ada pertanyaan lain?</p>
            <p className="text-white font-bold text-xl mb-6">Hubungi tim protokoler kami langsung.</p>
            <Link
              href="mailto:protokoler@unp.ac.id"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full transition-all hover:scale-105"
            >
              Kirim Email
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950 py-10 relative z-20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8">
              <Image src="/logo protokoler.png" alt="Logo Protokoler" fill sizes="32px" className="object-contain grayscale opacity-40" />
            </div>
            <span className="font-display text-lg font-bold text-white tracking-widest">PROTOKOLER</span>
          </div>
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} Unit Protokoler Universitas. Hak Cipta Dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
