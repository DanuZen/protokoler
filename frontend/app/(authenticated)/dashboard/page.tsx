"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, CalendarDays, ClipboardList, CheckCircle2,
  TrendingUp, ArrowRight, Dot, Clock, MapPin,
  BarChart3, Activity, Bell, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" as const },
});

// Mini sparkline-style bar chart
function MiniBar({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-0.5 h-10">
      {values.map((v, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm ${color} opacity-80`}
          style={{ height: `${(v / max) * 100}%`, minHeight: 4 }}
        />
      ))}
    </div>
  );
}

const statusColors: Record<string, string> = {
  terkonfirmasi: "bg-blue-100 text-blue-700 border-blue-200",
  selesai: "bg-emerald-100 text-emerald-700 border-emerald-200",
  draft: "bg-slate-100 text-slate-500 border-slate-200",
  batal: "bg-red-100 text-red-500 border-red-200",
};

const bentukEmoji: Record<string, string> = {
  wisuda: "🎓", kunjungan: "🤝", seminar: "📢",
  pelantikan: "🏛️", rapat_resmi: "📋", lainnya: "📅",
};

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => dashboardApi.stats(),
  });

  const { data: upcoming } = useQuery({
    queryKey: ["dashboard-upcoming"],
    queryFn: () => dashboardApi.upcoming(8),
  });

  const kpiCards = [
    {
      label: "Total Mahasiswa",
      value: stats?.total_mahasiswa ?? "—",
      sub: "Anggota terdaftar",
      icon: Users,
      gradient: "from-blue-600 to-blue-500",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
      bars: [40, 55, 45, 60, 70, 65, 80],
      barColor: "bg-blue-500",
      trend: "+8%",
    },
    {
      label: "Total Kegiatan",
      value: stats?.total_kegiatan ?? "—",
      sub: "Sepanjang tahun",
      icon: CalendarDays,
      gradient: "from-violet-600 to-violet-500",
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
      bars: [30, 50, 40, 70, 60, 80, 75],
      barColor: "bg-violet-500",
      trend: "+12%",
    },
    {
      label: "Kegiatan Mendatang",
      value: stats?.kegiatan_mendatang ?? "—",
      sub: "Perlu dipersiapkan",
      icon: ClipboardList,
      gradient: "from-amber-500 to-amber-400",
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
      bars: [20, 30, 25, 35, 28, 40, 38],
      barColor: "bg-amber-400",
      trend: "+3",
    },
    {
      label: "Total Penugasan",
      value: stats?.total_penugasan ?? "—",
      sub: "Semua penugasan",
      icon: CheckCircle2,
      gradient: "from-emerald-600 to-emerald-500",
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      bars: [60, 75, 65, 80, 70, 90, 85],
      barColor: "bg-emerald-500",
      trend: "+15%",
    },
  ];

  // Group upcoming by date for deadline panel
  const deadlines = (upcoming ?? []).slice(0, 5);
  const recentActivity = (upcoming ?? []).slice(0, 6);

  return (
    <div className="space-y-8 max-w-[1400px]">
      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs font-semibold text-green-600 uppercase tracking-widest">Sistem Aktif</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-slate-500">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-medium text-slate-600">
            <BarChart3 className="h-4 w-4 text-primary" />
            Periode: {new Date().getFullYear()}
          </div>
          <Link href="/kegiatan">
            <Button className="h-10 rounded-xl px-5 gap-2 shadow-sm">
              <CalendarDays className="h-4 w-4" /> Lihat Kegiatan
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpiCards.map((card, i) => (
          <motion.div key={card.label} {...fadeUp(i * 0.08)}>
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-6 group">
              {/* Gradient blob */}
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />

              <div className="flex items-start justify-between mb-4">
                <div className={`${card.bg} h-12 w-12 rounded-xl flex items-center justify-center`}>
                  <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <TrendingUp className="h-3 w-3" />{card.trend}
                </span>
              </div>

              <div className="mb-1">
                <div className={`text-4xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-br ${card.gradient}`}>
                  {card.value}
                </div>
                <div className="text-sm font-semibold text-slate-700 mt-1">{card.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{card.sub}</div>
              </div>

              <div className="mt-4">
                <MiniBar values={card.bars} color={card.barColor} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Recent Activity Table - 2 cols */}
        <motion.div {...fadeUp(0.3)} className="xl:col-span-2">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Aktivitas Kegiatan Terbaru</h2>
                  <p className="text-xs text-slate-400">Daftar kegiatan yang akan dan sedang berlangsung</p>
                </div>
              </div>
              <Link href="/kegiatan" className="flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all">
                Lihat Semua <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Kegiatan</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Lokasi</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {!recentActivity.length && (
                    <tr>
                      <td colSpan={5} className="text-center py-14 text-slate-400">
                        <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p className="font-medium">Belum ada kegiatan terjadwal</p>
                      </td>
                    </tr>
                  )}
                  {recentActivity.map((k: any, i: number) => (
                    <motion.tr
                      key={k.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.04 }}
                      className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{bentukEmoji[k.bentuk] ?? "📅"}</span>
                          <div>
                            <div className="font-semibold text-slate-800 group-hover:text-primary transition-colors line-clamp-1">
                              {k.nama_kegiatan}
                            </div>
                            <div className="text-xs text-slate-400 capitalize">{k.bentuk?.replace("_", " ")}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="text-xs">
                            {new Date(k.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 ml-5">
                          {k.jam_mulai?.slice(0, 5)} WIB
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-xs text-slate-500 max-w-[120px]">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{k.lokasi}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
                          statusColors[k.status] ?? "bg-slate-100 text-slate-500 border-slate-200"
                        )}>
                          {k.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Link href={`/kegiatan/${k.id}`}>
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Right Panel */}
        <div className="space-y-5">
          {/* Upcoming Deadlines */}
          <motion.div {...fadeUp(0.35)}>
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900">Jadwal Terdekat</h3>
                </div>
                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-xs font-bold">
                  {deadlines.length} agenda
                </Badge>
              </div>
              <div className="p-3 space-y-2">
                {!deadlines.length && (
                  <div className="py-8 text-center text-slate-400 text-sm">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    Tidak ada jadwal
                  </div>
                )}
                {deadlines.map((k: any, i: number) => {
                  const d = new Date(k.tanggal);
                  const today = new Date();
                  const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const urgency = diffDays <= 2 ? "border-red-400 bg-red-50" :
                                  diffDays <= 7 ? "border-amber-400 bg-amber-50" :
                                  "border-blue-300 bg-blue-50";
                  const dayLabel = diffDays === 0 ? "Hari ini" :
                                   diffDays === 1 ? "Besok" :
                                   diffDays < 0 ? "Lewat" :
                                   `${diffDays} hari lagi`;

                  return (
                    <motion.div
                      key={k.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.06 }}
                    >
                      <Link href={`/kegiatan/${k.id}`}>
                        <div className={cn("flex items-start gap-3 rounded-xl border-l-4 px-3 py-3 hover:shadow-sm transition-all", urgency)}>
                          <div className="text-lg">{bentukEmoji[k.bentuk] ?? "📅"}</div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-slate-800 text-sm truncate">{k.nama_kegiatan}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-500">
                                {d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                              </span>
                              <Dot className="h-3 w-3 text-slate-300" />
                              <span className={cn(
                                "text-xs font-bold",
                                diffDays <= 2 ? "text-red-600" :
                                diffDays <= 7 ? "text-amber-600" : "text-blue-600"
                              )}>{dayLabel}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Quick Summary */}
          <motion.div {...fadeUp(0.45)}>
            <div className="rounded-2xl bg-gradient-to-br from-primary via-blue-700 to-indigo-800 text-white shadow-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <h3 className="font-bold text-white">Ringkasan Cepat</h3>
                <p className="text-white/60 text-xs mt-0.5">Statistik tim protokoler</p>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {[
                  { label: "Total Anggota", value: stats?.total_mahasiswa ?? "—", icon: Users, bg: "bg-white/10" },
                  { label: "Kegiatan", value: stats?.total_kegiatan ?? "—", icon: CalendarDays, bg: "bg-white/10" },
                  { label: "Penugasan", value: stats?.total_penugasan ?? "—", icon: ClipboardList, bg: "bg-white/10" },
                  { label: "Mendatang", value: stats?.kegiatan_mendatang ?? "—", icon: CheckCircle2, bg: "bg-white/10" },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.07 }}
                    className={`${s.bg} rounded-xl p-3 text-center hover:bg-white/20 transition-colors`}
                  >
                    <s.icon className="h-5 w-5 mx-auto mb-1.5 opacity-80" />
                    <div className="text-2xl font-display font-extrabold">{s.value}</div>
                    <div className="text-white/60 text-[10px] font-semibold uppercase tracking-wider mt-0.5">{s.label}</div>
                  </motion.div>
                ))}
              </div>
              <div className="px-4 pb-4">
                <Link href="/laporan">
                  <Button variant="ghost" className="w-full rounded-xl text-white border border-white/20 hover:bg-white/10 hover:text-white gap-2 text-sm h-10">
                    <BarChart3 className="h-4 w-4" /> Lihat Laporan Lengkap
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
