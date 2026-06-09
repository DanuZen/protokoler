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
  const isAdmin = role === "admin" || role === "pimpinan";
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
    <div className="min-h-screen bg-transparent">
      {/* ─── Hero Banner ─── */}
      <div className="relative px-6 md:px-10 pt-24 pb-32 overflow-hidden">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight">Manajemen Anggota</h1>
            <p className="mt-3 text-slate-300 text-lg">Verifikasi dan kelola tim protokoler universitas.</p>
          </div>
        </motion.div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="bg-slate-50 min-h-screen pt-4 pb-12">
        <div className="px-6 md:px-10 -mt-24 relative z-10 space-y-6">

      {/* Stats Row */}
      <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-slate-200 shadow-xl">
        {[
          { label: "Menunggu Verifikasi", value: pendingCount, icon: ShieldCheck, color: "text-orange-500" },
          { label: "Protokoler Aktif", value: aktifCount, icon: UserCheck, color: "text-emerald-600" },
          { label: "Total Terdaftar", value: allData.length, icon: Users, color: "text-slate-900" },
        ].map((s, i) => (
          <motion.div key={s.label} variants={fadeUp} className={cn(
            "bg-white p-6 flex justify-between items-center hover:bg-slate-50 transition-colors",
            i < 2 && "border-b md:border-b-0 md:border-r border-slate-200"
          )}>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{s.label}</div>
              <div className={`text-4xl font-display font-extrabold leading-none ${s.color}`}>{s.value}</div>
            </div>
            <div className="flex-shrink-0 h-12 w-12 bg-slate-900 flex items-center justify-center rounded-none">
              <s.icon className="h-5 w-5 text-[#C9A84C]" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Area */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden">
        
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-5 border-b border-slate-100">
          <div className="flex bg-slate-100 p-1 w-full md:w-auto">
            <button 
              onClick={() => setTab("semua")} 
              className={`flex-1 md:flex-none px-6 py-2 text-sm font-bold transition-colors ${tab === "semua" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Semua Anggota
            </button>
            <button 
              onClick={() => setTab("pending")} 
              className={`flex-1 md:flex-none px-6 py-2 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${tab === "pending" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Menunggu Verifikasi 
              {pendingCount > 0 && <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
            </button>
          </div>
          
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input 
              className="pl-9 rounded-none border-slate-200 bg-slate-50" 
              placeholder="Cari nama, NIM..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold text-slate-900">Protokoler</TableHead>
                <TableHead className="font-bold text-slate-900">Program Studi</TableHead>
                <TableHead className="font-bold text-slate-900">Kontak</TableHead>
                <TableHead className="font-bold text-slate-900">Status</TableHead>
                {tab === "semua" && <TableHead className="font-bold text-slate-900">Pencapaian</TableHead>}
                {tab === "pending" && <TableHead className="font-bold text-slate-900 text-right">Verifikasi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center">Memuat data...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-32 text-center text-slate-500">Tidak ada data.</TableCell></TableRow>
              ) : (
                filtered.map((m) => (
                  <TableRow key={m.id} className="hover:bg-slate-50/50 border-b-slate-100">
                    <TableCell>
                      <div className="font-bold text-slate-900">{m.nama_lengkap}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{m.nim}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-slate-700">{m.prodi}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{m.fakultas}</div>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">{m.no_hp}</TableCell>
                    <TableCell><BadgeStatus status={m.status_akun} /></TableCell>
                    
                    {tab === "semua" && (
                      <TableCell>
                        <div className="flex flex-col gap-1.5 items-start">
                          {m.kategori_sertifikat && <BadgeKategori kategori={m.kategori_sertifikat} />}
                          <span className="text-xs text-slate-500 font-medium">{m.total_kegiatan} Kegiatan</span>
                        </div>
                      </TableCell>
                    )}

                    {tab === "pending" && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-green-200 text-green-700 hover:bg-green-50"
                            onClick={() => { setSelected(m); setDialogMode("approve"); }}
                          >
                            <Check className="h-4 w-4 mr-1" /> Setujui
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-red-200 text-red-700 hover:bg-red-50"
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

      {/* Verification Dialogs */}
      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="sm:max-w-md rounded-none border border-slate-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl">
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
                  <label className="text-sm font-bold text-slate-900">Alasan Penolakan</label>
                  <Input 
                    value={rejectReason} 
                    onChange={(e) => setRejectReason(e.target.value)} 
                    placeholder="Contoh: Foto tidak sesuai ketentuan..."
                    className="rounded-none border-slate-300"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDialogMode(null)} className="rounded-none">Batal</Button>
            <Button 
              variant={dialogMode === "approve" ? "default" : "destructive"} 
              className={dialogMode === "approve" ? "bg-green-600 hover:bg-green-700 text-white rounded-none shadow-none" : "rounded-none shadow-none"}
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
      </div>
    </div>
  );
}
