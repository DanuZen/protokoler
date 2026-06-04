import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ClipboardList, Users, BarChart3, ShieldCheck, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SiProto – Sistem Informasi Protokoler Universitas" },
      { name: "description", content: "Kelola data anggota protokoler, kegiatan, penugasan LO, dan laporan dalam satu platform digital." },
      { property: "og:title", content: "SiProto – Sistem Informasi Protokoler Universitas" },
      { property: "og:description", content: "Platform digital untuk mengelola tim protokoler universitas dengan efisien dan transparan." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-gradient-hero text-primary-foreground shadow-card">
              <ShieldCheck className="h-5 w-5 text-gold" />
            </div>
            <span className="font-display text-xl font-bold text-primary">SiProto</span>
          </Link>
          <nav className="hidden gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#fitur" className="hover:text-foreground">Fitur</a>
            <a href="#alur" className="hover:text-foreground">Alur Kerja</a>
            <a href="#role" className="hover:text-foreground">Pengguna</a>
          </nav>
          <Link to="/auth"><Button>Masuk</Button></Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/5 px-3 py-1 text-xs font-medium text-gold">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Sistem Internal Universitas
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-tight md:text-6xl">
              Manajemen Protokoler Universitas, <span className="text-gold">Digital & Terpusat</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-primary-foreground/80">
              SiProto membantu unit protokoler mengelola data mahasiswa, perencanaan kegiatan resmi, penugasan LO, hingga rekap dan laporan — semuanya dalam satu platform.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/auth">
                <Button size="lg" className="bg-gold text-gold-foreground hover:opacity-90">Mulai Sekarang</Button>
              </Link>
              <a href="#fitur">
                <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-primary-foreground hover:bg-white/10">
                  Lihat Fitur
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" className="container mx-auto px-6 py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-gold">Modul Inti</p>
          <h2 className="mt-2 text-4xl font-bold text-foreground">Semua kebutuhan protokoler dalam satu sistem</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group rounded-xl border bg-card p-6 shadow-card transition hover:shadow-elegant">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-gold text-gold-foreground">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section id="role" className="bg-secondary/40 py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-gold">Pengguna</p>
            <h2 className="mt-2 text-4xl font-bold">Dirancang untuk tiga peran utama</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {roles.map((r) => (
              <div key={r.title} className="rounded-xl border bg-card p-8 shadow-card">
                <div className="font-display text-3xl font-bold text-primary">{r.no}</div>
                <h3 className="mt-4 text-xl font-semibold">{r.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flow */}
      <section id="alur" className="container mx-auto px-6 py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-gold">Alur Kerja</p>
          <h2 className="mt-2 text-4xl font-bold">Dari perencanaan hingga laporan</h2>
        </div>
        <ol className="mt-12 grid gap-4 md:grid-cols-4">
          {flow.map((s, i) => (
            <li key={s} className="rounded-xl border bg-card p-6 shadow-card">
              <div className="font-display text-2xl font-bold text-gold">0{i + 1}</div>
              <p className="mt-3 font-medium">{s}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex justify-center">
          <Link to="/auth"><Button size="lg">Masuk ke Dashboard</Button></Link>
        </div>
      </section>

      <footer className="border-t bg-primary py-8 text-primary-foreground/70">
        <div className="container mx-auto px-6 text-center text-sm">
          © {new Date().getFullYear()} SiProto · Sistem Informasi Protokoler Universitas
        </div>
      </footer>
    </div>
  );
}

const features = [
  { icon: Users, title: "Database Mahasiswa", desc: "Pusat data anggota tim protokoler dengan filter NIM, prodi, dan angkatan. Lengkap dengan riwayat tugas." },
  { icon: CalendarDays, title: "Manajemen Kegiatan", desc: "Catat kegiatan resmi: wisuda, kunjungan, seminar, pelantikan. Tampilan kalender terintegrasi." },
  { icon: ClipboardList, title: "Penugasan LO", desc: "Tugaskan mahasiswa sebagai LO atau staf protokoler. Sistem mendeteksi konflik jadwal otomatis." },
  { icon: Bell, title: "Notifikasi & Reminder", desc: "Mahasiswa menerima notifikasi penugasan dan reminder H-1 / H-0 secara otomatis." },
  { icon: BarChart3, title: "Laporan & Rekap", desc: "Generate laporan kegiatan per periode, rekap jam tugas, dan dashboard statistik." },
  { icon: ShieldCheck, title: "Role-Based Access", desc: "Akses sesuai peran: Admin, Mahasiswa, dan Pimpinan dengan hak yang berbeda." },
];

const roles = [
  { no: "01", title: "Admin / Staf Protokol", desc: "Mengelola data mahasiswa, membuat kegiatan, menentukan penugasan, dan mengekspor laporan." },
  { no: "02", title: "Mahasiswa Protokoler", desc: "Melihat jadwal tugas pribadi, detail kegiatan, dan mengkonfirmasi kesediaan bertugas." },
  { no: "03", title: "Pimpinan / Manajemen", desc: "Memantau ringkasan kegiatan, performa mahasiswa, dan mengakses laporan agregat." },
];

const flow = [
  "Admin membuat kegiatan baru",
  "Mahasiswa ditugaskan & dinotifikasi",
  "Mahasiswa konfirmasi & bertugas",
  "Sistem rekap & laporkan otomatis",
];
