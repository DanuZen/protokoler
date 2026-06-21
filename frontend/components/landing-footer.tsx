import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Camera, Play, Mail, MapPin, Phone } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="relative z-20 pt-20 pb-10" style={{ background: '#020104', borderTop: '1px solid rgba(210,173,92,0.15)' }}>
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center gap-12 mb-16 max-w-3xl mx-auto">
          
          {/* Column 1: Brand & About */}
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="relative h-16 w-16">
                <Image src="/logo protokoler.png" alt="Logo Protokoler" fill sizes="64px" className="object-contain drop-shadow-md" />
              </div>
              <div className="flex flex-col items-center">
                <span className="font-display text-3xl font-bold text-white tracking-widest leading-none mb-2">PROTOKOLER</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D2AD5C]">Universitas Negeri Padang</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md mb-8">
              Garda terdepan dalam menjaga tata aturan, tata tempat, tata upacara, dan tata penghormatan di lingkungan institusi Universitas Negeri Padang.
            </p>
            <div className="flex items-center justify-center gap-4">
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

          {/* Column 2: Kontak */}
          <div className="flex flex-col items-center">
            <h3 className="text-white font-bold tracking-widest uppercase text-sm mb-6 flex items-center justify-center gap-4">
              <div className="w-8 h-[2px] bg-[#D2AD5C]"></div>
              Hubungi Kami
              <div className="w-8 h-[2px] bg-[#D2AD5C]"></div>
            </h3>
            <ul className="space-y-4 flex flex-col items-center">
              <li className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <MapPin className="w-5 h-5 text-[#D2AD5C] flex-shrink-0" />
                <span className="text-slate-400 text-sm leading-relaxed max-w-md">Gedung Rektorat UNP Lantai 1, Jl. Prof. Dr. Hamka, Air Tawar Padang, Sumatera Barat.</span>
              </li>
              <li className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <Phone className="w-4 h-4 text-[#D2AD5C] flex-shrink-0" />
                <span className="text-slate-400 text-sm">(0751) 7051147</span>
              </li>
              <li className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <Mail className="w-4 h-4 text-[#D2AD5C] flex-shrink-0" />
                <span className="text-slate-400 text-sm">protokoler@unp.ac.id</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col items-center justify-center gap-4 text-center">
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
