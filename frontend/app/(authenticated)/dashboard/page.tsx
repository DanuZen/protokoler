'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { dashboardApi } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  LayoutGrid, ArrowRight, Info, MoreVertical,
  Activity, CalendarDays, Clock, MapPin, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' as const },
});

export default function Dashboard() {
  const { user, loading: isAuthLoading } = useAuth();
  const displayName = user?.user_metadata?.nama_lengkap || user?.email?.split('@')[0] || 'Demo Pimpinan';
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.stats(),
  });

  const { data: upcoming, isLoading: isUpcomingLoading } = useQuery({
    queryKey: ['dashboard-upcoming'],
    queryFn: () => dashboardApi.upcoming(8),
  });

  const recentActivity = (upcoming ?? []).slice(0, 5);

  const kpiData = [
    { 
      label: 'Total Anggota', 
      value: stats?.total_mahasiswa ?? '142', 
      trend: '+5%', 
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
      label: 'Total Kegiatan', 
      value: stats?.total_kegiatan ?? '86', 
      trend: '+8%', 
      isUp: true,
      chart: (
        <div className="w-16 h-10 mt-2 relative overflow-hidden">
          <svg viewBox="0 0 100 40" className="w-full h-full stroke-red-700 fill-none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5,30 L25,15 L45,25 L70,5 L95,15" />
          </svg>
        </div>
      )
    },
    { 
      label: 'Mendatang', 
      value: stats?.kegiatan_mendatang ?? '3', 
      trend: '+12%', 
      isUp: true,
      chart: (
        <div className="w-10 h-10 mt-2 rounded-full border-4 border-red-700/20 border-r-red-700 border-t-red-700 rotate-45" />
      )
    },
    { 
      label: 'Total Penugasan', 
      value: stats?.total_penugasan ?? '512', 
      trend: '-3%', 
      isUp: false,
      chart: (
        <div className="flex items-end gap-0.5 h-10 mt-2 opacity-50">
          {[80, 70, 85, 95, 70, 60, 50, 40].map((h, i) => (
            <div key={i} className="w-2 bg-red-700 rounded-sm" style={{ height: `${h}%` }} />
          ))}
        </div>
      )
    },
  ];

  return (
    <div className="flex flex-col h-auto md:h-dvh md:overflow-hidden pb-6 px-6 md:px-8 pt-4">
      
      {/* ─── HEADER SECTION ──────────────────────────────────────── */}
      <motion.div {...fadeUp(0)} className="shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 pb-6 border-b border-slate-200/60">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-700 to-red-800 shadow-lg shadow-red-700/20 text-white">
            <LayoutGrid className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-red-800">
                Ringkasan Sistem
              </span>
            </div>
            {isAuthLoading ? (
              <Skeleton className="h-12 w-64 mb-1.5 rounded-lg" />
            ) : (
              <h2 className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 text-slate-900 drop-shadow-sm">Selamat Datang, {displayName}</h2>
            )}
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Senang melihat Anda kembali. Mari mulai bekerja.</p>
          </div>
        </div>
      </motion.div>

      {/* ─── KPI METRICS ─────────────────────────────────────────── */}
      <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {kpiData.map((kpi, i) => (
          <motion.div {...fadeUp(0.15 + i * 0.05)} key={kpi.label} className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="text-sm font-semibold">{kpi.label}</span>
                    <Info className="h-3.5 w-3.5 opacity-60" />
                  </div>
                  <div className={cn("px-2 py-0.5 rounded-md text-[11px] font-bold", kpi.isUp ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                    {kpi.trend}
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    {isStatsLoading ? (
                      <Skeleton className="h-8 w-20 mb-1 rounded-md" />
                    ) : (
                      <div className="text-[32px] font-bold text-slate-900 leading-none mb-1">{kpi.value}</div>
                    )}
                    <div className="text-[11px] font-medium text-slate-400">Bulan lalu</div>
                  </div>
                  {isStatsLoading ? <Skeleton className="w-16 h-10 mt-2 rounded-md" /> : kpi.chart}
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button className="w-full flex items-center justify-center gap-2 text-[13px] font-bold text-slate-600 hover:text-slate-900 transition-colors">
                  Lihat Detail <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          </motion.div>
        ))}
      </div>

      {/* ─── MAIN CHARTS & LISTS ─────────────────────────────────── */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 pb-12 pr-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
            
            {/* BIG CHART: Sales Revenue Style */}
            <motion.div {...fadeUp(0.3)} className="lg:col-span-2 bg-white border border-slate-100 shadow-sm rounded-[24px] flex flex-col relative overflow-hidden h-full">
              <div className="px-6 md:px-8 py-5 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4 shrink-0 rounded-t-[24px]">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 bg-white border border-slate-200 text-primary rounded-[14px] shadow-sm shrink-0">
                    <Activity className="h-6 w-6 text-red-700" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">Statistik Kegiatan</h2>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">Grafik jumlah kegiatan internal & eksternal.</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  {isStatsLoading ? (
                    <Skeleton className="h-8 w-32 rounded-lg" />
                  ) : (
                    <div className="text-[28px] font-bold text-slate-900">{stats?.total_kegiatan ?? 124} <span className="text-sm font-medium text-slate-500 ml-1">kegiatan</span></div>
                  )}
                  <div className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-700">+12%</div>
                </div>
                <div className="flex gap-4 mb-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500"><span className="h-2 w-2 rounded-full bg-red-700" /> Internal</div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500"><span className="h-2 w-2 rounded-full bg-red-100" /> Eksternal</div>
                </div>
              
                {/* Mock Chart Area */}
                <div className="flex-1 min-h-[240px] flex items-end gap-2 md:gap-4 justify-between relative mt-4">
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
                  {isStatsLoading ? (
                    <div className="flex items-end justify-between w-full h-full pb-2">
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                          <div className="flex gap-2 items-end w-full max-w-[64px] lg:max-w-[76px] mx-auto h-[90%]">
                            <Skeleton className="w-1/2 rounded-t-md" style={{ height: `${Math.floor(Math.random() * 60) + 20}%` }} />
                            <Skeleton className="w-1/2 rounded-t-md" style={{ height: `${Math.floor(Math.random() * 60) + 20}%` }} />
                          </div>
                          <Skeleton className="h-3 w-6 mt-1" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    [
                      { m: 'Jan', h1: 28, h2: 14 }, { m: 'Feb', h1: 35, h2: 18 }, { m: 'Mar', h1: 22, h2: 11 },
                      { m: 'Apr', h1: 45, h2: 22 }, { m: 'Mei', h1: 55, h2: 28 }, { m: 'Jun', h1: 60, h2: 30 },
                      { m: 'Jul', h1: 48, h2: 24 }, { m: 'Agt', h1: 30, h2: 15 }, { m: 'Sep', h1: 25, h2: 12 },
                      { m: 'Okt', h1: 38, h2: 19 }, { m: 'Nov', h1: 42, h2: 21 }, { m: 'Des', h1: 33, h2: 16 },
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
                            {/* Internal (Left Bar) */}
                            <div className={cn("w-1/2 rounded-t-[6px] transition-all duration-300", isHovered ? "bg-red-700 shadow-md" : "bg-red-600")} style={{ height: `${h1}%` }} />
                            {/* Eksternal (Right Bar) */}
                            <div className={cn("w-1/2 rounded-t-[6px] transition-all duration-300", isHovered ? "bg-red-300 shadow-md" : "bg-red-200")} style={{ height: `${h2}%` }} />
  
                            {/* Tooltip */}
                            {isHovered && (
                              <div className="absolute -top-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-3.5 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] w-[140px] z-20 pointer-events-none animate-fade-in-up border border-slate-700/50">
                                <div className="text-[11px] text-slate-400 mb-2 font-medium border-b border-slate-700/50 pb-1.5">{m} 2026</div>
                                <div className="flex justify-between items-center text-xs font-bold mb-2">
                                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> Internal</span>
                                  <span className="text-white">{h1}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold">
                                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-200 shadow-[0_0_8px_rgba(254,202,202,0.5)]" /> Eksternal</span>
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
                    })
                  )}
                </div>
              </div>
            </div>
          </motion.div>

            {/* LIST: Top Product Style */}
            <motion.div {...fadeUp(0.35)} className="bg-white border border-slate-100 shadow-sm rounded-[24px] flex flex-col relative overflow-hidden h-full">
              <div className="px-6 md:px-8 py-5 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4 shrink-0 rounded-t-[24px]">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 bg-white border border-slate-200 text-primary rounded-[14px] shadow-sm shrink-0">
                    <CalendarDays className="h-6 w-6 text-red-700" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">Aktivitas Terkini</h2>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">Kegiatan yang baru saja diterbitkan.</p>
                  </div>
                </div>
                <Link href="/kegiatan">
                  <Button variant="outline" className="rounded-xl border-slate-300 text-slate-700 font-bold bg-white hover:bg-slate-100 hover:text-slate-800 h-10 px-4">
                    Semua Kegiatan <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="p-6 md:p-8 flex-1 flex flex-col gap-4 overflow-y-auto">
                {isUpcomingLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                      <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <div className="space-y-2 text-right flex flex-col items-end">
                        <Skeleton className="h-3 w-8" />
                        <Skeleton className="h-2 w-12" />
                      </div>
                    </div>
                  ))
                ) : !recentActivity.length ? (
                  <div className="py-12 text-center my-auto">
                    <CalendarDays className="h-8 w-8 mx-auto mb-3 text-slate-200" />
                    <p className="text-xs font-medium text-slate-400">Belum ada aktivitas</p>
                  </div>
                ) : (
                  recentActivity.map((k: any, i: number) => {
                    const d = new Date(k.tanggal);
                    return (
                      <Link key={k.id} href={`/kegiatan/${k.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                        <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-red-700 group-hover:shadow-sm border border-slate-200/50 transition-all">
                          <CalendarDays className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-900 truncate group-hover:text-red-700 transition-colors">{k.nama_kegiatan}</div>
                          <div className="text-[11px] font-medium text-slate-500 truncate flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {k.jam_mulai?.slice(0,5)} WIB</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {k.lokasi || 'Kampus'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] font-bold text-slate-900">{d.getDate()} {d.toLocaleDateString('id-ID', { month: 'short' })}</div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase">{k.status}</div>
                        </div>
                      </Link>
                    )
                  })
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
}
