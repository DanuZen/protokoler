"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { kegiatanApi } from "@/lib/api";
import { useAuth, useRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, MapPin, Clock, CalendarDays, Search,
  GraduationCap, Handshake, Megaphone, Landmark, ClipboardList
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";


type Bentuk = "wisuda"|"kunjungan"|"seminar"|"pelantikan"|"rapat_resmi"|"lainnya";
type Status = "draft"|"terkonfirmasi"|"selesai"|"batal"|"terjadwal"|"berlangsung";
type Keg = { id: string; nama_kegiatan: string; bentuk: Bentuk; tanggal: string; jam_mulai: string; jam_selesai: string; lokasi: string; deskripsi?: string | null; status: Status | string };

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  terkonfirmasi: { label: 'Terkonfirmasi', color: 'text-emerald-600', dot: 'bg-emerald-500' },
  terjadwal:     { label: 'Terjadwal',     color: 'text-blue-600',    dot: 'bg-blue-500' },
  berlangsung:   { label: 'Berlangsung',   color: 'text-amber-600',   dot: 'bg-amber-500' },
  selesai:       { label: 'Selesai',       color: 'text-slate-500',   dot: 'bg-slate-400' },
  batal:         { label: 'Batal',         color: 'text-red-600',     dot: 'bg-red-500' },
};

const BentukIcon = ({ bentuk, className }: { bentuk: string, className?: string }) => {
  switch (bentuk) {
    case "wisuda": return <GraduationCap className={className} />;
    case "kunjungan": return <Handshake className={className} />;
    case "seminar": return <Megaphone className={className} />;
    case "pelantikan": return <Landmark className={className} />;
    case "rapat_resmi": return <ClipboardList className={className} />;
    default: return <CalendarDays className={className} />;
  }
};

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const cardAnim = { hidden: { opacity: 0, y: 20, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } } };

export default function Page() {
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const isAdmin = role === "admin";
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["kegiatan"],
    queryFn: () => kegiatanApi.list() as Promise<Keg[]>,
  });

  const filtered = (data ?? []).filter((k) => {
    const q = search.toLowerCase();
    return !q || k.nama_kegiatan.toLowerCase().includes(q) || k.lokasi.toLowerCase().includes(q) || k.bentuk.includes(q);
  });

  return (
    <div className="flex flex-col min-h-full pb-10 px-6 md:px-8 pt-4">
      
      {/* ─── HEADER SECTION ──────────────────────────────────────── */}
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
            <h2 className="text-3xl md:text-[2.5rem] font-black tracking-tight leading-none mb-1.5 text-slate-900 drop-shadow-sm">Manajemen Kegiatan</h2>
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

      {/* ─── Floating Toolbar ─── */}
      <section className="relative z-20 pb-0">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row items-center justify-between gap-4 border border-white/80 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-5">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input className="pl-12 bg-white border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl h-11 text-base focus-visible:ring-slate-200 shadow-sm" placeholder="Cari kegiatan, lokasi..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="text-sm font-semibold text-slate-500 shrink-0 bg-slate-50 px-4 py-2 border border-slate-200 rounded-xl">
            Menampilkan <span className="text-slate-900">{filtered.length}</span> hasil
          </div>
        </motion.div>
      </section>

      {/* ─── BODY CONTENT ─── */}
      <div className="flex-1 mt-8">
        <section className="pb-12 space-y-6">

      {isLoading && (
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 w-full rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && !filtered.length && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <CalendarDays className="h-14 w-14 mx-auto mb-4 text-slate-300" />
          <h3 className="font-bold text-slate-800 text-xl mb-2">Belum ada kegiatan</h3>
          <p className="text-slate-500 text-sm">Buat kegiatan baru dengan menekan tombol "Buat Kegiatan" di atas.</p>
        </motion.div>
      )}

      <motion.div initial="hidden" animate="visible" variants={stagger} className="bg-white border border-slate-200 rounded-[24px] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 bg-slate-50 text-slate-600 rounded-xl border border-slate-200">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-wider">Semua Kegiatan</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Daftar lengkap agenda protokoler.</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {filtered.map((k) => (
            <motion.div key={k.id} variants={cardAnim} className="group hover:bg-slate-50 transition-colors">
              <Link href={`/kegiatan/${k.id}`} className="block">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-6 py-5">
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <BentukIcon bentuk={k.bentuk} className="h-3.5 w-3.5 text-slate-400 group-hover:text-orange-500 transition-colors" />
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 group-hover:text-orange-500 transition-colors">
                        {k.bentuk.replace("_", " ")}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 text-lg group-hover:text-orange-500 transition-colors truncate">{k.nama_kegiatan}</h3>
                  </div>
                  
                  <div className="flex flex-col gap-1 min-w-[200px]">
                    <div className="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
                      <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{new Date(k.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span className="text-slate-400 text-xs">· {k.jam_mulai.slice(0,5)} WIB</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                      <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" />
                      <span className="truncate">{k.lokasi}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-end md:w-[140px]">
                    {statusConfig[k.status] ? (
                      <span className={cn('shrink-0 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest', statusConfig[k.status].color)}>
                        <span className={cn('h-1.5 w-1.5 shrink-0', statusConfig[k.status].dot)} />
                        {statusConfig[k.status].label}
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                        {k.status}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
        </section>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <span className={cn("rounded-xl px-2 py-0.5 text-xs font-bold uppercase tracking-wider border", statusConfig[status]?.color || "bg-slate-100 text-slate-500 border-slate-200")}>{status}</span>;
}

