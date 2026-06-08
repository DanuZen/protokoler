"use client";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Users, CalendarDays, ClipboardList, TrendingUp,
  Clock, MapPin, ChevronRight,
  GraduationCap, Handshake, Megaphone, Landmark, ArrowUpRight,
  CheckCircle2, Timer, TrendingDown
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: "easeOut" as const },
});

/* ── Status config ─────────────────────────────────────── */
const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  terkonfirmasi: { label: "Terkonfirmasi", color: "text-emerald-700 bg-emerald-50 border border-emerald-200",  dot: "bg-emerald-500" },
  terjadwal:    { label: "Terjadwal",    color: "text-slate-700 bg-slate-100 border border-slate-200",        dot: "bg-slate-400" },
  berlangsung:  { label: "Berlangsung",  color: "text-amber-700 bg-amber-50 border border-amber-200",         dot: "bg-amber-500" },
  selesai:      { label: "Selesai",      color: "text-slate-500 bg-slate-50 border border-slate-200",         dot: "bg-slate-400" },
  draft:        { label: "Draft",        color: "text-slate-500 bg-slate-100 border border-slate-200",        dot: "bg-slate-400" },
  batal:        { label: "Batal",        color: "text-red-600 bg-red-50 border border-red-200",               dot: "bg-red-500" },
};

