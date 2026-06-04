"use client";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { mahasiswaApi } from "@/lib/api";
import { useAuth, useRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, Users, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

type Mhs = {
  id: string; nim: string; nama_lengkap: string; prodi: string; angkatan: number;
  no_hp: string | null; email: string | null; status: "aktif"|"tidak_aktif"|"cuti";
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

function StatusBadge({ status }: { status: Mhs["status"] }) {
  const map = {
    aktif: "bg-emerald-100 text-emerald-700 border-emerald-200",
    tidak_aktif: "bg-slate-100 text-slate-500 border-slate-200",
    cuti: "bg-amber-100 text-amber-700 border-amber-200"
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status]}`}>{status.replace("_", " ")}</span>;
}

export default function Page() {
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const isAdmin = role === "admin";
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Mhs | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["mahasiswa"],
    queryFn: () => mahasiswaApi.list() as Promise<Mhs[]>,
  });

  const del = useMutation({
    mutationFn: (id: string) => mahasiswaApi.remove(id),
    onSuccess: () => { toast.success("Mahasiswa dihapus"); qc.invalidateQueries({ queryKey: ["mahasiswa"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = (data ?? []).filter((m) => {
    const q = search.toLowerCase();
    return !q || m.nama_lengkap.toLowerCase().includes(q) || m.nim.toLowerCase().includes(q) || m.prodi.toLowerCase().includes(q) || String(m.angkatan).includes(q);
  });

  const aktifCount = (data ?? []).filter(m => m.status === "aktif").length;
  const cutiCount = (data ?? []).filter(m => m.status === "cuti").length;
  const tidakAktifCount = (data ?? []).filter(m => m.status === "tidak_aktif").length;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 tracking-tight">Database Mahasiswa</h1>
          <p className="mt-2 text-slate-500 text-base">Pusat data anggota tim protokoler universitas.</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button className="h-11 rounded-xl px-5 shadow-sm">
                <Plus className="mr-2 h-4 w-4" />Tambah Mahasiswa
              </Button>
            </DialogTrigger>
            <MahasiswaForm key={editing?.id ?? "new"} editing={editing} onDone={() => setOpen(false)} />
          </Dialog>
        )}
      </motion.div>

      {/* Stats Row */}
      <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-3 gap-4">
        {[
          { label: "Mahasiswa Aktif", value: aktifCount, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Sedang Cuti", value: cutiCount, icon: Users, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Tidak Aktif", value: tidakAktifCount, icon: UserX, color: "text-slate-500", bg: "bg-slate-100" },
        ].map((s) => (
          <motion.div key={s.label} variants={fadeUp} className="rounded-2xl border border-slate-100 bg-white p-5 flex items-center gap-4 shadow-sm">
            <div className={`${s.bg} h-11 w-11 rounded-xl flex items-center justify-center`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{s.value}</div>
              <div className="text-xs font-medium text-slate-500">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-10 bg-slate-50 border-slate-200 rounded-xl h-10" placeholder="Cari nama, NIM, prodi..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Badge variant="outline" className="text-slate-500 font-medium">
            {filtered.length} dari {data?.length ?? 0} data
          </Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="font-bold text-slate-600 pl-6">NIM</TableHead>
              <TableHead className="font-bold text-slate-600">Nama</TableHead>
              <TableHead className="font-bold text-slate-600">Prodi</TableHead>
              <TableHead className="font-bold text-slate-600">Angkatan</TableHead>
              <TableHead className="font-bold text-slate-600">Kontak</TableHead>
              <TableHead className="font-bold text-slate-600">Status</TableHead>
              {isAdmin && <TableHead className="font-bold text-slate-600 text-right pr-6">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell colSpan={7}>
                    <div className="h-5 bg-slate-100 rounded-full w-full"></div>
                  </TableCell>
                </TableRow>
              ))
            )}
            {!isLoading && !filtered.length && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-400 py-16">
                  <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Tidak ada data mahasiswa ditemukan.</p>
                </TableCell>
              </TableRow>
            )}
            {filtered.map((m, i) => (
              <motion.tr
                key={m.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
              >
                <TableCell className="font-mono text-xs text-slate-500 pl-6">{m.nim}</TableCell>
                <TableCell className="font-semibold text-slate-800">{m.nama_lengkap}</TableCell>
                <TableCell className="text-slate-600">{m.prodi}</TableCell>
                <TableCell className="text-slate-600">{m.angkatan}</TableCell>
                <TableCell className="text-sm text-slate-500">{m.no_hp ?? m.email ?? "—"}</TableCell>
                <TableCell><StatusBadge status={m.status} /></TableCell>
                {isAdmin && (
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600" onClick={() => { setEditing(m); setOpen(true); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-500" onClick={() => { if (confirm(`Hapus ${m.nama_lengkap}?`)) del.mutate(m.id); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
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
      if (editing) await mahasiswaApi.update(editing.id, payload);
      else await mahasiswaApi.create(payload);
    },
    onSuccess: () => { toast.success(editing ? "Data diperbarui" : "Mahasiswa ditambahkan"); qc.invalidateQueries({ queryKey: ["mahasiswa"] }); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">{editing ? "Edit Mahasiswa" : "Tambah Mahasiswa"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="grid gap-4 mt-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label className="text-sm font-semibold">NIM</Label><Input required value={form.nim} onChange={(e) => setForm({ ...form, nim: e.target.value })} className="rounded-lg" /></div>
          <div className="space-y-1.5"><Label className="text-sm font-semibold">Angkatan</Label><Input type="number" required value={form.angkatan} onChange={(e) => setForm({ ...form, angkatan: Number(e.target.value) })} className="rounded-lg" /></div>
        </div>
        <div className="space-y-1.5"><Label className="text-sm font-semibold">Nama Lengkap</Label><Input required value={form.nama_lengkap} onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })} className="rounded-lg" /></div>
        <div className="space-y-1.5"><Label className="text-sm font-semibold">Program Studi</Label><Input required value={form.prodi} onChange={(e) => setForm({ ...form, prodi: e.target.value })} className="rounded-lg" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label className="text-sm font-semibold">No. HP</Label><Input value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} className="rounded-lg" /></div>
          <div className="space-y-1.5"><Label className="text-sm font-semibold">Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-lg" /></div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Mhs["status"] })}>
            <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="tidak_aktif">Tidak Aktif</SelectItem>
              <SelectItem value="cuti">Cuti</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={save.isPending} className="w-full rounded-lg">
            {save.isPending ? "Menyimpan..." : editing ? "Perbarui Data" : "Simpan Mahasiswa"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
