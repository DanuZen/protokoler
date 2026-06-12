'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';
import {
  Users, CalendarDays, ClipboardList, TrendingUp, Clock, MapPin,
  ChevronRight, GraduationCap, Handshake, Megaphone, Landmark,
  ArrowUpRight, CheckCircle2, Timer, Camera, FileText, LayoutGrid,
  Activity,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: 'easeOut' as const },
});

/* ── Status config ─────────────────────────────────────── */
const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  terkonfirmasi: { label: 'Terkonfirmasi', color: 'text-emerald-600', dot: 'bg-emerald-500' },
  terjadwal:     { label: 'Terjadwal',     color: 'text-blue-600',    dot: 'bg-blue-500' },
  berlangsung:   { label: 'Berlangsung',   color: 'text-amber-600',   dot: 'bg-amber-500' },
  selesai:       { label: 'Selesai',       color: 'text-slate-500',   dot: 'bg-slate-400' },
  draft:         { label: 'Draft',         color: 'text-slate-400',   dot: 'bg-slate-300' },
  batal:         { label: 'Batal',         color: 'text-red-600',     dot: 'bg-red-500' },
};

/* ── Bentuk Icon ───────────────────────────────────────── */
const BentukIcon = ({ bentuk, className }: { bentuk: string; className?: string }) => {
  switch (bentuk) {
    case 'wisuda':      return <GraduationCap className={className} />;
    case 'kunjungan':   return <Handshake className={className} />;
    case 'seminar':     return <Megaphone className={className} />;
    case 'pelantikan':  return <Landmark className={className} />;
    case 'rapat_resmi': return <ClipboardList className={className} />;
    default:            return <CalendarDays className={className} />;
  }
};

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.stats(),
  });

  const { data: upcoming } = useQuery({
    queryKey: ['dashboard-upcoming'],
    queryFn: () => dashboardApi.upcoming(8),
  });

  const kpiCards = [
    { label: 'Total Anggota',  value: stats?.total_mahasiswa    ?? '—', trend: '+8%',  icon: Users },
    { label: 'Total Kegiatan', value: stats?.total_kegiatan     ?? '—', trend: '+12%', icon: CalendarDays },
    { label: 'Mendatang',      value: stats?.kegiatan_mendatang ?? '—', trend: '+3',   icon: Timer },
    { label: 'Penugasan',      value: stats?.total_penugasan   ?? '—', trend: '+15%', icon: ClipboardList },
  ];

  const deadlines      = (upcoming ?? []).slice(0, 5);
  const recentActivity = (upcoming ?? []).slice(0, 6);

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="min-h-screen">

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative px-6 md:px-10 pt-10 pb-16 overflow-hidden">
        {/* decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* gold glow */}
        <div className="absolute -right-24 -top-8 h-80 w-80 rounded-full bg-[#C9A84C]/8 blur-3xl pointer-events-none" />
        {/* gold underline */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />

        <motion.div {...fadeUp(0)} className="relative z-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[#C9A84C] text-[10px] font-bold uppercase tracking-[0.3em] mb-2">
              Sistem Informasi Protokoler
            </p>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight">
              Dashboard
            </h1>
            <p className="mt-2 text-slate-400 text-sm">{today}</p>
          </div>

          <Link href="/kegiatan">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 bg-[#C9A84C] hover:bg-[#b8963f] text-slate-900 font-bold px-5 py-2.5 text-sm shadow-lg transition-all"
            >
              <CalendarDays className="h-4 w-4" />
              Kelola Kegiatan
              <ArrowUpRight className="h-4 w-4 ml-0.5" />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ─── KPI METRICS — floats between hero and white section ─── */}
      <section className="px-6 md:px-10 -mt-12 relative z-20 pb-0">
        <motion.div {...fadeUp(0.1)} className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {kpiCards.map((card, i) => {
            return (
              <motion.div
                key={card.label}
                {...fadeUp(0.12 + i * 0.07)}
                className="bg-slate-900 border border-slate-800 shadow-xl py-3 px-4 flex flex-col justify-between hover:border-[#C9A84C]/60 hover:shadow-2xl transition-all group relative overflow-hidden"
              >
                {/* Decorative background icon */}
                <card.icon className="absolute -right-4 -bottom-4 h-24 w-24 text-white opacity-5 transform group-hover:scale-110 transition-transform duration-500" />

                <div className="flex items-center justify-between relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{card.label}</p>
                  <div className="flex-shrink-0 h-7 w-7 flex items-center justify-center bg-[#C9A84C]/20 text-[#C9A84C] group-hover:bg-[#C9A84C] group-hover:text-white transition-colors border border-[#C9A84C]/30">
                    <card.icon className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="mt-1.5 relative z-10">
                  <p className="text-3xl font-extrabold leading-tight font-display text-white">{card.value}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400">
                      <TrendingUp className="h-3 w-3" />
                      {card.trend}
                    </span>
                    <span className="text-[10px] text-slate-500">vs. bulan lalu</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ─── BODY CONTENT (white bg) ──────────────────────── */}
      <div className="bg-slate-50 min-h-screen -mt-6">

        {/* spacer so white bg starts overlapping the floating KPI section neatly */}
        <div className="h-12" />


        {/* ─── MAIN CONTENT GRID ────────────────────────────── */}
        <section className="px-6 md:px-10 pb-12">
          <div className="grid xl:grid-cols-2 gap-5">

            {/* LEFT — Aktivitas Terbaru */}
            <motion.div {...fadeUp(0.3)}>
              <div className="bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[420px]">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-900 bg-slate-900 text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 bg-[#C9A84C] text-white">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white uppercase tracking-wider">Aktivitas Terbaru</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Daftar kegiatan protokoler terkini</p>
                    </div>
                  </div>
                  <Link
                    href="/kegiatan"
                    className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-slate-900 hover:bg-[#C9A84C] border border-slate-700 hover:border-[#C9A84C] px-3 py-1.5 transition-colors"
                  >
                    Lihat Semua <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Items list — scrollable, fixed height */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {!recentActivity.length && (
                    <div className="py-12 text-center">
                      <CalendarDays className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                      <p className="text-sm font-medium text-slate-400">Belum ada aktivitas kegiatan</p>
                    </div>
                  )}
                  {recentActivity.map((k: any, i: number) => {
                    const cfg = statusConfig[k.status];
                    const d = new Date(k.tanggal);
                    return (
                      <motion.div
                        key={k.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.35 + i * 0.05 }}
                      >
                        <Link
                          href={`/kegiatan/${k.id}`}
                          className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors group"
                        >
                          {/* Date block — mirrors Jadwal Terdekat */}
                          <div className="shrink-0 text-center w-9 border-r border-slate-100 pr-4">
                            <div className="text-2xl font-extrabold text-slate-900 leading-none font-display">
                              {d.getDate()}
                            </div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                              {d.toLocaleDateString('id-ID', { month: 'short' })}
                            </div>
                          </div>

                          {/* Info + details */}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-900 text-sm line-clamp-1 group-hover:text-[#C9A84C] transition-colors">
                              {k.nama_kegiatan}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate max-w-[120px]">{k.lokasi || k.tempat || '—'}</span>
                              </span>
                              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                <Clock className="h-3 w-3 shrink-0" />
                                <span>{k.jam_mulai?.slice(0, 5)} WIB</span>
                              </span>
                              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                <CalendarDays className="h-3 w-3 shrink-0" />
                                <span>{new Date(k.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              </span>
                            </div>
                          </div>

                          {/* Status — plain colored text, no box */}
                          {cfg ? (
                            <span className={cn('shrink-0 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest', cfg.color)}>
                              <span className={cn('h-1.5 w-1.5 shrink-0', cfg.dot)} />
                              {cfg.label}
                            </span>
                          ) : (
                            <span className="shrink-0 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                              {k.status}
                            </span>
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* RIGHT — Jadwal Terdekat */}
            <motion.div {...fadeUp(0.38)}>
              <div className="bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[420px]">
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-900 bg-slate-900 text-white">
                  <div className="h-10 w-10 bg-[#C9A84C] flex items-center justify-center shrink-0">
                    <LayoutGrid className="h-5 w-5 text-slate-900" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Jadwal Terdekat</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">Kegiatan yang akan segera berlangsung</p>
                  </div>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {!deadlines.length && (
                    <div className="py-12 text-center">
                      <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                      <p className="text-sm font-medium text-slate-400">Tidak ada jadwal terdekat</p>
                    </div>
                  )}
                  {deadlines.map((k: any, i: number) => {
                    const d       = new Date(k.tanggal);
                    const today   = new Date();
                    const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                    let dayLabel   = `${diffDays}h`;
                    let urgencyBg  = 'text-slate-500';

                    if (diffDays < 0) {
                      dayLabel  = 'Lewat';
                      urgencyBg = 'text-slate-400';
                    } else if (diffDays === 0) {
                      dayLabel  = 'Hari ini';
                      urgencyBg = 'text-[#C9A84C] font-extrabold';
                    } else if (diffDays === 1) {
                      dayLabel  = 'Besok';
                      urgencyBg = 'text-red-600';
                    } else if (diffDays <= 7) {
                      dayLabel  = `${diffDays} hari`;
                      urgencyBg = 'text-amber-600';
                    } else {
                      dayLabel  = `${diffDays} hari`;
                      urgencyBg = 'text-slate-500';
                    }

                    return (
                      <motion.div
                        key={k.id}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.45 + i * 0.06 }}
                      >
                        <Link
                          href={`/kegiatan/${k.id}`}
                          className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors group"
                        >
                          {/* Date block */}
                          <div className="shrink-0 text-center w-9 border-r border-slate-100 pr-4">
                            <div className="text-2xl font-extrabold text-slate-900 leading-none font-display">
                              {d.getDate()}
                            </div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                              {d.toLocaleDateString('id-ID', { month: 'short' })}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-900 text-sm line-clamp-1 group-hover:text-[#C9A84C] transition-colors">
                              {k.nama_kegiatan}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                <Clock className="h-3 w-3" />
                                <span>{k.jam_mulai?.slice(0, 5)} WIB</span>
                              </span>
                              {(k.lokasi || k.tempat) && (
                                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  <span className="truncate max-w-[120px]">{k.lokasi || k.tempat}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Urgency badge */}
                          <span className={cn('shrink-0 text-[9px] font-bold px-2 py-1 uppercase tracking-wider', urgencyBg)}>
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
        </section>

      </div>
    </div>
  );
}
