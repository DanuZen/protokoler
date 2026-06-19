"use client";
import { useQuery } from "@tanstack/react-query";
import { useAuth, useRole } from "@/hooks/use-auth";
import { protokolerApi, kegiatanApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, MapPin, Clock, Trophy, Star, Medal, CheckCircle2, AlertCircle, ShieldCheck, Info, ArrowRight, Activity, CalendarDays, MoreVertical, Award, ClipboardList } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const GAMIFICATION = [
  { level: "Perak", min: 1, max: 9, color: "from-slate-400 to-slate-600", textColor: "text-white", icon: "🥈" },
  { level: "Silver", min: 10, max: 19, color: "from-zinc-500 to-zinc-700", textColor: "text-white", icon: "🥇" },
  { level: "Gold", min: 20, max: Infinity, color: "from-yellow-400 to-amber-600", textColor: "text-white", icon: "🏆" },
];

function getNextLevel(total: number) {
  if (total < 10) return { next: "Silver", remaining: 10 - total, target: 10 };
  if (total < 20) return { next: "Gold", remaining: 20 - total, target: 20 };
  return { next: null, remaining: 0, target: total };
}

export default function BerandaPage() {
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  const { data: protokoler } = useQuery({
    queryKey: ["protokoler-me"],
    queryFn: () => protokolerApi.list().then((list: any[]) =>
      list.find((p: any) => p.user_id === user?.id) ?? null
    ),
    enabled: !!user,
  });

  const { data: kegiatan } = useQuery({
    queryKey: ["kegiatan-publik"],
    queryFn: () => kegiatanApi.list({ status: "publik" }),
  });

  const total = protokoler?.total_kegiatan ?? 0;
  const kategori = protokoler?.kategori_sertifikat ?? null;
  const { next, remaining, target } = getNextLevel(total);
  const progress = target > 0 ? Math.min(100, Math.round((total / target) * 100)) : 100;
  const recentKegiatan = (kegiatan ?? []).slice(0, 3);

  const displayName = protokoler?.nama_lengkap || user?.user_metadata?.nama_lengkap || user?.email?.split('@')[0] || 'Protokoler';

  return (
    <div className="flex-1 flex flex-col min-h-0 pb-6 px-6 md:px-8 pt-4">
      
      {/* ─── HEADER SECTION (Adapted Layout) ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 md:mb-8 pt-2">
        {/* Left: Title & Description */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
              Dashboard Anggota
            </span>
          </div>
          <h1 className="font-display text-[28px] md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 md:mb-2 text-slate-900 drop-shadow-sm">Selamat Datang, {displayName}</h1>
          <p className="text-[13px] md:text-base text-slate-600 font-medium max-w-xl">
            {protokoler?.prodi ? `${protokoler.prodi} · Unit Protokoler UNP` : "Anggota aktif unit keprotokolan Universitas Negeri Padang."}
          </p>
        </div>

        {/* Right: Premium Badges */}
        <div className="hidden md:flex flex-col gap-2 md:items-end">
          {/* Level Badge */}
          {kategori ? (
            <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${
              kategori === 'gold' ? 'bg-orange-50 border-orange-200 text-orange-600' :
              kategori === 'silver' ? 'bg-slate-100 border-slate-200 text-slate-600' :
              'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              {kategori === 'gold' ? <Trophy className="h-4 w-4" /> : <Medal className="h-4 w-4" />}
              <span className="text-xs font-bold uppercase tracking-widest">{kategori.charAt(0).toUpperCase() + kategori.slice(1)}</span>
            </div>
          ) : null}

          {/* Status Badge */}
          {(() => {
            const s = (protokoler?.status_akun ?? 'pending').toLowerCase();
            const isAktif = s === 'aktif';
            const isPending = s === 'pending';
            return (
              <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${
                isAktif  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                isPending ? 'bg-amber-50 border-amber-200 text-amber-600' :
                            'bg-red-50 border-red-200 text-red-600'
              }`}>
                {isAktif ? <CheckCircle2 className="h-4 w-4" /> :
                 isPending ? <AlertCircle className="h-4 w-4" /> :
                             <ShieldCheck className="h-4 w-4" />}
                <span className="text-xs font-bold uppercase tracking-widest capitalize">{s}</span>
              </div>
            );
          })()}
        </div>
      </motion.div>

      {/* ─── Floating Stats Row ─── */}
      <section className="relative z-20 pb-0 shrink-0 mb-6 md:mb-8">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
          {[
            { label: "Total Penugasan", value: total, icon: ClipboardList, hint: "Aktif & selesai", color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Sertifikat", value: total, icon: Award, hint: "Berhasil diklaim", color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Evaluasi Positif", value: "14", icon: Star, hint: "Feedback kegiatan", color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Level Saat Ini", value: kategori ? kategori.toUpperCase() : "–", icon: Trophy, hint: "Peringkat", color: "text-orange-600", bg: "bg-orange-50" },
          ].map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }}>
              <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-4 md:p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-orange-50/80 transition-all group relative overflow-hidden h-full">
                <div className="flex items-center justify-between relative z-10 mb-2 md:mb-0">
                  <p className="text-xs md:text-sm font-semibold text-slate-500 truncate pr-2">{stat.label}</p>
                  <div className={cn("flex-shrink-0 h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-xl transition-colors", stat.bg, stat.color)}>
                    <stat.icon className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                </div>
                <div className="mt-1 md:mt-4 relative z-10">
                  <p className="text-2xl md:text-[32px] font-bold leading-tight text-slate-900">{stat.value}</p>
                  <span className="text-[9px] md:text-[11px] font-medium text-slate-400 mt-0.5 md:mt-1 block truncate">{stat.hint}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── MAIN CHARTS & LISTS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* BIG CHART */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="lg:col-span-2 bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-5 md:p-6 flex flex-col overflow-hidden">
          <div className="shrink-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-0 mb-6 md:mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <Activity className="h-4 w-4" />
                </div>
                <h3 className="text-[15px] font-bold text-slate-900">Statistik Partisipasi Kegiatan</h3>
                <Info className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <div className="flex items-center gap-3 mt-4">
                <div className="text-[28px] font-bold text-slate-900">{total} <span className="text-sm font-medium text-slate-500 ml-1">kegiatan</span></div>
                <div className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-700">+8%</div>
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
          
          {/* Chart Area */}
          <div className="flex-1 w-full overflow-x-auto pb-2 mt-4 custom-scrollbar">
            <div className="flex items-end gap-2 md:gap-4 justify-between relative min-w-[500px] h-[200px] md:h-full">
              {/* Y-axis labels */}
              <div className="sticky left-0 bg-white/80 backdrop-blur-sm z-10 w-8 shrink-0 flex flex-col justify-between text-[10px] font-bold text-slate-400 pb-6 pt-2">
                <span>20</span>
                <span>15</span>
                <span>10</span>
                <span>5</span>
                <span>0</span>
              </div>
              {/* Chart Bars */}
              <div className="flex-1 flex items-end justify-between border-b border-slate-100 pb-2 h-full pl-2">
              {[
                { m: 'Jan', h1: 12, h2: 4 }, { m: 'Feb', h1: 15, h2: 8 }, { m: 'Mar', h1: 10, h2: 5 },
                { m: 'Apr', h1: 18, h2: 12 }, { m: 'Mei', h1: 20, h2: 8 }, { m: 'Jun', h1: 14, h2: 10 },
                { m: 'Jul', h1: 10, h2: 4 }, { m: 'Agt', h1: 15, h2: 5 }, { m: 'Sep', h1: 12, h2: 2 },
                { m: 'Okt', h1: 18, h2: 9 }, { m: 'Nov', h1: 12, h2: 11 }, { m: 'Des', h1: 10, h2: 6 },
              ].map(({ m, h1, h2 }) => {
                const isHovered = hoveredBar === m;
                // Skala disesuaikan agar tidak melampaui max 20
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
        </div>
        </motion.div>

        {/* LIST: Top Product Style */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }} className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl flex flex-col min-h-[400px] lg:min-h-0">
          <div className="shrink-0 flex items-center justify-between p-5 md:p-6 pb-2 md:pb-4 border-b border-slate-100/50">
            <div>
              <h3 className="text-[15px] font-bold text-slate-900">Aktivitas Terkini</h3>
              <Link href="/kegiatan" className="text-[11px] font-bold text-orange-500 hover:underline mt-0.5 inline-block">
                Lihat semua aktivitas &gt;
              </Link>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 md:px-6 py-2 space-y-3 [&::-webkit-scrollbar]:hidden">
            {!recentKegiatan.length ? (
              <div className="py-12 text-center my-auto">
                <CalendarDays className="h-8 w-8 mx-auto mb-3 text-slate-200" />
                <p className="text-xs font-medium text-slate-400">Belum ada aktivitas</p>
              </div>
            ) : (
              recentKegiatan.map((k: any) => {
                const d = new Date(k.tanggal);
                return (
                  <Link key={k.id} href={`/kegiatan/${k.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                    <div className="shrink-0 h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-orange-500 group-hover:shadow-sm border border-slate-200/50 transition-all">
                      <CalendarDays className="h-4 w-4" />
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
                      <div className="text-[9px] font-bold text-slate-400 uppercase">{(k.status || 'Tersedia').replace(/_/g, ' ')}</div>
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
