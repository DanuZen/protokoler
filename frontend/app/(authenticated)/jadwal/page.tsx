"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { kegiatanApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CalendarDays, Clock, MapPin, Search, ArrowRight,
  GraduationCap, Handshake, Megaphone, Landmark, ClipboardList, ChevronLeft, ChevronRight, ListTodo
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const DAYS_SHORT = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

function BentukIcon({ bentuk, className }: { bentuk: string; className?: string }) {
  const map: Record<string, any> = {
    wisuda: GraduationCap, kunjungan: Handshake, seminar: Megaphone,
    rapat_resmi: Landmark, pelantikan: Landmark, lainnya: ClipboardList,
  };
  const Icon = map[bentuk] || ClipboardList;
  return <Icon className={className} />;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-500 border-slate-200" },
  terkonfirmasi: { label: "Terkonfirmasi", color: "bg-blue-100 text-blue-700 border-blue-200" },
  terjadwal: { label: "Terjadwal", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  berlangsung: { label: "Berlangsung", color: "bg-amber-100 text-amber-700 border-amber-200" },
  selesai: { label: "Selesai", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  batal: { label: "Batal", color: "bg-red-100 text-red-600 border-red-200" },
};

export default function JadwalPage() {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: kegiatan, isLoading } = useQuery({
    queryKey: ["jadwal-kegiatan"],
    queryFn: () => kegiatanApi.list(),
  });

  // Build a set of dates that have kegiatan
  const kegiatanByDate = ((kegiatan || []) as any[]).reduce((acc: Record<string, any[]>, k) => {
    const d = k.tanggal.slice(0, 10);
    if (!acc[d]) acc[d] = [];
    acc[d].push(k);
    return acc;
  }, {});

  const filtered = ((kegiatan || []) as any[]).filter((k) => {
    const matchSearch = k.nama_kegiatan.toLowerCase().includes(search.toLowerCase()) || k.lokasi.toLowerCase().includes(search.toLowerCase());
    if (selectedDate) return matchSearch && k.tanggal.slice(0, 10) === selectedDate;
    return matchSearch;
  });

  // Sort by date ascending
  const sortedFiltered = [...filtered].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

  // Calendar helpers
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const calendarDays: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const formatDateLabel = (d: string) => new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-transparent">
      {/* ─── Hero Banner ─── */}
      <section className="relative px-6 md:px-10 pt-10 pb-16 overflow-hidden">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <p className="text-[#C9A84C] text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Sistem Informasi Protokoler</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight">Jadwal Penugasan</h1>
            <p className="mt-2 text-slate-400 text-sm">Pantau kalender dan agenda kegiatan protokoler yang akan datang.</p>
          </div>
        </motion.div>
      </section>

      {/* ─── Floating Stats Row ─── */}
      <section className="px-6 md:px-10 -mt-12 relative z-20 pb-0">
        <div className="grid gap-4 md:grid-cols-2 max-w-2xl">
          {[
            { 
              label: "Akan Datang", 
              value: ((kegiatan || []) as any[]).filter((k) => k.status === "terjadwal" || k.status === "berlangsung").length, 
              icon: Clock, 
              hint: "Segera dilaksanakan" 
            },
            { 
              label: "Total Kegiatan", 
              value: (kegiatan || []).length, 
              icon: ListTodo, 
              hint: "Semua agenda" 
            },
          ].map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }}>
              <div className="bg-slate-900 border border-slate-800 shadow-xl py-3 px-4 flex flex-col justify-between hover:border-[#C9A84C]/60 hover:shadow-2xl transition-all group relative overflow-hidden">
                <stat.icon className="absolute -right-4 -bottom-4 h-24 w-24 text-white opacity-5 transform group-hover:scale-110 transition-transform duration-500" />
                <div className="flex items-center justify-between relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                  <div className="flex-shrink-0 h-7 w-7 flex items-center justify-center bg-[#C9A84C]/20 text-[#C9A84C] group-hover:bg-[#C9A84C] group-hover:text-white transition-colors border border-[#C9A84C]/30">
                    <stat.icon className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div className="mt-1.5 relative z-10">
                  <p className="text-3xl font-extrabold leading-tight font-display text-white">{stat.value}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] text-slate-500">{stat.hint}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── BODY CONTENT ─── */}
      <div className="bg-slate-50 min-h-screen -mt-6">
        <div className="h-12" />
        <section className="px-6 md:px-10 pb-12 space-y-6">

          {/* Two-column layout: Calendar + List */}
          <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6">

            {/* ── Calendar ── */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-slate-200 shadow-sm rounded-none h-fit">
              {/* Month nav */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <button onClick={prevMonth} className="h-8 w-8 flex items-center justify-center border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors rounded-none">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="font-bold text-slate-900 text-base uppercase tracking-wider">
                  {MONTHS[viewMonth]} {viewYear}
                </div>
                <button onClick={nextMonth} className="h-8 w-8 flex items-center justify-center border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors rounded-none">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Day labels */}
              <div className="grid grid-cols-7 border-b border-slate-100">
                {DAYS_SHORT.map((d) => (
                  <div key={d} className="text-center py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d}</div>
                ))}
              </div>

              {/* Date cells */}
              <div className="grid grid-cols-7 p-2 gap-1">
                {calendarDays.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} />;
                  const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const hasEvent = !!kegiatanByDate[dateStr];
                  const isToday = dateStr === today.toISOString().slice(0, 10);
                  const isSelected = dateStr === selectedDate;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                      className={cn(
                        "relative h-9 w-full flex items-center justify-center text-sm font-medium transition-all rounded-none",
                        isSelected && "bg-slate-900 text-white",
                        !isSelected && isToday && "border-2 border-[#C9A84C] text-[#C9A84C]",
                        !isSelected && !isToday && "hover:bg-slate-100 text-slate-700",
                      )}
                    >
                      {day}
                      {hasEvent && !isSelected && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-[#C9A84C]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="p-4 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C] inline-block" /> Ada kegiatan</span>
                <span className="flex items-center gap-1.5"><span className="h-4 w-4 border-2 border-[#C9A84C] inline-flex items-center justify-center text-[9px] text-[#C9A84C] font-bold">{today.getDate()}</span> Hari ini</span>
              </div>
            </motion.div>

            {/* ── Agenda List ── */}
            <div className="space-y-4">
              {/* Search + filter info */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-4 rounded-none">
                <div className="relative max-w-md w-full">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input className="pl-12 bg-slate-50 border-slate-200 rounded-none h-11 text-base focus-visible:ring-slate-900" placeholder="Cari kegiatan..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="text-sm font-semibold text-slate-500 shrink-0 bg-slate-50 px-4 py-2 border border-slate-200">
                  {selectedDate ? (
                    <span className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-[#C9A84C]" />
                      {formatDateLabel(selectedDate)}
                      <button onClick={() => setSelectedDate(null)} className="text-slate-400 hover:text-slate-900 ml-1 font-bold">✕</button>
                    </span>
                  ) : (
                    <span><span className="text-slate-900">{sortedFiltered.length}</span> kegiatan</span>
                  )}
                </div>
              </motion.div>

              {/* List */}
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-24 w-full bg-white border border-slate-200 animate-pulse" />)}
                </div>
              ) : sortedFiltered.length === 0 ? (
                <div className="bg-white border border-slate-200 p-16 text-center shadow-sm">
                  <CalendarDays className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <h3 className="font-bold text-slate-900 text-lg">Tidak ada kegiatan</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    {selectedDate ? "Tidak ada kegiatan pada tanggal ini." : "Tidak ada kegiatan yang cocok dengan pencarian."}
                  </p>
                </div>
              ) : (
                <motion.div initial="hidden" animate="visible" variants={stagger} className="bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {sortedFiltered.map((k: any) => (
                      <motion.div key={k.id} variants={fadeUp} className="group hover:bg-slate-50/60 transition-colors">
                        <Link href={`/kegiatan/${k.id}`} className="block">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-6 py-5">
                            {/* Date block */}
                            <div className="hidden md:flex flex-col items-center justify-center bg-slate-900 text-white rounded-none w-14 h-14 shrink-0">
                              <span className="text-xl font-display font-bold leading-none">
                                {new Date(k.tanggal).getDate()}
                              </span>
                              <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">
                                {MONTHS[new Date(k.tanggal).getMonth()].slice(0, 3)}
                              </span>
                            </div>

                            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2.5 mb-1">
                                <div className="h-7 w-7 bg-slate-100 border border-slate-200 rounded-none flex items-center justify-center flex-shrink-0 group-hover:bg-slate-900 transition-colors">
                                  <BentukIcon bentuk={k.bentuk} className="h-3.5 w-3.5 text-slate-500 group-hover:text-[#C9A84C] transition-colors" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{k.bentuk.replace("_", " ")}</span>
                              </div>
                              <h3 className="font-semibold text-slate-900 text-lg group-hover:text-[#C9A84C] transition-colors truncate">{k.nama_kegiatan}</h3>
                            </div>

                            <div className="flex flex-col gap-1 min-w-[180px]">
                              <div className="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
                                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span>{k.jam_mulai.slice(0, 5)} – {k.jam_selesai.slice(0, 5)} WIB</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" />
                                <span className="truncate">{k.lokasi}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 justify-end md:w-[160px]">
                              <span className={cn("inline-flex items-center rounded-none px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border", statusConfig[k.status]?.color || "bg-slate-100 text-slate-500 border-slate-200")}>
                                {statusConfig[k.status]?.label || k.status}
                              </span>
                              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#C9A84C] transition-colors shrink-0" />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}
