import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@backend/integrations/supabase/client";
import { useAuth, useRole } from "@frontend/hooks/use-auth";
import { Button } from "@frontend/components/ui/button";
import { Input } from "@frontend/components/ui/input";
import { Label } from "@frontend/components/ui/label";
import { Textarea } from "@frontend/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@frontend/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@frontend/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@frontend/components/ui/select";
import { Badge } from "@frontend/components/ui/badge";
import { Plus, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/kegiatan")({ component: Page });

type Bentuk = "wisuda"|"kunjungan"|"seminar"|"pelantikan"|"rapat_resmi"|"lainnya";
type Status = "draft"|"terkonfirmasi"|"selesai"|"batal";
type Keg = { id: string; nama_kegiatan: string; bentuk: Bentuk; tanggal: string; jam_mulai: string; jam_selesai: string; lokasi: string; deskripsi: string | null; status: Status };

function Page() {
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const isAdmin = role === "admin";
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["kegiatan"],
    queryFn: async () => {
      const { data, error } = await supabase.from("kegiatan").select("*").order("tanggal", { ascending: false });
      if (error) throw error;
      return data as Keg[];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Kegiatan</h1>
          <p className="text-muted-foreground">Daftar kegiatan protokoler universitas.</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-1.5 h-4 w-4" />Buat Kegiatan</Button></DialogTrigger>
            <KegiatanForm onDone={() => setOpen(false)} />
          </Dialog>
        )}
      </div>

      {isLoading && <p className="text-muted-foreground">Memuat...</p>}
      {!isLoading && !data?.length && (
        <Card className="shadow-card"><CardContent className="py-12 text-center text-muted-foreground">Belum ada kegiatan.</CardContent></Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((k) => (
          <Link key={k.id} to="/kegiatan/$id" params={{ id: k.id }}>
            <Card className="shadow-card transition hover:shadow-elegant h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{k.nama_kegiatan}</CardTitle>
                  <StatusBadge status={k.status} />
                </div>
                <Badge variant="outline" className="w-fit capitalize">{k.bentuk.replace("_", " ")}</Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{new Date(k.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} · {k.jam_mulai.slice(0,5)}–{k.jam_selesai.slice(0,5)}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{k.lokasi}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    draft: "bg-muted text-muted-foreground",
    terkonfirmasi: "bg-primary/10 text-primary",
    selesai: "bg-success/15 text-success",
    batal: "bg-destructive/15 text-destructive",
  };
  return <span className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${map[status]}`}>{status}</span>;
}

function KegiatanForm({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    nama_kegiatan: "", bentuk: "lainnya" as Bentuk, tanggal: new Date().toISOString().slice(0,10),
    jam_mulai: "08:00", jam_selesai: "12:00", lokasi: "", deskripsi: "", status: "draft" as Status,
  });
  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("kegiatan").insert(form);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Kegiatan dibuat"); qc.invalidateQueries({ queryKey: ["kegiatan"] }); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>Buat Kegiatan</DialogTitle></DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="grid gap-4">
        <div><Label>Nama Kegiatan</Label><Input required value={form.nama_kegiatan} onChange={(e) => setForm({ ...form, nama_kegiatan: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Bentuk</Label>
            <Select value={form.bentuk} onValueChange={(v) => setForm({ ...form, bentuk: v as Bentuk })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="wisuda">Wisuda</SelectItem>
                <SelectItem value="kunjungan">Kunjungan Tamu</SelectItem>
                <SelectItem value="seminar">Seminar</SelectItem>
                <SelectItem value="pelantikan">Pelantikan</SelectItem>
                <SelectItem value="rapat_resmi">Rapat Resmi</SelectItem>
                <SelectItem value="lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Status })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
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
          <div><Label>Tanggal</Label><Input type="date" required value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} /></div>
          <div><Label>Jam Mulai</Label><Input type="time" required value={form.jam_mulai} onChange={(e) => setForm({ ...form, jam_mulai: e.target.value })} /></div>
          <div><Label>Jam Selesai</Label><Input type="time" required value={form.jam_selesai} onChange={(e) => setForm({ ...form, jam_selesai: e.target.value })} /></div>
        </div>
        <div><Label>Lokasi</Label><Input required value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} /></div>
        <div><Label>Deskripsi</Label><Textarea rows={3} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} /></div>
        <DialogFooter><Button type="submit" disabled={save.isPending}>{save.isPending ? "Menyimpan..." : "Simpan"}</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}
