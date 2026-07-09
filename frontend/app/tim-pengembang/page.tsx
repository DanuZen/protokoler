'use client';
import { motion } from 'framer-motion';
import { ChevronLeft, Globe, Mail, Code } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { LandingNavbar } from '@/components/landing-navbar';
import { LandingFooter } from '@/components/landing-footer';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

const team = [
  {
    name: "Wira Fikri Ramadanu",
    role: "Project Manager & Frontend Developer",
    description: "Memimpin manajemen proyek sekaligus merancang dan membangun arsitektur antarmuka pengguna yang modern.",
    image: "/tim_pengembang/danu.webp",
    socials: {
      instagram: "https://www.instagram.com/daann.u/",
      github: "https://github.com/DanuZen",
      web: "https://imdann.vercel.app/"
    }
  },
  {
    name: "Hafiz Hafrienda",
    role: "Backend Developer & Quality Assurance",
    description: "Mengoptimalkan sistem database dan logika server, serta memastikan keandalan fungsionalitas seluruh fitur.",
    image: "/tim_pengembang/hafiz.webp",
    socials: {
      instagram: "https://www.instagram.com/phizrr/",
      github: "https://github.com/HAFIZ-02",
      web: null
    }
  }
];

export default function TimPengembang() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-red-100 flex flex-col font-sans">
      
      <LandingNavbar alwaysDark={true} />

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
            
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] font-bold tracking-tight text-slate-900 leading-tight mb-4 sm:mb-6 text-balance">
              Tim <span className="text-[#6B0000]">Pengembang</span>
            </motion.h1>
            
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-sm sm:text-base md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed px-4">
              Orang-orang di balik layar yang merancang dan mengembangkan sistem informasi modern untuk Unit Protokoler Universitas.
            </motion.p>
          </div>

          <div className="flex flex-col items-center gap-24 md:gap-16 max-w-sm md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto w-full">
            {team.map((member, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + (i * 0.1) }}
                className={`group w-full relative z-10 hover:z-50 flex flex-col ${i % 2 === 0 ? 'md:flex-row md:text-left' : 'md:flex-row-reverse md:text-right'} items-center bg-white rounded-3xl p-6 md:p-10 border border-slate-100 hover:border-red-100 shadow-sm hover:shadow-xl transition-all duration-500 gap-6 md:gap-24`}
              >
                {/* Image Section */}
                <div className="relative w-44 h-36 sm:w-48 sm:h-40 md:w-56 md:h-48 shrink-0 z-20 mx-auto">
                   {/* Background Box (The one that expands and changes color) */}
                   <div className="absolute inset-0 bg-[#6B0000] scale-x-[1.25] md:bg-slate-200 md:scale-x-100 md:group-hover:bg-[#6B0000] md:group-hover:scale-x-[1.15] rounded-[2rem] shadow-md transition-all duration-500 flex flex-col items-center justify-center">
                     <Code className="w-8 h-8 md:w-16 md:h-16 text-slate-300" />
                   </div>
                   
                   {/* Profile Image (The one that pops out) */}
                   <Image src={member.image} alt={member.name} fill sizes="(max-width: 768px) 192px, 256px" className="object-contain object-bottom relative z-20 grayscale-0 scale-[1.75] drop-shadow-2xl md:drop-shadow-none md:grayscale md:scale-100 md:group-hover:grayscale-0 md:group-hover:scale-[1.45] md:group-hover:drop-shadow-2xl transition-all duration-500 origin-bottom" />
                </div>
                
                {/* Text Section */}
                <div className={`flex-1 flex flex-col justify-center text-center md:text-inherit ${i % 2 === 0 ? 'md:pr-16' : 'md:pl-16'}`}>
                  <h3 className="font-display text-2xl md:text-4xl font-bold text-slate-900 mb-2">{member.name}</h3>
                  <p className="text-xs md:text-sm font-bold text-[#D2AD5C] uppercase tracking-wider mb-4 md:mb-6">{member.role}</p>
                  <p className="text-sm md:text-lg text-slate-500 leading-relaxed transition-all duration-300">
                    {member.description}
                  </p>
                </div>
                
                {/* Socials Hover */}
                <div className={`relative mt-6 md:mt-0 md:absolute md:top-1/2 md:-translate-y-1/2 ${i % 2 === 0 ? 'md:right-8' : 'md:left-8'} opacity-100 translate-x-0 md:opacity-0 ${i % 2 === 0 ? 'md:translate-x-2' : 'md:-translate-x-2'} md:group-hover:translate-x-0 md:group-hover:opacity-100 transition-all duration-300 flex flex-row md:flex-col justify-center gap-4 md:gap-3 z-30`}>
                  {member.socials?.instagram && (
                    <a href={member.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-50 text-[#6B0000] hover:bg-[#6B0000] hover:text-white flex items-center justify-center shadow-sm transition-colors duration-300">
                      <InstagramIcon className="w-4 h-4 md:w-5 md:h-5" />
                    </a>
                  )}
                  {member.socials?.github && (
                    <a href={member.socials.github} target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-50 text-[#6B0000] hover:bg-[#6B0000] hover:text-white flex items-center justify-center shadow-sm transition-colors duration-300">
                      <GithubIcon className="w-4 h-4 md:w-5 md:h-5" />
                    </a>
                  )}
                  {member.socials?.web && (
                    <a href={member.socials.web} target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-50 text-[#6B0000] hover:bg-[#6B0000] hover:text-white flex items-center justify-center shadow-sm transition-colors duration-300">
                      <Globe className="w-4 h-4 md:w-4.5 md:h-4.5" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