/* ── Bentuk Icon ───────────────────────────────────────── */
const BentukIcon = ({ bentuk, className }: { bentuk: string; className?: string }) => {
  switch (bentuk) {
    case "wisuda":      return <GraduationCap className={className} />;
    case "kunjungan":   return <Handshake className={className} />;
    case "seminar":     return <Megaphone className={className} />;
    case "pelantikan":  return <Landmark className={className} />;
    case "rapat_resmi": return <ClipboardList className={className} />;
    default:            return <CalendarDays className={className} />;
  }
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

  /* KPI Cards — ikon dengan warna emas sebagai aksen sesuai design system */
  const kpiCards = [
    {
      label: "Total Anggota",
      value: stats?.total_mahasiswa ?? "—",
      trend: "+8%",
      positive: true,
      icon: Users,
    },
    {
      label: "Total Kegiatan",
      value: stats?.total_kegiatan ?? "—",
      trend: "+12%",
      positive: true,
      icon: CalendarDays,
    },
    {
      label: "Mendatang",
      value: stats?.kegiatan_mendatang ?? "—",
      trend: "+3",
      positive: true,
      icon: Timer,
    },
    {
      label: "Penugasan",
      value: stats?.total_penugasan ?? "—",
      trend: "+15%",
      positive: true,
      icon: ClipboardList,
    },
  ];

  const deadlines = (upcoming ?? []).slice(0, 5);
  const recentActivity = (upcoming ?? []).slice(0, 6);

  return (
    <div className="min-h-screen bg-transparent">

      {/* ─── Hero Banner — Transparent (Bg handled by app-shell) ─── */}
      <div className="relative px-6 md:px-10 pt-24 pb-32 overflow-hidden">

        {/* Gold decorative line at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent opacity-60" />
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Gold accent circle */}
        <div className="absolute -right-16 top-0 h-72 w-72 rounded-full bg-[#C9A84C]/5 blur-3xl" />

        <motion.div {...fadeUp(0)} className="relative z-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-[0.25em] mb-3">
              Sistem Informasi Protokoler
            </p>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight">
              Dashboard
            </h1>
            <p className="mt-2 text-slate-300 text-sm">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>

          <Link href="/kegiatan">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-[#C9A84C] hover:bg-[#b8963f] text-slate-900 font-bold px-6 py-3 rounded-none transition-all text-sm shadow-lg"
            >
              <CalendarDays className="h-4 w-4" />
              Kelola Kegiatan
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </motion.button>
          </Link>
        </motion.div>
      </div>

      <div className="bg-slate-50 min-h-screen pt-4">
        {/* ─── KPI Cards — Sharp edges, navy + gold ─── */}
      <div className="px-6 md:px-10 -mt-24 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-0 border border-slate-200 shadow-xl">
          {kpiCards.map((card, i) => (
            <motion.div
              key={card.label}
              {...fadeUp(0.1 + i * 0.07)}
              className={cn(
                "bg-white px-6 py-5 flex items-center gap-5 hover:bg-slate-50 transition-colors",
                i < kpiCards.length - 1 && "border-r border-slate-200"
              )}
            >
              {/* Gold icon box */}
              <div className="flex-shrink-0 h-12 w-12 bg-slate-900 flex items-center justify-center rounded-none">
                <card.icon className="h-5 w-5 text-[#C9A84C]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] truncate">{card.label}</p>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-slate-900 leading-none font-display">{card.value}</span>
                </div>
                <div className="flex items-center gap-1 mt-1.5">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-500">{card.trend}</span>
                  <span className="text-[10px] text-slate-400 ml-1">vs. bulan lalu</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="px-6 md:px-10 mt-8 pb-12">
        <div className="grid xl:grid-cols-3 gap-6">

          {/* Left: Activity Table */}
          <motion.div {...fadeUp(0.35)} className="xl:col-span-2">
            <div className="bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden">
              {/* Card Header with gold left border accent */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
                <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Aktivitas Terbaru</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Daftar kegiatan protokoler terkini</p>
                </div>
                <Link
                  href="/kegiatan"
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-[#C9A84C] border border-slate-300 hover:border-[#C9A84C] px-3 py-1.5 rounded-none transition-colors"
                >
                  Lihat Semua <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Kegiatan</th>
                      <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Tanggal</th>
                      <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Status</th>
                      <th className="py-3 px-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {!recentActivity.length && (
                      <tr>
                        <td colSpan={4} className="text-center py-16 text-slate-300">
                          <CalendarDays className="h-10 w-10 mx-auto mb-3" />
                          <p className="text-sm font-medium text-slate-400">Belum ada aktivitas kegiatan</p>
                        </td>
                      </tr>
                    )}
                    {recentActivity.map((k: any, i: number) => {
                      const cfg = statusConfig[k.status];
                      return (
                        <motion.tr
                          key={k.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 + i * 0.05 }}
                          className="hover:bg-slate-50/60 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {/* Icon box — slate bg */}
                              <div className="h-9 w-9 bg-slate-100 border border-slate-200 rounded-none flex items-center justify-center flex-shrink-0 group-hover:bg-slate-900 group-hover:text-[#C9A84C] transition-colors">
                                <BentukIcon bentuk={k.bentuk} className="h-4 w-4 text-slate-500 group-hover:text-[#C9A84C] transition-colors" />
                              </div>
                              <div className="min-w-0">
                                <Link href={`/kegiatan/${k.id}`} className="font-semibold text-slate-900 text-sm hover:text-[#C9A84C] transition-colors line-clamp-1">
                                  {k.nama_kegiatan}
                                </Link>
                                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{k.lokasi || k.tempat || "—"}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-semibold text-slate-800">
                              {new Date(k.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                              <Clock className="h-3 w-3" />
                              <span>{k.jam_mulai?.slice(0, 5)} WIB</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {cfg ? (
                              <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-none uppercase tracking-wider", cfg.color)}>
                                <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", cfg.dot)} />
                                {cfg.label}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 capitalize border border-slate-200 px-2 py-0.5 rounded-none">{k.status}</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Link href={`/kegiatan/${k.id}`}>
                              <button className="h-8 w-8 rounded-none border border-slate-200 hover:border-slate-900 hover:bg-slate-900 hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </Link>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Right: Upcoming Deadlines */}
          <motion.div {...fadeUp(0.4)}>
            <div className="bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden h-full">
              <div className="px-6 pt-5 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Jadwal Terdekat</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Kegiatan yang akan segera berlangsung</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {!deadlines.length && (
                  <div className="py-12 text-center text-slate-300">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-400">Tidak ada jadwal terdekat</p>
                  </div>
                )}
                {deadlines.map((k: any, i: number) => {
                  const d = new Date(k.tanggal);
                  const today = new Date();
                  const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                  let dayLabel = `${diffDays}h`;
                  let urgencyText = "text-slate-500";
                  let urgencyBg = "bg-slate-100 text-slate-600 border border-slate-200";

                  if (diffDays < 0) {
                    dayLabel = "Lewat"; urgencyBg = "bg-slate-100 text-slate-400 border border-slate-200"; urgencyText = "text-slate-400";
                  } else if (diffDays === 0) {
                    dayLabel = "Hari ini"; urgencyBg = "bg-slate-900 text-[#C9A84C] border border-slate-900"; urgencyText = "text-slate-900";
                  } else if (diffDays === 1) {
                    dayLabel = "Besok"; urgencyBg = "bg-red-50 text-red-600 border border-red-200"; urgencyText = "text-red-600";
                  } else if (diffDays <= 7) {
                    dayLabel = `${diffDays} hari`; urgencyBg = "bg-amber-50 text-amber-600 border border-amber-200"; urgencyText = "text-amber-600";
                  } else {
                    dayLabel = `${diffDays} hari`; urgencyBg = "bg-slate-50 text-slate-600 border border-slate-200"; urgencyText = "text-slate-500";
                  }

                  return (
                    <motion.div
                      key={k.id}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.07 }}
                    >
                      <Link href={`/kegiatan/${k.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group">
                        {/* Date block */}
                        <div className="flex-shrink-0 text-center w-10 border-r border-slate-100 pr-4">
                          <div className="text-2xl font-extrabold text-slate-900 leading-none font-display">
                            {d.getDate()}
                          </div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                            {d.toLocaleDateString("id-ID", { month: "short" })}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 text-sm line-clamp-1 group-hover:text-[#C9A84C] transition-colors">
                            {k.nama_kegiatan}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span>{k.jam_mulai?.slice(0, 5)} WIB</span>
                          </div>
                        </div>

                        {/* Urgency badge */}
                        <span className={cn("flex-shrink-0 text-[9px] font-bold px-2 py-1 rounded-none uppercase tracking-wider", urgencyBg)}>
                          {dayLabel}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      </div>
    </div>
  );
}
