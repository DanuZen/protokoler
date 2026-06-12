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
    <div className="min-h-screen bg-transparent">
      {/* ─── Hero Banner ─── */}
      <section className="relative px-6 md:px-10 pt-10 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute -right-24 -top-8 h-80 w-80 rounded-full bg-[#C9A84C]/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-6 relative z-10">
          <div>
            <p className="text-[#C9A84C] text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Sistem Informasi Protokoler</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight">Laporan & Rekap</h1>
            <p className="mt-2 text-slate-400 text-sm">Laporan kegiatan dan rekap penugasan mahasiswa per periode.</p>
          </div>
        </motion.div>
      </section>

      {/* ─── Floating Toolbar (Filter) ─── */}
      <section className="px-6 md:px-10 -mt-12 relative z-20 pb-0">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 shadow-xl p-4 rounded-none">
          <div className="flex items-center gap-2 text-slate-300 font-bold text-sm uppercase tracking-wider shrink-0 bg-slate-800 px-4 py-2 border border-slate-700">
            <Filter className="h-4 w-4 text-[#C9A84C]" />
            Filter Periode
          </div>
          <div className="flex flex-wrap items-end gap-4 w-full md:w-auto">
            <div className="space-y-1.5 flex-1 min-w-[150px]">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dari Tanggal</Label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-none h-10 bg-slate-800 border-slate-700 text-white shadow-sm focus-visible:ring-[#C9A84C]" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-[150px]">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sampai Tanggal</Label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-none h-10 bg-slate-800 border-slate-700 text-white shadow-sm focus-visible:ring-[#C9A84C]" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── BODY CONTENT ─── */}
      <div className="bg-slate-50 min-h-screen -mt-6">
        <div className="h-16" />
        <section className="px-6 md:px-10 pb-12 space-y-6">

          {/* Kegiatan Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-900 px-5 py-3.5 bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 bg-[#C9A84C] text-white">
                  <FileBarChart className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Laporan Kegiatan</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">{kegiatan?.length ?? 0} kegiatan ditemukan</p>
                </div>
              </div>
              <Button className="rounded-none bg-slate-950 text-white hover:bg-[#C9A84C] hover:text-white font-bold gap-2 border border-slate-700 h-9 px-4 transition-colors" onClick={() => exportCsv(
                `laporan-kegiatan-${start}-${end}.csv`,
                [["Tanggal","Nama","Bentuk","Jam","Lokasi","Status"], ...(kegiatan ?? []).map((k: any) => [k.tanggal, k.nama_kegiatan, k.bentuk, `${k.jam_mulai}-${k.jam_selesai}`, k.lokasi, k.status])]
              )}>
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table className="text-sm">
              <TableHeader>
                <TableRow className="border-b-2 border-slate-900 hover:bg-transparent">
                  <TableHead className="font-bold text-slate-900 py-4 w-[160px]">Tanggal</TableHead>
                  <TableHead className="font-bold text-slate-900 py-4">Kegiatan</TableHead>
                  <TableHead className="font-bold text-slate-900 py-4">Bentuk</TableHead>
                  <TableHead className="font-bold text-slate-900 py-4">Lokasi</TableHead>
                  <TableHead className="font-bold text-slate-900 py-4">Status</TableHead>
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
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <TableCell className="text-slate-600 py-4">{new Date(k.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</TableCell>
                    <TableCell className="font-bold text-slate-900 py-4">{k.nama_kegiatan}</TableCell>
                    <TableCell className="py-4"><Badge variant="outline" className="capitalize font-bold border-slate-300">{k.bentuk?.replace("_"," ")}</Badge></TableCell>
                    <TableCell className="text-slate-600 py-4">{k.lokasi}</TableCell>
                    <TableCell className="py-4">
                      <span className={`inline-flex items-center rounded-none border px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusBadgeColor[k.status] ?? "bg-slate-100 text-slate-500"}`}>
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-900 px-5 py-3.5 bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 bg-[#C9A84C] text-white">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Rekap Penugasan Mahasiswa</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">{rekap.length} mahasiswa dalam periode ini</p>
                </div>
              </div>
              <Button className="rounded-none bg-slate-950 text-white hover:bg-[#C9A84C] hover:text-white font-bold gap-2 border border-slate-700 h-9 px-4 transition-colors" onClick={() => exportCsv(
                `rekap-penugasan-${start}-${end}.csv`,
                [["NIM","Nama","Prodi","Total Tugas","Dikonfirmasi","Ditolak"], ...rekap.map((r: any) => [r.nim, r.nama_lengkap, r.prodi, r.total_tugas, r.dikonfirmasi, r.ditolak])]
              )}>
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table className="text-sm">
              <TableHeader>
                <TableRow className="border-b-2 border-slate-900 hover:bg-transparent">
                  <TableHead className="font-bold text-slate-900 py-4 w-[120px]">NIM</TableHead>
                  <TableHead className="font-bold text-slate-900 py-4">Nama</TableHead>
                  <TableHead className="font-bold text-slate-900 py-4">Prodi</TableHead>
                  <TableHead className="font-bold text-slate-900 text-center py-4">Total Tugas</TableHead>
                  <TableHead className="font-bold text-slate-900 text-center py-4">Dikonfirmasi</TableHead>
                  <TableHead className="font-bold text-slate-900 text-center py-4">Ditolak</TableHead>
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
                  <motion.tr key={r.nim} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-mono text-sm text-slate-500 py-4">{r.nim}</TableCell>
                    <TableCell className="font-bold text-slate-900 py-4">{r.nama_lengkap}</TableCell>
                    <TableCell className="text-slate-600 py-4">{r.prodi}</TableCell>
                    <TableCell className="text-center py-4">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-slate-100 font-bold text-slate-700 text-sm border border-slate-200">{r.total_tugas}</span>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-emerald-100 font-bold text-emerald-700 text-sm border border-emerald-200">{r.dikonfirmasi}</span>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-100 font-bold text-red-600 text-sm border border-red-200">{r.ditolak}</span>
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
