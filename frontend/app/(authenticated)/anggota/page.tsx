"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { protokolerApi } from "@/lib/api";
import { useAuth, useRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users, UserCheck, ShieldCheck, Check, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BadgeStatus } from "@/components/BadgeStatus";
import { BadgeKategori } from "@/components/BadgeKategori";
import { cn } from "@/lib/utils";

type Protokoler = {
  id: string;
  nim: string;
  nama_lengkap: string;
  prodi: string;
  departemen: string;
  fakultas: string;
  no_hp: string;
  status_akun: "pending" | "aktif" | "ditolak" | "tidak_aktif";
  total_kegiatan: number;
  kategori_sertifikat: "perak" | "silver" | "gold" | null;
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

export default function AnggotaPage() {
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const isAdmin = role === "admin";
  const qc = useQueryClient();
  
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"semua" | "pending">("semua");
  const [selected, setSelected] = useState<Protokoler | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [dialogMode, setDialogMode] = useState<"approve" | "reject" | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["protokoler"],
    queryFn: () => protokolerApi.list() as Promise<Protokoler[]>,
  });

  const updateStatus = useMutation({
    mutationFn: (args: { id: string, status_akun: string, catatan_penolakan?: string }) => 
      protokolerApi.update(args.id, { status_akun: args.status_akun, catatan_penolakan: args.catatan_penolakan }),
    onSuccess: (_, variables) => { 
      toast.success(variables.status_akun === "aktif" ? "Akun disetujui" : "Akun ditolak"); 
      qc.invalidateQueries({ queryKey: ["protokoler"] }); 
      setDialogMode(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const allData = data ?? [];
  const pendingCount = allData.filter(m => m.status_akun === "pending").length;
  const aktifCount = allData.filter(m => m.status_akun === "aktif").length;

  const filtered = allData.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.nama_lengkap.toLowerCase().includes(q) || m.nim.toLowerCase().includes(q);
    const matchTab = tab === "semua" ? m.status_akun !== "pending" : m.status_akun === "pending";
    return matchSearch && matchTab;
  });

  if (!isAdmin) {
    return <div className="p-8 text-red-500 font-bold">Akses Ditolak</div>;
  }

  return (
    <div className="flex flex-col h-auto md:h-dvh md:overflow-hidden pb-6 px-6 md:px-8 pt-4">
      
      {/* ─── HEADER SECTION ──────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 pb-6 border-b border-slate-200/60 shrink-0">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-700 to-red-800 shadow-lg shadow-red-700/20 text-white">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-red-800">
                Manajemen Tim
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 text-slate-900 drop-shadow-sm">Manajemen Anggota</h2>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Verifikasi dan kelola tim protokoler universitas.</p>
          </div>
        </div>
      </motion.div>

      {/* ─── Floating Stats Row ─── */}
      <section className="relative z-20 pb-0 shrink-0">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Menunggu Verifikasi", value: pendingCount, icon: ShieldCheck, hint: "Perlu ditinjau", color: "text-amber-600", bg: "bg-amber-100" },
            { label: "Protokoler Aktif", value: aktifCount, icon: UserCheck, hint: "Anggota aktif", color: "text-emerald-600", bg: "bg-emerald-100" },
            { label: "Total Terdaftar", value: allData.length, icon: Users, hint: "Seluruh anggota", color: "text-[#ff6b4a]", bg: "bg-red-50" },
          ].map((stat, i) => (
            <motion.div key={stat.label} variants={fadeUp}>
              <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] py-6 px-6 flex flex-col justify-between hover:shadow-lg hover:shadow-slate-100 transition-all group relative overflow-hidden h-full">
                <div className="flex items-center justify-between relative z-10">
                  <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                  <div className={cn("flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl transition-colors", stat.bg, stat.color)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 relative z-10">
                  <p className={cn("text-[32px] font-bold leading-tight", stat.color || "text-slate-900")}>{stat.value}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[11px] font-medium text-slate-400">{stat.hint}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── BODY CONTENT ─── */}
      <main className="flex-1 min-h-0 flex flex-col mt-6 overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl overflow-hidden flex flex-col h-full">
          
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-100 px-6 py-4 bg-white shrink-0">
            <div className="flex items-center p-1 bg-slate-50 border border-slate-200 rounded-2xl w-full md:w-auto">
              <button 
                onClick={() => setTab("semua")} 
                className={cn(
                  "flex-1 md:flex-none px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-200",
                  tab === "semua" ? "bg-white text-slate-900 shadow-[0_2px_8px_rgb(0,0,0,0.08)]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                )}
              >
                Semua Anggota
              </button>
              <button 
                onClick={() => setTab("pending")} 
                className={cn(
                  "flex-1 md:flex-none px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2",
                  tab === "pending" ? "bg-white text-slate-900 shadow-[0_2px_8px_rgb(0,0,0,0.08)]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                )}
              >
                Menunggu Verifikasi 
                {pendingCount > 0 && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-md font-bold", 
                    tab === "pending" ? "bg-red-100 text-red-900" : "bg-slate-200 text-slate-600"
                  )}>
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>
            
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input 
                className="pl-9 rounded-xl border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus-visible:ring-slate-200 shadow-sm h-10" 
                placeholder="Cari nama, NIM..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <TableRow className="border-none">
                  <TableHead className="font-bold text-slate-800 pl-6">Protokoler</TableHead>
                  <TableHead className="font-bold text-slate-800">Program Studi</TableHead>
                  <TableHead className="font-bold text-slate-800">Kontak</TableHead>
                  <TableHead className="font-bold text-slate-800 text-center">Kegiatan</TableHead>
                  <TableHead className="font-bold text-slate-800">Status</TableHead>
                  {tab === "semua" && <TableHead className="font-bold text-slate-800 pr-6">Pencapaian</TableHead>}
                  {tab === "pending" && <TableHead className="font-bold text-slate-800 text-right pr-6">Verifikasi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="h-24 text-center">Memuat data...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="h-32 text-center text-slate-500">Tidak ada data.</TableCell></TableRow>
                ) : (
                  filtered.map((m) => (
                    <TableRow key={m.id} className="hover:bg-slate-50 border-b border-slate-100 transition-colors">
                      <TableCell className="pl-6">
                        <div className="font-bold text-slate-800">{m.nama_lengkap}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{m.nim}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-slate-700">{m.prodi}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{m.fakultas}</div>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">{m.no_hp}</TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-bold text-sm">
                          {m.total_kegiatan || 0}
                        </span>
                      </TableCell>
                      <TableCell><BadgeStatus status={m.status_akun} /></TableCell>
                      
                      {tab === "semua" && (
                        <TableCell className="pr-6">
                          <div className="flex flex-col gap-1.5 items-start">
                            {m.kategori_sertifikat ? <BadgeKategori kategori={m.kategori_sertifikat} /> : <span className="text-xs text-slate-400">—</span>}
                          </div>
                        </TableCell>
                      )}

                      {tab === "pending" && (
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="rounded-xl border-green-500 text-green-700 hover:bg-green-50 font-bold"
                              onClick={() => { setSelected(m); setDialogMode("approve"); }}
                            >
                              <Check className="h-4 w-4 mr-1" /> Setujui
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="rounded-xl border-red-500 text-red-700 hover:bg-red-50 font-bold"
                              onClick={() => { setSelected(m); setDialogMode("reject"); setRejectReason(""); }}
                            >
                              <X className="h-4 w-4 mr-1" /> Tolak
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </main>

      {/* Verification Dialogs */}
      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="sm:max-w-md rounded-xl border border-slate-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className=" font-bold text-xl">
              {dialogMode === "approve" ? "Setujui Pendaftaran" : "Tolak Pendaftaran"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 text-slate-600">
            {dialogMode === "approve" ? (
              <p>Apakah Anda yakin ingin menyetujui akun <strong>{selected?.nama_lengkap}</strong> ({selected?.nim})? Mereka akan menerima notifikasi dan bisa mulai mendaftar kegiatan.</p>
            ) : (
              <div className="space-y-4">
                <p>Silakan berikan alasan penolakan untuk <strong>{selected?.nama_lengkap}</strong>. Alasan ini akan dikirimkan kepada calon protokoler.</p>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-800">Alasan Penolakan</label>
                  <Input 
                    value={rejectReason} 
                    onChange={(e) => setRejectReason(e.target.value)} 
                    placeholder="Contoh: Foto tidak sesuai ketentuan..."
                    className="rounded-xl border-slate-300"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDialogMode(null)} className="rounded-xl">Batal</Button>
            <Button 
              variant={dialogMode === "approve" ? "default" : "destructive"} 
              className={dialogMode === "approve" ? "bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-none" : "rounded-xl shadow-none"}
              disabled={updateStatus.isPending || (dialogMode === "reject" && !rejectReason)}
              onClick={() => {
                if (!selected) return;
                updateStatus.mutate({ 
                  id: selected.id, 
                  status_akun: dialogMode === "approve" ? "aktif" : "ditolak",
                  catatan_penolakan: dialogMode === "reject" ? rejectReason : undefined
                });
              }}
            >
              {updateStatus.isPending ? "Memproses..." : dialogMode === "approve" ? "Ya, Setujui" : "Tolak Pendaftaran"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
