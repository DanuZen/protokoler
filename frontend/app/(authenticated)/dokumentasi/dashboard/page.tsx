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
import { Camera, FileImage, Film, Upload, GalleryHorizontal, CalendarDays, MapPin, Clock, ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const gallerySeed = [
  { id: 'gal-1', label: 'Sambutan Rektor', type: 'foto', color: 'from-slate-900 to-slate-700' },
  { id: 'gal-2', label: 'Prosesi Utama', type: 'video', color: 'from-amber-500 to-orange-500' },
  { id: 'gal-3', label: 'Dokumentasi Panel', type: 'dokumen', color: 'from-emerald-600 to-teal-600' },
];

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
    { label: 'Kegiatan selesai', value: selesai.length, hint: 'Siap didokumentasikan' },
    { label: 'Sudah terdokumentasi', value: selesai.length ? 1 : 0, hint: 'Upload aktif' },
    { label: 'File unggahan', value: 8, hint: 'Foto, video, dokumen' },
    { label: 'Antrian review', value: 2, hint: 'Menunggu verifikasi' },
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
    <div className="min-h-screen bg-transparent pb-16">
      <div className="relative px-6 md:px-10 pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800" />
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at top right, rgba(201,168,76,0.32), transparent 35%), radial-gradient(circle at left, rgba(56,189,248,0.18), transparent 30%)' }} />

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="rounded-none border border-amber-300/40 bg-amber-300/10 text-amber-200">Dashboard Dokumentasi</Badge>
            <span className="text-xs uppercase tracking-[0.25em] text-slate-400">Role {role || '...'}</span>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">Galeri dan Upload Dokumentasi Acara</h1>
              <p className="mt-3 text-slate-300 text-base md:text-lg leading-relaxed">Ruang kerja khusus untuk mengunggah foto, video, dan dokumen kegiatan yang sudah selesai, lalu menatanya dalam galeri acara yang terkurasi.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/kegiatan">
                <Button variant="outline" className="rounded-none border-slate-600 bg-slate-950/40 text-white hover:bg-slate-800/70">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Ke Kegiatan
                </Button>
              </Link>
              <Button onClick={handleUpload} className="rounded-none bg-[#C9A84C] text-slate-950 hover:bg-[#b8963f] font-bold">
                <Upload className="mr-2 h-4 w-4" /> Upload Sekarang
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-slate-50 pt-4">
        <div className="px-6 md:px-10 -mt-16 relative z-10 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }}>
                <Card className="rounded-none border-slate-200 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                        <div className="mt-2 text-3xl font-display font-bold text-slate-900">{stat.value}</div>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center bg-slate-950 text-[#C9A84C]">
                        <Camera className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">{stat.hint}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {role !== 'dokumentasi' && (
            <div className="border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm shadow-sm rounded-none flex items-start gap-3">
              <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">Mode pratinjau</p>
                <p className="text-amber-800/90">Halaman ini tetap bisa dibuka oleh admin untuk inspeksi, tetapi aksi upload idealnya digunakan oleh role Dokumentasi.</p>
              </div>
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="rounded-none border-slate-200 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-white">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900">Kegiatan Siap Upload</h2>
                    <p className="text-xs text-slate-400 mt-1">Pilih kegiatan selesai untuk memulai unggahan.</p>
                  </div>
                  <Badge variant="outline" className="rounded-none border-slate-300 text-slate-600">
                    {selesai.length} kegiatan
                  </Badge>
                </div>

                <div className="divide-y divide-slate-100">
                  {selesai.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">
                      <GalleryHorizontal className="mx-auto h-10 w-10 mb-3 text-slate-300" />
                      Belum ada kegiatan selesai untuk didokumentasikan.
                    </div>
                  ) : (
                    selesai.map((item: any) => {
                      const active = selected?.id === item.id;
                      return (
                        <button key={item.id} onClick={() => setSelectedId(item.id)} className={cn('w-full text-left px-5 py-4 transition-colors', active ? 'bg-slate-950 text-white' : 'hover:bg-slate-50')}>
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className={cn('font-semibold', active ? 'text-white' : 'text-slate-900')}>{item.nama_kegiatan}</div>
                              <div className={cn('mt-1 flex items-center gap-3 text-xs', active ? 'text-slate-300' : 'text-slate-500')}>
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
                              <Badge className={cn('rounded-none', active ? 'bg-[#C9A84C] text-slate-950' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')}>{active ? 'Terpilih' : 'Selesai'}</Badge>
                              <span className={cn('text-xs font-bold uppercase tracking-[0.2em]', active ? 'text-slate-300' : 'text-slate-400')}>Upload</span>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-none border-slate-200 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900">Form Upload</h2>
                    <p className="text-xs text-slate-400 mt-1">Metadata file ditangkap langsung dari dashboard ini.</p>
                  </div>

                  {selected ? (
                    <div className="space-y-3 border border-slate-200 bg-slate-50 p-4">
                      <div className="text-sm font-semibold text-slate-900">{selected.nama_kegiatan}</div>
                      <div className="text-xs text-slate-500">
                        {selected.lokasi} · {new Date(selected.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  ) : (
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
                              'flex flex-col items-center gap-2 border px-3 py-3 text-sm font-semibold transition-colors rounded-none',
                              active ? 'border-slate-900 bg-slate-900 text-[#C9A84C]' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-400',
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
                </CardContent>
              </Card>

              <Card className="rounded-none border-slate-200 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900">Galeri Dokumen</h2>
                    <p className="text-xs text-slate-400 mt-1">Pratinjau hasil unggahan terbaru untuk kegiatan terpilih.</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {gallerySeed.map((item) => (
                      <div key={item.id} className="overflow-hidden border border-slate-200 bg-white">
                        <div className={cn('h-28 bg-gradient-to-br flex items-end justify-between p-3 text-white', item.color)}>
                          <Badge className="rounded-none bg-white/15 text-white border-white/20">{item.type}</Badge>
                          <span className="text-[10px] uppercase tracking-[0.2em]">Preview</span>
                        </div>
                        <div className="p-3">
                          <div className="text-sm font-semibold text-slate-900">{item.label}</div>
                          <p className="mt-1 text-xs text-slate-500">Siap dipindahkan ke galeri publik setelah review.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
