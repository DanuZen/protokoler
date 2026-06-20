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
    <div className="flex flex-col min-h-full pb-10 px-6 md:px-8 pt-4">
      {/* ─── HEADER SECTION ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 pb-6 border-b border-slate-200/60">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20 text-white">
            <FileBarChart className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
                Data & Analitik
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 text-slate-900 drop-shadow-sm">Laporan & Rekap</h2>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Laporan kegiatan dan rekap penugasan mahasiswa per periode.</p>
          </div>
        </div>
      </motion.div>

      {/* ─── Floating Toolbar (Filter) ─── */}
      <section className="relative z-20 pb-0">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row items-center justify-between gap-4 border border-white/80 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-5">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-sm uppercase tracking-wider shrink-0 bg-slate-50 px-4 py-2 border border-slate-200 rounded-xl">
            <Filter className="h-4 w-4 text-slate-400" />
            Filter Periode
          </div>
          <div className="flex flex-wrap items-end gap-4 w-full md:w-auto">
            <div className="space-y-1.5 flex-1 min-w-[150px]">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dari Tanggal</Label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-xl h-10 bg-white border-slate-200 text-slate-900 shadow-sm focus-visible:ring-slate-200" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-[150px]">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sampai Tanggal</Label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-xl h-10 bg-white border-slate-200 text-slate-900 shadow-sm focus-visible:ring-slate-200" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── BODY CONTENT ─── */}
      <div className="flex-1 mt-8">
        <section className="pb-12 grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">

          {/* Kegiatan Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="h-[500px] flex flex-col bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl overflow-hidden">
            <div className="shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 px-6 py-4 bg-white">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 bg-slate-50 text-slate-600 rounded-xl border border-slate-200">
                  <FileBarChart className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Laporan Kegiatan</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">{kegiatan?.length ?? 0} kegiatan ditemukan</p>
                </div>
              </div>
              <Button className="rounded-xl bg-orange-600 text-white border border-transparent hover:bg-orange-700 font-bold gap-2 h-9 px-4 transition-colors shadow-sm shadow-orange-500/20" onClick={() => exportCsv(
                `laporan-kegiatan-${start}-${end}.csv`,
                [["Tanggal","Nama","Bentuk","Jam","Lokasi","Status"], ...(kegiatan ?? []).map((k: any) => [k.tanggal, k.nama_kegiatan, k.bentuk, `${k.jam_mulai}-${k.jam_selesai}`, k.lokasi, k.status])]
              )}>
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>
            <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden">
              <Table className="text-sm">
              <TableHeader>
                <TableRow className="border-b border-slate-200 hover:bg-transparent bg-slate-50">
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
            </div>
          </motion.div>

          {/* Rekap Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="h-[500px] flex flex-col bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl overflow-hidden">
            <div className="shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 px-6 py-4 bg-white">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 bg-slate-50 text-slate-600 rounded-xl border border-slate-200">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Rekap Penugasan Mahasiswa</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">{rekap.length} mahasiswa dalam periode ini</p>
                </div>
              </div>
              <Button className="rounded-xl bg-orange-600 text-white border border-transparent hover:bg-orange-700 font-bold gap-2 h-9 px-4 transition-colors shadow-sm shadow-orange-500/20" onClick={() => exportCsv(
                `rekap-penugasan-${start}-${end}.csv`,
                [["NIM","Nama","Prodi","Total Tugas","Dikonfirmasi","Ditolak"], ...rekap.map((r: any) => [r.nim, r.nama_lengkap, r.prodi, r.total_tugas, r.dikonfirmasi, r.ditolak])]
              )}>
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>
            <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden">
              <Table className="text-sm">
              <TableHeader>
                <TableRow className="border-b border-slate-200 hover:bg-transparent bg-slate-50">
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
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
