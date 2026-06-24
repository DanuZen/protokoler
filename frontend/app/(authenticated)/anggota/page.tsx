"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { protokolerApi } from "@/lib/api";
import { useAuth, useRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users, UserCheck, ShieldCheck, Check, X, Sparkles, Eye } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BadgeStatus } from "@/components/BadgeStatus";
import { BadgeKategori } from "@/components/BadgeKategori";
import { cn } from "@/lib/utils";
import { DetailAnggotaModal } from "./detail-modal";

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
  catatan_penolakan?: string;
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
  const { data: role, loading: isRoleLoading } = useRole(user);
  const isAdmin = role === "admin";
  const qc = useQueryClient();
  
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"semua" | "pending" | "ditolak">("semua");
  const [selected, setSelected] = useState<Protokoler | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [dialogMode, setDialogMode] = useState<"approve" | "reject" | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["protokoler"],
    queryFn: () => protokolerApi.list() as Promise<Protokoler[]>,
  });

  const updateStatus = useMutation({
    mutationFn: (args: { id: string, status_akun: string, catatan_penolakan?: string }) => 
      protokolerApi.verifikasi(args.id, args.status_akun === "aktif" ? "setujui" : "tolak", args.catatan_penolakan),
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
  const ditolakCount = allData.filter(m => m.status_akun === "ditolak").length;

  const filtered = allData.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.nama_lengkap.toLowerCase().includes(q) || m.nim.toLowerCase().includes(q);
    let matchTab = false;
    if (tab === "semua") {
      matchTab = m.status_akun !== "pending" && m.status_akun !== "ditolak";
    } else if (tab === "pending") {
      matchTab = m.status_akun === "pending";
    } else if (tab === "ditolak") {
      matchTab = m.status_akun === "ditolak";
    }
    return matchSearch && matchTab;
  });

  if (isRoleLoading) return null;

  if (!isAdmin) {
    return (
      <div className="flex-1 h-dvh flex flex-col items-center justify-center p-8 bg-slate-50/50">
        <div className="bg-red-100 text-red-700 p-5 rounded-full mb-6 shadow-sm border border-red-200">
          <ShieldCheck className="h-12 w-12" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Akses Ditolak</h1>
        <p className="text-slate-500 max-w-md text-center text-sm md:text-base leading-relaxed">
          Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Halaman manajemen anggota hanya diperuntukkan bagi Administrator.
        </p>
      </div>
    );
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
            { label: "Menunggu Verifikasi", value: pendingCount, icon: ShieldCheck, hint: "Perlu ditinjau" },
            { label: "Protokoler Aktif", value: aktifCount, icon: UserCheck, hint: "Anggota aktif" },
            { label: "Total Terdaftar", value: allData.length, icon: Users, hint: "Seluruh anggota" },
          ].map((stat, i) => (
            <motion.div key={stat.label} variants={fadeUp}>
              <div className="bg-white border border-slate-200 shadow-sm rounded-[24px] py-6 px-6 flex flex-col justify-between hover:shadow-md transition-all group relative overflow-hidden h-full">
                <div className="flex items-center justify-between relative z-10">
                  <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-800 transition-colors">
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 relative z-10">
                  <p className="text-[32px] font-bold leading-tight text-red-800">{stat.value}</p>
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
          <div className="px-6 md:px-8 py-5 bg-slate-50 border-b border-slate-100 flex flex-col xl:flex-row justify-between xl:items-center gap-4 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center h-12 w-12 bg-white border border-slate-200 text-primary rounded-[14px] shadow-sm shrink-0">
                <Users className="h-6 w-6 text-red-700" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 leading-tight">Daftar Anggota</h2>
                <p className="text-sm text-slate-500 mt-1 line-clamp-1">Kelola dan filter data seluruh anggota protokoler.</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto [&::-webkit-scrollbar]:hidden">
                <button 
                  onClick={() => setTab("semua")} 
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 whitespace-nowrap",
                    tab === "semua" ? "bg-[#6B0000] text-white border-[#6B0000] shadow-md shadow-red-700/20" : "bg-white text-slate-600 border-slate-200 shadow-sm hover:text-slate-900 hover:shadow-md"
                  )}
                >
                  Semua Anggota
                </button>
                <button 
                  onClick={() => setTab("pending")} 
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 whitespace-nowrap flex items-center",
                    tab === "pending" ? "bg-[#6B0000] text-white border-[#6B0000] shadow-md shadow-red-700/20" : "bg-white text-slate-600 border-slate-200 shadow-sm hover:text-slate-900 hover:shadow-md"
                  )}
                >
                  Menunggu Verifikasi 
                  {pendingCount > 0 && (
                    <span className={cn(
                      "ml-2 inline-flex items-center justify-center px-1.5 py-0.5 rounded-md text-[10px]", 
                      tab === "pending" ? "bg-white/20" : "bg-slate-100 text-slate-500"
                    )}>
                      {pendingCount}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => setTab("ditolak")} 
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 whitespace-nowrap flex items-center",
                    tab === "ditolak" ? "bg-[#6B0000] text-white border-[#6B0000] shadow-md shadow-red-700/20" : "bg-white text-slate-600 border-slate-200 shadow-sm hover:text-slate-900 hover:shadow-md"
                  )}
                >
                  Ditolak 
                  {ditolakCount > 0 && (
                    <span className={cn(
                      "ml-2 inline-flex items-center justify-center px-1.5 py-0.5 rounded-md text-[10px]", 
                      tab === "ditolak" ? "bg-white/20" : "bg-slate-100 text-slate-500"
                    )}>
                      {ditolakCount}
                    </span>
                  )}
                </button>
              </div>
              
              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input 
                  className="pl-9 h-10 rounded-xl bg-white border-slate-200 text-sm shadow-sm focus-visible:ring-red-700 w-full text-slate-900 placeholder-slate-400" 
                  placeholder="Cari nama, NIM..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="flex-1 overflow-auto flex flex-col min-h-0 relative">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <TableRow className="border-none">
                  <TableHead className="font-bold text-slate-800 pl-6">Protokoler</TableHead>
                  <TableHead className="font-bold text-slate-800">Program Studi</TableHead>
                  <TableHead className="font-bold text-slate-800">Kontak</TableHead>
                  <TableHead className="font-bold text-slate-800 text-center">Kegiatan</TableHead>
                  <TableHead className="font-bold text-slate-800">Status</TableHead>
                  {tab === "semua" && <TableHead className="font-bold text-slate-800">Pencapaian</TableHead>}
                  {tab === "pending" && <TableHead className="font-bold text-slate-800 text-right">Verifikasi</TableHead>}
                  {tab === "ditolak" && <TableHead className="font-bold text-slate-800">Catatan Penolakan</TableHead>}
                  <TableHead className="font-bold text-slate-800 text-center pr-6 w-20">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow><TableCell colSpan={8} className="h-24 text-center">Memuat data...</TableCell></TableRow>
                )}
                
                {!isLoading && filtered.length > 0 && (
                  filtered.map((m) => (
                    <TableRow 
                      key={m.id} 
                      className="hover:bg-slate-50/80 border-b border-slate-100 transition-colors cursor-pointer"
                      onClick={() => { setDetailId(m.id); setIsDetailOpen(true); }}
                    >
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
                        <TableCell>
                          <div className="flex flex-col gap-1.5 items-start">
                            {m.kategori_sertifikat ? <BadgeKategori kategori={m.kategori_sertifikat} /> : <span className="text-xs text-slate-400">—</span>}
                          </div>
                        </TableCell>
                      )}

                      {tab === "pending" && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="rounded-xl border-green-500 text-green-700 hover:bg-green-50 font-bold"
                              onClick={(e) => { e.stopPropagation(); setSelected(m); setDialogMode("approve"); }}
                            >
                              <Check className="h-4 w-4 mr-1" /> Setujui
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="rounded-xl border-red-500 text-red-700 hover:bg-red-50 font-bold"
                              onClick={(e) => { e.stopPropagation(); setSelected(m); setDialogMode("reject"); setRejectReason(""); }}
                            >
                              <X className="h-4 w-4 mr-1" /> Tolak
                            </Button>
                          </div>
                        </TableCell>
                      )}

                      {tab === "ditolak" && (
                        <TableCell className="align-top">
                          {m.catatan_penolakan ? (
                             <p className="text-xs text-slate-600 bg-red-50 p-2 rounded-lg border border-red-100 leading-relaxed max-w-xs">{m.catatan_penolakan}</p>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Tidak ada catatan</span>
                          )}
                        </TableCell>
                      )}

                      <TableCell className="text-center pr-6" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-red-800 hover:bg-red-50"
                          onClick={() => {
                            setDetailId(m.id);
                            setIsDetailOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Detail</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            {!isLoading && filtered.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 min-h-[350px]">
                <Sparkles className="mx-auto h-12 w-12 mb-4 text-slate-300" />
                <h3 className="text-sm font-bold text-slate-700 mb-1">Tidak Ada Data</h3>
                <p className="text-xs">Belum ada anggota yang cocok dengan filter atau pencarian Anda.</p>
              </div>
            )}
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

      {/* Detail Anggota Modal */}
      <DetailAnggotaModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailId(null);
        }}
        protokolerId={detailId}
      />
    </div>
  );
}
