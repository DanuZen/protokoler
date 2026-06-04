import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@backend/integrations/supabase/client";
import { useAuth, useRole } from "@frontend/hooks/use-auth";
import { Button } from "@frontend/components/ui/button";
import { Input } from "@frontend/components/ui/input";
import { Label } from "@frontend/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@frontend/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@frontend/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@frontend/components/ui/select";
import { Badge } from "@frontend/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@frontend/components/ui/table";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/mahasiswa")({ component: Page });

type Mhs = {
  id: string; nim: string; nama_lengkap: string; prodi: string; angkatan: number;
  no_hp: string | null; email: string | null; status: "aktif"|"tidak_aktif"|"cuti";
};

function Page() {
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const isAdmin = role === "admin";
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Mhs | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["mahasiswa"],
    queryFn: async () => {
      const { data, error } = await supabase.from("mahasiswa").select("*").order("nama_lengkap");
      if (error) throw error;
      return data as Mhs[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mahasiswa").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Mahasiswa dihapus"); qc.invalidateQueries({ queryKey: ["mahasiswa"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = (data ?? []).filter((m) => {
    const q = search.toLowerCase();
    return !q || m.nama_lengkap.toLowerCase().includes(q) || m.nim.toLowerCase().includes(q) || m.prodi.toLowerCase().includes(q) || String(m.angkatan).includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Database Mahasiswa</h1>
          <p className="text-muted-foreground">Pusat data anggota tim protokoler.</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild><Button><Plus className="mr-1.5 h-4 w-4" />Tambah Mahasiswa</Button></DialogTrigger>
            <MahasiswaForm key={editing?.id ?? "new"} editing={editing} onDone={() => setOpen(false)} />
          </Dialog>
        )}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Cari nama, NIM, prodi..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIM</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Prodi</TableHead>
                <TableHead>Angkatan</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead className="text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Memuat...</TableCell></TableRow>}
              {!isLoading && !filtered.length && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Tidak ada data.</TableCell></TableRow>}
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs">{m.nim}</TableCell>
                  <TableCell className="font-medium">{m.nama_lengkap}</TableCell>
                  <TableCell>{m.prodi}</TableCell>
                  <TableCell>{m.angkatan}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.no_hp ?? m.email ?? "—"}</TableCell>
                  <TableCell><StatusBadge status={m.status} /></TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(m); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => { if (confirm(`Hapus ${m.nama_lengkap}?`)) del.mutate(m.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: Mhs["status"] }) {
  const map = { aktif: "bg-success/15 text-success", tidak_aktif: "bg-muted text-muted-foreground", cuti: "bg-warning/15 text-warning" };
  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${map[status]}`}>{status.replace("_", " ")}</span>;
}

function MahasiswaForm({ editing, onDone }: { editing: Mhs | null; onDone: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    nim: editing?.nim ?? "",
    nama_lengkap: editing?.nama_lengkap ?? "",
    prodi: editing?.prodi ?? "",
    angkatan: editing?.angkatan ?? new Date().getFullYear(),
    no_hp: editing?.no_hp ?? "",
    email: editing?.email ?? "",
    status: editing?.status ?? "aktif" as Mhs["status"],
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, angkatan: Number(form.angkatan) };
      if (editing) {
        const { error } = await supabase.from("mahasiswa").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("mahasiswa").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(editing ? "Data diperbarui" : "Mahasiswa ditambahkan"); qc.invalidateQueries({ queryKey: ["mahasiswa"] }); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>{editing ? "Edit Mahasiswa" : "Tambah Mahasiswa"}</DialogTitle></DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="grid gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>NIM</Label><Input required value={form.nim} onChange={(e) => setForm({ ...form, nim: e.target.value })} /></div>
          <div><Label>Angkatan</Label><Input type="number" required value={form.angkatan} onChange={(e) => setForm({ ...form, angkatan: Number(e.target.value) })} /></div>
        </div>
        <div><Label>Nama Lengkap</Label><Input required value={form.nama_lengkap} onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })} /></div>
        <div><Label>Program Studi</Label><Input required value={form.prodi} onChange={(e) => setForm({ ...form, prodi: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>No. HP</Label><Input value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Mhs["status"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="tidak_aktif">Tidak Aktif</SelectItem>
              <SelectItem value="cuti">Cuti</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter><Button type="submit" disabled={save.isPending}>{save.isPending ? "Menyimpan..." : "Simpan"}</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}
