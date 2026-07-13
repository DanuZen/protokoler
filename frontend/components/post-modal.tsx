import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  X, ShieldCheck, ChevronLeft, ChevronRight, 
  CalendarDays, FileText, Clock, MapPin, Users, Megaphone, UserCheck, Mic, Star 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostModalProps {
  selectedPost: any;
  setSelectedPost: (post: any | null) => void;
  modalPhotoIdx: number;
  setModalPhotoIdx: React.Dispatch<React.SetStateAction<number>>;
  isPostDescExpanded: boolean;
  setIsPostDescExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

export function PostModal({ 
  selectedPost, 
  setSelectedPost, 
  modalPhotoIdx, 
  setModalPhotoIdx, 
  isPostDescExpanded, 
  setIsPostDescExpanded 
}: PostModalProps) {
  if (!selectedPost) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center px-4 pb-4 pt-[100px] sm:px-6 sm:pb-6 sm:pt-[110px] md:px-12 md:pb-12 md:pt-[130px] bg-black/80 backdrop-blur-sm"
        onClick={() => setSelectedPost(null)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white w-[95vw] max-w-[1400px] max-h-[90vh] md:h-[85vh] rounded-2xl md:rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Header Sticky */}
          <div className="md:hidden shrink-0 px-5 py-3 border-b border-red-100/60 flex items-center justify-between bg-gradient-to-r from-red-50/80 via-white to-amber-50/50 z-20 shadow-sm relative w-full">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#6B0000] via-[#8f0000] to-[#D2AD5C]" />
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                 <Image src="/logo-protokoler-new.webp" width={36} height={36} alt="Protokoler" className="object-contain drop-shadow-sm" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-sm text-slate-900 leading-none">Protokoler UNP</p>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D2AD5C]" />
                </div>
                <p className="text-[10px] text-red-900/60 font-semibold mt-0.5 tracking-wide">Akun Resmi Institusi</p>
              </div>
            </div>
            <button onClick={() => setSelectedPost(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-red-100 hover:bg-[#6B0000] text-slate-400 hover:text-white transition-all shadow-sm group">
              <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
            </button>
          </div>

          {/* Left Side: Image (Instagram style slideable) */}
          <div className={cn("w-full md:w-[60%] aspect-square md:aspect-auto md:h-full shrink-0 bg-slate-950 relative flex items-center justify-center overflow-hidden group/image", isPostDescExpanded ? "hidden md:flex" : "flex")}>
             {/* Blur Background */}
             <Image 
               src={selectedPost.images?.[modalPhotoIdx] || selectedPost.gambar} 
               alt={selectedPost.judul} 
               fill 
               className="object-cover opacity-30 blur-2xl pointer-events-none scale-110" 
             />
             {/* Main Image */}
             <Image 
               src={selectedPost.images?.[modalPhotoIdx] || selectedPost.gambar} 
               alt={selectedPost.judul} 
               fill 
               className="object-contain drop-shadow-2xl z-10" 
             />

             {/* Navigation Arrows for Slider */}
             {selectedPost.images && selectedPost.images.length > 1 && (
               <>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setModalPhotoIdx((prev) => (prev === 0 ? selectedPost.images.length - 1 : prev - 1)); 
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md animate-in fade-in"
                  >
                     <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setModalPhotoIdx((prev) => (prev === selectedPost.images.length - 1 ? 0 : prev + 1)); 
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md animate-in fade-in"
                  >
                     <ChevronRight className="w-6 h-6" />
                  </button>
               </>
             )}
          </div>

          {/* Right Side: Content */}
          <div className="w-full md:w-[40%] h-[60%] md:h-full flex flex-col bg-white overflow-hidden">
             {/* Header Sticky */}
             <div className="hidden md:flex px-6 py-4 md:px-8 md:py-4 border-b border-red-100/60 items-center justify-between bg-gradient-to-r from-red-50/80 via-white to-amber-50/50 z-10 shadow-sm relative">
               <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#6B0000] via-[#8f0000] to-[#D2AD5C]" />
               <div className="flex items-center gap-3">
                 <div className="flex-shrink-0">
                    <Image src="/logo-protokoler-new.webp" width={44} height={44} alt="Protokoler" className="object-contain drop-shadow-sm" />
                 </div>
                 <div>
                   <div className="flex items-center gap-1.5">
                     <p className="font-bold text-sm md:text-base text-slate-900 leading-none">Protokoler UNP</p>
                     <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#D2AD5C]" />
                   </div>
                   <p className="text-[10px] md:text-xs text-red-900/60 font-semibold mt-0.5 tracking-wide">Akun Resmi Institusi</p>
                 </div>
               </div>
               <button onClick={() => setSelectedPost(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-red-100 hover:bg-[#6B0000] text-slate-400 hover:text-white transition-all shadow-sm group">
                 <X className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:rotate-90" />
               </button>
             </div>

             {/* Scrollable Content */}
             <div className="px-6 py-5 md:px-8 md:py-6 flex-1 overflow-y-auto bg-slate-50/50 flex flex-col">
               <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900 mb-3 leading-tight">{selectedPost.judul}</h2>
               
               <div className="flex flex-wrap items-center gap-4 mb-5">
                 <div className="inline-flex items-center gap-1.5 text-slate-500">
                   <CalendarDays className="w-3.5 h-3.5" />
                   <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest">
                     {new Date(selectedPost.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                   </p>
                 </div>
                 {selectedPost.kategori && (
                   <div className="inline-flex items-center gap-1.5 text-slate-500">
                     <FileText className="w-3.5 h-3.5" />
                     <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest">
                       {selectedPost.kategori}
                     </p>
                   </div>
                 )}
               </div>
               
               {(() => {
                 const activePhotoUrl = selectedPost.images?.[modalPhotoIdx];
                 const activeDoc = (selectedPost.dokumentasi || []).find((d: any) => d.file_url === activePhotoUrl);
                 const description = activeDoc?.keterangan || selectedPost.ringkasan;
                 
                 const cleanDesc = description ? description.replace(/\d+\s*file\s*dokumentasi\s*telah\s*diupload/i, '').trim() : '';
                 
                 if (!cleanDesc) {
                   return (
                     <div className="mb-8 flex items-center gap-3 px-4 py-3 bg-slate-50/80 rounded-xl border border-slate-100/60">
                       <div className="w-2 h-2 rounded-full bg-slate-300" />
                       <p className="text-slate-400 italic text-sm">Tidak ada deskripsi tambahan.</p>
                     </div>
                   );
                 }

                 return (
                   <div className="mb-4 md:mb-8 relative flex-shrink-0 group/desc">
                     {/* Decorative quote mark */}
                     <div className="hidden md:block absolute -top-3 -left-3 text-4xl text-slate-200 font-serif leading-none select-none">"</div>
                     <div className="relative z-10 pl-0 md:pl-2">
                       <p className={cn("text-slate-600 leading-relaxed whitespace-pre-wrap text-sm md:text-base transition-all duration-300", !isPostDescExpanded && "line-clamp-2 md:line-clamp-none")}>
                         {cleanDesc}
                       </p>
                       {!isPostDescExpanded && cleanDesc.length > 80 && (
                         <button 
                           onClick={() => setIsPostDescExpanded(true)}
                           className="text-slate-400 hover:text-slate-600 font-semibold text-[11px] md:hidden mt-1"
                         >
                           selengkapnya
                         </button>
                       )}
                       {isPostDescExpanded && (
                         <button 
                           onClick={() => setIsPostDescExpanded(false)}
                           className="text-slate-400 hover:text-slate-600 font-semibold text-[11px] md:hidden mt-2 block"
                         >
                           Sembunyikan
                         </button>
                       )}
                     </div>
                   </div>
                 );
               })()}

               {/* Mini Gallery (if multiple images) */}
               {selectedPost.images && selectedPost.images.length > 1 && (
                 <div className="hidden md:block mb-8 shrink-0">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Galeri Dokumentasi ({selectedPost.images.length})</p>
                   <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
                     {selectedPost.images.map((img: string, idx: number) => (
                       <button 
                         key={idx} 
                         onClick={() => setModalPhotoIdx(idx)} 
                         className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-300 ${idx === modalPhotoIdx ? 'border-[#6B0000] shadow-md ring-2 ring-red-100 ring-offset-1' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}
                       >
                         <Image src={img} fill alt={`Thumbnail ${idx+1}`} className="object-cover" />
                       </button>
                     ))}
                   </div>
                 </div>
               )}

               {/* Bottom Fixed Container */}
               <div className="mt-auto shrink-0 flex flex-col">
                 {/* Event Details Grid */}
                 <div className="hidden md:grid grid-cols-2 gap-y-7 gap-x-4 py-6 border-t border-slate-200/60">
                    {/* WAKTU */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100 mt-0.5">
                         <Clock className="w-4 h-4 text-[#6B0000]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Waktu</p>
                        <p className="text-sm text-slate-900 font-semibold">
                          {selectedPost.jam_mulai && selectedPost.jam_selesai 
                            ? `${String(selectedPost.jam_mulai).slice(0, 5)} - ${String(selectedPost.jam_selesai).slice(0, 5)} WIB` 
                            : '-'}
                        </p>
                      </div>
                    </div>

                    {/* LOKASI */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100 mt-0.5">
                         <MapPin className="w-4 h-4 text-[#6B0000]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lokasi</p>
                        <p className="text-sm text-slate-900 font-semibold capitalize">{selectedPost.lokasi || '-'}</p>
                      </div>
                    </div>

                    {/* TAMU / PIMPINAN */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100 mt-0.5">
                         <Users className="w-4 h-4 text-[#6B0000]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tamu / Pimpinan</p>
                        <p className="text-sm text-slate-900 font-semibold capitalize">
                          {selectedPost.tamu_vvip && selectedPost.tamu_vvip.length > 0
                            ? selectedPost.tamu_vvip.map((t: any) => t.nama_tamu).join(', ')
                            : '-'}
                        </p>
                      </div>
                    </div>

                    {/* BENTUK KEGIATAN */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100 mt-0.5">
                         <Megaphone className="w-4 h-4 text-[#6B0000]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bentuk Kegiatan</p>
                        <p className="text-sm text-slate-900 font-semibold capitalize">{selectedPost.bentuk_kegiatan ? selectedPost.bentuk_kegiatan.replace(/_/g, ' ') : '-'}</p>
                      </div>
                    </div>

                    {/* TARGET PESERTA */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100 mt-0.5">
                         <UserCheck className="w-4 h-4 text-[#6B0000]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Peserta</p>
                        <p className="text-sm text-slate-900 font-semibold capitalize">{selectedPost.audience || '-'}</p>
                      </div>
                    </div>

                    {/* NARASUMBER / KEYNOTE */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100 mt-0.5">
                         <Mic className="w-4 h-4 text-[#6B0000]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Narasumber / Keynote</p>
                        <p className="text-sm text-slate-900 font-semibold capitalize">{selectedPost.keynote || '-'}</p>
                      </div>
                    </div>
                 </div>

                 {/* Testimoni Tamu */}
                 {selectedPost.testimoni && selectedPost.testimoni.length > 0 && (
                   <div className="hidden md:block pt-2 pb-2">
                     <div className="flex flex-col gap-4">
                       {selectedPost.testimoni.map((t: any, idx: number) => (
                         <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-5 shadow-sm">
                           <div className="flex flex-col gap-3">
                             <div className="flex items-start justify-between">
                               <div>
                                 <p className="text-sm font-bold text-slate-900">{t.nama_tamu}</p>
                                 {t.jabatan_tamu && <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mt-0.5">{t.jabatan_tamu}</p>}
                               </div>
                               {t.rating && (
                                 <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                                   <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                                   <span className="text-xs font-bold text-amber-700">{t.rating}</span>
                                 </div>
                               )}
                             </div>
                             <p className="text-sm text-slate-600 leading-relaxed italic relative pl-4 border-l-2 border-[#D2AD5C]">
                               "{t.isi_testimoni}"
                             </p>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
               </div>

             </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
