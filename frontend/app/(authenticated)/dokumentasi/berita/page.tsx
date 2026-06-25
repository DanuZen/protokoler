'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kegiatanApi, postinganApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BookOpen, CalendarDays, Search, UploadCloud, MapPin, CheckCircle2, AlertCircle, ArrowLeft, ListTodo, Clock, Radio, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAuth, useRole } from '@/hooks/use-auth';

function compressImage(file: File, quality = 0.75): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file); // Hanya kompres file bertipe gambar
      return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', quality);
      };
    };
  });
}

export default function ManajemenBeritaPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  
  // User Auth & Role
  const { user } = useAuth();
  const { data: role } = useRole(user);

  // Dialog State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState('foto');
  const [files, setFiles] = useState<File[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [formData, setFormData] = useState({
    kategori: '',
    gambar: '/gallery_1.webp',
    ringkasan: '',
  });

  // Tampilan Upload Form / Detail
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      setIsCompressing(true);
      try {
        const fileList = Array.from(selectedFiles);
        const compressedList = await Promise.all(
          fileList.map((f) => compressImage(f))
        );
        setFiles(compressedList);
      } catch (err) {
        toast.error('Gagal mengompres beberapa gambar');
      } finally {
        setIsCompressing(false);
      }
    }
  };

  // Queries
  const { data: kegiatan } = useQuery({
    queryKey: ['dokumentasi-kegiatan'],
    queryFn: () => kegiatanApi.list(),
  });

  const { data: postingan = [] } = useQuery({
    queryKey: ['postingan-list'],
    queryFn: postinganApi.list,
  });

  // Query Detail Dokumentasi per Kegiatan
  const { data: detailDokumentasi, refetch: refetchDetail } = useQuery({
    queryKey: ['dokumentasi-kegiatan-detail', selectedId],
    queryFn: () => postinganApi.byKegiatan(selectedId!),
    enabled: !!selectedId,
  });

  // Filter foto saja
  const existingPhotos = useMemo(() => {
    return (detailDokumentasi?.dokumentasi || []).filter((d: any) => d.media_type === 'foto');
  }, [detailDokumentasi]);

  // Reset active photo index when detail photos change
  useEffect(() => {
    setActivePhotoIdx(0);
  }, [existingPhotos.length]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const kegiatanId = params.get('kegiatan_id');
      if (kegiatanId && !selectedId) {
        setSelectedId(kegiatanId);
      }
    }
  }, [selectedId]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !hasAutoOpened && detailDokumentasi && selectedId) {
      const params = new URLSearchParams(window.location.search);
      const kegiatanId = params.get('kegiatan_id');
      const edit = params.get('edit');
      
      if (kegiatanId === selectedId && edit === 'true') {
        setHasAutoOpened(true);
        const photos = (detailDokumentasi.dokumentasi || []).filter((d: any) => d.media_type === 'foto');
        if (photos.length > 0) {
          const firstPhotoWithKategori = photos.find((d: any) => d.kategori && d.kategori.trim() !== '');
          const firstPhotoWithKeterangan = photos.find((d: any) => d.keterangan && d.keterangan.trim() !== '');
          
          setFormData({
            kategori: firstPhotoWithKategori?.kategori || '',
            gambar: '/gallery_1.webp',
            ringkasan: firstPhotoWithKeterangan?.keterangan || '',
          });
          setFiles([]);
          setIsEditingMode(true);
          setShowUploadForm(true);
        } else {
          setFormData({
            kategori: '',
            gambar: '/gallery_1.webp',
            ringkasan: '',
          });
          setFiles([]);
          setIsEditingMode(false);
          setShowUploadForm(true);
        }
      }
    }
  }, [detailDokumentasi, selectedId, hasAutoOpened]);

  const handleEditPost = () => {
    const firstPhotoWithKategori = existingPhotos.find((d: any) => d.kategori && d.kategori.trim() !== '');
    const firstPhotoWithKeterangan = existingPhotos.find((d: any) => d.keterangan && d.keterangan.trim() !== '');
    
    setFormData({
      kategori: firstPhotoWithKategori?.kategori || '',
      gambar: '/gallery_1.webp',
      ringkasan: firstPhotoWithKeterangan?.keterangan || '',
    });
    setFiles([]);
    setIsEditingMode(true);
    setShowUploadForm(true);
  };

  // Search filter - Tampilkan semua kegiatan (tidak hanya selesai)
  const filteredKegiatan = (kegiatan ?? []).filter((p: any) => 
    p.nama_kegiatan.toLowerCase().includes(search.toLowerCase()) || 
    (p.lokasi && p.lokasi.toLowerCase().includes(search.toLowerCase()))
  );

  const selected = (kegiatan ?? []).find((item: any) => item.id === selectedId) || null;

  const createMutation = useMutation({
    mutationFn: postinganApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postingan-list'] });
      queryClient.invalidateQueries({ queryKey: ['dokumentasi-kegiatan-detail', selectedId] });
      toast.success(`Dokumentasi berhasil dipublikasikan!`);
      setFormData({ kategori: '', gambar: '/gallery_1.webp', ringkasan: '' });
      setFiles([]);
      setMediaType('foto');
      refetchDetail().then(() => {
        setShowUploadForm(false);
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: postinganApi.delete,
    onSuccess: () => {
      toast.success('Foto dokumentasi berhasil dihapus!');
      refetchDetail();
      queryClient.invalidateQueries({ queryKey: ['postingan-list'] });
    },
    onError: (err: any) => {
      toast.error(`Gagal menghapus: ${err.message}`);
    }
  });

  const handleDeletePhoto = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus foto dokumentasi ini dari database?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleUpload = async () => {
    if (!selected) return;
    if (mediaType !== 'video' && (!formData.kategori || !formData.ringkasan)) {
      toast.error('Mohon lengkapi Kategori dan Keterangan berita');
      return;
    }
    
    if (isEditingMode) {
      try {
        await postinganApi.update(selected.id, {
          ringkasan: formData.ringkasan,
          kategori: formData.kategori
        });
        
        if (files.length > 0) {
          const payload = {
            kegiatan_id: selected.id,
            media_type: mediaType,
            ringkasan: formData.ringkasan,
            kategori: formData.kategori,
            files: files,
            judul: selected.nama_kegiatan,
            gambar: formData.gambar,
            tanggal: new Date().toISOString()
          };
          createMutation.mutate(payload);
        } else {
          queryClient.invalidateQueries({ queryKey: ['postingan-list'] });
          queryClient.invalidateQueries({ queryKey: ['dokumentasi-kegiatan-detail', selectedId] });
          toast.success('Postingan dokumentasi berhasil diperbarui!');
          setFormData({ kategori: '', gambar: '/gallery_1.webp', ringkasan: '' });
          setFiles([]);
          setShowUploadForm(false);
        }
      } catch (err: any) {
        toast.error(`Gagal memperbarui postingan: ${err.message}`);
      }
    } else {
      if (mediaType !== 'video' && files.length === 0) {
        toast.error('Mohon pilih file dokumentasi untuk diunggah');
        return;
      }
      
      const payload = {
        kegiatan_id: selected.id,
        media_type: mediaType,
        ringkasan: formData.ringkasan,
        kategori: formData.kategori,
        files: files,
        judul: selected.nama_kegiatan,
        gambar: formData.gambar,
        tanggal: new Date().toISOString()
      };
      
      createMutation.mutate(payload);
    }
  };

  const isPublished = (judulKegiatan: string) => {
    return postingan.some((p: any) => p.judul === judulKegiatan);
  };

  const totalKegiatan = kegiatan?.length || 0;
  const selesaiKegiatan = (kegiatan || []).filter((k: any) => k.status === 'selesai').length;
  const belumDokumentasi = (kegiatan || []).filter((k: any) => k.status === 'selesai' && !isPublished(k.nama_kegiatan)).length;
  const beritaPublished = postingan?.length || 0;


  return (
    <div className="flex flex-col h-auto md:h-dvh md:overflow-hidden pb-6 px-6 md:px-8 pt-4">
      
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-200/60">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-800 to-red-800 shadow-lg shadow-red-900/20 text-white">
            <BookOpen className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-red-900">
                Workspace Terpadu
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 text-slate-900 drop-shadow-sm">Manajemen Berita</h1>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Pantau status kegiatan dan unggah dokumentasi untuk mempublikasikannya sebagai berita.</p>
          </div>
        </div>
      </motion.div>

      {!selectedId && (
        <>
          {/* SUMMARY CARDS */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Kegiatan", value: totalKegiatan, icon: ListTodo, hint: "Semua agenda terdaftar", color: "text-red-800", bg: "bg-red-50" },
              { label: "Acara Selesai", value: selesaiKegiatan, icon: CheckCircle2, hint: "Kegiatan yang telah selesai", color: "text-red-800", bg: "bg-red-50" },
              { label: "Belum Upload", value: belumDokumentasi, icon: AlertCircle, hint: "Acara selesai belum ada berita", color: "text-red-800", bg: "bg-red-50" },
              { label: "Berita Dipublikasi", value: beritaPublished, icon: BookOpen, hint: "Berita yang sudah tayang", color: "text-red-800", bg: "bg-red-50" }
            ].map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }}>
                <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl py-6 px-6 flex flex-col justify-between hover:shadow-xl hover:shadow-red-50/80 transition-all group relative overflow-hidden h-full">
                  <div className="flex items-center justify-between relative z-10">
                    <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                    <div className={cn("flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl transition-colors", stat.bg, stat.color)}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 relative z-10">
                    <p className="text-[32px] font-bold leading-tight text-slate-900">{stat.value}</p>
                    <span className="text-[11px] font-medium text-slate-400 mt-1 block">{stat.hint}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>


        </>
      )}

      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {!selectedId ? (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col h-full overflow-hidden">
            <Card className="overflow-hidden border-slate-200 shadow-sm rounded-2xl bg-white flex flex-col h-full">
              <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 bg-white border border-slate-200 text-primary rounded-[14px] shadow-sm shrink-0">
                    <ListTodo className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">Daftar Acara & Status Dokumentasi</h2>
                    <p className="text-sm text-slate-500 mt-1">Pilih acara pada tabel di bawah ini untuk mengunggah dokumentasi.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-sm w-full md:max-w-xs">
                  <Search className="h-4 w-4 text-slate-400" />
                  <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama acara atau lokasi..." className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-1 h-8 text-sm" />
                </div>
              </div>
              
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4">Nama Kegiatan</th>
                      <th className="px-6 py-4">Waktu & Tempat</th>
                      <th className="px-6 py-4">Status Acara</th>
                      <th className="px-6 py-4">Status Dokumentasi</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredKegiatan.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-400">
                          Tidak ada kegiatan yang ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredKegiatan.map((keg: any) => {
                        const published = isPublished(keg.nama_kegiatan);
                        return (
                          <tr key={keg.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-900 mb-1">{keg.nama_kegiatan}</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{keg.kategori}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mb-1.5">
                                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                                {new Date(keg.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                <span className="truncate max-w-[150px]">{keg.lokasi}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className={cn("px-2.5 py-0.5 rounded-full text-xs capitalize font-medium", 
                                keg.status === 'selesai' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                keg.status === 'berlangsung' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                'bg-amber-50 text-amber-600 border-amber-200'
                              )}>
                                {keg.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              {published ? (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 w-fit font-medium">
                                  <CheckCircle2 className="w-3 h-3" /> Sudah Upload
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 w-fit font-medium">
                                  <AlertCircle className="w-3 h-3" /> Belum Upload
                                </Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button 
                                onClick={() => { 
                                  setSelectedId(keg.id); 
                                  setIsEditingMode(false);
                                  setShowUploadForm(false); 
                                  setFormData({ kategori: '', gambar: '/gallery_1.webp', ringkasan: '' });
                                  setFiles([]);
                                }}
                                className="bg-red-900 hover:bg-red-800 text-white rounded-xl h-8 px-4 text-xs font-bold shadow-sm"
                              >
                                <UploadCloud className="w-3.5 h-3.5 mr-1.5" /> Upload
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        ) : (

          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="flex flex-col h-full overflow-hidden">
            <div className="shrink-0 mb-6 flex items-center">
              <Button variant="outline" onClick={() => setSelectedId(null)} className="bg-white border-slate-200 text-slate-700 hover:text-red-900 hover:bg-red-50 hover:border-red-200 shadow-sm rounded-xl px-4 h-10 font-bold transition-all">
                <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Acara
              </Button>
            </div>
            
            {existingPhotos.length > 0 && !showUploadForm ? (
              // ─── TAMPILAN DETAIL DOKUMENTASI & SLIDER ───
              <Card className="overflow-hidden border-slate-200 shadow-sm rounded-2xl bg-white w-full flex flex-col h-full">
                <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center h-12 w-12 bg-white border border-slate-200 text-red-900 rounded-[14px] shadow-sm">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 leading-tight">Detail Dokumentasi Kegiatan</h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Menampilkan dokumentasi untuk: <strong className="text-slate-800">{selected?.nama_kegiatan}</strong>
                      </p>
                    </div>
                  </div>
                  {(role === 'admin' || role === 'dokumentasi') && (
                    <Button 
                      onClick={handleEditPost} 
                      className="bg-red-900 hover:bg-red-800 text-white rounded-xl h-10 px-5 text-xs font-bold shadow-sm transition-all"
                    >
                      Edit Postingan
                    </Button>
                  )}
                </div>

                <div className="p-8 space-y-6 flex-1 overflow-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left: Slideable Photo */}
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-sm group">
                      <img 
                        src={existingPhotos[activePhotoIdx].file_url} 
                        alt={selected?.nama_kegiatan} 
                        className="w-full h-full object-contain" 
                      />
                      
                      {/* Photo overlay description */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-5 text-white text-xs z-10">
                        <p className="font-semibold text-slate-200">
                          Foto {activePhotoIdx + 1} dari {existingPhotos.length}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Diupload oleh: {existingPhotos[activePhotoIdx].uploaded_by} · {existingPhotos[activePhotoIdx].uploaded_at ? new Date(existingPhotos[activePhotoIdx].uploaded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                        </p>
                      </div>

                      {/* Delete icon button (admin & dokumentasi only) */}
                      {(role === 'admin' || role === 'dokumentasi') && (
                        <button 
                          onClick={() => handleDeletePhoto(existingPhotos[activePhotoIdx].id)}
                          className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-xl shadow-lg transition-all hover:scale-105 z-20 flex items-center justify-center"
                          title="Hapus foto ini"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      )}

                      {/* Carousel Arrow Controls */}
                      {existingPhotos.length > 1 && (
                        <>
                          <button 
                            onClick={() => setActivePhotoIdx((prev) => (prev === 0 ? existingPhotos.length - 1 : prev - 1))}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2.5 rounded-full backdrop-blur-sm transition-all z-20 flex items-center justify-center"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setActivePhotoIdx((prev) => (prev === existingPhotos.length - 1 ? 0 : prev + 1))}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2.5 rounded-full backdrop-blur-sm transition-all z-20 flex items-center justify-center"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>

                          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1.5 rounded-full z-20">
                            {existingPhotos.map((_: any, idx: number) => (
                              <div 
                                key={idx} 
                                className={cn("w-1.5 h-1.5 rounded-full transition-all", idx === activePhotoIdx ? "bg-white w-3" : "bg-white/50")} 
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Right: Description & News details */}
                    <div className="flex flex-col gap-4">
                      <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-6 shadow-sm">
                        <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 block">Keterangan / Isi Berita</label>
                        <div className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                          {existingPhotos[activePhotoIdx].keterangan || 'Tidak ada keterangan / isi berita untuk dokumentasi foto ini.'}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                        <span className="bg-red-50 text-red-700 px-3 py-1 rounded-lg">Kategori: {formData.kategori || selected?.kategori || 'Protokoler'}</span>
                        <span>Lokasi: {selected?.lokasi || '—'}</span>
                        <span>Tanggal: {selected?.tanggal ? new Date(selected.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              // ─── TAMPILAN FORM UPLOAD DOKUMENTASI ───
              <Card className="overflow-hidden border-slate-200 shadow-sm rounded-2xl bg-white w-full flex flex-col h-full">
                <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center h-12 w-12 bg-white border border-slate-200 text-red-900 rounded-[14px] shadow-sm">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 leading-tight">
                        {isEditingMode ? 'Edit Postingan Dokumentasi' : existingPhotos.length > 0 ? 'Upload Foto Tambahan' : 'Form Berita & Upload'}
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Upload dokumentasi untuk: <strong className="text-slate-800">{selected?.nama_kegiatan}</strong>
                      </p>
                    </div>
                  </div>
                  {existingPhotos.length > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowUploadForm(false)} 
                      className="border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-800 rounded-xl h-10 px-5 text-xs font-bold transition-all"
                    >
                      Batal
                    </Button>
                  )}
                </div>
                
                <div className="p-8 space-y-6 flex-1 overflow-auto">
                  <div className={cn("grid gap-6", mediaType === 'video' ? "grid-cols-1" : "grid-cols-2")}>
                    <div className="space-y-2.5">
                      <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Tipe File Asli</label>
                      <select 
                        value={mediaType}
                        onChange={e => setMediaType(e.target.value)}
                        className="w-full flex h-12 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent font-medium"
                      >
                        <option value="foto">Foto</option>
                        <option value="video">Video</option>
                        <option value="dokumen">Dokumen</option>
                      </select>
                    </div>
                    {mediaType !== 'video' && (
                      <div className="space-y-2.5">
                        <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Kategori Berita</label>
                        <select 
                          value={formData.kategori} 
                          onChange={e => setFormData({...formData, kategori: e.target.value})}
                          className="w-full flex h-12 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent font-medium"
                        >
                          <option value="" disabled>Pilih Kategori</option>
                          <option value="Seremonial">Seremonial</option>
                          <option value="Protokol VIP">Protokol VIP</option>
                          <option value="Wisuda">Wisuda</option>
                          <option value="Internal">Internal</option>
                          <option value="Pelatihan">Pelatihan</option>
                        </select>
                      </div>
                    )}
                  </div>

                   {mediaType === 'video' ? (
                    <div className="space-y-4 flex flex-col w-full">
                      <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1 block">
                        Form Pengisian Video (Google Form)
                      </label>
                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-slate-900">Format Penamaan File Video:</h4>
                          <div className="text-sm text-slate-600 bg-white border border-slate-200/60 rounded-xl p-4 font-mono space-y-1.5 shadow-inner">
                            <p>Nama File: <span className="font-bold text-red-900">Tanggal_Nama Kegiatan</span></p>
                            <p>Format tanggal: <span className="font-bold text-red-900">YYMMDD</span> (thn/bln/hari)</p>
                            <p className="text-xs text-slate-400 mt-3 pt-2 border-t border-slate-100">
                              Contoh: <span className="text-slate-700 font-bold font-mono">260622_Wisuda periode 131</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <a 
                            href="https://forms.gle/XitH1gmCuGpdt8Pi8" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-full md:w-auto px-6 h-12 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-red-900 hover:bg-red-50 hover:border-red-200 font-bold transition-all shadow-sm gap-2"
                          >
                            <span>Buka Google Form di Tab Baru</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                      <div className="space-y-2.5 flex flex-col">
                        <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2 block">
                          Upload File Dokumentasi
                        </label>
                        <label htmlFor="file-upload" className="flex-1 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-red-50 hover:border-red-600 transition-all flex flex-col items-center justify-center py-10 px-6 cursor-pointer group relative overflow-hidden min-h-[220px]">
                          <div className="absolute inset-0 bg-red-700/0 group-hover:bg-red-700/5 transition-colors" />
                          <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 mb-4 group-hover:scale-110 group-hover:shadow-md transition-all">
                            <UploadCloud className="h-7 w-7 text-red-800 group-hover:text-red-900" />
                          </div>
                          {isCompressing ? (
                            <div className="text-center relative z-10 px-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-900 mx-auto mb-2" />
                              <p className="text-xs text-slate-500 font-medium">Mengompres gambar...</p>
                            </div>
                          ) : files.length > 0 ? (
                            <div className="text-center relative z-10 px-4 w-full">
                              <h3 className="text-sm font-bold text-slate-800 mb-2">
                                {files.length} File Terpilih
                              </h3>
                              <div className="max-h-32 overflow-y-auto space-y-1 text-left bg-white p-2 rounded-lg border border-slate-200">
                                {files.map((f, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-xs text-slate-600 px-1 py-0.5 border-b last:border-0 border-slate-100">
                                    <span className="truncate max-w-[180px]">{f.name}</span>
                                    <span className="font-semibold text-slate-400">({(f.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3 className="text-sm font-bold text-slate-700 mb-1.5 text-center">Klik untuk memilih atau seret & lepas file ke sini</h3>
                              <p className="text-xs text-slate-400 text-center font-medium">Format didukung: JPG, PNG, PDF. Maksimal 100MB. Bisa pilih beberapa file sekaligus.</p>
                            </>
                          )}
                          <input type="file" className="hidden" id="file-upload" multiple onChange={handleFileChange} />
                        </label>
                      </div>

                      <div className="space-y-2.5 flex flex-col">
                        <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2 block">Keterangan / Isi Berita</label>
                        <Textarea value={formData.ringkasan} onChange={(e) => setFormData({...formData, ringkasan: e.target.value})} placeholder="Tuliskan isi berita atau keterangan dokumentasi..." className="flex-1 min-h-[220px] rounded-2xl border-slate-200 bg-slate-50 resize-none text-sm p-5 leading-relaxed" />
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button onClick={handleUpload} disabled={createMutation.isPending || isCompressing} className="w-full rounded-xl bg-red-900 text-white hover:bg-red-800 shadow-lg shadow-red-900/20 h-14 text-sm font-bold">
                      <UploadCloud className="mr-2 h-5 w-5" /> {isCompressing ? 'Mengompres Gambar...' : createMutation.isPending ? 'Menyimpan...' : isEditingMode ? 'Simpan Perubahan' : mediaType === 'video' ? 'Konfirmasi Pengisian Video' : 'Upload & Publish Berita'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
