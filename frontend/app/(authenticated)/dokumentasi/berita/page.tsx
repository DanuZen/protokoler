'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kegiatanApi, postinganApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BookOpen, CalendarDays, Search, UploadCloud, MapPin, CheckCircle2, AlertCircle, ArrowLeft, ListTodo, Clock, Radio } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function ManajemenBeritaPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  
  // Dialog State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState('foto');
  const [formData, setFormData] = useState({
    kategori: '',
    gambar: '/gallery_1.png',
    ringkasan: '',
  });

  // Queries
  const { data: kegiatan } = useQuery({
    queryKey: ['dokumentasi-kegiatan'],
    queryFn: () => kegiatanApi.list(),
  });

  const { data: postingan = [] } = useQuery({
    queryKey: ['postingan-list'],
    queryFn: postinganApi.list,
  });

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
      toast.success(`Dokumentasi berhasil dipublikasikan!`);
      setFormData({ kategori: '', gambar: '/gallery_1.png', ringkasan: '' });
      setMediaType('foto');
      setSelectedId(null); // Tutup dialog
    }
  });

  const handleUpload = () => {
    if (!selected) return;
    if (!formData.kategori || !formData.ringkasan) {
      toast.error('Mohon lengkapi Kategori dan Keterangan berita');
      return;
    }
    
    const payload = {
      judul: selected.nama_kegiatan,
      kategori: formData.kategori,
      gambar: formData.gambar,
      ringkasan: formData.ringkasan,
      tanggal: new Date().toISOString()
    };
    
    createMutation.mutate(payload);
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
                                onClick={() => setSelectedId(keg.id)}
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
            
            <Card className="overflow-hidden border-slate-200 shadow-sm rounded-2xl bg-white w-full flex flex-col h-full">
              <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center gap-4 shrink-0">
                <div className="flex items-center justify-center h-12 w-12 bg-white border border-slate-200 text-red-900 rounded-[14px] shadow-sm">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 leading-tight">Form Berita & Upload</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Upload dokumentasi untuk: <strong className="text-slate-800">{selected?.nama_kegiatan}</strong>
                  </p>
                </div>
              </div>
              
              <div className="p-8 space-y-6 flex-1 overflow-auto">
                <div className="grid grid-cols-2 gap-6">
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
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2.5 flex flex-col">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2 block">Upload File Dokumentasi</label>
                    <label htmlFor="file-upload" className="flex-1 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-red-50 hover:border-red-600 transition-all flex flex-col items-center justify-center py-10 px-6 cursor-pointer group relative overflow-hidden min-h-[220px]">
                      <div className="absolute inset-0 bg-red-700/0 group-hover:bg-red-700/5 transition-colors" />
                      <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 mb-4 group-hover:scale-110 group-hover:shadow-md transition-all">
                        <UploadCloud className="h-7 w-7 text-red-800 group-hover:text-red-900" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-700 mb-1.5 text-center">Klik untuk memilih atau seret & lepas file ke sini</h3>
                      <p className="text-xs text-slate-400 text-center font-medium">Format didukung: JPG, PNG, MP4, PDF. Maksimal 100MB.</p>
                      <input type="file" className="hidden" id="file-upload" />
                    </label>
                  </div>

                  <div className="space-y-2.5 flex flex-col">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2 block">Keterangan / Isi Berita</label>
                    <Textarea value={formData.ringkasan} onChange={(e) => setFormData({...formData, ringkasan: e.target.value})} placeholder="Tuliskan isi berita atau keterangan dokumentasi..." className="flex-1 min-h-[220px] rounded-2xl border-slate-200 bg-slate-50 resize-none text-sm p-5 leading-relaxed" />
                  </div>
                </div>

                <div className="pt-2">
                  <Button onClick={handleUpload} disabled={createMutation.isPending} className="w-full rounded-xl bg-red-900 text-white hover:bg-red-800 shadow-lg shadow-red-900/20 h-14 text-sm font-bold">
                    <UploadCloud className="mr-2 h-5 w-5" /> {createMutation.isPending ? 'Menyimpan...' : 'Upload & Publish Berita'}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
