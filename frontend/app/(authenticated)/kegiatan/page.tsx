"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { kegiatanApi } from "@/lib/api";
import { useAuth, useRole } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CalendarDays, Clock, MapPin, Search, ArrowRight, Plus,
  GraduationCap, Handshake, Megaphone, Landmark, ClipboardList,
  ChevronLeft, ChevronRight, ListTodo, CheckCircle2, Loader2,
  AlertCircle, XCircle, Radio, Circle
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const DAYS_SHORT = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

function BentukIcon({ bentuk, className }: { bentuk: string; className?: string }) {
  const map: Record<string, any> = {
    wisuda: GraduationCap, kunjungan: Handshake, seminar: Megaphone,
    rapat_resmi: Landmark, pelantikan: Landmark, lainnya: ClipboardList,
  };
  const Icon = map[bentuk] || ClipboardList;
  return <Icon className={className} />;
}

const statusConfig: Record<string, { label: string; color: string; dot: string; Icon: any }> = {
  draft:        { label: "Draft",         color: "bg-slate-100 text-slate-600 border-slate-200",    dot: "bg-slate-400",   Icon: Circle },
  terkonfirmasi:{ label: "Terkonfirmasi", color: "bg-blue-50 text-blue-700 border-blue-200",        dot: "bg-blue-500",    Icon: CheckCircle2 },
  terjadwal:    { label: "Terjadwal",     color: "bg-indigo-50 text-indigo-700 border-indigo-200",  dot: "bg-indigo-500",  Icon: CalendarDays },
  berlangsung:  { label: "Berlangsung",   color: "bg-amber-50 text-amber-700 border-amber-200",     dot: "bg-amber-500",   Icon: Radio },
  selesai:      { label: "Selesai",       color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", Icon: CheckCircle2 },
  batal:        { label: "Batal",         color: "bg-red-50 text-red-600 border-red-200",           dot: "bg-red-500",     Icon: XCircle },
};

export default function KegiatanPage() {
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const isAdmin = role === "admin";

  const getLocalISODate = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: kegiatan, isLoading } = useQuery({
    queryKey: ["kegiatan"],
    queryFn: () => kegiatanApi.list(),
  });

  const kegiatanByDate = ((kegiatan || []) as any[]).reduce((acc: Record<string, any[]>, k) => {
    const d = getLocalISODate(new Date(k.tanggal));
    if (!acc[d]) acc[d] = [];
    acc[d].push(k);
    return acc;
  }, {});

  const filtered = ((kegiatan || []) as any[]).filter((k) => {
    const matchSearch = k.nama_kegiatan.toLowerCase().includes(search.toLowerCase()) || k.lokasi.toLowerCase().includes(search.toLowerCase());
    if (selectedDate) return matchSearch && getLocalISODate(new Date(k.tanggal)) === selectedDate;
    return matchSearch;
  });

  const sortedFiltered = [...filtered].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const calendarDays: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const formatDateLabel = (d: string) => new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const upcoming = ((kegiatan || []) as any[]).filter((k) => k.status === "terjadwal" || k.status === "berlangsung").length;
  const todayStr = getLocalISODate(today);

  return (
    <div className="flex flex-col min-h-full pb-10 px-6 md:px-8 pt-4">
      {/* ─── HEADER SECTION ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 pb-6 border-b border-slate-200/60">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20 text-white">
            <CalendarDays className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
                Agenda Protokoler
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 text-slate-900 drop-shadow-sm">Manajemen Kegiatan</h2>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Daftar kegiatan protokoler universitas.</p>
          </div>
        </div>
        {isAdmin && (
          <Link href="/kegiatan/buat">
            <Button className="h-11 rounded-xl px-6 shadow-sm bg-[#1a1a1a] hover:bg-black text-white font-bold transition-colors">
              <Plus className="mr-2 h-4 w-4" /> Buat Kegiatan
            </Button>
          </Link>
        )}
      </motion.div>

      {/* ─── Floating Stats Row ─── */}
      <section className="relative z-20 pb-0">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Akan Datang", value: upcoming, icon: Clock, hint: "Segera dilaksanakan", color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Berlangsung", value: ((kegiatan || []) as any[]).filter((k) => k.status === "berlangsung").length, icon: Radio, hint: "Kegiatan berjalan saat ini", color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Selesai", value: ((kegiatan || []) as any[]).filter((k) => k.status === "selesai").length, icon: CheckCircle2, hint: "Tugas yang telah selesai", color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Total Kegiatan", value: (kegiatan || []).length, icon: ListTodo, hint: "Semua agenda terdaftar", color: "text-orange-600", bg: "bg-orange-50" },
          ].map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }}>
              <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl py-6 px-6 flex flex-col justify-between hover:shadow-xl hover:shadow-orange-50/80 transition-all group relative overflow-hidden h-full">
                <div className="flex items-center justify-between relative z-10">
                  <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                  <div className={cn("flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl transition-colors", stat.bg, stat.color)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 relative z-10">
                  <p className="text-[32px] font-bold leading-tight text-slate-900">{stat.value}</p>
                  <span className="text-[11px] font-medium text-slate-400 mt-1 block">{stat.hint}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── BODY CONTENT ─── */}
      <div className="flex-1 mt-8">
        <section className="pb-12 space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

            {/* ── Calendar Panel ── */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="xl:col-span-1 bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl overflow-hidden h-[500px] flex flex-col">
              {/* Month nav header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
                <button onClick={prevMonth} className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 hover:border-orange-500 hover:text-orange-500 text-slate-400 bg-white transition-colors shadow-sm">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="font-bold text-slate-800 text-sm uppercase tracking-widest">
                  {MONTHS[viewMonth]} {viewYear}
                </div>
                <button onClick={nextMonth} className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 hover:border-orange-500 hover:text-orange-500 text-slate-400 bg-white transition-colors shadow-sm">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Day labels */}
              <div className="grid grid-cols-7 border-b border-white/20 bg-slate-50">
                {DAYS_SHORT.map((d) => (
                  <div key={d} className="text-center py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d}</div>
                ))}
              </div>

              {/* Date cells */}
              <div className="grid grid-cols-7 p-3 gap-1">
                {calendarDays.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} />;
                  const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const hasEvent = !!kegiatanByDate[dateStr];
                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === selectedDate;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                      className={cn(
                        "relative h-9 w-full flex flex-col items-center justify-center text-sm font-semibold transition-all rounded-md",
                        isSelected && "bg-orange-700 text-white shadow-sm",
                        !isSelected && isToday && "ring-2 ring-orange-700 text-orange-700",
                        !isSelected && !isToday && "hover:bg-slate-50 text-slate-700",
                      )}
                    >
                      {day}
                      {hasEvent && (
                        <span className={cn(
                          "absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full",
                          isSelected ? "bg-white" : "bg-orange-700"
                        )} />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex-1"></div>

              {/* Legend + selected filter clear */}
              <div className="px-4 py-3 border-t border-slate-100 bg-white flex items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-700 inline-block" />
                    Ada kegiatan
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-4 w-4 ring-2 ring-orange-700 inline-flex items-center justify-center text-[9px] text-orange-700 font-bold rounded-full">{today.getDate()}</span>
                    Hari ini
                  </span>
                </div>
                {selectedDate && (
                  <button onClick={() => setSelectedDate(null)} className="text-orange-700 font-bold hover:text-orange-800 transition-colors text-xs flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" /> Reset
                  </button>
                )}
              </div>
            </motion.div>

            {/* ── Agenda List ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="xl:col-span-3 bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl flex flex-col h-[500px] overflow-hidden">
              
              {/* Top Header & Search */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 bg-slate-50 text-slate-600 rounded-xl border border-slate-200">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Daftar Agenda</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">Filter dan cari kegiatan mendatang.</p>
                  </div>
                </div>
                
                <div className="flex flex-1 md:max-w-md items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      className="pl-9 bg-slate-50 border-slate-200 rounded-xl h-10 text-sm text-slate-900 placeholder-slate-400 focus-visible:ring-1 focus-visible:ring-slate-200 shadow-sm"
                      placeholder="Cari kegiatan, lokasi..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className={cn(
                    "shrink-0 flex items-center gap-1.5 px-3 h-10 text-[11px] font-semibold border rounded-xl",
                    selectedDate ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-slate-50 border-slate-200 text-slate-500"
                  )}>
                    {selectedDate ? (
                      <span>{formatDateLabel(selectedDate)}</span>
                    ) : (
                      <span><span className="text-slate-800 font-bold">{sortedFiltered.length}</span> kegiatan</span>
                    )}
                  </div>
                </div>
              </div>

              {/* List */}
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                  <span className="text-sm font-medium">Memuat jadwal...</span>
                </div>
              ) : sortedFiltered.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <AlertCircle className="h-10 w-10 mx-auto mb-4 text-slate-300" />
                  <h3 className="font-bold text-slate-800 text-base">Tidak ada kegiatan</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    {selectedDate ? "Tidak ada kegiatan pada tanggal ini." : "Tidak ada kegiatan yang cocok dengan pencarian."}
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0 bg-white/40">
                  {/* Table header */}
                  <div className="hidden md:grid grid-cols-[56px_1fr_200px_160px_48px] gap-4 px-6 py-3 border-b border-slate-100 bg-white">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center">Tgl</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Kegiatan</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Waktu & Lokasi</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</div>
                    <div />
                  </div>

                  <div className="divide-y divide-slate-100 flex-1 overflow-y-auto min-h-0">
                    {sortedFiltered.map((k: any) => {
                      const cfg = statusConfig[k.status] || statusConfig.draft;
                      const StatusIcon = cfg.Icon;
                      return (
                        <motion.div key={k.id} variants={fadeUp} className="group hover:bg-slate-50/50 transition-colors">
                          <Link href={`/kegiatan/${k.id}`} className="block">
                            <div className="grid grid-cols-1 md:grid-cols-[56px_1fr_200px_160px_48px] gap-4 items-center px-6 py-5">

                              {/* Date block */}
                              <div className="hidden md:flex flex-col items-center justify-center bg-slate-50 text-slate-500 w-14 h-14 rounded-xl shrink-0 border border-slate-200 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-colors shadow-sm">
                                <span className="text-xl font-bold leading-none">
                                  {new Date(k.tanggal).getDate()}
                                </span>
                                <span className="text-[9px] uppercase tracking-widest opacity-80 mt-0.5 font-semibold">
                                  {MONTHS[new Date(k.tanggal).getMonth()].slice(0, 3)}
                                </span>
                              </div>

                              {/* Title & type */}
                              <div className="flex flex-col gap-1.5 min-w-0">
                                <div className="flex items-center gap-2">
                                  <div className="h-5 w-5 flex items-center justify-center text-slate-400 group-hover:text-orange-500 transition-colors shrink-0">
                                    <BentukIcon bentuk={k.bentuk_kegiatan || k.bentuk} className="h-3.5 w-3.5" />
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{(k.bentuk_kegiatan || k.bentuk || '').replace(/_/g, " ")}</span>
                                </div>
                                <h3 className="font-bold text-slate-800 text-base group-hover:text-orange-600 transition-colors line-clamp-1">{k.nama_kegiatan}</h3>
                              </div>

                              {/* Time & location */}
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-1.5 text-slate-700 text-sm font-semibold">
                                  <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                  <span>{k.jam_mulai?.slice(0, 5)} – {k.jam_selesai?.slice(0, 5)} WIB</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                  <span className="truncate">{k.lokasi}</span>
                                </div>
                              </div>

                              {/* Status */}
                              <div className="flex justify-start">
                                <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold tracking-wider uppercase bg-white shadow-sm", cfg.color.replace("bg-", "text-").replace("50", "600"), cfg.color.replace("bg-", "border-").replace("50", "200"))}>
                                  <StatusIcon className="h-3.5 w-3.5" />
                                  {cfg.label}
                                </div>
                              </div>

                              {/* Arrow */}
                              <div className="hidden md:flex justify-end pr-2">
                                <div className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-300 group-hover:bg-orange-50 group-hover:border-orange-200 group-hover:text-orange-500 transition-all">
                                  <ArrowRight className="h-4 w-4" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
