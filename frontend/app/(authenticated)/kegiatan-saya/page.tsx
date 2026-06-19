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
      nama_kegiatan: "Wisuda UNP",
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
    <div className="flex flex-col min-h-full pb-10 px-6 md:px-8 pt-4">
      {/* ─── HEADER SECTION (Adapted Layout) ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-8 pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
              Penugasan Mahasiswa
            </span>
          </div>
          <h2 className="font-display text-[28px] md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 md:mb-2 text-slate-900 drop-shadow-sm">Kegiatan Saya</h2>
          <p className="text-[13px] md:text-base text-slate-600 font-medium max-w-xl">
            Daftar penugasan yang ditugaskan kepada Anda.
          </p>
        </div>
      </motion.div>

      {/* ─── Floating Stats Row ─── */}
      <section className="relative z-20 pb-0 shrink-0">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {[
            { label: "Menunggu", value: pending, icon: AlertCircle, hint: "Perlu konfirmasi", color: "text-amber-600", bg: "bg-amber-100" },
            { label: "Dikonfirmasi", value: confirmed, icon: CheckCircle2, hint: "Siap bertugas", color: "text-emerald-600", bg: "bg-emerald-100" },
            { label: "Total Penugasan", value: data?.length ?? 0, icon: ClipboardList, hint: "Semua status", color: "text-orange-600", bg: "bg-orange-50", className: "hidden md:block" },
          ].map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }} className={stat.className || ""}>
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

      {/* ─── BODY CONTENT ─── */}
      <div className="flex-1 mt-8">
        <section className="pb-12 space-y-6">

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-24 w-full bg-white/60 border border-white/80 animate-pulse rounded-2xl" />)}
            </div>
          ) : !data?.length ? (
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-16 text-center">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <h3 className="font-bold text-slate-900 text-lg">Belum ada penugasan</h3>
              <p className="text-slate-500 text-sm mt-1">Tunggu penugasan dari administrator.</p>
            </div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={stagger} className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl overflow-hidden">
              <div className="divide-y divide-slate-100">
                <AnimatePresence>
                  {data?.map((p: any) => p.kegiatan && (
                    <motion.div key={p.id} variants={fadeUp} className="group hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-6 py-6">
                        
                        {/* Date block */}
                        <div className="hidden md:flex flex-col items-center justify-center bg-slate-50 border border-slate-200 text-slate-600 rounded-xl w-14 h-14 shrink-0">
                          <span className="text-xl font-bold leading-none text-slate-900">
                            {new Date(p.kegiatan.tanggal).getDate()}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider text-slate-500 mt-0.5 font-bold">
                            {new Date(p.kegiatan.tanggal).toLocaleDateString("id-ID", { month: "short" })}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-200 px-2.5 py-1 rounded-md">
                              {p.peran}
                            </span>
                            <span className={cn("inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", statusConfig[p.status_konfirmasi]?.color)}>
                              {statusConfig[p.status_konfirmasi]?.label}
                            </span>
                          </div>
                          <Link href={`/kegiatan/${p.kegiatan.id}`}>
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-500 transition-colors truncate">
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
                              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-9"
                              onClick={() => konfirmasi.mutate({ id: p.id, status: "dikonfirmasi" })}
                              disabled={konfirmasi.isPending}
                            >
                              <Check className="h-4 w-4" /> Konfirmasi Hadir
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 gap-1.5 h-9"
                              onClick={() => konfirmasi.mutate({ id: p.id, status: "ditolak" })}
                              disabled={konfirmasi.isPending}
                            >
                              <X className="h-4 w-4" /> Tidak Bisa
                            </Button>
                          </div>
                        ) : (
                          <Link href={`/kegiatan/${p.kegiatan.id}`}>
                            <Button variant="ghost" size="sm" className="rounded-xl text-slate-400 hover:text-slate-800 gap-1">
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
