'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { kegiatanApi, postinganApi } from '@/lib/api';
import { useAuth, useRole } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera, Upload, ArrowLeft, Info, ArrowRight, CalendarDays, MapPin, CheckCircle2, ListTodo, Activity, MoreVertical, Clock, Search, Image as ImageIcon, FileText, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ViewportFitGrid } from '@/components/ViewportFitGrid';

export default function DokumentasiDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: role, loading: isRoleLoading } = useRole(user);
  const displayName = user?.user_metadata?.nama_lengkap || user?.email?.split('@')[0] || 'Tim Dokumentasi';
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);



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

  const adminFiltered = useMemo(() => selesai.filter((item: any) => item.nama_kegiatan.toLowerCase().includes(search.toLowerCase()) || item.lokasi.toLowerCase().includes(search.toLowerCase())), [selesai, search]);
  const activeDetail = adminFiltered.find((item: any) => item.id === selectedId) ?? adminFiltered[0] ?? null;
  const activePost = activeDetail ? (postinganList ?? []).find((p: any) => p.judul === activeDetail.nama_kegiatan) : null;

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

  if (authLoading || isRoleLoading) return null;

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
                {role === 'dokumentasi' ? 'Daftar Acara & Dokumentasi' : 'Manajemen Dokumentasi'}
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 text-slate-900 drop-shadow-sm">
              {role === 'dokumentasi' ? `Selamat Datang, ${displayName}` : 'Daftar Acara & Dokumentasi'}
            </h1>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Kelola dan pantau status unggahan dokumentasi untuk seluruh kegiatan.</p>
          </div>
        </div>
      </motion.div>

      {/* ─── Floating Stats Row ─── */}
      <section className="shrink-0 relative z-20 pb-0">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }}>
                <div className="bg-white border border-slate-200 rounded-[24px] p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300 h-full shadow-sm">
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

      {/* ─── MAIN CHARTS & LISTS ─────────────────────────────────── */}
      <main className="flex-1 min-h-0 flex flex-col mt-8 overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 pb-6 min-h-0">
          {role === 'admin' ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-full">
              {/* KIRI: Daftar Acara Selesai */}
              <div className="w-full min-h-0 flex flex-col">
                <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0 flex-1 bg-white/60 backdrop-blur-xl border-white/80">
                  <CardContent className="p-0 flex flex-col flex-1 min-h-0">
                    <div className="px-6 md:px-8 py-5 bg-slate-50 border-b border-slate-100 flex flex-col lg:flex-row justify-between lg:items-center gap-4 shrink-0">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center h-12 w-12 bg-white border border-slate-200 text-primary rounded-[14px] shadow-sm shrink-0">
                          <CheckCircle2 className="h-6 w-6 text-red-700" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-slate-900 leading-tight">Kegiatan Selesai</h2>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-1">Pilih acara untuk melihat detail dokumentasi.</p>
                        </div>
                      </div>
                      <div className="relative w-full lg:w-72 shrink-0">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari acara..." className="rounded-xl border-slate-200 bg-white text-slate-900 placeholder-slate-400 pl-9 h-10 shadow-sm" />
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 bg-white min-h-0">
                      <div className="divide-y divide-slate-100 flex-1 overflow-y-auto min-h-0">
                        {adminFiltered.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-slate-400 h-full min-h-[200px]">
                            <Sparkles className="mx-auto h-12 w-12 mb-4 text-slate-300" />
                            <h3 className="text-sm font-bold text-slate-700 mb-1">Tidak Ada Kegiatan</h3>
                            <p className="text-xs">Belum ada kegiatan selesai yang cocok dengan pencarian Anda.</p>
                          </div>
                        ) : (
                          adminFiltered.map((item: any) => {
                            const active = activeDetail?.id === item.id;
                            const isUploaded = (postinganList ?? []).some((p: any) => p.judul === item.nama_kegiatan);
                            return (
                              <button key={item.id} onClick={() => setSelectedId(item.id)} className={cn('w-full text-left px-5 py-4 transition-colors border-l-4', active ? 'bg-slate-50 border-red-700' : 'border-transparent hover:bg-slate-50')}>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    <div className={cn('font-semibold truncate', active ? 'text-slate-900' : 'text-slate-900')}>{item.nama_kegiatan}</div>
                                    <div className={cn('mt-1 flex flex-wrap items-center gap-3 text-xs', active ? 'text-slate-600' : 'text-slate-500')}>
                                      <span className="inline-flex items-center gap-1">
                                        <CalendarDays className="h-3.5 w-3.5" /> {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </span>
                                      <span className="inline-flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" /> {item.lokasi || 'Kampus'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2 shrink-0">
                                    {isUploaded ? (
                                      <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Uploaded</div>
                                    ) : (
                                      <div className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase flex items-center gap-1"><Clock className="h-3 w-3" /> Waiting</div>
                                    )}
                                    <ChevronRight className={cn('h-4 w-4', active ? 'text-red-700' : 'text-slate-300')} />
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* KANAN: Preview Laporan */}
              <div className="w-full min-h-0 flex flex-col">
                <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0 flex-1 bg-white/60 backdrop-blur-xl border-white/80">
                  <CardContent className="p-0 flex flex-col flex-1 min-h-0">
                    <div className="px-6 md:px-8 py-5 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4 shrink-0">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center h-12 w-12 bg-white border border-slate-200 text-primary rounded-[14px] shadow-sm shrink-0">
                          <FileText className="h-6 w-6 text-red-700" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-slate-900 leading-tight">Detail Dokumentasi</h2>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-1">Pratinjau konten yang diunggah oleh tim dokumentasi.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col flex-1 bg-white min-h-0 p-6 overflow-y-auto">
                      {!activeDetail ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 h-full">
                          <ImageIcon className="mx-auto h-12 w-12 mb-4 text-slate-300" />
                          <h3 className="text-sm font-bold text-slate-700 mb-1">Belum Ada Pilihan</h3>
                          <p className="text-xs">Pilih salah satu acara di daftar sebelah kiri.</p>
                        </div>
                      ) : !activePost ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 h-full">
                          <Camera className="mx-auto h-16 w-16 mb-4 text-slate-200" />
                          <h3 className="text-base font-bold text-slate-700 mb-1">Dokumentasi Belum Tersedia</h3>
                          <p className="text-sm max-w-sm mx-auto leading-relaxed">Tim dokumentasi belum mengunggah laporan berita atau foto untuk acara <b>{activeDetail.nama_kegiatan}</b>.</p>
                        </div>
                      ) : (
                        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                          {activePost.thumbnail ? (
                            <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden bg-slate-100 mb-6 shrink-0 relative">
                              <img src={activePost.thumbnail} alt={activePost.judul} className="w-full h-full object-cover" />
                              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1.5 border border-white/20"><ImageIcon className="h-3.5 w-3.5" /> Foto Tersedia</div>
                            </div>
                          ) : (
                            <div className="w-full h-48 md:h-64 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center mb-6 shrink-0 text-slate-400">
                              <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                              <span className="text-xs font-bold">Tidak ada Thumbnail</span>
                            </div>
                          )}
                          <h3 className="font-display text-2xl font-bold text-slate-900 mb-2">{activePost.judul}</h3>
                          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 mb-6 pb-4 border-b border-slate-100">
                            <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-md">{activePost.kategori}</span>
                            <span>{new Date(activePost.tanggal_publikasi).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          </div>
                          <div className="prose prose-slate prose-sm max-w-none">
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{activePost.konten}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-full">
            
            {/* BIG CHART: Statistik Dokumentasi */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="lg:col-span-2 bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] overflow-hidden flex flex-col min-h-[320px] h-full">
              
              {/* Card Header */}
              <div className="px-6 md:px-8 py-5 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 bg-white border border-slate-200 text-primary rounded-[14px] shadow-sm shrink-0">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">Tren Publikasi</h2>
                    <p className="text-sm text-slate-500 mt-1">Pantau statistik unggahan dokumentasi terbaru.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex p-1 bg-white border border-slate-200 rounded-xl">
                    {['1D', '1W', '1M', '6M', '1Y'].map((t) => (
                      <button key={t} className={cn("px-3 py-1.5 text-[11px] font-bold rounded-lg", t === '6M' ? "bg-slate-100 shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600")}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <button className="p-1.5 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white bg-white shadow-sm">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-6 shrink-0">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="text-[28px] font-bold text-slate-900 leading-none">{uploadedCount} <span className="text-sm font-medium text-slate-500 ml-1">berita tayang</span></div>
                      <div className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-700">+8%</div>
                    </div>
                    <div className="flex gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500"><span className="h-2 w-2 rounded-full bg-red-700" /> Diupload</div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500"><span className="h-2 w-2 rounded-full bg-red-100" /> Antrian</div>
                    </div>
                  </div>
                </div>

                {/* Mock Chart Area */}
                <div className="flex-1 min-h-[160px] flex items-end gap-2 md:gap-4 justify-between relative">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[10px] font-bold text-slate-400">
                    <span>40</span>
                    <span>30</span>
                    <span>20</span>
                    <span>10</span>
                    <span>0</span>
                  </div>
                  {/* Chart Bars */}
                  <div className="flex-1 flex items-end justify-between ml-10 border-b border-slate-100 pb-2 h-full">
                    {[
                      { m: 'Jan', h1: 18, h2: 4 }, { m: 'Feb', h1: 25, h2: 8 }, { m: 'Mar', h1: 12, h2: 1 },
                      { m: 'Apr', h1: 35, h2: 12 }, { m: 'Mei', h1: 45, h2: 8 }, { m: 'Jun', h1: 62, h2: 18 },
                      { m: 'Jul', h1: 38, h2: 14 }, { m: 'Agt', h1: 20, h2: 5 }, { m: 'Sep', h1: 15, h2: 2 },
                      { m: 'Okt', h1: 28, h2: 9 }, { m: 'Nov', h1: 32, h2: 11 }, { m: 'Des', h1: 23, h2: 6 },
                    ].map(({ m, h1, h2 }) => {
                      const isHovered = hoveredBar === m;
                      const isFaded = hoveredBar !== null && hoveredBar !== m;
                      
                      return (
                        <div
                          key={m}
                          className="flex flex-col items-center gap-2 group flex-1 h-full justify-end relative cursor-pointer"
                          onMouseEnter={() => setHoveredBar(m)}
                          onMouseLeave={() => setHoveredBar(null)}
                        >
                          <div className={cn("flex gap-1.5 md:gap-2 items-end w-full max-w-[48px] md:max-w-[64px] lg:max-w-[76px] mx-auto h-[90%] relative transition-opacity duration-300", isFaded ? "opacity-30" : "opacity-100")}>
                            {/* Diupload */}
                            <div className={cn("w-1/2 rounded-t-[6px] transition-all duration-300", isHovered ? "bg-red-700 shadow-md" : "bg-red-600")} style={{ height: `${h1}%` }} />
                            {/* Antrian */}
                            <div className={cn("w-1/2 rounded-t-[6px] transition-all duration-300", isHovered ? "bg-red-300 shadow-md" : "bg-red-200")} style={{ height: `${h2}%` }} />

                            {/* Tooltip */}
                            {isHovered && (
                              <div className="absolute -top-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-3.5 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] w-[140px] z-20 pointer-events-none animate-fade-in-up border border-slate-700/50">
                                <div className="text-[11px] text-slate-400 mb-2 font-medium border-b border-slate-700/50 pb-1.5">{m} 2026</div>
                                <div className="flex justify-between items-center text-xs font-bold mb-2">
                                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> Diupload</span>
                                  <span className="text-white">{h1}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold">
                                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-200 shadow-[0_0_8px_rgba(254,202,202,0.5)]" /> Antrian</span>
                                  <span className="text-white">{h2}</span>
                                </div>
                                {/* Triangle pointer */}
                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45 border-b border-r border-slate-700/50" />
                              </div>
                            )}
                          </div>
                          <span className={cn("text-[11px] font-bold transition-colors", isHovered ? "text-slate-900" : isFaded ? "text-slate-300" : "text-slate-500")}>{m}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* LIST: Antrian Dokumentasi Terkini */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }} className="lg:col-span-1 bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] overflow-hidden flex flex-col min-h-[320px] h-full">
              
              {/* Card Header */}
              <div className="px-6 md:px-8 py-5 bg-slate-50 border-b border-slate-100 flex flex-col justify-between gap-4 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 bg-white border border-slate-200 text-primary rounded-[14px] shadow-sm shrink-0">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-slate-900 leading-tight">Kegiatan Selesai</h2>
                      <Link href="/dokumentasi/berita" className="text-[11px] font-bold text-red-700 hover:underline shrink-0">
                        Lihat antrian &gt;
                      </Link>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">Antrean upload dokumentasi terbaru.</p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 md:p-8 flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
                  {!selesai.length ? (
                    <div className="py-12 text-center my-auto">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-slate-200" />
                      <p className="text-xs font-medium text-slate-400">Belum ada kegiatan selesai</p>
                    </div>
                  ) : (
                    selesai.slice(0, 5).map((k: any) => {
                      const d = new Date(k.tanggal);
                      const isUploaded = (postinganList ?? []).some((p: any) => p.judul === k.nama_kegiatan);
                      return (
                        <Link key={k.id} href="/dokumentasi/berita" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group shrink-0">
                          <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-red-700 group-hover:shadow-sm border border-slate-200/50 transition-all">
                            <Camera className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-900 truncate group-hover:text-red-700 transition-colors">{k.nama_kegiatan}</div>
                            <div className="text-[11px] font-medium text-slate-500 truncate flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {k.lokasi || 'Kampus'}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[11px] font-bold text-slate-900">{d.getDate()} {d.toLocaleDateString('id-ID', { month: 'short' })}</div>
                            {isUploaded ? (
                              <div className="text-[9px] font-bold text-emerald-600 uppercase">Uploaded</div>
                            ) : (
                              <div className="text-[9px] font-bold text-red-600 uppercase">Waiting</div>
                            )}
                          </div>
                        </Link>
                      )
                    })
                  )}
                </div>
              </div>
            </motion.div>
          </div>
          )}
        </div>
      </main>
    </div>
  );
}
