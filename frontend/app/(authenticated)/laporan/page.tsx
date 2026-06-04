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
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 tracking-tight">Laporan & Rekap</h1>
        <p className="mt-2 text-slate-500 text-base">Laporan kegiatan dan rekap penugasan mahasiswa per periode.</p>
      </motion.div>

      {/* Filter */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5 text-slate-700">
          <Filter className="h-4 w-4" />
          <span className="font-bold text-sm uppercase tracking-wider">Filter Periode</span>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-600">Dari Tanggal</Label>
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-xl w-44 bg-slate-50" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-600">Sampai Tanggal</Label>
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-xl w-44 bg-slate-50" />
          </div>
        </div>
      </motion.div>

      {/* Kegiatan Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Laporan Kegiatan</h2>
              <p className="text-xs text-slate-400">{kegiatan?.length ?? 0} kegiatan ditemukan pada periode ini</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl gap-2 border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => exportCsv(
            `laporan-kegiatan-${start}-${end}.csv`,
            [["Tanggal","Nama","Bentuk","Jam","Lokasi","Status"], ...(kegiatan ?? []).map((k: any) => [k.tanggal, k.nama_kegiatan, k.bentuk, `${k.jam_mulai}-${k.jam_selesai}`, k.lokasi, k.status])]
          )}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="font-bold text-slate-600 pl-6">Tanggal</TableHead>
              <TableHead className="font-bold text-slate-600">Kegiatan</TableHead>
              <TableHead className="font-bold text-slate-600">Bentuk</TableHead>
              <TableHead className="font-bold text-slate-600">Lokasi</TableHead>
              <TableHead className="font-bold text-slate-600">Status</TableHead>
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
                <TableCell className="pl-6 text-slate-600 text-sm">{new Date(k.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</TableCell>
                <TableCell className="font-semibold text-slate-800">{k.nama_kegiatan}</TableCell>
                <TableCell><Badge variant="outline" className="capitalize text-xs">{k.bentuk?.replace("_"," ")}</Badge></TableCell>
                <TableCell className="text-slate-600 text-sm">{k.lokasi}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusBadgeColor[k.status] ?? "bg-slate-100 text-slate-500"}`}>
                    {k.status}
                  </span>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      {/* Rekap Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Rekap Penugasan Mahasiswa</h2>
              <p className="text-xs text-slate-400">{rekap.length} mahasiswa memiliki penugasan pada periode ini</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl gap-2 border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => exportCsv(
            `rekap-penugasan-${start}-${end}.csv`,
            [["NIM","Nama","Prodi","Total Tugas","Dikonfirmasi","Ditolak"], ...rekap.map((r: any) => [r.nim, r.nama_lengkap, r.prodi, r.total_tugas, r.dikonfirmasi, r.ditolak])]
          )}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="font-bold text-slate-600 pl-6">NIM</TableHead>
              <TableHead className="font-bold text-slate-600">Nama</TableHead>
              <TableHead className="font-bold text-slate-600">Prodi</TableHead>
              <TableHead className="font-bold text-slate-600 text-center">Total Tugas</TableHead>
              <TableHead className="font-bold text-slate-600 text-center">Dikonfirmasi</TableHead>
              <TableHead className="font-bold text-slate-600 text-center">Ditolak</TableHead>
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
                <TableCell className="font-mono text-xs text-slate-500 pl-6">{r.nim}</TableCell>
                <TableCell className="font-semibold text-slate-800">{r.nama_lengkap}</TableCell>
                <TableCell className="text-slate-600">{r.prodi}</TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-sm">{r.total_tugas}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700 text-sm">{r.dikonfirmasi}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-100 font-bold text-red-600 text-sm">{r.ditolak}</span>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
