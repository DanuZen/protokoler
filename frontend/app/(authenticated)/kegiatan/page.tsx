"use client";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { kegiatanApi } from "@/lib/api";
import { useAuth, useRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Clock, CalendarDays, Search } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Bentuk = "wisuda"|"kunjungan"|"seminar"|"pelantikan"|"rapat_resmi"|"lainnya";
type Status = "draft"|"terkonfirmasi"|"selesai"|"batal";
type Keg = { id: string; nama_kegiatan: string; bentuk: Bentuk; tanggal: string; jam_mulai: string; jam_selesai: string; lokasi: string; deskripsi: string | null; status: Status };

const statusConfig: Record<Status, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-500 border-slate-200" },
  terkonfirmasi: { label: "Terkonfirmasi", color: "bg-blue-100 text-blue-700 border-blue-200" },
  selesai: { label: "Selesai", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  batal: { label: "Batal", color: "bg-red-100 text-red-500 border-red-200" },
};

const bentukIcon: Record<Bentuk, string> = {
  wisuda: "🎓", kunjungan: "🤝", seminar: "📢", pelantikan: "🏛️", rapat_resmi: "📋", lainnya: "📅"
};

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const cardAnim = { hidden: { opacity: 0, y: 20, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } } };

export default function Page() {
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const isAdmin = role === "admin";
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["kegiatan"],
    queryFn: () => kegiatanApi.list() as Promise<Keg[]>,
  });

  const filtered = (data ?? []).filter((k) => {
    const q = search.toLowerCase();
    return !q || k.nama_kegiatan.toLowerCase().includes(q) || k.lokasi.toLowerCase().includes(q) || k.bentuk.includes(q);
  });

  return (
    <div className="space-y-12 max-w-[1400px]">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-slate-900 tracking-tight">Manajemen Kegiatan</h1>
          <p className="mt-3 text-slate-500 text-lg">Daftar kegiatan protokoler universitas.</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 rounded-xl px-5 shadow-sm">
                <Plus className="mr-2 h-4 w-4" /> Buat Kegiatan
              </Button>
            </DialogTrigger>
            <KegiatanForm onDone={() => setOpen(false)} />
          </Dialog>
        )}
      </motion.div>

      {/* Search + count */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-4 pt-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input className="pl-12 bg-transparent border-slate-300 rounded-full h-12 text-base focus-visible:ring-slate-900" placeholder="Cari kegiatan, lokasi..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <span className="text-sm font-semibold text-slate-500 shrink-0">Menampilkan {filtered.length} hasil</span>
      </motion.div>

      {isLoading && (
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 w-full rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && !filtered.length && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border border-slate-100 bg-white p-16 text-center shadow-sm">
          <CalendarDays className="h-14 w-14 mx-auto mb-4 text-slate-200" />
          <h3 className="font-bold text-slate-700 text-xl mb-2">Belum ada kegiatan</h3>
          <p className="text-slate-400 text-sm">Buat kegiatan baru dengan menekan tombol "Buat Kegiatan" di atas.</p>
        </motion.div>
      )}

      <motion.div initial="hidden" animate="visible" variants={stagger} className="flex flex-col">
        {filtered.map((k) => (
          <motion.div key={k.id} variants={cardAnim}>
            <Link href={`/kegiatan/${k.id}`} className="block group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 border-b border-slate-200/60 hover:bg-slate-50/80 transition-colors px-4 -mx-4 rounded-xl">
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{bentukIcon[k.bentuk]}</span>
                    <Badge variant="outline" className="text-xs uppercase tracking-wider font-bold text-slate-500 border-slate-300">
                      {k.bentuk.replace("_", " ")}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-slate-900 text-2xl group-hover:text-blue-600 transition-colors mt-1">{k.nama_kegiatan}</h3>
                </div>
                
                <div className="flex flex-col gap-1.5 min-w-[200px]">
                  <div className="flex items-center gap-2 text-slate-600 text-base">
                    <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="font-medium">{new Date(k.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <span className="text-slate-400">· {k.jam_mulai.slice(0,5)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <MapPin className="h-4 w-4 shrink-0 opacity-70" />
                    {k.lokasi}
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-end md:w-[140px]">
                  <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-sm font-bold capitalize", statusConfig[k.status].color)}>
                    {statusConfig[k.status].label}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  return <span className={cn("rounded px-2 py-0.5 text-xs font-medium capitalize", statusConfig[status].color)}>{status}</span>;
}

function KegiatanForm({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    nama_kegiatan: "", bentuk: "lainnya" as Bentuk, tanggal: new Date().toISOString().slice(0,10),
    jam_mulai: "08:00", jam_selesai: "12:00", lokasi: "", deskripsi: "", status: "draft" as Status,
  });
  const save = useMutation({
    mutationFn: async () => { await kegiatanApi.create(form); },
    onSuccess: () => { toast.success("Kegiatan dibuat"); qc.invalidateQueries({ queryKey: ["kegiatan"] }); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">Buat Kegiatan Baru</DialogTitle>
      </DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="grid gap-4 mt-2">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Nama Kegiatan</Label>
          <Input required value={form.nama_kegiatan} onChange={(e) => setForm({ ...form, nama_kegiatan: e.target.value })} className="rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Bentuk</Label>
            <Select value={form.bentuk} onValueChange={(v) => setForm({ ...form, bentuk: v as Bentuk })}>
              <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="wisuda">🎓 Wisuda</SelectItem>
                <SelectItem value="kunjungan">🤝 Kunjungan Tamu</SelectItem>
                <SelectItem value="seminar">📢 Seminar</SelectItem>
                <SelectItem value="pelantikan">🏛️ Pelantikan</SelectItem>
                <SelectItem value="rapat_resmi">📋 Rapat Resmi</SelectItem>
                <SelectItem value="lainnya">📅 Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Status })}>
              <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="terkonfirmasi">Terkonfirmasi</SelectItem>
                <SelectItem value="selesai">Selesai</SelectItem>
                <SelectItem value="batal">Batal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5"><Label className="text-sm font-semibold">Tanggal</Label><Input type="date" required value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="rounded-lg" /></div>
          <div className="space-y-1.5"><Label className="text-sm font-semibold">Jam Mulai</Label><Input type="time" required value={form.jam_mulai} onChange={(e) => setForm({ ...form, jam_mulai: e.target.value })} className="rounded-lg" /></div>
          <div className="space-y-1.5"><Label className="text-sm font-semibold">Jam Selesai</Label><Input type="time" required value={form.jam_selesai} onChange={(e) => setForm({ ...form, jam_selesai: e.target.value })} className="rounded-lg" /></div>
        </div>
        <div className="space-y-1.5"><Label className="text-sm font-semibold">Lokasi</Label><Input required value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} className="rounded-lg" /></div>
        <div className="space-y-1.5"><Label className="text-sm font-semibold">Deskripsi</Label><Textarea rows={3} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} className="rounded-lg" /></div>
        <DialogFooter>
          <Button type="submit" disabled={save.isPending} className="w-full rounded-lg">
            {save.isPending ? "Menyimpan..." : "Buat Kegiatan"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
