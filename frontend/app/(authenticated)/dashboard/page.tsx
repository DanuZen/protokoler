"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Users, CalendarDays, ClipboardList, CheckCircle2,
  TrendingUp, Dot, Clock, MapPin, Activity, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" as const },
});

const statusColors: Record<string, string> = {
  terkonfirmasi: "text-blue-600 bg-blue-50/50",
  selesai: "text-emerald-600 bg-emerald-50/50",
  draft: "text-slate-500 bg-slate-100",
  batal: "text-red-500 bg-red-50/50",
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
    { label: "Total Anggota", value: stats?.total_mahasiswa ?? "—", trend: "+8%", color: "text-slate-900" },
    { label: "Total Kegiatan", value: stats?.total_kegiatan ?? "—", trend: "+12%", color: "text-slate-900" },
    { label: "Mendatang", value: stats?.kegiatan_mendatang ?? "—", trend: "+3", color: "text-blue-600" },
    { label: "Penugasan", value: stats?.total_penugasan ?? "—", trend: "+15%", color: "text-slate-900" },
  ];

  const deadlines = (upcoming ?? []).slice(0, 5);
  const recentActivity = (upcoming ?? []).slice(0, 6);

  return (
    <div className="space-y-10 w-full max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex flex-wrap items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="mt-3 text-slate-500 text-lg">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/kegiatan">
            <Button size="lg" className="h-12 rounded-full px-8 text-base shadow-sm hover:shadow-md hover:bg-slate-800 transition-all">
              <CalendarDays className="mr-2 h-5 w-5" /> Kelola Kegiatan
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* KPI Hero Numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, i) => (
          <motion.div key={card.label} {...fadeUp(i * 0.1)} className="group bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                <TrendingUp className="h-3 w-3" />{card.trend}
              </span>
            </div>
            <div className={`text-5xl md:text-6xl font-display font-light tracking-tighter ${card.color}`}>
              {card.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid xl:grid-cols-3 gap-8 pt-4 pb-20">
        {/* Recent Activity Table */}
        <motion.div {...fadeUp(0.3)} className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                Aktivitas Terbaru
              </h2>
              <Link href="/kegiatan" className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 flex items-center gap-1 group transition-colors">
                Lihat Semua <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-4 text-sm font-bold text-slate-500 w-1/2 uppercase tracking-wider">Kegiatan</th>
                    <th className="text-left px-4 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Tanggal & Waktu</th>
                    <th className="text-left px-4 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {!recentActivity.length && (
                    <tr>
                      <td colSpan={4} className="text-center py-20 text-slate-400">
                        <p className="font-medium text-lg">Belum ada aktivitas kegiatan.</p>
                      </td>
                    </tr>
                  )}
                  {recentActivity.map((k: any, i: number) => (
                    <motion.tr
                      key={k.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-5 pr-4">
                        <div className="flex items-start gap-4">
                          <span className="text-3xl mt-1">{bentukEmoji[k.bentuk] ?? "📅"}</span>
                          <div>
                            <Link href={`/kegiatan/${k.id}`} className="font-bold text-slate-900 text-lg hover:text-blue-600 transition-colors line-clamp-1">
                              {k.nama_kegiatan}
                            </Link>
                            <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500">
                              <span className="capitalize">{k.bentuk?.replace("_", " ")}</span>
                              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {k.lokasi}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-slate-600">
                        <div className="font-semibold text-slate-800">
                          {new Date(k.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                        <div className="text-sm text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                          <Clock className="h-3.5 w-3.5" /> {k.jam_mulai?.slice(0, 5)} WIB
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-3 py-1 text-sm font-bold capitalize",
                          statusColors[k.status] ?? "text-slate-500 bg-slate-100"
                        )}>
                          {k.status}
                        </span>
                      </td>
                      <td className="py-5 text-right pl-4">
                        <Link href={`/kegiatan/${k.id}`}>
                          <Button size="icon" variant="ghost" className="rounded-full hover:bg-slate-200">
                            <ChevronRight className="h-5 w-5" />
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

        {/* Right Panel: Upcoming Deadlines */}
        <motion.div {...fadeUp(0.35)} className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 h-full">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-6">
              Jadwal Terdekat
            </h2>
            
            <div className="space-y-0">
              {!deadlines.length && (
                <div className="py-10 text-slate-400 text-lg">
                  Tidak ada jadwal dalam waktu dekat.
                </div>
              )}
              {deadlines.map((k: any, i: number) => {
                const d = new Date(k.tanggal);
                const today = new Date();
                const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const urgency = diffDays <= 2 ? "text-red-600 bg-red-50" : diffDays <= 7 ? "text-amber-600 bg-amber-50" : "text-blue-600 bg-blue-50";
                const dayLabel = diffDays === 0 ? "Hari ini" : diffDays === 1 ? "Besok" : diffDays < 0 ? "Lewat" : `${diffDays} hr lagi`;

                return (
                  <motion.div
                    key={k.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    className="group border-b border-slate-100 last:border-0"
                  >
                    <Link href={`/kegiatan/${k.id}`} className="block py-5 hover:pl-2 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-20 shrink-0 font-bold text-center text-sm py-1.5 rounded-lg", urgency)}>
                          {dayLabel}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-slate-900 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">{k.nama_kegiatan}</div>
                          <div className="text-slate-500 text-sm mt-1">{d.toLocaleDateString("id-ID", { day: "numeric", month: "long" })}</div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
