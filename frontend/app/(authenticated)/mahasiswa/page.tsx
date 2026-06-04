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
    <div className="space-y-12 max-w-[1400px]">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-wrap items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-slate-900 tracking-tight">Database Mahasiswa</h1>
          <p className="mt-3 text-slate-500 text-lg">Pusat data anggota tim protokoler universitas.</p>
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

      {/* Stats Row - Flat Modern Style */}
      <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Mahasiswa Aktif", value: aktifCount, icon: UserCheck, color: "text-slate-900" },
          { label: "Sedang Cuti", value: cutiCount, icon: Users, color: "text-amber-600" },
          { label: "Tidak Aktif", value: tidakAktifCount, icon: UserX, color: "text-slate-500" },
        ].map((s) => (
          <motion.div key={s.label} variants={fadeUp} className="group border-l-2 border-slate-200/60 pl-6 hover:border-slate-900 transition-colors">
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{s.label}</div>
            <div className={`text-6xl font-display font-light tracking-tighter ${s.color}`}>
              {s.value}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="pt-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input className="pl-12 bg-transparent border-slate-300 rounded-full h-12 text-base focus-visible:ring-slate-900" placeholder="Cari nama, NIM, prodi..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="text-sm font-semibold text-slate-500">
            Menampilkan {filtered.length} hasil
          </div>
        </div>

        <Table className="text-base">
          <TableHeader>
            <TableRow className="border-b-2 border-slate-900 hover:bg-transparent">
              <TableHead className="font-bold text-slate-900 py-4 w-[120px]">NIM</TableHead>
              <TableHead className="font-bold text-slate-900 py-4">Nama Lengkap</TableHead>
              <TableHead className="font-bold text-slate-900 py-4">Program Studi</TableHead>
              <TableHead className="font-bold text-slate-900 py-4">Angkatan</TableHead>
              <TableHead className="font-bold text-slate-900 py-4">Kontak</TableHead>
              <TableHead className="font-bold text-slate-900 py-4">Status</TableHead>
              {isAdmin && <TableHead className="font-bold text-slate-900 text-right py-4">Aksi</TableHead>}
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
                className="border-b border-slate-200/60 hover:bg-slate-100/50 transition-colors"
              >
                <TableCell className="font-mono text-sm text-slate-500 py-5">{m.nim}</TableCell>
                <TableCell className="font-bold text-slate-900 text-lg py-5">{m.nama_lengkap}</TableCell>
                <TableCell className="text-slate-600 py-5">{m.prodi}</TableCell>
                <TableCell className="text-slate-600 font-medium py-5">{m.angkatan}</TableCell>
                <TableCell className="text-slate-600 py-5">{m.no_hp ?? m.email ?? "—"}</TableCell>
                <TableCell className="py-5"><StatusBadge status={m.status} /></TableCell>
                {isAdmin && (
                  <TableCell className="text-right py-5">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="icon" variant="ghost" className="rounded-full hover:bg-slate-200" onClick={() => { setEditing(m); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="rounded-full hover:bg-red-50 hover:text-red-500" onClick={() => { if (confirm(`Hapus ${m.nama_lengkap}?`)) del.mutate(m.id); }}>
                        <Trash2 className="h-4 w-4" />
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
