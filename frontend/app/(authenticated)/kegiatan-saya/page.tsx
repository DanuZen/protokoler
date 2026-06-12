"use client";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kegiatanApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Check, X, ClipboardList, Clock, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp  = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

const statusConfig: Record<string, { label: string; color: string }> = {
  pending:      { label: "Menunggu Konfirmasi", color: "bg-amber-100 text-amber-700 border-amber-200" },
  dikonfirmasi: { label: "Dikonfirmasi",        color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  ditolak:      { label: "Ditolak",             color: "bg-red-100 text-red-600 border-red-200" },
};

// Mock data – penugasan saya
const mockPenugasan = [
  {
    id: "p1",
    peran: "Protokoler Utama",
    status_konfirmasi: "dikonfirmasi",
    kegiatan: {
      id: "keg-1",
      nama_kegiatan: "Wisuda Periode 130 UNP",
      tanggal: new Date(Date.now() + 86400000 * 2).toISOString(),
      jam_mulai: "07:00:00", jam_selesai: "12:00:00",
      lokasi: "Auditorium UNP",
      bentuk: "wisuda",
    },
  },
  {
    id: "p2",
    peran: "Protokoler Pendamping",
    status_konfirmasi: "pending",
    kegiatan: {
      id: "keg-2",
      nama_kegiatan: "Kunjungan Menteri Pendidikan",
      tanggal: new Date(Date.now() + 86400000 * 5).toISOString(),
      jam_mulai: "09:00:00", jam_selesai: "11:30:00",
      lokasi: "Ruang Rektor",
      bentuk: "kunjungan",
    },
  },
];

export default function KegiatanSayaPage() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["jadwal-saya", user?.id],
    queryFn: async () => mockPenugasan,
  });

  const qc = useQueryClient();
  const konfirmasi = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "dikonfirmasi" | "ditolak" }) => {
      await new Promise((r) => setTimeout(r, 400));
    },
    onSuccess: () => {
      toast.success("Status diperbarui");
      qc.invalidateQueries({ queryKey: ["jadwal-saya"] });
    },
    onError: () => toast.error("Gagal memperbarui status"),
  });

  const pending    = (data ?? []).filter((p: any) => p.status_konfirmasi === "pending").length;
  const confirmed  = (data ?? []).filter((p: any) => p.status_konfirmasi === "dikonfirmasi").length;

  return (
    <div className="min-h-screen bg-transparent">
      {/* ─── Hero Banner ─── */}
      <section className="relative px-6 md:px-10 pt-10 pb-16 overflow-hidden">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <p className="text-[#C9A84C] text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Sistem Informasi Protokoler</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight">Kegiatan Saya</h1>
            <p className="mt-2 text-slate-400 text-sm">Daftar penugasan yang ditugaskan kepada Anda.</p>
          </div>
        </motion.div>
      </section>

      {/* ─── Floating Stats Row ─── */}
      <section className="px-6 md:px-10 -mt-12 relative z-20 pb-0">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Menunggu", value: pending, icon: AlertCircle, hint: "Perlu konfirmasi" },
            { label: "Dikonfirmasi", value: confirmed, icon: CheckCircle2, hint: "Siap bertugas" },
            { label: "Total Penugasan", value: data?.length ?? 0, icon: ClipboardList, hint: "Semua status" },
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

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-24 w-full bg-white border border-slate-200 animate-pulse" />)}
            </div>
          ) : !data?.length ? (
            <div className="bg-white border border-slate-200 p-16 text-center shadow-sm">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <h3 className="font-bold text-slate-900 text-lg">Belum ada penugasan</h3>
              <p className="text-slate-500 text-sm mt-1">Tunggu penugasan dari administrator.</p>
            </div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={stagger} className="bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden">
              <div className="divide-y divide-slate-100">
                <AnimatePresence>
                  {data?.map((p: any) => p.kegiatan && (
                    <motion.div key={p.id} variants={fadeUp} className="group hover:bg-slate-50/60 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-6 py-6">
                        
                        {/* Date block */}
                        <div className="hidden md:flex flex-col items-center justify-center bg-slate-900 text-white w-14 h-14 shrink-0">
                          <span className="text-xl font-display font-bold leading-none">
                            {new Date(p.kegiatan.tanggal).getDate()}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">
                            {new Date(p.kegiatan.tanggal).toLocaleDateString("id-ID", { month: "short" })}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-[#C9A84C] px-2.5 py-1 rounded-none">
                              {p.peran}
                            </span>
                            <span className={cn("inline-flex items-center rounded-none border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", statusConfig[p.status_konfirmasi]?.color)}>
                              {statusConfig[p.status_konfirmasi]?.label}
                            </span>
                          </div>
                          <Link href={`/kegiatan/${p.kegiatan.id}`}>
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#C9A84C] transition-colors truncate">
                              {p.kegiatan.nama_kegiatan}
                            </h3>
                          </Link>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              {p.kegiatan.jam_mulai?.slice(0, 5)} – {p.kegiatan.jam_selesai?.slice(0, 5)} WIB
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                              {p.kegiatan.lokasi}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        {p.status_konfirmasi === "pending" ? (
                          <div className="flex flex-col gap-2 md:w-[200px] shrink-0">
                            <Button
                              size="sm"
                              className="rounded-none bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-9"
                              onClick={() => konfirmasi.mutate({ id: p.id, status: "dikonfirmasi" })}
                              disabled={konfirmasi.isPending}
                            >
                              <Check className="h-4 w-4" /> Konfirmasi Hadir
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-none border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 gap-1.5 h-9"
                              onClick={() => konfirmasi.mutate({ id: p.id, status: "ditolak" })}
                              disabled={konfirmasi.isPending}
                            >
                              <X className="h-4 w-4" /> Tidak Bisa
                            </Button>
                          </div>
                        ) : (
                          <Link href={`/kegiatan/${p.kegiatan.id}`}>
                            <Button variant="ghost" size="sm" className="rounded-none text-slate-400 hover:text-slate-900 gap-1">
                              Detail <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}
