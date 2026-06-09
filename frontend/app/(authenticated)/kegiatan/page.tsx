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
import { 
  Plus, MapPin, Clock, CalendarDays, Search,
  GraduationCap, Handshake, Megaphone, Landmark, ClipboardList
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Bentuk = "wisuda"|"kunjungan"|"seminar"|"pelantikan"|"rapat_resmi"|"lainnya";
type Status = "draft"|"terkonfirmasi"|"selesai"|"batal"|"terjadwal"|"berlangsung";
type Keg = { id: string; nama_kegiatan: string; bentuk: Bentuk; tanggal: string; jam_mulai: string; jam_selesai: string; lokasi: string; deskripsi: string | null; status: Status | string };

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-500 border-slate-200" },
  terkonfirmasi: { label: "Terkonfirmasi", color: "bg-blue-100 text-blue-700 border-blue-200" },
  terjadwal: { label: "Terjadwal", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  berlangsung: { label: "Berlangsung", color: "bg-amber-100 text-amber-700 border-amber-200" },
  selesai: { label: "Selesai", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  batal: { label: "Batal", color: "bg-red-100 text-red-500 border-red-200" },
};

const BentukIcon = ({ bentuk, className }: { bentuk: string, className?: string }) => {
  switch (bentuk) {
    case "wisuda": return <GraduationCap className={className} />;
    case "kunjungan": return <Handshake className={className} />;
    case "seminar": return <Megaphone className={className} />;
    case "pelantikan": return <Landmark className={className} />;
    case "rapat_resmi": return <ClipboardList className={className} />;
    default: return <CalendarDays className={className} />;
  }
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
    <div className="min-h-screen bg-transparent">
      {/* ─── Hero Banner ─── */}
      <div className="relative px-6 md:px-10 pt-24 pb-32 overflow-hidden">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight">Manajemen Kegiatan</h1>
            <p className="mt-3 text-slate-300 text-lg">Daftar kegiatan protokoler universitas.</p>
          </div>
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="h-11 rounded-none px-6 shadow-sm bg-[#C9A84C] hover:bg-[#b8963f] text-slate-900 font-bold">
                  <Plus className="mr-2 h-4 w-4" /> Buat Kegiatan
                </Button>
              </DialogTrigger>
              <KegiatanForm onDone={() => setOpen(false)} />
            </Dialog>
          )}
        </motion.div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="bg-slate-50 min-h-screen pt-4 pb-12">
        <div className="px-6 md:px-10 -mt-10 relative z-10 space-y-6">

      {/* Search + count */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-4 rounded-none">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input className="pl-12 bg-slate-50 border-slate-200 rounded-none h-11 text-base focus-visible:ring-slate-900" placeholder="Cari kegiatan, lokasi..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="text-sm font-semibold text-slate-500 shrink-0 bg-slate-50 px-4 py-2 border border-slate-200">
          Menampilkan <span className="text-slate-900">{filtered.length}</span> hasil
        </div>
      </motion.div>

      {isLoading && (
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 w-full rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && !filtered.length && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-none border border-slate-200 bg-white p-16 text-center shadow-sm">
          <CalendarDays className="h-14 w-14 mx-auto mb-4 text-slate-300" />
          <h3 className="font-bold text-slate-800 text-xl mb-2">Belum ada kegiatan</h3>
          <p className="text-slate-500 text-sm">Buat kegiatan baru dengan menekan tombol "Buat Kegiatan" di atas.</p>
        </motion.div>
      )}

      <motion.div initial="hidden" animate="visible" variants={stagger} className="bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filtered.map((k) => (
            <motion.div key={k.id} variants={cardAnim} className="group hover:bg-slate-50/60 transition-colors">
              <Link href={`/kegiatan/${k.id}`} className="block">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-6 py-5">
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <div className="h-8 w-8 bg-slate-100 border border-slate-200 rounded-none flex items-center justify-center flex-shrink-0 group-hover:bg-slate-900 group-hover:text-[#C9A84C] transition-colors">
                        <BentukIcon bentuk={k.bentuk} className="h-3.5 w-3.5 text-slate-500 group-hover:text-[#C9A84C] transition-colors" />
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold text-slate-500 border-slate-200 rounded-none">
                        {k.bentuk.replace("_", " ")}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900 text-lg group-hover:text-[#C9A84C] transition-colors truncate">{k.nama_kegiatan}</h3>
                  </div>
                  
                  <div className="flex flex-col gap-1 min-w-[200px]">
                    <div className="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
                      <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{new Date(k.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span className="text-slate-400 text-xs">· {k.jam_mulai.slice(0,5)} WIB</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                      <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" />
                      <span className="truncate">{k.lokasi}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-end md:w-[140px]">
                    <span className={cn("inline-flex items-center rounded-none px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border", statusConfig[k.status]?.color || "bg-slate-100 text-slate-500 border-slate-200")}>
                      {statusConfig[k.status]?.label || k.status}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
      </div>
    </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <span className={cn("rounded-none px-2 py-0.5 text-xs font-bold uppercase tracking-wider border", statusConfig[status]?.color || "bg-slate-100 text-slate-500 border-slate-200")}>{status}</span>;
}

function KegiatanForm({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    nama_kegiatan: "", bentuk: "lainnya" as Bentuk, tanggal: new Date().toISOString().slice(0,10),
    jam_mulai: "08:00", jam_selesai: "12:00", tempat: "", peserta: "", petugas: "", rundown: "", status: "draft" as Status,
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
          <div className="flex gap-3">
            <Input required value={form.nama_kegiatan} onChange={(e) => setForm({ ...form, nama_kegiatan: e.target.value })} className="rounded-none flex-1" placeholder="Contoh: Wisuda Periode 130" />
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Status })}>
              <SelectTrigger className="rounded-none w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="terkonfirmasi">Terkonfirmasi</SelectItem>
                <SelectItem value="selesai">Selesai</SelectItem>
                <SelectItem value="batal">Batal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5"><Label className="text-sm font-semibold">Tanggal</Label><Input type="date" required value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="rounded-none" /></div>
          <div className="space-y-1.5"><Label className="text-sm font-semibold">Jam Mulai</Label><Input type="time" required value={form.jam_mulai} onChange={(e) => setForm({ ...form, jam_mulai: e.target.value })} className="rounded-none" /></div>
          <div className="space-y-1.5"><Label className="text-sm font-semibold">Jam Selesai</Label><Input type="time" required value={form.jam_selesai} onChange={(e) => setForm({ ...form, jam_selesai: e.target.value })} className="rounded-none" /></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label className="text-sm font-semibold">Tempat</Label><Input required value={form.tempat} onChange={(e) => setForm({ ...form, tempat: e.target.value })} className="rounded-none" placeholder="Nama gedung/ruangan" /></div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Bentuk Acara</Label>
            <Select value={form.bentuk} onValueChange={(v) => setForm({ ...form, bentuk: v as Bentuk })}>
              <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="wisuda"><div className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Wisuda</div></SelectItem>
                <SelectItem value="kunjungan"><div className="flex items-center gap-2"><Handshake className="h-4 w-4" /> Kunjungan Tamu</div></SelectItem>
                <SelectItem value="seminar"><div className="flex items-center gap-2"><Megaphone className="h-4 w-4" /> Seminar</div></SelectItem>
                <SelectItem value="pelantikan"><div className="flex items-center gap-2"><Landmark className="h-4 w-4" /> Pelantikan</div></SelectItem>
                <SelectItem value="rapat_resmi"><div className="flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Rapat Resmi</div></SelectItem>
                <SelectItem value="lainnya"><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Lainnya</div></SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label className="text-sm font-semibold">Peserta</Label><Input required value={form.peserta} onChange={(e) => setForm({ ...form, peserta: e.target.value })} className="rounded-none" placeholder="Contoh: 500 Mahasiswa" /></div>
          <div className="space-y-1.5"><Label className="text-sm font-semibold">Petugas Protokoler</Label><Input required value={form.petugas} onChange={(e) => setForm({ ...form, petugas: e.target.value })} className="rounded-none" placeholder="Jumlah atau nama petugas" /></div>
        </div>

        <div className="space-y-1.5"><Label className="text-sm font-semibold">Rundown / Deskripsi</Label><Textarea rows={4} value={form.rundown} onChange={(e) => setForm({ ...form, rundown: e.target.value })} className="rounded-none" placeholder="Detail urutan acara atau catatan penting" /></div>
        <DialogFooter>
          <Button type="submit" disabled={save.isPending} className="w-full rounded-none">
            {save.isPending ? "Menyimpan..." : "Buat Kegiatan"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
