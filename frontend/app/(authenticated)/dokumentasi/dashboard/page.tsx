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
import { Camera, FileImage, Film, Upload, GalleryHorizontal, CalendarDays, MapPin, Clock, ArrowLeft, Sparkles, ShieldCheck, CheckCircle2, Folder, Image as ImageIcon } from 'lucide-react';
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
    { label: 'Kegiatan selesai', value: selesai.length, hint: 'Siap didokumentasikan', icon: CheckCircle2 },
    { label: 'Sudah terdokumentasi', value: selesai.length ? 1 : 0, hint: 'Upload aktif', icon: Camera },
    { label: 'File unggahan', value: 8, hint: 'Foto, video, dokumen', icon: ImageIcon },
    { label: 'Antrian review', value: 2, hint: 'Menunggu verifikasi', icon: Folder },
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
    <div className="min-h-screen bg-transparent">
      {/* ─── Hero Banner ─── */}
      <section className="relative px-6 md:px-10 pt-10 pb-16 overflow-hidden">
        {/* decorative grid */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* gold glow */}
        <div className="absolute -right-24 -top-8 h-80 w-80 rounded-full bg-[#C9A84C]/8 blur-3xl pointer-events-none" />
        {/* gold underline */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div>
              <p className="text-[#C9A84C] text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Sistem Informasi Protokoler</p>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight">Galeri Dokumentasi</h1>
              <p className="mt-2 text-slate-400 text-sm">Ruang kerja unggah foto, video, dan dokumen kegiatan yang sudah selesai.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/kegiatan">
                <Button variant="outline" className="rounded-none border-slate-600 bg-slate-950/40 text-white hover:bg-slate-800/70">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Ke Kegiatan
                </Button>
              </Link>
              <Button onClick={handleUpload} className="rounded-none bg-[#C9A84C] text-white hover:bg-[#b8963f] font-bold">
                <Upload className="mr-2 h-4 w-4" /> Upload Sekarang
              </Button>
            </div>
        </motion.div>
      </section>

      {/* ─── Floating Stats Row ─── */}
      <section className="px-6 md:px-10 -mt-12 relative z-20 pb-0">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }}>
                <div className="bg-slate-900 border border-slate-800 shadow-xl py-3 px-4 flex flex-col justify-between hover:border-[#C9A84C]/60 hover:shadow-2xl transition-all group relative overflow-hidden">
                  <stat.icon className="absolute -right-4 -bottom-4 h-24 w-24 text-white opacity-5 transform group-hover:scale-110 transition-transform duration-500" />
                  <div className="flex items-center justify-between relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                    <div className="flex-shrink-0 h-7 w-7 flex items-center justify-center bg-[#C9A84C]/20 text-[#C9A84C] group-hover:bg-[#C9A84C] group-hover:text-white transition-colors border border-[#C9A84C]/30">
                      <stat.icon className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div className="mt-1.5 relative z-10">
                    <p className="text-3xl font-extrabold leading-tight font-display text-white">{stat.value}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] text-slate-500">{stat.hint}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </section>

      {/* ─── BODY CONTENT ─── */}
      <div className="bg-slate-50 min-h-screen -mt-6">
        <div className="h-12" />
        <section className="px-6 md:px-10 pb-12 space-y-6">


          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
            <div className="w-full h-full min-h-0">
            <Card className="rounded-none border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="flex items-center justify-between border-b border-slate-900 px-5 py-3.5 bg-slate-900 text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 bg-[#C9A84C] text-white">
                      <GalleryHorizontal className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white uppercase tracking-wider">Kegiatan Siap Upload</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">Pilih kegiatan selesai untuk memulai unggahan.</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="rounded-none border-slate-700 text-slate-300">
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
                        <button key={item.id} onClick={() => setSelectedId(item.id)} className={cn('w-full text-left px-5 py-4 transition-colors border-l-4', active ? 'bg-slate-50 border-[#C9A84C]' : 'border-transparent hover:bg-slate-50')}>
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className={cn('font-semibold', active ? 'text-slate-900' : 'text-slate-800')}>{item.nama_kegiatan}</div>
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
                              <Badge className={cn('rounded-none', active ? 'bg-[#C9A84C] text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')}>{active ? 'Terpilih' : 'Selesai'}</Badge>
                              <span className={cn('text-xs font-bold uppercase tracking-[0.2em]', active ? 'text-[#C9A84C]' : 'text-slate-400')}>Upload</span>
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
              <Card className="rounded-none border-slate-200 shadow-sm h-full flex flex-col">
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="flex items-center justify-between border-b border-slate-900 px-5 py-3.5 bg-slate-900 text-white">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-10 w-10 bg-[#C9A84C] text-white">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Form Upload</h2>
                        <p className="text-[11px] text-slate-400 mt-0.5">Metadata file ditangkap langsung dari dashboard ini.</p>
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
                              'flex flex-col items-center gap-2 border px-3 py-3 text-sm transition-all rounded-none',
                              active ? 'bg-[#C9A84C] border-slate-900 text-white font-bold shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] -translate-y-[1px]' : 'bg-white border-slate-200 text-slate-500 font-semibold hover:border-slate-400 hover:bg-slate-50',
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
                    <Input type="file" className="rounded-none border-slate-200" />
                    <p className="text-[11px] text-slate-400">Format .jpg .png .mp4 .mov, maksimal 100MB per file.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Keterangan</label>
                    <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Tuliskan konteks singkat dokumentasi..." className="min-h-[100px] rounded-none border-slate-200 bg-slate-50" />
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleUpload} className="flex-1 rounded-none bg-slate-950 text-white hover:bg-slate-800">
                      <Upload className="mr-2 h-4 w-4" /> Simpan Unggahan
                    </Button>
                    <Button variant="outline" className="rounded-none border-slate-300" onClick={() => setCaption('')}>
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
