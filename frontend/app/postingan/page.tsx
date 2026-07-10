'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { postinganApi } from '@/lib/api';
import { LandingNavbar } from '@/components/landing-navbar';
import { LandingFooter } from '@/components/landing-footer';
import { PostCard } from '@/components/post-card';
import { PostModal } from '@/components/post-modal';
import { Megaphone, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

export default function PostinganPage() {
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [modalPhotoIdx, setModalPhotoIdx] = useState(0);
  const [isPostDescExpanded, setIsPostDescExpanded] = useState(false);

  const { data: postinganDokumentasi, isLoading } = useQuery({
    queryKey: ['postingan-dokumentasi'],
    queryFn: () => postinganApi.list(),
  });

  const handleSelectPost = (post: any) => {
    setSelectedPost(post);
    setModalPhotoIdx(0);
    setIsPostDescExpanded(false);
  };

  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedPost]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-red-100 font-sans flex flex-col relative overflow-hidden">
      {/* Subtle clean background decoration */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 z-0"
        style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #ffffff 0%, transparent 70%)' }}
      />
      <LandingNavbar alwaysDark={true} />

      <main className="flex-1 pt-32 pb-24 md:pt-40 md:pb-32 relative z-10">
        <div className="container mx-auto px-6 max-w-7xl">
          
          {/* Header Section */}
          <div className="mb-12 md:mb-16">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-16"
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-3 md:gap-4 mb-6">
                <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C]"></div>
                <span className="text-[10px] sm:text-xs md:text-sm font-bold text-[#6B0000] uppercase tracking-widest md:tracking-[0.25em] whitespace-nowrap">Galeri & Dokumentasi</span>
                <div className="w-6 md:w-8 h-[2px] bg-[#D2AD5C]"></div>
              </motion.div>
              <motion.h1 variants={fadeUp} className="font-display text-3xl sm:text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-4 sm:mb-6">
                Semua <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-900">Postingan</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-slate-500 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
                Eksplorasi seluruh dokumentasi kegiatan resmi yang telah dirangkum oleh tim Protokoler Universitas Negeri Padang.
              </motion.p>
            </motion.div>
          </div>

          {/* Grid Section */}
          {isLoading ? (
            <div className="flex justify-center items-center py-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B0000]"></div>
            </div>
          ) : postinganDokumentasi && postinganDokumentasi.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
              {postinganDokumentasi.map((post: any) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isFeatured={false} // All posts normal size in this view
                  onClick={() => handleSelectPost(post)}
                />
              ))}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 px-6 bg-white border border-slate-100 rounded-[2rem] text-center shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center shadow-inner mb-6">
                <Megaphone className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Belum ada postingan</h3>
              <p className="text-slate-500 max-w-md text-lg">Informasi, berita, dan dokumentasi terbaru akan segera hadir di sini.</p>
            </div>
          )}
        </div>
      </main>

      <LandingFooter />

      {/* Post Modal */}
      <PostModal 
        selectedPost={selectedPost} 
        setSelectedPost={setSelectedPost} 
        modalPhotoIdx={modalPhotoIdx} 
        setModalPhotoIdx={setModalPhotoIdx} 
        isPostDescExpanded={isPostDescExpanded} 
        setIsPostDescExpanded={setIsPostDescExpanded} 
      />
    </div>
  );
}
