import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/laporan")({ component: Page });

function Page() {
  const firstOfMonth = new Date(); firstOfMonth.setDate(1);
  const [start, setStart] = useState(firstOfMonth.toISOString().slice(0, 10));
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 10));

  const { data: kegiatan } = useQuery({
    queryKey: ["laporan-kegiatan", start, end],
    queryFn: async () => {
      const { data, error } = await supabase.from("kegiatan").select("*").gte("tanggal", start).lte("tanggal", end).order("tanggal");
      if (error) throw error;
      return data;
    },
  });

  const { data: rekap } = useQuery({
    queryKey: ["laporan-rekap", start, end],
    queryFn: async () => {
      const { data, error } = await supabase.from("penugasan")
        .select("peran, mahasiswa:mahasiswa_id(id, nim, nama_lengkap, prodi), kegiatan:kegiatan_id(tanggal, jam_mulai, jam_selesai)")
        .gte("kegiatan.tanggal", start).lte("kegiatan.tanggal", end);
      if (error) throw error;
      const map = new Map<string, { nim: string; nama: string; prodi: string; jumlah: number; jam: number }>();
      for (const p of (data ?? []) as any[]) {
        if (!p.mahasiswa || !p.kegiatan) continue;
        const k = p.mahasiswa;
        const e = map.get(k.id) ?? { nim: k.nim, nama: k.nama_lengkap, prodi: k.prodi, jumlah: 0, jam: 0 };
        e.jumlah += 1;
        const [h1, m1] = p.kegiatan.jam_mulai.split(":").map(Number);
        const [h2, m2] = p.kegiatan.jam_selesai.split(":").map(Number);
        e.jam += Math.max(0, (h2 + m2 / 60) - (h1 + m1 / 60));
        map.set(k.id, e);
      }
      return Array.from(map.values()).sort((a, b) => b.jam - a.jam);
    },
  });

  const exportCsv = (filename: string, rows: (string|number)[][]) => {
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Laporan & Rekap</h1>
        <p className="text-muted-foreground">Laporan kegiatan dan rekap jam tugas mahasiswa per periode.</p>
      </div>

      <Card className="shadow-card">
        <CardContent className="flex flex-wrap items-end gap-4 pt-6">
          <div><Label>Dari</Label><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div>
          <div><Label>Sampai</Label><Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Laporan Kegiatan ({kegiatan?.length ?? 0})</CardTitle>
          <Button variant="outline" size="sm" onClick={() => exportCsv(
            `laporan-kegiatan-${start}-${end}.csv`,
            [["Tanggal","Nama","Bentuk","Jam","Lokasi","Status"], ...(kegiatan ?? []).map((k) => [k.tanggal, k.nama_kegiatan, k.bentuk, `${k.jam_mulai}-${k.jam_selesai}`, k.lokasi, k.status])]
          )}><Download className="mr-1.5 h-4 w-4" />Export CSV</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Kegiatan</TableHead><TableHead>Bentuk</TableHead><TableHead>Lokasi</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {!kegiatan?.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Tidak ada kegiatan pada periode ini.</TableCell></TableRow>}
              {kegiatan?.map((k) => (
                <TableRow key={k.id}>
                  <TableCell>{new Date(k.tanggal).toLocaleDateString("id-ID")}</TableCell>
                  <TableCell className="font-medium">{k.nama_kegiatan}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{k.bentuk.replace("_"," ")}</Badge></TableCell>
                  <TableCell>{k.lokasi}</TableCell>
                  <TableCell><Badge className="capitalize">{k.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Rekap Jam Tugas Mahasiswa</CardTitle>
          <Button variant="outline" size="sm" onClick={() => exportCsv(
            `rekap-jam-${start}-${end}.csv`,
            [["NIM","Nama","Prodi","Jumlah Kegiatan","Total Jam"], ...(rekap ?? []).map((r) => [r.nim, r.nama, r.prodi, r.jumlah, r.jam.toFixed(1)])]
          )}><Download className="mr-1.5 h-4 w-4" />Export CSV</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>NIM</TableHead><TableHead>Nama</TableHead><TableHead>Prodi</TableHead><TableHead className="text-right">Kegiatan</TableHead><TableHead className="text-right">Total Jam</TableHead></TableRow></TableHeader>
            <TableBody>
              {!rekap?.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Belum ada data penugasan.</TableCell></TableRow>}
              {rekap?.map((r) => (
                <TableRow key={r.nim}>
                  <TableCell className="font-mono text-xs">{r.nim}</TableCell>
                  <TableCell className="font-medium">{r.nama}</TableCell>
                  <TableCell>{r.prodi}</TableCell>
                  <TableCell className="text-right">{r.jumlah}</TableCell>
                  <TableCell className="text-right font-medium">{r.jam.toFixed(1)} jam</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
