"use client";
import React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { kegiatanApi, penugasanApi, mahasiswaApi } from "@/lib/api";
import { useAuth, useRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2, MapPin, Clock, UserPlus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const isAdmin = role === "admin";
  const qc = useQueryClient();

  const { data: keg } = useQuery({
    queryKey: ["kegiatan", id],
    queryFn: () => kegiatanApi.get(id),
  });

  const { data: penugasan } = useQuery({
    queryKey: ["penugasan-kegiatan", id],
    queryFn: () => penugasanApi.byKegiatan(id),
  });

  const { data: tamu } = useQuery({
    queryKey: ["tamu", id],
    queryFn: () => kegiatanApi.get(id).then((k: any) => k.tamu ?? []),
  });

  const delPenugasan = useMutation({
    mutationFn: (pid: string) => penugasanApi.remove(pid),
    onSuccess: () => { toast.success("Penugasan dihapus"); qc.invalidateQueries({ queryKey: ["penugasan-kegiatan", id] }); },
  });

  const delTamu = useMutation({
    mutationFn: async (tid: string) => { await fetch('/api/tamu/' + tid, { method: 'DELETE' }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tamu", id] }); },
  });

  if (!keg) return <p className="text-muted-foreground">Memuat...</p>;

  return (
    <div className="space-y-6">
      <Link href="/kegiatan" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" />Kembali ke daftar
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold">{keg.nama_kegiatan}</h1>
          <Badge variant="outline" className="capitalize">{keg.bentuk?.replace("_", " ")}</Badge>
          <Badge className="capitalize">{keg.status}</Badge>
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{new Date(keg.tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {keg.jam_mulai?.slice(0,5)}–{keg.jam_selesai?.slice(0,5)}</span>
          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{keg.lokasi}</span>
        </div>
        {keg.deskripsi && <p className="mt-3 max-w-3xl text-sm">{keg.deskripsi}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Penugasan Mahasiswa</CardTitle>
            {isAdmin && <AssignDialog kegiatanId={id} tanggal={keg.tanggal} jamMulai={keg.jam_mulai} jamSelesai={keg.jam_selesai} />}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIM</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead>Konfirmasi</TableHead>
                  {isAdmin && <TableHead></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {!penugasan?.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Belum ada penugasan.</TableCell></TableRow>}
                {penugasan?.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.mahasiswa?.nim}</TableCell>
                    <TableCell className="font-medium">{p.mahasiswa?.nama_lengkap}<div className="text-xs text-muted-foreground">{p.mahasiswa?.prodi}</div></TableCell>
                    <TableCell><Badge variant={p.peran === "lo" ? "default" : "secondary"} className="uppercase">{p.peran}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{p.status_konfirmasi}</Badge></TableCell>
                    {isAdmin && <TableCell><Button size="icon" variant="ghost" onClick={() => delPenugasan.mutate(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tamu / Peserta VIP</CardTitle>
            {isAdmin && <TamuDialog kegiatanId={id} />}
          </CardHeader>
          <CardContent className="space-y-3">
            {!tamu?.length && <p className="text-sm text-muted-foreground">Belum ada tamu tercatat.</p>}
            {tamu?.map((t: any) => (
              <div key={t.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{t.nama_tamu}</div>
                    {t.jabatan && <div className="text-xs text-muted-foreground">{t.jabatan}{t.instansi && ` · ${t.instansi}`}</div>}
                    <div className="mt-1 text-xs">Rombongan: {t.jumlah_rombongan}</div>
                  </div>
                  {isAdmin && <Button size="icon" variant="ghost" onClick={() => delTamu.mutate(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AssignDialog({ kegiatanId, tanggal, jamMulai, jamSelesai }: { kegiatanId: string; tanggal: string; jamMulai: string; jamSelesai: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [mahasiswaId, setMahasiswaId] = useState("");
  const [peran, setPeran] = useState<"lo"|"protokoler">("lo");

  const { data: mhs } = useQuery({
    queryKey: ["mahasiswa-aktif"],
    queryFn: () => mahasiswaApi.list(),
  });

  const { data: conflicts } = useQuery({
    queryKey: ["conflict", mahasiswaId, tanggal],
    enabled: !!mahasiswaId,
    queryFn: () => penugasanApi.byMahasiswa(mahasiswaId).then((list: any[]) =>
      list.filter((p: any) => {
        const k = p.kegiatan;
        if (!k || k.id === kegiatanId || k.tanggal !== tanggal) return false;
        return !(k.jam_selesai <= jamMulai || k.jam_mulai >= jamSelesai);
      })
    ),
  });

  const save = useMutation({
    mutationFn: async () => {
      await penugasanApi.create({ kegiatan_id: kegiatanId, mahasiswa_id: mahasiswaId, peran });
    },
    onSuccess: () => { toast.success("Penugasan ditambahkan"); qc.invalidateQueries({ queryKey: ["penugasan-kegiatan", kegiatanId] }); setOpen(false); setMahasiswaId(""); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><UserPlus className="mr-1.5 h-4 w-4" />Tugaskan</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Tugaskan Mahasiswa</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label>Mahasiswa</Label>
            <Select value={mahasiswaId} onValueChange={setMahasiswaId}>
              <SelectTrigger><SelectValue placeholder="Pilih mahasiswa" /></SelectTrigger>
              <SelectContent>{mhs?.map((m: any) => <SelectItem key={m.id} value={m.id}>{m.nama_lengkap} ({m.nim})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Peran</Label>
            <Select value={peran} onValueChange={(v) => setPeran(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="lo">LO (Liaison Officer)</SelectItem>
                <SelectItem value="protokoler">Protokoler</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {!!conflicts?.length && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
              <div className="flex items-center gap-1.5 font-medium text-destructive"><AlertTriangle className="h-4 w-4" />Konflik Jadwal</div>
              <ul className="mt-1 list-disc pl-5 text-destructive/80">
                {conflicts.map((c: any) => <li key={c.kegiatan.id}>{c.kegiatan.nama_kegiatan} ({c.kegiatan.jam_mulai.slice(0,5)}–{c.kegiatan.jam_selesai.slice(0,5)})</li>)}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter><Button onClick={() => save.mutate()} disabled={!mahasiswaId || save.isPending}>Simpan</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TamuDialog({ kegiatanId }: { kegiatanId: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nama_tamu: "", jabatan: "", instansi: "", jumlah_rombongan: 1 });
  const save = useMutation({
    mutationFn: async () => {
      await fetch('/api/tamu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, kegiatan_id: kegiatanId }) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tamu", kegiatanId] }); setOpen(false); setForm({ nama_tamu: "", jabatan: "", instansi: "", jumlah_rombongan: 1 }); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="icon" variant="outline"><Plus className="h-4 w-4" /></Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Tambah Tamu</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="grid gap-3">
          <div><Label>Nama Tamu</Label><Input required value={form.nama_tamu} onChange={(e) => setForm({ ...form, nama_tamu: e.target.value })} /></div>
          <div><Label>Jabatan</Label><Input value={form.jabatan} onChange={(e) => setForm({ ...form, jabatan: e.target.value })} /></div>
          <div><Label>Instansi</Label><Input value={form.instansi} onChange={(e) => setForm({ ...form, instansi: e.target.value })} /></div>
          <div><Label>Jumlah Rombongan</Label><Input type="number" min={1} value={form.jumlah_rombongan} onChange={(e) => setForm({ ...form, jumlah_rombongan: Number(e.target.value) })} /></div>
          <DialogFooter><Button type="submit">Simpan</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
