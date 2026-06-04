import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Check, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/jadwal-saya")({ component: Page });

function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["jadwal-saya", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: mhs } = await supabase.from("mahasiswa").select("id").eq("user_id", user!.id).maybeSingle();
      if (!mhs) return [];
      const { data: list, error } = await supabase.from("penugasan")
        .select("id, peran, status_konfirmasi, kegiatan:kegiatan_id(id, nama_kegiatan, bentuk, tanggal, jam_mulai, jam_selesai, lokasi, status)")
        .eq("mahasiswa_id", mhs.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return list;
    },
  });

  const konfirmasi = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "dikonfirmasi"|"ditolak" }) => {
      const { error } = await supabase.from("penugasan").update({ status_konfirmasi: status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Status diperbarui"); qc.invalidateQueries({ queryKey: ["jadwal-saya"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Jadwal Tugas Saya</h1>
        <p className="text-muted-foreground">Daftar penugasan kegiatan yang ditugaskan kepada Anda.</p>
      </div>

      {!data?.length && (
        <Card className="shadow-card"><CardContent className="py-12 text-center text-muted-foreground">
          Belum ada penugasan. Pastikan akun Anda sudah terhubung ke data mahasiswa oleh admin.
        </CardContent></Card>
      )}

      <div className="grid gap-4">
        {data?.map((p: any) => p.kegiatan && (
          <Card key={p.id} className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link to="/kegiatan/$id" params={{ id: p.kegiatan.id }}>
                    <CardTitle className="text-lg hover:text-primary">{p.kegiatan.nama_kegiatan}</CardTitle>
                  </Link>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{new Date(p.kegiatan.tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {p.kegiatan.jam_mulai.slice(0,5)}–{p.kegiatan.jam_selesai.slice(0,5)}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{p.kegiatan.lokasi}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className="uppercase">{p.peran}</Badge>
                  <Badge variant="outline" className="capitalize">{p.status_konfirmasi}</Badge>
                </div>
              </div>
            </CardHeader>
            {p.status_konfirmasi === "pending" && (
              <CardContent className="flex gap-2">
                <Button size="sm" onClick={() => konfirmasi.mutate({ id: p.id, status: "dikonfirmasi" })}><Check className="mr-1 h-4 w-4" />Konfirmasi</Button>
                <Button size="sm" variant="outline" onClick={() => konfirmasi.mutate({ id: p.id, status: "ditolak" })}><X className="mr-1 h-4 w-4" />Tidak Bisa</Button>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
