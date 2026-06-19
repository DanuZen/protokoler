"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { laporanApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileBarChart, Users, CalendarDays, Filter, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const statusBadgeColor: Record<string, string> = {
  selesai: "bg-emerald-50 text-emerald-600 border-emerald-100",
  terkonfirmasi: "bg-blue-50 text-blue-600 border-blue-100",
  draft: "bg-slate-50 text-slate-500 border-slate-100",
  batal: "bg-red-50 text-red-600 border-red-100",
};

export default function Page() {
  const firstOfMonth = new Date(); firstOfMonth.setDate(1);
  const [start, setStart] = useState(firstOfMonth.toISOString().slice(0, 10));
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 10));
  const [viewMode, setViewMode] = useState<"kegiatan" | "rekap">("kegiatan");

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
    <div className="flex-1 flex flex-col min-h-0 pb-6 px-6 md:px-8 pt-4">
      {/* ─── HEADER SECTION (Adapted Layout) ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-8 pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
              Data & Analitik
            </span>
          </div>
          <h2 className="font-display text-[28px] md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 md:mb-2 text-slate-900 drop-shadow-sm">Laporan & Rekap</h2>
          <p className="text-[13px] md:text-base text-slate-600 font-medium max-w-xl">
            Laporan kegiatan dan rekap penugasan mahasiswa per periode.
          </p>
        </div>
      </motion.div>

      {/* ─── Floating Toolbar (Filter) ─── */}
      <section className="relative z-20 pb-0">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-100 bg-white shadow-sm rounded-[20px] p-3 pl-3 md:pl-6 pr-3 md:pr-6">
          <div className="flex items-center p-1 bg-slate-50 border border-slate-100 rounded-xl w-full md:w-auto">
            <button 
              onClick={() => setViewMode("kegiatan")} 
              className={cn(
                "flex-1 md:flex-none px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap",
                viewMode === "kegiatan" ? "bg-[#5b1511] text-white shadow-sm border border-[#5b1511]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
              )}
            >
              Laporan Kegiatan
            </button>
            <button 
              onClick={() => setViewMode("rekap")} 
              className={cn(
                "flex-1 md:flex-none px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap",
                viewMode === "rekap" ? "bg-[#5b1511] text-white shadow-sm border border-[#5b1511]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
              )}
            >
              Rekap Penugasan
            </button>
          </div>
          <div className="flex flex-wrap items-end gap-4 w-full md:w-auto">
            <div className="space-y-1.5 flex-1 min-w-[150px] flex items-center gap-3">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider m-0">Dari Tanggal</Label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-full h-10 bg-white border-slate-200 text-slate-900 shadow-sm focus-visible:ring-slate-200" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-[150px] flex items-center gap-3">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider m-0">Sampai Tanggal</Label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-full h-10 bg-white border-slate-200 text-slate-900 shadow-sm focus-visible:ring-slate-200" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── BODY CONTENT ─── */}
      <div className="flex-1 flex flex-col min-h-0 mt-8 pb-4">
        <section className="flex-1 flex flex-col min-h-0 pb-0">

          {/* Kegiatan Table */}
          {viewMode === "kegiatan" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex-1 flex flex-col min-h-0 rounded-[20px] border border-slate-100 shadow-sm overflow-hidden" style={{ backgroundColor: '#ffffff', isolation: 'isolate' }}>
            <div className="shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 px-6 py-4" style={{ backgroundColor: '#ffffff' }}>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 bg-white text-[#5b1511] rounded-xl border border-slate-100 shadow-sm">
                  <FileBarChart className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Laporan Kegiatan</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">{kegiatan?.length ?? 0} kegiatan ditemukan</p>
                </div>
              </div>
              <Button className="rounded-full bg-[#5b1511] text-white border border-transparent hover:bg-[#4a100d] font-bold gap-2 h-9 px-5 transition-colors shadow-sm" onClick={() => exportCsv(
                `laporan-kegiatan-${start}-${end}.csv`,
                [["Tanggal","Nama","Bentuk","Jam","Lokasi","Status"], ...(kegiatan ?? []).map((k: any) => [k.tanggal, k.nama_kegiatan, k.bentuk, `${k.jam_mulai}-${k.jam_selesai}`, k.lokasi, k.status])]
              )}>
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>
            <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden" style={{ backgroundColor: '#ffffff' }}>
              <Table className="text-sm" style={{ backgroundColor: '#ffffff' }}>
              <TableHeader style={{ backgroundColor: '#ffffff' }}>
                <TableRow className="border-b border-slate-100 hover:bg-slate-50" style={{ backgroundColor: '#ffffff' }}>
                  <TableHead className="font-bold text-slate-600 py-4 pl-6 w-[160px]">Tanggal</TableHead>
                  <TableHead className="font-bold text-slate-600 py-4">Kegiatan</TableHead>
                  <TableHead className="font-bold text-slate-600 py-4">Bentuk</TableHead>
                  <TableHead className="font-bold text-slate-600 py-4">Lokasi</TableHead>
                  <TableHead className="font-bold text-slate-600 py-4 pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!kegiatan?.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-400 py-14">
                      <FileBarChart className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="font-medium">Tidak ada kegiatan pada periode ini.</p>
                    </TableCell>
                  </TableRow>
                )}
                {kegiatan?.map((k: any, i: number) => (
                  <motion.tr
                    key={k.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <TableCell className="text-slate-600 py-4 pl-6">{new Date(k.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</TableCell>
                    <TableCell className="font-bold text-slate-900 py-4">{k.nama_kegiatan}</TableCell>
                    <TableCell className="py-4 font-medium text-slate-700 capitalize">{k.bentuk?.replace("_"," ")}</TableCell>
                    <TableCell className="text-slate-600 py-4">{k.lokasi}</TableCell>
                    <TableCell className="py-4 pr-6">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusBadgeColor[k.status] ?? "bg-slate-50 text-slate-500 border-slate-200"}`}>
                        {k.status}
                      </span>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
            </div>
          </motion.div>
          )}

          {/* Rekap Table */}
          {viewMode === "rekap" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex-1 flex flex-col min-h-0 rounded-[20px] border border-slate-100 shadow-sm overflow-hidden" style={{ backgroundColor: '#ffffff', isolation: 'isolate' }}>
            <div className="shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 px-6 py-4" style={{ backgroundColor: '#ffffff' }}>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 bg-white text-[#5b1511] rounded-xl border border-slate-100 shadow-sm">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Rekap Penugasan Mahasiswa</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">{rekap.length} mahasiswa dalam periode ini</p>
                </div>
              </div>
              <Button className="rounded-full bg-[#5b1511] text-white border border-transparent hover:bg-[#4a100d] font-bold gap-2 h-9 px-5 transition-colors shadow-sm" onClick={() => exportCsv(
                `rekap-penugasan-${start}-${end}.csv`,
                [["NIM","Nama","Prodi","Total Tugas","Dikonfirmasi","Ditolak"], ...rekap.map((r: any) => [r.nim, r.nama_lengkap, r.prodi, r.total_tugas, r.dikonfirmasi, r.ditolak])]
              )}>
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>
            <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden" style={{ backgroundColor: '#ffffff' }}>
              <Table className="text-sm" style={{ backgroundColor: '#ffffff' }}>
              <TableHeader style={{ backgroundColor: '#ffffff' }}>
                <TableRow className="border-b border-slate-100 hover:bg-slate-50" style={{ backgroundColor: '#ffffff' }}>
                  <TableHead className="font-bold text-slate-600 py-4 pl-6 w-[120px]">NIM</TableHead>
                  <TableHead className="font-bold text-slate-600 py-4">Nama</TableHead>
                  <TableHead className="font-bold text-slate-600 py-4">Prodi</TableHead>
                  <TableHead className="font-bold text-slate-600 text-center py-4">Total Tugas</TableHead>
                  <TableHead className="font-bold text-slate-600 text-center py-4">Dikonfirmasi</TableHead>
                  <TableHead className="font-bold text-slate-600 text-center py-4 pr-6">Ditolak</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!rekap?.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-400 py-14">
                      <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="font-medium">Belum ada data penugasan pada periode ini.</p>
                    </TableCell>
                  </TableRow>
                )}
                {rekap?.map((r: any, i: number) => (
                  <motion.tr key={r.nim} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="border-b border-slate-100 hover:bg-slate-50 transition-colors" style={{ backgroundColor: '#ffffff' }}>
                    <TableCell className="font-mono text-sm text-slate-500 py-4 pl-6">{r.nim}</TableCell>
                    <TableCell className="font-bold text-slate-900 py-4">{r.nama_lengkap}</TableCell>
                    <TableCell className="text-slate-600 py-4">{r.prodi}</TableCell>
                    <TableCell className="text-center py-4">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white font-bold text-slate-700 text-sm border border-slate-200">{r.total_tugas}</span>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white font-bold text-emerald-600 text-sm border border-emerald-200">{r.dikonfirmasi}</span>
                    </TableCell>
                    <TableCell className="text-center py-4 pr-6">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white font-bold text-red-600 text-sm border border-red-200">{r.ditolak}</span>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
            </div>
          </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}
