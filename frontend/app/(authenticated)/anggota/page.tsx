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
      <section className="relative px-6 md:px-10 pt-10 pb-16 overflow-hidden">
        {/* decorative grid */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* gold glow */}
        <div className="absolute -right-24 -top-8 h-80 w-80 rounded-full bg-[#C9A84C]/8 blur-3xl pointer-events-none" />
        {/* gold underline */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-6 relative z-10">
          <div>
            <p className="text-[#C9A84C] text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Sistem Informasi Protokoler</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight">Manajemen Anggota</h1>
            <p className="mt-2 text-slate-400 text-sm">Verifikasi dan kelola tim protokoler universitas.</p>
          </div>
        </motion.div>
      </section>

      {/* ─── Floating Stats Row ─── */}
      <section className="px-6 md:px-10 -mt-12 relative z-20 pb-0">

      <motion.div initial="hidden" animate="visible" variants={stagger} className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Menunggu Verifikasi", value: pendingCount, icon: ShieldCheck, hint: "Perlu ditinjau" },
          { label: "Protokoler Aktif", value: aktifCount, icon: UserCheck, hint: "Anggota aktif" },
          { label: "Total Terdaftar", value: allData.length, icon: Users, hint: "Seluruh anggota" },
        ].map((stat, i) => (
          <motion.div key={stat.label} variants={fadeUp}>
            <div className="bg-slate-900 border border-slate-800 shadow-xl py-3 px-4 flex flex-col justify-between hover:border-[#C9A84C]/60 hover:shadow-2xl transition-all group relative overflow-hidden h-full">
              <stat.icon className="absolute -right-4 -bottom-4 h-24 w-24 text-white opacity-5 transform group-hover:scale-110 transition-transform duration-500" />
              <div className="flex items-center justify-between relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                <div className="flex-shrink-0 h-7 w-7 flex items-center justify-center bg-[#C9A84C]/20 text-[#C9A84C] group-hover:bg-[#C9A84C] group-hover:text-white transition-colors border border-[#C9A84C]/30">
                  <stat.icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="mt-1.5 relative z-10">
                <p className="text-3xl font-extrabold leading-tight font-display text-white">{stat.value}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-slate-500">{stat.hint}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      </section>

      {/* ─── BODY CONTENT (white bg) ─── */}
      <div className="bg-slate-50 min-h-screen -mt-6">
        <div className="h-12" />
        <section className="px-6 md:px-10 pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden">
        
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-900 px-5 py-4 bg-slate-900 text-white">
          <div className="flex bg-slate-800 p-1 w-full md:w-auto border border-slate-700">
            <button 
              onClick={() => setTab("semua")} 
              className={`flex-1 md:flex-none px-6 py-2 text-sm font-bold transition-colors ${tab === "semua" ? "bg-[#C9A84C] text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
            >
              Semua Anggota
            </button>
            <button 
              onClick={() => setTab("pending")} 
              className={`flex-1 md:flex-none px-6 py-2 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${tab === "pending" ? "bg-[#C9A84C] text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
            >
              Menunggu Verifikasi 
              {pendingCount > 0 && <span className={cn("text-[10px] px-1.5 py-0.5 rounded-none font-extrabold", tab === "pending" ? "bg-slate-900 text-[#C9A84C]" : "bg-[#C9A84C] text-white")}>{pendingCount}</span>}
            </button>
          </div>
          
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input 
              className="pl-9 rounded-none border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus-visible:ring-slate-700 h-10" 
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
                            className="rounded-none border-green-500 text-green-700 hover:bg-green-50 font-bold"
                            onClick={() => { setSelected(m); setDialogMode("approve"); }}
                          >
                            <Check className="h-4 w-4 mr-1" /> Setujui
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-none border-red-500 text-red-700 hover:bg-red-50 font-bold"
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
        </section>
      </div>
    </div>
  );
}
