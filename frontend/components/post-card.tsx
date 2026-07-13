import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: any;
  isFeatured: boolean;
  onClick: () => void;
}

export function PostCard({ post, isFeatured, onClick }: PostCardProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const images = post.images || [post.gambar || '/protokoler1.jpeg'];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  let gridClass = "h-[360px] md:h-[400px]";
  if (isFeatured) {
    gridClass += " md:col-span-2 lg:col-span-2";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden cursor-pointer rounded-3xl w-full",
        gridClass
      )}
      style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)' }}
    >
      {/* Slider Images */}
      {images.map((img: string, idx: number) => (
        <motion.div
          key={img + idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: idx === activeIdx ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 z-0"
        >
          <Image 
            src={img} 
            alt={post.judul} 
            fill 
            sizes={isFeatured ? "(max-width: 1024px) 100vw, 60vw" : "(max-width: 1024px) 100vw, 40vw"} 
            className="object-cover transition-transform duration-1000 group-hover:scale-108" 
          />
        </motion.div>
      ))}

      {/* Slide Navigation Buttons */}
      {images.length > 1 && (
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-20 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={handlePrev} 
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={handleNext} 
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500 z-10" />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" style={{ background: 'linear-gradient(135deg, rgba(139,10,26,0.4) 0%, transparent 60%)' }} />
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" style={{ boxShadow: 'inset 0 0 0 2px rgba(139,10,26,0.6)' }} />
      
      {/* Tag */}
      <div className="absolute top-6 left-6 flex gap-2 z-20">
        <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#6B0000]/90 backdrop-blur-md text-white shadow-lg">
          {post.kategori}
        </span>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 z-20 flex flex-col justify-end">
        <p className="text-[#D2AD5C] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2">
          {new Date(post.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <h3 className={cn("text-white font-bold drop-shadow-lg leading-tight mb-3", isFeatured ? "text-2xl md:text-3xl" : "text-xl md:text-2xl")}>
          {post.judul}
        </h3>
        
        <p className={cn("text-white/80 transition-all duration-500 line-clamp-2", isFeatured ? "text-sm md:text-base mb-5 opacity-100" : "text-sm mb-0 h-0 opacity-0 group-hover:h-auto group-hover:mb-4 group-hover:opacity-100")}>
          {post.ringkasan}
        </p>

        <div className={cn("flex items-center gap-3 transition-opacity duration-500", isFeatured ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
          <div className="w-8 h-[2px] rounded-full bg-[#D2AD5C]" />
          <span className="text-white text-[10px] md:text-xs font-bold uppercase tracking-widest group-hover:text-[#D2AD5C] transition-colors">Baca Selengkapnya</span>
        </div>
      </div>
    </motion.div>
  );
}
