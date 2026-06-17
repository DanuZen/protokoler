'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { kegiatanApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileImage, Film, UploadCloud, Sparkles, CalendarDays, Clock, MapPin, GalleryHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

import { postinganApi } from '@/lib/api';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Image as ImageIcon } from 'lucide-react';

export default function DokumentasiUploadPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState('foto');
  
  // State form gabungan
  const [formData, setFormData] = useState({
    kategori: '',
    gambar: '/gallery_1.png',
    ringkasan: '',
  });

  const { data: kegiatan } = useQuery({
    queryKey: ['dokumentasi-dashboard-kegiatan'],
    queryFn: () => kegiatanApi.list(),
  });

  const selesai = useMemo(() => (kegiatan ?? []).filter((item: any) => item.status === 'selesai'), [kegiatan]);
  const selected = selesai.find((item: any) => item.id === selectedId) ?? selesai[0] ?? null;

  const createMutation = useMutation({
    mutationFn: postinganApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postingan-list'] });
      queryClient.invalidateQueries({ queryKey: ['postingan'] });
      toast.success(`Dokumentasi & Berita untuk ${selected?.nama_kegiatan} berhasil dipublikasikan!`);
      setFormData({ kategori: '', gambar: '/gallery_1.png', ringkasan: '' });
      setMediaType('foto');
    }
  });

  const handleUpload = () => {
    if (!selected) {
      toast.error('Pilih kegiatan terlebih dahulu');
      return;
    }
    if (!formData.kategori || !formData.ringkasan) {
      toast.error('Mohon lengkapi Kategori dan Keterangan berita');
      return;
    }
    
    // Create payload from combined state and selected kegiatan
    const payload = {
      judul: selected.nama_kegiatan,
      kategori: formData.kategori,
      gambar: formData.gambar,
      ringkasan: formData.ringkasan,
      tanggal: new Date().toISOString()
    };
    
    createMutation.mutate(payload);
  };

  return (
    <div className="flex flex-col min-h-full pb-10 px-6 md:px-8 pt-4">
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-200/60">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20 text-white">
            <UploadCloud className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
                Workspace Terpadu
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 text-slate-900 drop-shadow-sm">Upload &amp; Publikasi</h1>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Satu inputan untuk mengunggah bukti dokumentasi dan otomatis mempublikasikannya sebagai Berita di Landing Page.</p>
          </div>
        </div>
      </motion.div>

      {/* BODY */}
      <div className="flex-1">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch h-[850px]">
          {/* LEFT: KEGIATAN LIST */}
          <div className="w-full h-full min-h-0">
            <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden h-full flex flex-col bg-white">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 bg-white border border-slate-200 text-slate-600 rounded-xl">
                      <GalleryHorizontal className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Kegiatan Siap Upload</h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">Pilih kegiatan selesai untuk memulai unggahan.</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="rounded-xl border-slate-200 text-slate-600 bg-white shadow-sm">
                    {selesai.length} kegiatan
                  </Badge>
                </div>

                <div className="divide-y divide-slate-100 flex-1 overflow-y-auto bg-white custom-scrollbar">
                  {selesai.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">
                      <GalleryHorizontal className="mx-auto h-10 w-10 mb-3 text-slate-300" />
                      Belum ada kegiatan selesai untuk didokumentasikan.
                    </div>
                  ) : (
                    selesai.map((item: any) => {
                      const active = selected?.id === item.id;
                      return (
                        <button key={item.id} onClick={() => setSelectedId(item.id)} className={cn('w-full text-left px-5 py-4 transition-colors border-l-4', active ? 'bg-orange-50 border-orange-500' : 'border-transparent hover:bg-slate-50')}>
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className={cn('font-bold', active ? 'text-slate-900' : 'text-slate-800')}>{item.nama_kegiatan}</div>
                              <div className={cn('mt-1 flex flex-wrap items-center gap-3 text-xs', active ? 'text-slate-600' : 'text-slate-500')}>
                                <span className="inline-flex items-center gap-1">
                                  <CalendarDays className="h-3.5 w-3.5" /> {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" /> {item.jam_mulai?.slice(0, 5)} WIB
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" /> {item.lokasi}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={cn('rounded-xl border', active ? 'bg-orange-500 text-white border-orange-600' : 'bg-emerald-50 text-emerald-700 border-emerald-200')}>{active ? 'Terpilih' : 'Selesai'}</Badge>
                              <span className={cn('text-xs font-bold uppercase tracking-[0.2em]', active ? 'text-orange-600' : 'text-slate-400')}>Upload</span>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: FORM UPLOAD */}
          <div className="w-full h-full min-h-0">
            <Card className="rounded-[24px] border-slate-200 shadow-sm h-full flex flex-col bg-white">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 bg-white border border-slate-200 text-slate-600 rounded-xl">
                      <UploadCloud className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Form Berita &amp; Upload</h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">Judul berita akan otomatis menggunakan judul kegiatan.</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1 overflow-y-auto space-y-5 custom-scrollbar">

                  {!selected && (
                    <div className="border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 rounded-xl text-center">
                      <GalleryHorizontal className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      Pilih kegiatan di sisi kiri untuk mulai upload dokumentasi.
                    </div>
                  )}

                  {selected && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1 block">Otomatisasi Judul Berita</label>
                      <p className="text-sm font-bold text-slate-900">{selected.nama_kegiatan}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Tipe File Asli</label>
                      <select 
                        value={mediaType}
                        onChange={e => setMediaType(e.target.value)}
                        className="w-full flex h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="foto">Foto</option>
                        <option value="video">Video</option>
                        <option value="dokumen">Dokumen</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Kategori Berita</label>
                      <select 
                        value={formData.kategori} 
                        onChange={e => setFormData({...formData, kategori: e.target.value})}
                        className="w-full flex h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Pilih File Unggahan Asli</label>
                    <Input type="file" className="rounded-xl border-slate-200 h-11 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                    <p className="text-[11px] text-slate-400 mt-1">Format didukung: .jpg, .png, .mp4, .pdf. Maksimal 100MB.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Cover Gambar untuk Berita</label>
                    <p className="text-[10px] text-slate-400">Pilih gambar mockup untuk demo tampilan di halaman depan</p>
                    <div className="flex gap-2 mt-1">
                        {['/gallery_1.png', '/gallery_2.png', '/gallery_3.png'].map(img => (
                          <div key={img} onClick={() => setFormData({...formData, gambar: img})} className={`w-14 h-14 rounded-lg cursor-pointer border-2 bg-slate-100 bg-cover bg-center transition-all ${formData.gambar === img ? 'border-orange-500 shadow-md ring-2 ring-orange-200' : 'border-transparent'}`} style={{backgroundImage: `url(${img})`}} />
                        ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Keterangan / Isi Berita</label>
                    <Textarea value={formData.ringkasan} onChange={(e) => setFormData({...formData, ringkasan: e.target.value})} placeholder="Tuliskan isi berita atau keterangan dokumentasi..." className="min-h-[120px] rounded-xl border-slate-200 bg-slate-50 resize-none" />
                  </div>

                  <div className="flex gap-3 pt-4 mt-auto">
                    <Button onClick={handleUpload} disabled={createMutation.isPending} className="flex-1 rounded-xl bg-orange-500 text-white hover:bg-orange-600 shadow-md h-12 text-sm font-bold">
                      <UploadCloud className="mr-2 h-4 w-4" /> {createMutation.isPending ? 'Menyimpan...' : 'Upload File & Publish Berita'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
