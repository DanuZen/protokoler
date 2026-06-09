"use client";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Award, Download, BadgeCheck, Calendar, MapPin, ChevronDown } from "lucide-react";
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
    <div className="min-h-screen bg-transparent">
      {/* ─── Hero Banner ─── */}
      <div className="relative px-6 md:px-10 pt-24 pb-32 overflow-hidden">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight">Sertifikat Saya</h1>
            <p className="mt-3 text-slate-300 text-lg">Riwayat sertifikat penugasan dan keaktifan protokoler.</p>
          </div>
          <div className="flex items-center gap-0 border border-slate-700 bg-slate-900/50 backdrop-blur-sm rounded-none overflow-hidden">
            {[
              { label: "Diterbitkan",   value: issued,    color: "text-[#C9A84C]" },
              { label: "Dalam Proses",  value: inProcess, color: "text-amber-400" },
              { label: "Total",         value: mockSertifikat.length, color: "text-white" },
            ].map((s, i) => (
              <div key={s.label} className={cn("text-center px-5 py-4", i < 2 && "border-r border-slate-700")}>
                <div className={`text-3xl font-display font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="bg-slate-50 min-h-screen pt-4 pb-12">
        <div className="px-6 md:px-10 -mt-10 relative z-10 space-y-6">

          {mockSertifikat.length === 0 ? (
            <div className="bg-white border border-slate-200 p-16 text-center shadow-sm">
              <Award className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <h3 className="font-bold text-slate-900 text-lg">Belum ada sertifikat</h3>
              <p className="text-slate-500 text-sm mt-1">Sertifikat akan diterbitkan setelah kegiatan selesai.</p>
            </div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={stagger} className="bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden">
              <div className="divide-y divide-slate-100">
                {mockSertifikat.map((s) => (
                  <motion.div key={s.id} variants={fadeUp}>
                    {/* Row */}
                    <button
                      className="w-full text-left group hover:bg-slate-50/60 transition-colors"
                      onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5">
                        {/* Icon + info */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={cn(
                            "h-12 w-12 flex items-center justify-center shrink-0 rounded-none",
                            s.status === "diterbitkan" ? "bg-slate-900" : "bg-slate-200"
                          )}>
                            <Award className={cn("h-5 w-5", s.status === "diterbitkan" ? "text-[#C9A84C]" : "text-slate-400")} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 text-base group-hover:text-[#C9A84C] transition-colors truncate">{s.judul}</h3>
                            <p className="text-slate-500 text-sm truncate">{s.kegiatan}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 md:shrink-0">
                          <span className={cn("inline-flex items-center gap-1.5 rounded-none px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border",
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
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Nomor Sertifikat</div>
                            <div className="text-sm font-mono font-bold text-slate-900">{s.nomor}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Peran Penugasan</div>
                            <div className="text-sm font-bold text-slate-900">{s.peran}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tanggal Kegiatan</div>
                            <div className="text-sm font-bold text-slate-900">
                              {new Date(s.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                            </div>
                          </div>
                          <div className="md:col-span-3">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Lokasi</div>
                            <div className="text-sm text-slate-700 flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" /> {s.lokasi}
                            </div>
                          </div>
                        </div>
                        {s.status === "diterbitkan" && (
                          <Button className="rounded-none bg-slate-900 text-white hover:bg-[#C9A84C] hover:text-slate-900 transition-colors gap-2 font-bold">
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
        </div>
      </div>
    </div>
  );
}
