'use client';
import { motion } from 'framer-motion';
import { ChevronLeft, GitBranch, ExternalLink, Mail, Code } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const team = [
  {
    name: "John Doe",
    role: "Project Manager",
    description: "Memastikan proyek berjalan sesuai timeline dan standar protokol institusi.",
    image: "https://i.pravatar.cc/300?img=11",
  },
  {
    name: "Jane Smith",
    role: "Lead UI/UX Designer",
    description: "Merancang antarmuka pengguna yang elegan dan intuitif bernuansa premium.",
    image: "https://i.pravatar.cc/300?img=5",
  },
  {
    name: "Wira",
    role: "Fullstack Developer",
    description: "Membangun arsitektur frontend dan backend yang solid untuk aplikasi Protokoler.",
    image: "https://i.pravatar.cc/300?img=15",
  },
  {
    name: "Ahmad",
    role: "Backend Engineer",
    description: "Mengoptimalkan database dan fungsionalitas manajemen kegiatan.",
    image: "https://i.pravatar.cc/300?img=8",
  }
];

export default function TimPengembang() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-red-100 flex flex-col font-sans">
      
      {/* Header Minimalis */}
      <header className="absolute top-0 left-0 right-0 z-50 p-6 md:p-10 flex justify-between items-center">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-[#6B0000] font-medium transition-colors group">
          <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-all border border-slate-100">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <span className="hidden md:block">Kembali ke Beranda</span>
        </Link>
        <div className="flex items-center gap-3">
            <div className="relative h-8 w-8">
              <Image src="/logo protokoler.png" alt="Logo" fill sizes="32px" className="object-contain" />
            </div>
            <span className="font-display font-bold text-slate-900 tracking-widest text-sm">PROTOKOLER</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative pt-32 pb-24">
        
        {/* Background Mesh (Subtle) */}
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-red-50/50 to-transparent -z-10 pointer-events-none" />
        
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          
          <div className="text-center mb-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex justify-center items-center gap-3 md:gap-4 mb-6">
              <div className="w-6 md:w-12 h-[2px] bg-[#D2AD5C]"></div>
              <span className="text-[10px] sm:text-xs md:text-sm font-bold text-[#6B0000] uppercase tracking-widest md:tracking-[0.25em] whitespace-nowrap">Credit</span>
              <div className="w-6 md:w-12 h-[2px] bg-[#D2AD5C]"></div>
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="font-display text-4xl md:text-5xl lg:text-[4rem] font-bold tracking-tight text-slate-900 leading-tight mb-6 text-balance">
              Tim <span className="text-[#6B0000]">Pengembang</span>
            </motion.h1>
            
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Orang-orang di balik layar yang merancang dan mengembangkan sistem informasi modern untuk Unit Protokoler Universitas.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + (i * 0.1) }}
                className="group relative bg-white rounded-3xl p-6 border border-slate-100 hover:border-red-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
              >
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden mb-6 mx-auto group-hover:-translate-y-2 transition-transform duration-500 shadow-md">
                   <div className="absolute inset-0 bg-[#6B0000]/20 group-hover:opacity-0 transition-opacity z-10 mix-blend-multiply" />
                   {/* Fallback to initials if image is blocked */}
                   <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center">
                     <Code className="w-8 h-8 text-slate-300" />
                   </div>
                   <Image src={member.image} alt={member.name} fill sizes="96px" className="object-cover relative z-20 grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
                
                <div className="text-center">
                  <h3 className="font-display text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-xs font-bold text-[#D2AD5C] uppercase tracking-wider mb-4">{member.role}</p>
                  <p className="text-sm text-slate-500 leading-relaxed transition-all duration-300">
                    {member.description}
                  </p>
                </div>
                
                {/* Socials Hover */}
                <div className="absolute top-6 right-6 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex flex-col gap-2 z-30">
                  <a href="#" className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-[#6B0000] hover:bg-red-50 flex items-center justify-center shadow-sm">
                    <GitBranch className="w-3.5 h-3.5" />
                  </a>
                  <a href="#" className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-[#6B0000] hover:bg-red-50 flex items-center justify-center shadow-sm">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </main>
      
      {/* Footer Minimalis */}
      <footer className="py-8 border-t border-slate-100 text-center relative z-20 bg-slate-50">
        <p className="text-xs font-medium text-slate-400">© {new Date().getFullYear()} Unit Protokoler Universitas. Dibuat dengan presisi.</p>
      </footer>
    </div>
  );
}
