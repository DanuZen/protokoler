'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { dashboardApi } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import {
  LayoutGrid, ArrowRight, Info, MoreVertical,
  Activity, CalendarDays, Clock, MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' as const },
});

export default function Dashboard() {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.nama_lengkap || user?.email?.split('@')[0] || 'Demo Pimpinan';
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.stats(),
  });

  const { data: upcoming } = useQuery({
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
            <div key={i} className="w-4 bg-orange-500 rounded-sm transition-all hover:opacity-80" style={{ height: `${h}%` }} />
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
          <svg viewBox="0 0 100 40" className="w-full h-full stroke-orange-500 fill-none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
        <div className="w-10 h-10 mt-2 rounded-full border-4 border-orange-500/20 border-r-orange-500 border-t-orange-500 rotate-45" />
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
            <div key={i} className="w-2 bg-orange-500 rounded-sm" style={{ height: `${h}%` }} />
          ))}
        </div>
      )
    },
  ];

  return (
    <div className="flex flex-col min-h-full pb-10 px-6 md:px-8 pt-4">
      
      {/* ─── HEADER SECTION ──────────────────────────────────────── */}
      <motion.div {...fadeUp(0)} className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 pb-6 border-b border-slate-200/60">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20 text-white">
            <LayoutGrid className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
                Ringkasan Sistem
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 text-slate-900 drop-shadow-sm">Selamat Datang, {displayName}</h2>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Senang melihat Anda kembali. Mari mulai bekerja.</p>
          </div>
        </div>
      </motion.div>

      {/* ─── KPI METRICS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {kpiData.map((kpi, i) => (
          <motion.div {...fadeUp(0.15 + i * 0.05)} key={kpi.label} className="bg-white/60 backdrop-blur-xl rounded-[24px] border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex flex-col justify-between hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
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
                    <div className="text-[32px] font-bold text-slate-900 leading-none mb-1">{kpi.value}</div>
                    <div className="text-[11px] font-medium text-slate-400">Bulan lalu</div>
                  </div>
                  {kpi.chart}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* BIG CHART: Sales Revenue Style */}
        <motion.div {...fadeUp(0.3)} className="lg:col-span-2 bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-6 flex flex-col">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <Activity className="h-4 w-4" />
                </div>
                <h3 className="text-[15px] font-bold text-slate-900">Statistik Kegiatan</h3>
                <Info className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <div className="flex items-center gap-3 mt-4">
                <div className="text-[28px] font-bold text-slate-900">124 <span className="text-sm font-medium text-slate-500 ml-1">kegiatan</span></div>
                <div className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-700">+12%</div>
              </div>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500"><span className="h-2 w-2 rounded-full bg-orange-500" /> Internal</div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500"><span className="h-2 w-2 rounded-full bg-orange-100" /> Eksternal</div>
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
              {[
                { m: 'Jan', h1: 28, h2: 14 }, { m: 'Feb', h1: 35, h2: 18 }, { m: 'Mar', h1: 22, h2: 11 },
                { m: 'Apr', h1: 45, h2: 22 }, { m: 'Mei', h1: 55, h2: 28 }, { m: 'Jun', h1: 72, h2: 38 },
                { m: 'Jul', h1: 48, h2: 24 }, { m: 'Agt', h1: 30, h2: 15 }, { m: 'Sep', h1: 25, h2: 12 },
                { m: 'Okt', h1: 38, h2: 19 }, { m: 'Nov', h1: 42, h2: 21 }, { m: 'Des', h1: 33, h2: 16 },
              ].map(({ m, h1, h2 }) => {
                const isHovered = hoveredBar === m;
                return (
                  <div
                    key={m}
                    className="flex flex-col items-center gap-2 group flex-1 h-full justify-end"
                    onMouseEnter={() => setHoveredBar(m)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <div className="flex gap-1 items-end w-full max-w-[24px] mx-auto h-[90%] relative">
                      <div className={cn("w-1/2 rounded-sm transition-all duration-300", isHovered ? "bg-orange-500" : "bg-slate-100 group-hover:bg-slate-200")} style={{ height: `${h1}%` }} />
                      <div className={cn("w-1/2 rounded-sm transition-all duration-300", isHovered ? "bg-orange-100" : "bg-slate-50 group-hover:bg-slate-100")} style={{ height: `${h2}%` }} />

                      {/* Tooltip — hanya muncul saat hover */}
                      {isHovered && (
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white p-3 rounded-xl shadow-xl w-32 z-10 pointer-events-none animate-fade-in-up">
                          <div className="text-[10px] text-slate-400 mb-1 font-medium">{m} 2026</div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Internal</span>
                            <span>{h1}</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold">
                            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-orange-200" /> Eksternal</span>
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

        {/* LIST: Top Product Style */}
        <motion.div {...fadeUp(0.35)} className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[15px] font-bold text-slate-900">Aktivitas Terkini</h3>
              <Link href="/kegiatan" className="text-[11px] font-bold text-orange-500 hover:underline mt-0.5 inline-block">
                Lihat semua aktivitas &gt;
              </Link>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            {!recentActivity.length ? (
              <div className="py-12 text-center my-auto">
                <CalendarDays className="h-8 w-8 mx-auto mb-3 text-slate-200" />
                <p className="text-xs font-medium text-slate-400">Belum ada aktivitas</p>
              </div>
            ) : (
              recentActivity.map((k: any, i: number) => {
                const d = new Date(k.tanggal);
                return (
                  <Link key={k.id} href={`/kegiatan/${k.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                    <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-orange-500 group-hover:shadow-sm border border-slate-200/50 transition-all">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate group-hover:text-orange-500 transition-colors">{k.nama_kegiatan}</div>
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
  );
}
