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
  status: "pending_verification" | "aktif" | "ditolak" | "tidak_aktif";
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
    mutationFn: (args: { id: string, status: string, catatan_penolakan?: string }) => 
      protokolerApi.update(args.id, { status: args.status, catatan_penolakan: args.catatan_penolakan }),
    onSuccess: (_, variables) => { 
      toast.success(variables.status === "aktif" ? "Akun disetujui" : "Akun ditolak"); 
      qc.invalidateQueries({ queryKey: ["protokoler"] }); 
      setDialogMode(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const allData = data ?? [];
  const pendingCount = allData.filter(m => m.status === "pending_verification").length;
  const aktifCount = allData.filter(m => m.status === "aktif").length;

  const filtered = allData.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.nama_lengkap.toLowerCase().includes(q) || m.nim.toLowerCase().includes(q);
    const matchTab = tab === "semua" ? m.status !== "pending_verification" : m.status === "pending_verification";
    return matchSearch && matchTab;
  });

  if (!isAdmin) {
    return <div className="p-8 text-red-500 font-bold">Akses Ditolak</div>;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 pb-6 px-6 md:px-8 pt-4">
      
      {/* ─── HEADER SECTION (Adapted Layout) ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-8 pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
              Manajemen Tim
            </span>
          </div>
          <h2 className="font-display text-[28px] md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 md:mb-2 text-slate-900 drop-shadow-sm">Manajemen Anggota</h2>
          <p className="text-[13px] md:text-base text-slate-600 font-medium max-w-xl">
            Verifikasi dan kelola tim protokoler universitas.
          </p>
        </div>
      </motion.div>

      {/* ─── Floating Stats Row ─── */}
      <section className="relative z-20 pb-0">

      <motion.div initial="hidden" animate="visible" variants={stagger} className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Menunggu Verifikasi", value: pendingCount, icon: ShieldCheck, hint: "Perlu ditinjau", color: "text-orange-900", bg: "bg-orange-50" },
          { label: "Protokoler Aktif", value: aktifCount, icon: UserCheck, hint: "Anggota aktif", color: "text-orange-900", bg: "bg-orange-50" },
          { label: "Total Terdaftar", value: allData.length, icon: Users, hint: "Seluruh anggota", color: "text-orange-900", bg: "bg-orange-50" },
        ].map((stat, i) => (
          <motion.div key={stat.label} variants={fadeUp}>
            <div className="bg-white rounded-[20px] p-6 flex flex-col justify-between h-full border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-500">{stat.label}</span>
                <div className={cn("flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full", stat.bg, stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              <div>
                <div className="text-[32px] font-bold text-slate-900 leading-none">{stat.value}</div>
                <div className="text-xs font-medium text-slate-400 mt-2">{stat.hint}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      </section>

      {/* ─── Floating Toolbar (Filter) ─── */}
      <section className="relative z-20 mt-8 pb-0">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-100 bg-white shadow-sm rounded-[20px] p-3 pl-3 md:pl-6 pr-3 md:pr-6">
          <div className="flex items-center p-1 bg-slate-50 border border-slate-100 rounded-xl w-full md:w-auto">
            <button 
              onClick={() => setTab("semua")} 
              className={cn(
                "flex-1 md:flex-none px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap",
                tab === "semua" ? "bg-[#5b1511] text-white shadow-sm border border-[#5b1511]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
              )}
            >
              Semua Anggota
            </button>
            <button 
              onClick={() => setTab("pending")} 
              className={cn(
                "flex-1 md:flex-none px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap",
                tab === "pending" ? "bg-[#5b1511] text-white shadow-sm border border-[#5b1511]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
              )}
            >
              Menunggu Verifikasi 
              {pendingCount > 0 && (
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-md font-bold", 
                  tab === "pending" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                )}>
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
          
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input 
              className="pl-9 h-10 rounded-full border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus-visible:ring-slate-200 shadow-sm" 
              placeholder="Cari nama, NIM..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
        </motion.div>
      </section>

      {/* ─── BODY CONTENT ─── */}
      <div className="flex-1 flex flex-col min-h-0 mt-8">
        <section className="flex-1 flex flex-col min-h-0 pb-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex-1 flex flex-col min-h-0 bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden" style={{ backgroundColor: '#ffffff', isolation: 'isolate' }}>
        
        {/* Table Header */}
        <div className="shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 px-6 py-4" style={{ backgroundColor: '#ffffff' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 bg-white text-[#5b1511] rounded-xl border border-slate-100 shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {tab === "semua" ? "Daftar Anggota" : "Menunggu Verifikasi"}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">{filtered.length} anggota ditemukan</p>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden" style={{ backgroundColor: '#ffffff' }}>
          <Table className="text-sm" style={{ backgroundColor: '#ffffff' }}>
            <TableHeader style={{ backgroundColor: '#ffffff' }}>
              <TableRow className="border-b border-slate-100 hover:bg-slate-50" style={{ backgroundColor: '#ffffff' }}>
                <TableHead className="font-bold text-slate-600 py-4 pl-6">Protokoler</TableHead>
                <TableHead className="font-bold text-slate-600 py-4">Program Studi</TableHead>
                <TableHead className="font-bold text-slate-600 py-4">Kontak</TableHead>
                <TableHead className="font-bold text-slate-600 py-4 text-center">Kegiatan</TableHead>
                <TableHead className="font-bold text-slate-600 py-4">Status</TableHead>
                {tab === "semua" && <TableHead className="font-bold text-slate-600 py-4 pr-6">Pencapaian</TableHead>}
                {tab === "pending" && <TableHead className="font-bold text-slate-600 py-4 text-right pr-6">Verifikasi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="h-24 text-center">Memuat data...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="h-32 text-center text-slate-500">Tidak ada data.</TableCell></TableRow>
              ) : (
                filtered.map((m, i) => (
                  <motion.tr 
                    key={m.id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <TableCell className="pl-6 py-4">
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
                    <TableCell><BadgeStatus status={m.status} /></TableCell>
                    
                    {tab === "semua" && (
                      <TableCell className="py-4 pr-6">
                        <div className="flex flex-col gap-1.5 items-start">
                          {m.kategori_sertifikat ? <BadgeKategori kategori={m.kategori_sertifikat} /> : <span className="text-xs text-slate-400">—</span>}
                        </div>
                      </TableCell>
                    )}

                    {tab === "pending" && (
                      <TableCell className="py-4 text-right pr-6">
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
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

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
                  status: dialogMode === "approve" ? "aktif" : "ditolak",
                  catatan_penolakan: dialogMode === "reject" ? rejectReason : undefined
                });
              }}
            >
              {updateStatus.isPending ? "Memproses..." : dialogMode === "approve" ? "Ya, Setujui" : "Tolak Pendaftaran"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </section>
      </div>
    </div>
  );
}
