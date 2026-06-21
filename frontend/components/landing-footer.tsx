import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Camera, Play, Mail, MapPin, Phone } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="relative z-20 pt-20 pb-10" style={{ background: '#020104', borderTop: '1px solid rgba(210,173,92,0.15)' }}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8 mb-16 text-center lg:text-left">
          
          {/* Column 1: Brand & About */}
          <div className="lg:col-span-2 flex flex-col items-center lg:items-start">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative h-16 w-16 lg:h-14 lg:w-14">
                <Image src="/logo protokoler.png" alt="Logo Protokoler" fill sizes="(max-width: 1024px) 64px, 56px" className="object-contain drop-shadow-md lg:drop-shadow-none" />
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="font-display text-3xl lg:text-2xl font-bold text-white tracking-widest leading-none mb-2 lg:mb-1">PROTOKOLER</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D2AD5C]">Universitas Negeri Padang</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md lg:max-w-sm mb-8">
              Garda terdepan dalam menjaga tata aturan, tata tempat, tata upacara, dan tata penghormatan di lingkungan institusi Universitas Negeri Padang.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-4">
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

          {/* Column 2: Tautan Cepat (Desktop Only) */}
          <div className="hidden lg:block">
            <h3 className="text-white font-bold tracking-widest uppercase text-sm mb-6 flex items-center gap-2">
              <div className="w-4 h-[2px] bg-[#D2AD5C]"></div>
              Tautan Cepat
            </h3>
            <ul className="space-y-4">
              <li><Link href="/#profil" className="text-slate-400 hover:text-[#D2AD5C] text-sm transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Tentang Kami</Link></li>
              <li><Link href="/#jadwal" className="text-slate-400 hover:text-[#D2AD5C] text-sm transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Jadwal Kegiatan</Link></li>
              <li><Link href="/#prosedur" className="text-slate-400 hover:text-[#D2AD5C] text-sm transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> SOP & Regulasi</Link></li>
              <li><Link href="/#postingan" className="text-slate-400 hover:text-[#D2AD5C] text-sm transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Berita Terbaru</Link></li>
              <li><Link href="/persyaratan" className="text-slate-400 hover:text-[#D2AD5C] text-sm transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Persyaratan</Link></li>
            </ul>
          </div>

          {/* Column 3: Kontak */}
          <div className="flex flex-col items-center lg:items-start">
            <h3 className="text-white font-bold tracking-widest uppercase text-sm mb-6 flex items-center justify-center lg:justify-start gap-4 lg:gap-2">
              <div className="w-8 lg:w-4 h-[2px] bg-[#D2AD5C]"></div>
              Hubungi Kami
              <div className="w-8 h-[2px] bg-[#D2AD5C] block lg:hidden"></div>
            </h3>
            <ul className="space-y-4 lg:space-y-5 flex flex-col items-center lg:items-start text-center lg:text-left">
              <li className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-2 sm:gap-3">
                <MapPin className="w-5 h-5 text-[#D2AD5C] flex-shrink-0 lg:mt-0.5" />
                <span className="text-slate-400 text-sm leading-relaxed max-w-md">Gedung Rektorat UNP Lantai 1, Jl. Prof. Dr. Hamka, Air Tawar Padang, Sumatera Barat.</span>
              </li>
              <li className="flex flex-col sm:flex-row items-center lg:items-center justify-center lg:justify-start gap-2 sm:gap-3">
                <Phone className="w-4 h-4 text-[#D2AD5C] flex-shrink-0" />
                <span className="text-slate-400 text-sm">(0751) 7051147</span>
              </li>
              <li className="flex flex-col sm:flex-row items-center lg:items-center justify-center lg:justify-start gap-2 sm:gap-3">
                <Mail className="w-4 h-4 text-[#D2AD5C] flex-shrink-0" />
                <span className="text-slate-400 text-sm">protokoler@unp.ac.id</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-4 text-center lg:text-left">
          <p className="text-xs text-slate-500 font-medium">© {new Date().getFullYear()} Unit Protokoler Universitas Negeri Padang. Hak Cipta Dilindungi.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500">
            <Link href="/tim-pengembang" className="hover:text-white transition-colors font-bold text-[#D2AD5C]">Tim Pengembang</Link>
            <Link href="#" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
            <Link href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
