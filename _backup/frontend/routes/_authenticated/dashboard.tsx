import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@backend/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@frontend/components/ui/card";
import { Badge } from "@frontend/components/ui/badge";
import { Users, CalendarDays, ClipboardList, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [mhs, keg, kegUpcoming, peng] = await Promise.all([
        supabase.from("mahasiswa").select("id", { count: "exact", head: true }).eq("status", "aktif"),
        supabase.from("kegiatan").select("id", { count: "exact", head: true }),
        supabase.from("kegiatan").select("id", { count: "exact", head: true }).gte("tanggal", today).neq("status", "batal"),
        supabase.from("penugasan").select("id", { count: "exact", head: true }),
      ]);
      return {
        mahasiswa: mhs.count ?? 0,
        kegiatan: keg.count ?? 0,
        upcoming: kegUpcoming.count ?? 0,
        penugasan: peng.count ?? 0,
      };
    },
  });

  const { data: upcoming } = useQuery({
    queryKey: ["dashboard-upcoming"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("kegiatan")
        .select("id, nama_kegiatan, bentuk, tanggal, jam_mulai, lokasi, status")
        .gte("tanggal", today)
        .neq("status", "batal")
        .order("tanggal", { ascending: true })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  const cards = [
    { label: "Mahasiswa Aktif", value: stats?.mahasiswa ?? "—", icon: Users },
    { label: "Total Kegiatan", value: stats?.kegiatan ?? "—", icon: CalendarDays },
    { label: "Kegiatan Mendatang", value: stats?.upcoming ?? "—", icon: ClipboardList },
    { label: "Penugasan Tercatat", value: stats?.penugasan ?? "—", icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Ringkasan aktivitas tim protokoler universitas.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="font-display text-4xl font-bold text-primary">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Kegiatan Mendatang</CardTitle>
        </CardHeader>
        <CardContent>
          {!upcoming?.length && <p className="text-sm text-muted-foreground">Belum ada kegiatan terjadwal.</p>}
          <div className="space-y-2">
            {upcoming?.map((k) => (
              <Link key={k.id} to="/kegiatan/$id" params={{ id: k.id }} className="flex items-center justify-between rounded-lg border p-4 hover:bg-secondary/40">
                <div>
                  <div className="font-medium">{k.nama_kegiatan}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(k.tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {k.jam_mulai?.slice(0,5)} · {k.lokasi}
                  </div>
                </div>
                <Badge variant="outline" className="capitalize">{k.bentuk.replace("_", " ")}</Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
