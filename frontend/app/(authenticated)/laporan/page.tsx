"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { laporanApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileBarChart, Users, CalendarDays, Filter, CheckCircle2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const statusBadgeColor: Record<string, string> = {
  selesai: "bg-emerald-100 text-emerald-700 border-emerald-200",
  terkonfirmasi: "bg-blue-100 text-blue-700 border-blue-200",
  draft: "bg-slate-100 text-slate-500 border-slate-200",
  draf: "bg-slate-100 text-slate-500 border-slate-200",
  publik: "bg-sky-100 text-sky-700 border-sky-200",
  batal: "bg-red-100 text-red-600 border-red-200",
};

export default function Page() {
  const firstOfMonth = new Date(); firstOfMonth.setDate(1);
  const [start, setStart] = useState(firstOfMonth.toISOString().slice(0, 10));
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 10));
  const [tab, setTab] = useState<"kegiatan" | "rekap">("kegiatan");

  const { data: kegiatan } = useQuery({
    queryKey: ["laporan-kegiatan", start, end],
    queryFn: () => laporanApi.kegiatan(start, end),
  });

  const { data: rekapRes } = useQuery({
    queryKey: ["laporan-rekap", start, end],
    queryFn: () => laporanApi.rekap(start, end),
  });

  const rekap = rekapRes?.rekap_mahasiswa ?? [];

  const exportCsv = (filename: string, rows: (string|number)[][]) => {
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-auto md:h-dvh md:overflow-hidden pb-6 px-4 md:px-8 pt-4">
      {/* ─── HEADER SECTION ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-5 mb-4 pb-4 md:mb-8 md:pb-6 border-b border-slate-200/60">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-700 to-red-800 shadow-lg shadow-red-700/20 text-white">
            <FileBarChart className="h-6 w-6 md:h-7 md:w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-red-800">
                Data & Analitik
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-[2.5rem] font-bold tracking-tight leading-none mb-1 md:mb-1.5 text-slate-900 drop-shadow-sm">Laporan & Rekap</h2>
            <p className="text-xs md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Laporan kegiatan dan rekap penugasan mahasiswa per periode.</p>
          </div>
        </div>
      </motion.div>

      {/* ─── Floating Toolbar (Filter & Tabs) ─── */}
      <section className="shrink-0 relative z-20 pb-0">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col xl:flex-row items-center justify-between gap-4 border border-slate-200 bg-white shadow-sm rounded-[24px] p-5">
          
          {/* TABS */}
          <div className="flex gap-2 overflow-x-auto w-full xl:w-auto [&::-webkit-scrollbar]:hidden shrink-0 pb-2 xl:pb-0">
            <button 
              onClick={() => setTab("kegiatan")} 
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 whitespace-nowrap",
                tab === "kegiatan" ? "bg-[#6B0000] text-white border-[#6B0000] shadow-md shadow-red-700/20" : "bg-white text-slate-600 border-slate-200 shadow-sm hover:text-slate-900 hover:shadow-md"
              )}
            >
              Laporan Kegiatan
            </button>
            <button 
              onClick={() => setTab("rekap")} 
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 whitespace-nowrap",
                tab === "rekap" ? "bg-[#6B0000] text-white border-[#6B0000] shadow-md shadow-red-700/20" : "bg-white text-slate-600 border-slate-200 shadow-sm hover:text-slate-900 hover:shadow-md"
              )}
            >
              Rekap Penugasan Mahasiswa
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            <div className="flex flex-1 items-center gap-3">
              <div className="space-y-1.5 flex-1 min-w-[130px]">
                <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-xl h-10 bg-white border-slate-200 text-slate-900 shadow-sm focus-visible:ring-slate-200" />
              </div>
              <div className="text-slate-400 font-bold">-</div>
              <div className="space-y-1.5 flex-1 min-w-[130px]">
                <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-xl h-10 bg-white border-slate-200 text-slate-900 shadow-sm focus-visible:ring-slate-200" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── BODY CONTENT ─── */}
      <main className="flex-1 md:min-h-0 flex flex-col mt-6 overflow-visible md:overflow-hidden">
        <section className="flex-1 flex flex-col pb-12 pr-2 min-h-0">

          {/* Kegiatan Table */}
          {tab === "kegiatan" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-1 flex flex-col bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden min-h-0">
            <div className="shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 px-6 py-4 bg-white">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 bg-slate-50 text-slate-600 rounded-xl border border-slate-200">
                  <FileBarChart className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Laporan Kegiatan</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">{kegiatan?.length ?? 0} kegiatan ditemukan</p>
                </div>
              </div>
              <Button className="rounded-xl bg-red-800 text-white border border-transparent hover:bg-red-900 font-bold gap-2 h-9 px-4 transition-colors shadow-sm shadow-red-700/20" onClick={() => exportCsv(
                `laporan-kegiatan-${start}-${end}.csv`,
                [["Tanggal","Nama","Bentuk","Jam","Lokasi","Status"], ...(kegiatan ?? []).map((k: any) => [k.tanggal, k.nama_kegiatan, k.bentuk, `${k.jam_mulai}-${k.jam_selesai}`, k.lokasi, k.status])]
              )}>
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>
            <div className="flex-1 overflow-auto flex flex-col relative min-h-0 [&::-webkit-scrollbar]:hidden">
              <Table className="text-sm">
              <TableHeader>
                <TableRow className="border-b border-slate-200 hover:bg-transparent bg-slate-50 sticky top-0 z-10">
                  <TableHead className="font-bold text-slate-600 py-4 pl-6 w-[160px]">Tanggal</TableHead>
                  <TableHead className="font-bold text-slate-600 py-4">Kegiatan</TableHead>
                  <TableHead className="font-bold text-slate-600 py-4">Bentuk</TableHead>
                  <TableHead className="font-bold text-slate-600 py-4">Lokasi</TableHead>
                  <TableHead className="font-bold text-slate-600 py-4 pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kegiatan?.length > 0 && kegiatan.map((k: any, i: number) => (
                  <motion.tr
                    key={k.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <TableCell className="text-slate-600 py-4 pl-6">{new Date(k.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</TableCell>
                    <TableCell className="font-bold text-slate-900 py-4">{k.nama_kegiatan}</TableCell>
                    <TableCell className="py-4 font-medium text-slate-700 capitalize">{k.bentuk?.replace("_"," ")}</TableCell>
                    <TableCell className="text-slate-600 py-4">{k.lokasi}</TableCell>
                    <TableCell className="py-4 pr-6">
                      <span className={`inline-flex items-center rounded-xl border px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusBadgeColor[k.status] ?? "bg-slate-100 text-slate-500 border-slate-200"}`}>
                        {k.status}
                      </span>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
            
            {!kegiatan?.length && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 min-h-[300px]">
                <Sparkles className="mx-auto h-12 w-12 mb-4 text-slate-300" />
                <h3 className="text-sm font-bold text-slate-700 mb-1">Tidak Ada Data</h3>
                <p className="text-xs">Tidak ada laporan kegiatan pada periode ini.</p>
              </div>
            )}
            </div>
          </motion.div>
          )}

          {/* Rekap Table */}
          {tab === "rekap" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-1 flex flex-col bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden min-h-0">
            <div className="shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 px-6 py-4 bg-white">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 bg-slate-50 text-slate-600 rounded-xl border border-slate-200">
                  <Users className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Rekap Penugasan Mahasiswa</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">{rekap.length} mahasiswa dalam periode ini</p>
                </div>
              </div>
              <Button className="rounded-xl bg-red-800 text-white border border-transparent hover:bg-red-900 font-bold gap-2 h-9 px-4 transition-colors shadow-sm shadow-red-700/20" onClick={() => exportCsv(
                `rekap-penugasan-${start}-${end}.csv`,
                [["NIM","Nama","Prodi","Total Tugas","Dikonfirmasi","Ditolak"], ...rekap.map((r: any) => [r.nim, r.nama_lengkap, r.prodi, r.total_tugas, r.dikonfirmasi, r.ditolak])]
              )}>
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>
            <div className="flex-1 overflow-auto flex flex-col relative min-h-0 [&::-webkit-scrollbar]:hidden">
              <Table className="text-sm">
              <TableHeader>
                <TableRow className="border-b border-slate-200 hover:bg-transparent bg-slate-50 sticky top-0 z-10">
                  <TableHead className="font-bold text-slate-600 py-4 pl-6 w-[120px]">NIM</TableHead>
                  <TableHead className="font-bold text-slate-600 py-4">Nama</TableHead>
                  <TableHead className="font-bold text-slate-600 py-4">Prodi</TableHead>
                  <TableHead className="font-bold text-slate-600 text-center py-4">Total Tugas</TableHead>
                  <TableHead className="font-bold text-slate-600 text-center py-4">Dikonfirmasi</TableHead>
                  <TableHead className="font-bold text-slate-600 text-center py-4 pr-6">Ditolak</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rekap?.length > 0 && rekap.map((r: any, i: number) => (
                  <motion.tr key={r.nim} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <TableCell className="font-mono text-sm text-slate-500 py-4 pl-6">{r.nim}</TableCell>
                    <TableCell className="font-bold text-slate-900 py-4">{r.nama_lengkap}</TableCell>
                    <TableCell className="text-slate-600 py-4">{r.prodi}</TableCell>
                    <TableCell className="text-center py-4">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 font-bold text-slate-700 text-sm border border-slate-200">{r.total_tugas}</span>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 font-bold text-emerald-700 text-sm border border-emerald-200">{r.dikonfirmasi}</span>
                    </TableCell>
                    <TableCell className="text-center py-4 pr-6">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 font-bold text-red-600 text-sm border border-red-200">{r.ditolak}</span>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
            
            {!rekap?.length && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 min-h-[300px]">
                <Sparkles className="mx-auto h-12 w-12 mb-4 text-slate-300" />
                <h3 className="text-sm font-bold text-slate-700 mb-1">Tidak Ada Data</h3>
                <p className="text-xs">Belum ada data penugasan mahasiswa pada periode ini.</p>
              </div>
            )}
            </div>
          </motion.div>
          )}
          
        </section>
      </main>
    </div>
  );
}
