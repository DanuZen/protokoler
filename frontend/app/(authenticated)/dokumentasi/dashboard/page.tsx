'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { kegiatanApi, postinganApi } from '@/lib/api';
import { useAuth, useRole } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Upload, ArrowLeft, Info, ArrowRight, CalendarDays, MapPin, CheckCircle2, ListTodo } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function DokumentasiDashboardPage() {
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const displayName = user?.user_metadata?.nama_lengkap || user?.email?.split('@')[0] || 'Tim Dokumentasi';

  const { data: kegiatan } = useQuery({
    queryKey: ['dokumentasi-dashboard-kegiatan'],
    queryFn: () => kegiatanApi.list(),
  });

  const { data: postinganList } = useQuery({
    queryKey: ['dokumentasi-dashboard-postingan'],
    queryFn: () => postinganApi.list(),
  });

  const selesai = useMemo(() => (kegiatan ?? []).filter((item: any) => item.status === 'selesai'), [kegiatan]);
  
  const uploadedCount = useMemo(() => {
    return (kegiatan ?? []).filter((k: any) => 
      (postinganList ?? []).some((p: any) => p.judul === k.nama_kegiatan)
    ).length;
  }, [kegiatan, postinganList]);

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
            <div key={i} className="w-4 bg-red-700 rounded-sm transition-all hover:opacity-80" style={{ height: `${h}%` }} />
          ))}
        </div>
      )
    },
    { 
      label: 'Terdokumentasi', 
      value: uploadedCount, 
      hint: 'Acara sudah diupload', 
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
      value: uploadedCount * 2 + 6, 
      hint: 'Foto, video, dokumen', 
      trend: '+5%',
      isUp: true,
      chart: (
        <div className="w-8 h-8 rounded-full border-4 border-slate-100 border-t-blue-500 mt-2" />
      )
    },
    { 
      label: 'Antrian review', 
      value: selesai.length - uploadedCount > 0 ? selesai.length - uploadedCount : 0, 
      hint: 'Belum diupload', 
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

  return (
    <div className="flex flex-col h-auto md:h-dvh md:overflow-hidden pb-6 px-6 md:px-8 pt-4">
      {/* ─── HEADER SECTION ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-200/60">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-700 to-red-800 shadow-lg shadow-red-700/20 text-white">
            <Camera className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-red-800">
                Manajemen Dokumentasi
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 text-slate-900 drop-shadow-sm">Daftar Acara &amp; Dokumentasi</h1>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Kelola dan pantau status unggahan dokumentasi untuk seluruh kegiatan.</p>
          </div>
        </div>
      </motion.div>

      {/* ─── Floating Stats Row ─── */}
      <section className="shrink-0 relative z-20 pb-0">
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

      {/* ─── BODY CONTENT: KEGIATAN LIST ─── */}
      <main className="flex-1 min-h-0 flex flex-col mt-8 overflow-hidden">
        <div className="flex-1 overflow-auto pb-12 pr-2">
          <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden bg-white/60 backdrop-blur-xl flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center h-12 w-12 bg-slate-50 text-slate-600 rounded-[14px] border border-slate-200">
                  <ListTodo className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Daftar Acara & Status Dokumentasi</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Pantau status unggahan dokumentasi untuk seluruh kegiatan.</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <div className="min-w-full">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100 font-bold sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4">Nama Kegiatan</th>
                      <th className="px-6 py-4">Waktu & Tempat</th>
                      <th className="px-6 py-4">Status Acara</th>
                      <th className="px-6 py-4">Status Dokumentasi</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {(!kegiatan || kegiatan.length === 0) ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-slate-400">Belum ada kegiatan tersedia.</td>
                      </tr>
                    ) : (
                      kegiatan.map((item: any) => {
                        const isUploaded = (postinganList ?? []).some((p: any) => p.judul === item.nama_kegiatan);
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-900">{item.nama_kegiatan}</div>
                              <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{item.kategori}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-slate-600 mb-1">
                                <CalendarDays className="h-3.5 w-3.5 opacity-70" />
                                <span className="font-medium">{new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                <MapPin className="h-3.5 w-3.5 opacity-70" />
                                <span>{item.lokasi}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className={cn(
                                "rounded-lg font-bold px-2 py-1",
                                item.status === 'selesai' ? "bg-slate-100 text-slate-700 border-slate-200" :
                                item.status === 'berlangsung' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                "bg-amber-50 text-amber-700 border-amber-200"
                              )}>
                                {item.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              {isUploaded ? (
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border px-2 py-1 rounded-lg">
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Sudah Upload
                                </Badge>
                              ) : (
                                <Badge className="bg-red-50 text-red-700 border-red-200 border px-2 py-1 rounded-lg bg-opacity-50">
                                  Belum Upload
                                </Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {isUploaded ? (
                                <Link href="/dokumentasi/berita">
                                  <Button variant="outline" size="sm" className="rounded-xl border-slate-200 text-slate-600 font-medium hover:bg-slate-50">
                                    Lihat Berita
                                  </Button>
                                </Link>
                              ) : (
                                <Link href="/dokumentasi/upload">
                                  <Button size="sm" className="rounded-xl bg-red-700 text-white hover:bg-red-800 shadow-sm font-medium">
                                    <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload
                                  </Button>
                                </Link>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
