'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { kegiatanApi } from '@/lib/api';
import { useAuth, useRole } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Camera, FileImage, Film, Upload, GalleryHorizontal, CalendarDays, MapPin, Clock, ArrowLeft, Sparkles, ShieldCheck, CheckCircle2, Folder, Image as ImageIcon, Info, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';


export default function DokumentasiDashboardPage() {
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState('foto');
  const [caption, setCaption] = useState('');

  const { data: kegiatan } = useQuery({
    queryKey: ['dokumentasi-dashboard-kegiatan'],
    queryFn: () => kegiatanApi.list(),
  });

  const selesai = useMemo(() => (kegiatan ?? []).filter((item: any) => item.status === 'selesai'), [kegiatan]);
  const selected = selesai.find((item: any) => item.id === selectedId) ?? selesai[0] ?? null;

  const stats = [
    { 
      label: 'Kegiatan selesai', 
      value: selesai.length, 
      hint: 'Siap didokumentasikan', 
      trend: '+12%',
      isUp: true,
      chart: (
        <div className="flex items-end gap-1 h-10 mt-2">
          {[40, 70, 45, 90].map((h, i) => (
            <div key={i} className="w-4 bg-orange-500 rounded-sm transition-all hover:opacity-80" style={{ height: `${h}%` }} />
          ))}
        </div>
      )
    },
    { 
      label: 'Terdokumentasi', 
      value: selesai.length ? 1 : 0, 
      hint: 'Upload aktif', 
      trend: '+2',
      isUp: true,
      chart: (
        <div className="w-16 h-10 mt-2 relative overflow-hidden">
          <svg viewBox="0 0 100 40" className="w-full h-full stroke-emerald-500 fill-none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5,30 L25,15 L45,25 L70,5 L95,15" />
          </svg>
        </div>
      )
    },
    { 
      label: 'File unggahan', 
      value: 8, 
      hint: 'Foto, video, dokumen', 
      trend: '+5%',
      isUp: true,
      chart: (
        <div className="w-10 h-10 mt-2 rounded-full border-4 border-blue-500/20 border-r-blue-500 border-t-blue-500 rotate-45" />
      )
    },
    { 
      label: 'Antrian review', 
      value: 2, 
      hint: 'Menunggu verifikasi', 
      trend: '-1',
      isUp: false,
      chart: (
        <div className="flex items-end gap-0.5 h-10 mt-2 opacity-50">
          {[80, 70, 85, 95, 70, 60, 50, 40].map((h, i) => (
            <div key={i} className="w-2 bg-slate-400 rounded-sm" style={{ height: `${h}%` }} />
          ))}
        </div>
      )
    },
  ];

  const handleUpload = () => {
    if (!selected) {
      toast.error('Pilih kegiatan terlebih dahulu');
      return;
    }
    toast.success(`Dokumentasi ${selected.nama_kegiatan} berhasil disiapkan`);
    setCaption('');
    setMediaType('foto');
  };

  return (
    <div className="flex flex-col min-h-full pb-10 px-6 md:px-8 pt-4">
      {/* ─── HEADER SECTION ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-200/60">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20 text-white">
            <Camera className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
                Sistem Informasi Protokoler
              </span>
            </div>
            <h1 className="text-3xl md:text-[2.5rem] font-black tracking-tight leading-none mb-1.5 text-slate-900 drop-shadow-sm">Galeri Dokumentasi</h1>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Ruang kerja unggah foto, video, dan dokumen kegiatan yang sudah selesai.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/kegiatan">
            <Button variant="outline" className="rounded-xl border-slate-200 bg-white shadow-sm hover:bg-slate-50 text-slate-700">
              <ArrowLeft className="mr-2 h-4 w-4" /> Ke Kegiatan
            </Button>
          </Link>
          <Button onClick={handleUpload} className="rounded-xl bg-orange-500 text-white hover:bg-orange-600 font-bold shadow-md">
            <Upload className="mr-2 h-4 w-4" /> Upload Sekarang
          </Button>
        </div>
      </motion.div>

      {/* ─── Floating Stats Row ─── */}
      <section className="relative z-20 pb-0">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }}>
                <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-6 flex flex-col justify-between hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 h-full">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <span className="text-sm font-semibold">{stat.label}</span>
                        <Info className="h-3.5 w-3.5 opacity-60" />
                      </div>
                      <div className={cn("px-2 py-0.5 rounded-md text-[11px] font-bold", stat.isUp ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                        {stat.trend}
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-[32px] font-bold text-slate-900 leading-none mb-1">{stat.value}</div>
                        <div className="text-[11px] font-medium text-slate-400">{stat.hint}</div>
                      </div>
                      {stat.chart}
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <button className="w-full flex items-center justify-center gap-2 text-[13px] font-bold text-slate-600 hover:text-slate-900 transition-colors">
                      Lihat Detail <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </section>

      {/* ─── BODY CONTENT ─── */}
      <div className="flex-1 mt-8">
        <section className="pb-12 space-y-6">

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
            <div className="w-full h-full min-h-0">
            <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden h-full flex flex-col bg-white">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
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

                <div className="divide-y divide-slate-100 flex-1 overflow-y-auto bg-white">
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

            <div className="w-full h-full">
              <Card className="rounded-[24px] border-slate-200 shadow-sm h-full flex flex-col bg-white">
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-10 w-10 bg-white border border-slate-200 text-slate-600 rounded-xl">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Form Upload</h2>
                        <p className="text-[11px] text-slate-500 mt-0.5">Metadata file ditangkap langsung dari dashboard ini.</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1 overflow-y-auto space-y-4">

                  {!selected && (
                    <div className="border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">Pilih kegiatan di sisi kiri untuk mulai upload dokumentasi.</div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Tipe Media</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'foto', label: 'Foto', icon: FileImage },
                        { value: 'video', label: 'Video', icon: Film },
                        { value: 'dokumen', label: 'Dokumen', icon: Sparkles },
                      ].map((item) => {
                        const active = mediaType === item.value;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setMediaType(item.value)}
                            className={cn(
                              'flex flex-col items-center gap-2 border px-3 py-3 text-sm transition-all rounded-xl',
                              active ? 'bg-orange-50 border-orange-500 text-orange-600 font-bold' : 'bg-white border-slate-200 text-slate-500 font-semibold hover:border-slate-300 hover:bg-slate-50',
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">File</label>
                    <Input type="file" className="rounded-xl border-slate-200" />
                    <p className="text-[11px] text-slate-400">Format .jpg .png .mp4 .mov, maksimal 100MB per file.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Keterangan</label>
                    <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Tuliskan konteks singkat dokumentasi..." className="min-h-[100px] rounded-xl border-slate-200 bg-slate-50" />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleUpload} className="flex-1 rounded-xl bg-orange-500 text-white hover:bg-orange-600 shadow-md">
                      <Upload className="mr-2 h-4 w-4" /> Simpan Unggahan
                    </Button>
                    <Button variant="outline" className="rounded-xl border-slate-300" onClick={() => setCaption('')}>
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        </section>
      </div>
    </div>
  );
}
