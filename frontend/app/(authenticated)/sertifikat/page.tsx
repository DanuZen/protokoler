"use client";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Award, Download, BadgeCheck, Calendar, MapPin, ChevronDown, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const fadeUp  = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

// Mock sertifikat data
const mockSertifikat = [
  {
    id: "s1",
    nomor: "SERT/PROT/2024/001",
    judul: "Sertifikat Keaktifan Protokoler",
    kegiatan: "Wisuda Periode 129 UNP",
    tanggal: "2024-10-15",
    lokasi: "Auditorium UNP",
    peran: "Protokoler Utama",
    status: "diterbitkan",
  },
  {
    id: "s2",
    nomor: "SERT/PROT/2024/002",
    judul: "Sertifikat Penugasan Khusus",
    kegiatan: "Kunjungan Dubes Amerika Serikat",
    tanggal: "2024-11-03",
    lokasi: "Ruang Rektor, UNP",
    peran: "Protokoler Pendamping",
    status: "diterbitkan",
  },
  {
    id: "s3",
    nomor: "SERT/PROT/2025/003",
    judul: "Sertifikat Keaktifan Protokoler",
    kegiatan: "Seminar Internasional Pendidikan 2025",
    tanggal: "2025-02-20",
    lokasi: "Aula FMIPA, UNP",
    peran: "Protokoler Utama",
    status: "dalam_proses",
  },
];

export default function SertifikatPage() {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState<string | null>(null);

  const issued   = mockSertifikat.filter((s) => s.status === "diterbitkan").length;
  const inProcess = mockSertifikat.filter((s) => s.status === "dalam_proses").length;

  return (
    <div className="flex flex-col min-h-full pb-10 px-6 md:px-8 pt-4">
      {/* ─── HEADER SECTION ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200/60">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20 text-white">
            <Award className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
                Penghargaan
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 text-slate-900 drop-shadow-sm">Sertifikat Saya</h2>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Riwayat sertifikat penugasan dan keaktifan protokoler.</p>
          </div>
        </div>
      </motion.div>

      {/* ─── Floating Stats Row ─── */}
      <section className="relative z-20 pb-0">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Diterbitkan", value: issued, icon: BadgeCheck, hint: "Siap diunduh", color: "text-emerald-600", bg: "bg-emerald-100" },
            { label: "Dalam Proses", value: inProcess, icon: Clock, hint: "Menunggu admin", color: "text-amber-600", bg: "bg-amber-100" },
            { label: "Total", value: mockSertifikat.length, icon: Award, hint: "Seluruh riwayat", color: "text-[#ff6b4a]", bg: "bg-orange-50" },
          ].map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }}>
              <div className="bg-white border border-slate-200 rounded-[24px] py-6 px-6 flex flex-col justify-between hover:shadow-lg hover:shadow-slate-100 transition-all group relative overflow-hidden h-full shadow-sm">
                <div className="flex items-center justify-between relative z-10">
                  <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                  <div className={cn("flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl transition-colors", stat.bg, stat.color)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 relative z-10">
                  <p className="text-[32px] font-bold leading-tight text-slate-900">{stat.value}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[11px] font-medium text-slate-400">{stat.hint}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── BODY CONTENT ─── */}
      <div className="flex-1 mt-8">
        <section className="pb-12 space-y-6">

          {mockSertifikat.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-16 text-center">
              <Award className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <h3 className="font-bold text-slate-900 text-lg">Belum ada sertifikat</h3>
              <p className="text-slate-500 text-sm mt-1">Sertifikat akan diterbitkan setelah kegiatan selesai.</p>
            </div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={stagger} className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl overflow-hidden">
              <div className="divide-y divide-slate-100">
                {mockSertifikat.map((s) => (
                  <motion.div key={s.id} variants={fadeUp}>
                    {/* Row */}
                    <button
                      className="w-full text-left group hover:bg-slate-50 transition-colors"
                      onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5">
                        {/* Icon + info */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={cn(
                            "h-12 w-12 flex items-center justify-center shrink-0 rounded-xl",
                            s.status === "diterbitkan" ? "bg-emerald-50" : "bg-slate-100"
                          )}>
                            <Award className={cn("h-5 w-5", s.status === "diterbitkan" ? "text-emerald-600" : "text-slate-400")} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 text-base group-hover:text-orange-500 transition-colors truncate">{s.judul}</h3>
                            <p className="text-slate-500 text-sm truncate">{s.kegiatan}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 md:shrink-0">
                          <span className={cn("inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border",
                            s.status === "diterbitkan"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-600 border-amber-200"
                          )}>
                            {s.status === "diterbitkan" ? <><BadgeCheck className="h-3 w-3" /> Diterbitkan</> : "Dalam Proses"}
                          </span>
                          <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", expanded === s.id && "rotate-180")} />
                        </div>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {expanded === s.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-50 border-t border-slate-100 px-6 py-5"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nomor Sertifikat</div>
                            <div className="text-sm font-mono font-bold text-slate-900">{s.nomor}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Peran Penugasan</div>
                            <div className="text-sm font-bold text-slate-900">{s.peran}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tanggal Kegiatan</div>
                            <div className="text-sm font-bold text-slate-900">
                              {new Date(s.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                            </div>
                          </div>
                          <div className="md:col-span-3">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Lokasi</div>
                            <div className="text-sm text-slate-700 flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" /> {s.lokasi}
                            </div>
                          </div>
                        </div>
                        {s.status === "diterbitkan" && (
                          <Button className="rounded-xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm transition-colors gap-2 font-bold">
                            <Download className="h-4 w-4" /> Unduh Sertifikat PDF
                          </Button>
                        )}
                        {s.status === "dalam_proses" && (
                          <p className="text-xs text-amber-600 font-medium">Sertifikat sedang diproses oleh admin. Harap tunggu notifikasi.</p>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}
