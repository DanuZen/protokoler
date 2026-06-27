"use client";

import { useQuery } from "@tanstack/react-query";
import { protokolerApi, laporanApi } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BadgeStatus } from "@/components/BadgeStatus";
import { BadgeKategori } from "@/components/BadgeKategori";
import { 
  User, Mail, Phone, GraduationCap, Building2, Library, 
  Calendar, Clock, Shield, Award, ExternalLink, Activity,
  Briefcase, ChevronRight, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DetailAnggotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  protokolerId: string | null;
}

export function DetailAnggotaModal({ isOpen, onClose, protokolerId }: DetailAnggotaModalProps) {
  // Fetch detailed protokoler information
  const { data: protokoler, isLoading: isProtokolerLoading } = useQuery({
    queryKey: ["protokoler-detail", protokolerId],
    queryFn: () => protokolerApi.get(protokolerId!),
    enabled: !!protokolerId && isOpen,
  });

  // Fetch activity stats & history
  const { data: rekapData, isLoading: isRekapLoading } = useQuery({
    queryKey: ["protokoler-rekap", protokolerId],
    queryFn: () => laporanApi.rekap(protokolerId!),
    enabled: !!protokolerId && isOpen,
  });

  const isLoading = isProtokolerLoading || isRekapLoading;

  // Format date to local Indonesian format
  const formatDate = (dateStr: string | Date) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Convert phone number to WA format (e.g. 08... -> 628...)
  const getWaLink = (phone: string) => {
    if (!phone) return "";
    let clean = phone.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) {
      clean = "62" + clean.slice(1);
    }
    return `https://wa.me/${clean}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl border border-slate-200 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Detail Anggota Protokoler</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        ) : protokoler ? (
          <div className="flex flex-col h-[85vh] md:h-[75vh]">
            {/* ─── HEADER BANNER ──────────────────────────────────────── */}
            <div className="relative h-32 md:h-40 bg-gradient-to-r from-red-800 to-red-600 px-4 md:px-8 flex items-end pb-4 shrink-0">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-60" />
              
              {/* Profile Overlapping Info */}
              <div className="flex items-end gap-4 translate-y-6 md:translate-y-8 z-10 w-full">
                <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden flex-shrink-0">
                  {protokoler.foto_setengah_badan_url ? (
                    <img 
                      src={protokoler.foto_setengah_badan_url} 
                      alt={protokoler.nama_lengkap} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <User className="h-8 w-8" />
                    </div>
                  )}
                </div>
                
                <div className="pb-1 text-left flex-1 min-w-0 pr-4">
                  <h3 className="text-lg md:text-2xl font-bold text-white drop-shadow-sm truncate">
                    {protokoler.nama_lengkap}
                  </h3>
                  <p className="text-xs md:text-sm font-medium text-slate-100/90 drop-shadow-sm font-mono mt-0.5">
                    {protokoler.nim}
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-2 pb-1.5 self-end">
                  <BadgeStatus status={protokoler.status_akun} />
                  {protokoler.kategori_sertifikat && (
                    <BadgeKategori kategori={protokoler.kategori_sertifikat} />
                  )}
                </div>
              </div>
            </div>

            {/* Mobile badges */}
            <div className="sm:hidden px-6 pt-10 flex flex-wrap gap-2 shrink-0">
              <BadgeStatus status={protokoler.status_akun} />
              {protokoler.kategori_sertifikat && (
                <BadgeKategori kategori={protokoler.kategori_sertifikat} />
              )}
            </div>

            {/* ─── BODY TABS ────────────────────────────────────────── */}
            <Tabs defaultValue="profil" className="flex-1 min-h-0 flex flex-col pt-8 md:pt-10 px-4 md:px-8 pb-6">
              <TabsList className="grid grid-cols-2 max-w-sm mb-6 shrink-0 bg-slate-100 p-1 rounded-xl">
                <TabsTrigger value="profil" className="rounded-lg font-bold text-xs py-2">
                  Profil & Dokumen
                </TabsTrigger>
                <TabsTrigger value="kegiatan" className="rounded-lg font-bold text-xs py-2">
                  Statistik & Kegiatan
                </TabsTrigger>
              </TabsList>

              {/* ─── TAB 1: PROFIL & DOKUMEN ────────────────────────── */}
              <TabsContent value="profil" className="flex-1 min-h-0 overflow-y-auto space-y-6 focus-visible:outline-none pr-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Details */}
                  <div className="space-y-5 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <GraduationCap className="h-4 w-4 text-red-800" /> Data Akademik
                    </h4>
                    
                    <div className="space-y-4">
                      {[
                        { icon: GraduationCap, label: "Program Studi", val: protokoler.prodi },
                        { icon: Building2, label: "Departemen", val: protokoler.departemen },
                        { icon: Library, label: "Fakultas", val: protokoler.fakultas },
                      ].map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                            <item.icon className="h-4 w-4 text-slate-500" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              {item.label}
                            </span>
                            <span className="text-sm font-semibold text-slate-800">
                              {item.val || "—"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {protokoler.status_akun === "ditolak" && protokoler.catatan_penolakan && (
                      <div className="mt-4 p-3.5 bg-red-50 border border-red-100 rounded-xl">
                        <span className="text-xs font-bold text-red-800 block mb-1">Catatan Penolakan:</span>
                        <p className="text-xs text-red-700 leading-relaxed font-medium">{protokoler.catatan_penolakan}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Photo Upload Documents */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-1">
                      <ImageIcon className="h-4 w-4 text-red-800" /> Dokumen Foto Verifikasi
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Setengah Badan Card */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex flex-col group h-full">
                        <div className="relative aspect-[3/4] bg-slate-800 flex items-center justify-center overflow-hidden">
                          {protokoler.foto_setengah_badan_url ? (
                            <>
                              <img 
                                src={protokoler.foto_setengah_badan_url} 
                                alt="Foto Setengah Badan" 
                                className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-200"
                              />
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <a 
                                  href={protokoler.foto_setengah_badan_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-2.5 bg-white text-slate-800 rounded-full shadow-lg hover:scale-110 transition-transform"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </div>
                            </>
                          ) : (
                            <span className="text-xs text-slate-500 font-medium">Belum ada foto</span>
                          )}
                        </div>
                        <div className="p-3 text-center bg-white border-t border-slate-100 shrink-0">
                          <span className="text-xs font-bold text-slate-700 block">Foto 1/2 Badan</span>
                          <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Pasfoto Resmi</span>
                        </div>
                      </div>

                      {/* Full Body Card */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex flex-col group h-full">
                        <div className="relative aspect-[3/4] bg-slate-800 flex items-center justify-center overflow-hidden">
                          {protokoler.foto_full_body_url ? (
                            <>
                              <img 
                                src={protokoler.foto_full_body_url} 
                                alt="Foto Full Body" 
                                className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-200"
                              />
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <a 
                                  href={protokoler.foto_full_body_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-2.5 bg-white text-slate-800 rounded-full shadow-lg hover:scale-110 transition-transform"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </div>
                            </>
                          ) : (
                            <span className="text-xs text-slate-500 font-medium">Belum ada foto</span>
                          )}
                        </div>
                        <div className="p-3 text-center bg-white border-t border-slate-100 shrink-0">
                          <span className="text-xs font-bold text-slate-700 block">Foto Full Body</span>
                          <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Tampak Seluruh Badan</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ─── TAB 2: STATISTIK & KEGIATAN ────────────────────────── */}
              <TabsContent value="kegiatan" className="flex-1 min-h-0 overflow-y-auto space-y-6 focus-visible:outline-none pr-1">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Kegiatan", value: rekapData?.rekap?.total_kegiatan ?? 0, icon: Activity, desc: "Selesai diikuti" },
                    { label: "Total Jam Kerja", value: `${rekapData?.rekap?.total_jam_estimasi ?? 0} Jam`, icon: Clock, desc: "Estimasi waktu" },
                    { label: "Sebagai Protokoler", value: rekapData?.rekap?.sebagai_protokoler ?? 0, icon: User, desc: "Tugas keprotokolan" },
                    { label: "Sebagai LO", value: rekapData?.rekap?.sebagai_lo ?? 0, icon: Briefcase, desc: "Liaison Officer" },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">{stat.label}</span>
                        <div className="h-8 w-8 rounded-lg bg-red-50 text-red-800 flex items-center justify-center shrink-0">
                          <stat.icon className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="text-2xl font-bold text-red-800 leading-none">{stat.value}</span>
                        <span className="text-[10px] text-slate-400 font-medium block mt-1">{stat.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* History Table */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-red-800" /> Riwayat Penugasan Kegiatan
                  </h4>

                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="font-bold text-slate-700 pl-4">Nama Kegiatan</TableHead>
                          <TableHead className="font-bold text-slate-700">Tanggal</TableHead>
                          <TableHead className="font-bold text-slate-700">Peran</TableHead>
                          <TableHead className="font-bold text-slate-700 pr-4 text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rekapData?.riwayat && rekapData.riwayat.length > 0 ? (
                          rekapData.riwayat.map((riwayat: any, idx: number) => (
                            <TableRow key={idx} className="hover:bg-slate-50/50">
                              <TableCell className="font-semibold text-slate-800 pl-4 max-w-xs truncate">
                                {riwayat.nama_kegiatan}
                              </TableCell>
                              <TableCell className="text-xs text-slate-500 font-medium">
                                {formatDate(riwayat.tanggal)}
                              </TableCell>
                              <TableCell>
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                                  {riwayat.peran === "lo" ? "LO" : "Protokoler"}
                                </span>
                              </TableCell>
                              <TableCell className="text-right pr-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  riwayat.status === "diterima" 
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}>
                                  {riwayat.status === "dialihkan" ? "Dialihkan" : "Diterima"}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="h-32 text-center text-slate-400 font-medium text-xs">
                              Belum ada riwayat penugasan kegiatan
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="p-10 text-center text-slate-500 font-medium">
            Gagal mengambil data anggota.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
