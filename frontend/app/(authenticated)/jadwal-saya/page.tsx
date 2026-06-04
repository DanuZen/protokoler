"use client";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { penugasanApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Check, X, ClipboardList, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: { label: "Menunggu Konfirmasi", color: "bg-amber-100 text-amber-700 border-amber-200" },
  dikonfirmasi: { label: "Dikonfirmasi", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  ditolak: { label: "Ditolak", color: "bg-red-100 text-red-600 border-red-200" },
};

export default function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["jadwal-saya", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: mhs } = await supabase.from("mahasiswa").select("id").eq("user_id", user!.id).maybeSingle();
      if (!mhs) return [];
      return penugasanApi.byMahasiswa(mhs.id);
    },
  });

  const konfirmasi = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "dikonfirmasi"|"ditolak" }) => {
      await penugasanApi.update(id, { status_konfirmasi: status });
    },
    onSuccess: () => { toast.success("Status diperbarui"); qc.invalidateQueries({ queryKey: ["jadwal-saya"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const pending = (data ?? []).filter((p: any) => p.status_konfirmasi === "pending").length;
  const confirmed = (data ?? []).filter((p: any) => p.status_konfirmasi === "dikonfirmasi").length;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 tracking-tight">Jadwal Tugas Saya</h1>
        <p className="mt-2 text-slate-500 text-base">Daftar penugasan kegiatan yang ditugaskan kepada Anda.</p>
      </motion.div>

      {/* Summary chips */}
      {!isLoading && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-sm font-semibold text-slate-700">
            <ClipboardList className="h-4 w-4 text-primary" />
            Total: <span className="text-primary">{data?.length ?? 0}</span>
          </div>
          {pending > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-sm font-semibold text-amber-700">
              <Clock className="h-4 w-4" />
              Menunggu Konfirmasi: {pending}
            </div>
          )}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-700">
            <Check className="h-4 w-4" />
            Dikonfirmasi: {confirmed}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!isLoading && !data?.length && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border border-slate-100 bg-white p-16 text-center shadow-sm">
          <CalendarDays className="h-14 w-14 mx-auto mb-4 text-slate-200" />
          <h3 className="font-bold text-slate-700 text-xl mb-2">Belum ada penugasan</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">Pastikan akun Anda sudah terhubung ke data mahasiswa oleh admin, atau tunggu penugasan dari administrator.</p>
        </motion.div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      <div className="grid gap-5">
        <AnimatePresence>
          {data?.map((p: any, i: number) => p.kegiatan && (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                "rounded-2xl border bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md",
                p.status_konfirmasi === "pending" ? "border-amber-200" : "border-slate-100"
              )}
            >
              <div className="p-6 flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge className="uppercase text-xs tracking-wider font-bold bg-primary/10 text-primary border-primary/20">
                      {p.peran}
                    </Badge>
                    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", statusConfig[p.status_konfirmasi as keyof typeof statusConfig]?.color)}>
                      {statusConfig[p.status_konfirmasi as keyof typeof statusConfig]?.label ?? p.status_konfirmasi}
                    </span>
                  </div>
                  <Link href={`/kegiatan/${p.kegiatan.id}`}>
                    <h3 className="text-xl font-bold text-slate-900 hover:text-primary transition-colors mb-3 leading-tight">{p.kegiatan.nama_kegiatan}</h3>
                  </Link>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-slate-400 shrink-0" />
                      {new Date(p.kegiatan.tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                      {p.kegiatan.jam_mulai?.slice(0,5)} – {p.kegiatan.jam_selesai?.slice(0,5)} WIB
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      {p.kegiatan.lokasi}
                    </span>
                  </div>
                </div>
              </div>

              {p.status_konfirmasi === "pending" && (
                <div className="px-6 pb-6 pt-0 flex gap-3 border-t border-amber-100 bg-amber-50/40">
                  <Button
                    size="sm"
                    className="h-9 rounded-lg gap-2 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => konfirmasi.mutate({ id: p.id, status: "dikonfirmasi" })}
                    disabled={konfirmasi.isPending}
                  >
                    <Check className="h-4 w-4" /> Konfirmasi Kehadiran
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 rounded-lg gap-2 border-red-200 text-red-500 hover:bg-red-50"
                    onClick={() => konfirmasi.mutate({ id: p.id, status: "ditolak" })}
                    disabled={konfirmasi.isPending}
                  >
                    <X className="h-4 w-4" /> Tidak Bisa Hadir
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
