"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { laporanApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileBarChart, Users, CalendarDays, Filter } from "lucide-react";
import { motion } from "framer-motion";

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
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
      <div className="relative px-6 md:px-10 pt-24 pb-32 overflow-hidden">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight">Laporan & Rekap</h1>
            <p className="mt-3 text-slate-300 text-lg">Laporan kegiatan dan rekap penugasan mahasiswa per periode.</p>
          </div>
        </motion.div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="bg-slate-50 min-h-screen pt-4">
        <div className="px-6 md:px-10 -mt-24 relative z-10 space-y-12 max-w-[1400px] mx-auto">

      {/* Filter */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-4 bg-slate-100/50 p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-5 text-slate-700">
          <Filter className="h-4 w-4" />
          <span className="font-bold text-sm uppercase tracking-wider">Filter Periode</span>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2 flex-1 min-w-[200px]">
            <Label className="text-sm font-bold text-slate-700">Dari Tanggal</Label>
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-xl h-12 bg-white border-slate-200 shadow-sm" />
          </div>
          <div className="space-y-2 flex-1 min-w-[200px]">
            <Label className="text-sm font-bold text-slate-700">Sampai Tanggal</Label>
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-xl h-12 bg-white border-slate-200 shadow-sm" />
          </div>
        </div>
      </motion.div>

      {/* Kegiatan Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">Laporan Kegiatan</h2>
            <Badge variant="outline" className="text-slate-500 bg-white">{kegiatan?.length ?? 0} ditemukan</Badge>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl gap-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-100 h-10 px-4" onClick={() => exportCsv(
            `laporan-kegiatan-${start}-${end}.csv`,
            [["Tanggal","Nama","Bentuk","Jam","Lokasi","Status"], ...(kegiatan ?? []).map((k: any) => [k.tanggal, k.nama_kegiatan, k.bentuk, `${k.jam_mulai}-${k.jam_selesai}`, k.lokasi, k.status])]
          )}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
        <Table className="text-base">
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
                <TableCell className="text-slate-600 py-5">{new Date(k.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</TableCell>
                <TableCell className="font-bold text-slate-900 text-lg py-5">{k.nama_kegiatan}</TableCell>
                <TableCell className="py-5"><Badge variant="outline" className="capitalize font-bold border-slate-300">{k.bentuk?.replace("_"," ")}</Badge></TableCell>
                <TableCell className="text-slate-600 py-5">{k.lokasi}</TableCell>
                <TableCell className="py-5">
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold capitalize ${statusBadgeColor[k.status] ?? "bg-slate-100 text-slate-500"}`}>
                    {k.status}
                  </span>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      {/* Rekap Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pt-10 pb-20">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">Rekap Penugasan Mahasiswa</h2>
            <Badge variant="outline" className="text-slate-500 bg-white">{rekap.length} bertugas</Badge>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl gap-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-100 h-10 px-4" onClick={() => exportCsv(
            `rekap-penugasan-${start}-${end}.csv`,
            [["NIM","Nama","Prodi","Total Tugas","Dikonfirmasi","Ditolak"], ...rekap.map((r: any) => [r.nim, r.nama_lengkap, r.prodi, r.total_tugas, r.dikonfirmasi, r.ditolak])]
          )}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
        <Table className="text-base">
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
                <TableCell className="font-mono text-sm text-slate-500 py-5">{r.nim}</TableCell>
                <TableCell className="font-bold text-slate-900 text-lg py-5">{r.nama_lengkap}</TableCell>
                <TableCell className="text-slate-600 py-5">{r.prodi}</TableCell>
                <TableCell className="text-center py-5">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-base">{r.total_tugas}</span>
                </TableCell>
                <TableCell className="text-center py-5">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700 text-base">{r.dikonfirmasi}</span>
                </TableCell>
                <TableCell className="text-center py-5">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-100 font-bold text-red-600 text-base">{r.ditolak}</span>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>
      </div>
    </div>
    </div>
  );
}
