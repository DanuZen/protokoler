'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { kegiatanApi, postinganApi } from '@/lib/api';
import { useAuth, useRole } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Upload, ArrowLeft, Info, ArrowRight, CalendarDays, MapPin, CheckCircle2, ListTodo, Clock, Activity, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function DokumentasiDashboardPage() {
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
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

  const recentKegiatan = (kegiatan ?? []).slice(0, 5);

  return (
    <div className="flex-1 flex flex-col min-h-0 pb-6 px-6 md:px-8 pt-4">
      {/* ─── HEADER SECTION (Adapted Layout) ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-8 pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
              Manajemen Dokumentasi
            </span>
          </div>
          <h1 className="font-display text-[28px] md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 md:mb-2 text-slate-900 drop-shadow-sm">Daftar Acara &amp; Dokumentasi</h1>
          <p className="text-[13px] md:text-base text-slate-600 font-medium max-w-xl">
            Kelola dan pantau status unggahan dokumentasi untuk seluruh kegiatan.
          </p>
        </div>
      </motion.div>

      {/* ─── KPI METRICS ─── */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8 shrink-0">
        {[
          { 
            label: 'Kegiatan Selesai', 
            value: selesai.length, 
            hint: 'Siap didokumentasikan', 
            trend: "+2%", 
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
            value: uploadedCount, 
            hint: 'Acara sudah diupload', 
            trend: "+5%", 
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
            label: 'File Unggahan', 
            value: uploadedCount * 2 + 6, 
            hint: 'Foto, video, & dokumen', 
            trend: "+12", 
            isUp: true,
            chart: (
              <div className="flex items-end gap-0.5 h-10 mt-2 opacity-50">
                {[50, 60, 70, 65, 80, 85, 90, 95].map((h, i) => (
                  <div key={i} className="w-2 bg-emerald-500 rounded-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
            )
          },
          { 
            label: 'Antrian Review', 
            value: selesai.length - uploadedCount > 0 ? selesai.length - uploadedCount : 0, 
            hint: 'Menunggu upload', 
            trend: "-3", 
            isUp: false,
            chart: (
              <div className="w-10 h-10 mt-2 rounded-full border-4 border-amber-500/20 border-r-amber-500 border-t-amber-500 rotate-45" />
            )
          },
        ].map((s, index) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }}>
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-6 flex flex-col justify-between hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 h-full">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="text-sm font-semibold">{s.label}</span>
                    <Info className="h-3.5 w-3.5 opacity-60" />
                  </div>
                  <div className={cn("px-2 py-0.5 rounded-md text-[11px] font-bold", s.isUp ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                    {s.trend}
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[32px] font-bold text-slate-900 leading-none mb-1">{s.value}</div>
                    <div className="text-[11px] font-medium text-slate-400">{s.hint}</div>
                  </div>
                  {s.chart}
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
      </section>

      {/* ─── MAIN CHARTS & LISTS ─── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* BIG CHART */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="lg:col-span-2 bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-6 flex flex-col min-h-0">
          <div className="shrink-0 flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <Activity className="h-4 w-4" />
                </div>
                <h3 className="text-[15px] font-bold text-slate-900">Statistik Unggahan Dokumentasi</h3>
                <Info className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <div className="flex items-center gap-3 mt-4">
                <div className="text-[28px] font-bold text-slate-900">{uploadedCount} <span className="text-sm font-medium text-slate-500 ml-1">kegiatan terupload</span></div>
                <div className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-700">+8%</div>
              </div>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500"><span className="h-2 w-2 rounded-full bg-orange-500" /> Selesai</div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500"><span className="h-2 w-2 rounded-full bg-orange-100" /> Uploaded</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex p-1 bg-slate-50 border border-slate-200 rounded-xl">
                {['1D', '1W', '1M', '6M', '1Y'].map((t) => (
                  <button key={t} className={cn("px-3 py-1.5 text-[11px] font-bold rounded-lg", t === '6M' ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600")}>
                    {t}
                  </button>
                ))}
              </div>
              <button className="p-1.5 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Chart Area */}
          <div className="flex-1 min-h-0 flex items-end gap-2 md:gap-4 justify-between relative mt-4">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[10px] font-bold text-slate-400">
              <span>20</span>
              <span>15</span>
              <span>10</span>
              <span>5</span>
              <span>0</span>
            </div>
            {/* Chart Bars */}
            <div className="flex-1 flex items-end justify-between ml-10 border-b border-slate-100 pb-2 h-full">
              {[
                { m: 'Jan', h1: 12, h2: 4 }, { m: 'Feb', h1: 15, h2: 8 }, { m: 'Mar', h1: 10, h2: 5 },
                { m: 'Apr', h1: 18, h2: 12 }, { m: 'Mei', h1: 20, h2: 8 }, { m: 'Jun', h1: 14, h2: 10 },
                { m: 'Jul', h1: 10, h2: 4 }, { m: 'Agt', h1: 15, h2: 5 }, { m: 'Sep', h1: 12, h2: 2 },
                { m: 'Okt', h1: 18, h2: 9 }, { m: 'Nov', h1: 12, h2: 11 }, { m: 'Des', h1: 10, h2: 6 },
              ].map(({ m, h1, h2 }) => {
                const isHovered = hoveredBar === m;
                const h1Scaled = (h1 / 20) * 100;
                const h2Scaled = (h2 / 20) * 100;
                return (
                  <div
                    key={m}
                    className="flex flex-col items-center gap-2 group flex-1 h-full justify-end"
                    onMouseEnter={() => setHoveredBar(m)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <div className="flex gap-1 items-end w-full max-w-[24px] mx-auto h-[90%] relative">
                      <div className={cn("w-1/2 rounded-sm transition-all duration-300", isHovered ? "bg-orange-500" : "bg-slate-100 group-hover:bg-slate-200")} style={{ height: `${h1Scaled}%` }} />
                      <div className={cn("w-1/2 rounded-sm transition-all duration-300", isHovered ? "bg-orange-100" : "bg-slate-50 group-hover:bg-slate-100")} style={{ height: `${h2Scaled}%` }} />

                      {/* Tooltip */}
                      {isHovered && (
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white p-3 rounded-xl shadow-xl w-32 z-10 pointer-events-none animate-fade-in-up">
                          <div className="text-[10px] text-slate-400 mb-1 font-medium">{m} 2026</div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Selesai</span>
                            <span>{h1}</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold">
                            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-orange-200" /> Uploaded</span>
                            <span>{h2}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className={cn("text-[11px] font-bold transition-colors", isHovered ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600")}>{m}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* LIST: Aktivitas Terkini */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }} className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-6 flex flex-col min-h-0">
          <div className="shrink-0 flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[15px] font-bold text-slate-900">Aktivitas Terkini</h3>
              <Link href="/dokumentasi/upload" className="text-[11px] font-bold text-orange-500 hover:underline mt-0.5 inline-block">
                Kelola dokumen &gt;
              </Link>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 pb-2 space-y-3 [&::-webkit-scrollbar]:hidden">
            {!recentKegiatan.length ? (
              <div className="py-12 text-center my-auto">
                <Camera className="h-8 w-8 mx-auto mb-3 text-slate-200" />
                <p className="text-xs font-medium text-slate-400">Belum ada aktivitas</p>
              </div>
            ) : (
              recentKegiatan.map((k: any) => {
                const d = new Date(k.tanggal);
                const isUploaded = (postinganList ?? []).some((p: any) => p.judul === k.nama_kegiatan);
                return (
                  <Link key={k.id} href={isUploaded ? '/dokumentasi/berita' : '/dokumentasi/upload'} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                    <div className="shrink-0 h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-orange-500 group-hover:shadow-sm border border-slate-200/50 transition-all">
                      {isUploaded ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Camera className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate group-hover:text-orange-500 transition-colors">{k.nama_kegiatan}</div>
                      <div className="text-[11px] font-medium text-slate-500 truncate flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {k.jam_mulai?.slice(0,5)} WIB</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {k.lokasi || 'Kampus'}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[11px] font-bold text-slate-900">{d.getDate()} {d.toLocaleDateString('id-ID', { month: 'short' })}</div>
                      <div className={cn("text-[9px] font-bold uppercase", isUploaded ? "text-emerald-500" : "text-amber-500")}>
                        {isUploaded ? 'Diunggah' : 'Menunggu'}
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
