"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kegiatanApi, pendaftaranApi, absensiApi, evaluasiApi, testimoniApi } from "@/lib/api";
import { useAuth, useRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BadgeStatus } from "@/components/BadgeStatus";
import { BadgeKategori } from "@/components/BadgeKategori";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MapPin, Clock, Calendar, Users, CheckSquare, Square, Star, Image, FileText, Info, Crown, ClipboardCheck, MessageSquare, Camera, Briefcase, FileSignature, CheckCircle2, XCircle, UserCheck, Check, X, BarChart3, Download } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

type Tab = "info" | "rekrutmen" | "absensi" | "evaluasi" | "dokumentasi";

export default function KegiatanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const isAdmin = role === "admin";
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("info");
  const [evaluasiTab, setEvaluasiTab] = useState<'evaluasi' | 'testimoni' | 'feedback'>('evaluasi');
  const [feedbackText, setFeedbackText] = useState('');
  const [ratingAcara, setRatingAcara] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [evaluasiDiri, setEvaluasiDiri] = useState('');
  const [kendala, setKendala] = useState('');
  const [saran, setSaran] = useState('');
  const [isSuccessSubmit, setIsSuccessSubmit] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'Protokoler' | 'Liaison Officer'>('Protokoler');

  const { data: keg, isLoading } = useQuery({
    queryKey: ["kegiatan", id],
    queryFn: () => kegiatanApi.get(id),
  });

  const { data: pendaftaran } = useQuery({
    queryKey: ["pendaftaran-kegiatan", id],
    queryFn: () => pendaftaranApi.byKegiatan(id),
    enabled: tab === "rekrutmen",
  });

  const { data: absensi } = useQuery({
    queryKey: ["absensi-kegiatan", id],
    queryFn: () => absensiApi.byKegiatan(id),
    enabled: tab === "absensi",
  });

  const { data: evaluasi } = useQuery({
    queryKey: ["evaluasi-kegiatan", id],
    queryFn: () => evaluasiApi.byKegiatan(id),
    enabled: tab === "evaluasi",
  });

  const { data: testimoni } = useQuery({
    queryKey: ["testimoni-kegiatan", id],
    queryFn: () => testimoniApi.byKegiatan(id),
    enabled: tab === "evaluasi",
  });

  const updateChecklist = useMutation({
    mutationFn: async (data: Partial<typeof keg>) => { await kegiatanApi.update(id, data); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["kegiatan", id] }); },
  });

  const daftar = useMutation({
    mutationFn: async () => { await kegiatanApi.daftar(id, user?.id || "", user?.user_metadata?.nama_lengkap || "Mahasiswa", selectedRole); },
    onSuccess: () => { toast.success("Berhasil mendaftar ke kegiatan ini!"); qc.invalidateQueries({ queryKey: ["kegiatan", id] }); },
  });

  const verifikasi = useMutation({
    mutationFn: async ({ pId, status }: { pId: string, status: 'diterima' | 'ditolak' }) => { await kegiatanApi.verifikasiPendaftar(id, pId, status); },
    onSuccess: (_, variables) => { toast.success(`Pendaftar ${variables.status}`); qc.invalidateQueries({ queryKey: ["kegiatan", id] }); },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Memuat detail kegiatan...</div>;
  }

  if (!keg) {
    return <div className="p-8 text-center text-red-500">Kegiatan tidak ditemukan.</div>;
  }

  const isDaftarOpen = (keg as any).is_open_recruitment;
  const statusPendaftaran = (keg as any).pendaftar?.find((p: any) => p.protokoler_id === user?.id)?.status;
  const isDiterima = statusPendaftaran === 'diterima';

  const tabs: { key: Tab; label: string }[] = [
    { key: "info", label: "Info" },
    { key: "rekrutmen", label: "Rekrutmen & Penugasan" },
    { key: "absensi", label: "Absensi" },
    { key: "evaluasi", label: "Evaluasi" },
    { key: "dokumentasi", label: "Dokumentasi" },
  ];

  return (
    <div className="min-h-full relative z-10">
      <div className="space-y-6 px-6 md:px-8 py-6 pb-20">
      {/* ─── HEADER SECTION ──────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 pb-6 border-b border-slate-200/60">
        <div className="flex items-start md:items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-600/20 text-white">
            <Calendar className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                Detail Kegiatan
              </span>
              <div className="h-1 w-1 rounded-full bg-slate-300 mx-1" />
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  {keg.status === 'berlangsung' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    keg.status === 'berlangsung' ? 'bg-blue-500' :
                    keg.status === 'selesai' ? 'bg-emerald-500' :
                    keg.status === 'batal' ? 'bg-red-500' : 'bg-sky-500'
                  }`}></span>
                </span>
                <span className={`text-[11px] font-bold uppercase tracking-widest ${
                    keg.status === 'berlangsung' ? 'text-blue-600' :
                    keg.status === 'selesai' ? 'text-emerald-600' :
                    keg.status === 'batal' ? 'text-red-600' : 'text-sky-600'
                }`}>
                  {keg.status}
                </span>
              </div>
            </div>
            <h2 className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight leading-none text-slate-900 drop-shadow-sm">
              {keg.nama_kegiatan}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 mt-2 md:mt-0">
          <Link href="/kegiatan">
            <Button variant="outline" className="rounded-xl border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-slate-50 text-slate-600 h-11 px-4 font-bold transition-all">
              <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
            </Button>
          </Link>
          {isAdmin && (
            <Link href={`/kegiatan/buat?edit=${id}`}>
              <Button className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/10 h-11 px-5 font-bold transition-all">
                Edit Kegiatan
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto mb-8 pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap shadow-sm border ${
              tab === t.key
                ? "bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-600/20"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-orange-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        
        {/* ── Tab INFO ── */}
        {tab === "info" && (
          <div className="grid lg:grid-cols-3 gap-6 items-stretch min-h-[500px]">
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Info Dasar */}
              <Card className="rounded-[24px] bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-4 p-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-center h-10 w-10 bg-white rounded-xl border border-slate-200 text-slate-600 shadow-sm">
                    <Info className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-slate-800">Info Dasar</h2>
                    <p className="text-[12px] font-medium text-slate-500 mt-0.5">Waktu dan lokasi pelaksanaan kegiatan</p>
                  </div>
                </div>
                <div className="p-5 grid sm:grid-cols-2 gap-5 bg-white">
                  <div className="space-y-1.5">
                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Tanggal</p>
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-50 text-blue-600">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <p className="font-bold text-slate-800 text-[14px]">
                        {new Date(keg.tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Waktu Pelaksanaan</p>
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-orange-50 text-orange-600">
                        <Clock className="h-4 w-4" />
                      </div>
                      <p className="font-bold text-slate-800 text-[14px]">
                        {keg.jam_mulai?.slice(0, 5)} – {keg.jam_selesai?.slice(0, 5)} WIB
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-3 border-t border-slate-100">
                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Lokasi / Tempat</p>
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <p className="font-bold text-slate-800 text-[14px]">{keg.lokasi}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-3 border-t border-slate-100">
                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Bentuk / Jenis Kegiatan</p>
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600">
                        <FileText className="h-4 w-4" />
                      </div>
                      <p className="font-bold text-slate-800 text-[14px] capitalize">{(keg.bentuk || keg.bentuk_kegiatan || "Kegiatan").replace(/_/g, " ")}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Detail Acara */}
              <Card className="rounded-[24px] bg-white border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="flex items-center gap-4 p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 bg-white rounded-xl border border-slate-200 text-amber-600 shadow-sm">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-slate-800">Detail Acara</h2>
                    <p className="text-[12px] font-medium text-slate-500 mt-0.5">Target audiens, narasumber, dan rundown</p>
                  </div>
                </div>
                
                <div className="p-5 bg-white flex-1 flex flex-col">
                  {!((keg as any).audience || (keg as any).keynote || (keg as any).rundown_url || (keg as any).peserta) ? (
                    <div className="flex flex-col flex-1 items-center justify-center py-8 px-6 text-center bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 mb-4 text-slate-400">
                        <FileText className="h-6 w-6" />
                      </div>
                      <p className="text-[14px] font-bold text-slate-700">Belum Ada Detail Acara</p>
                      <p className="text-[12px] text-slate-500 mt-1 max-w-[250px]">Target audiens, keynote, atau rundown acara belum ditambahkan.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        {((keg as any).audience || (keg as any).peserta) && (
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">Target Peserta / Audiens</p>
                            <p className="font-bold text-slate-800 text-[14px]">{(keg as any).audience || (keg as any).peserta}</p>
                          </div>
                        )}
                        {(keg as any).keynote && (
                          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
                            <p className="text-amber-600/70 text-[11px] font-bold uppercase tracking-wider mb-1">Keynote / Narasumber Utama</p>
                            <p className="font-bold text-amber-900 text-[14px]">{(keg as any).keynote}</p>
                          </div>
                        )}
                      </div>
                      
                      {(keg as any).rundown_url && (
                        <div className="pt-2">
                          <a href={(keg as any).rundown_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-full sm:w-auto h-10 px-6 bg-orange-600 text-white font-bold text-[13px] rounded-xl shadow-sm hover:bg-orange-700 transition-all">
                            <FileText className="mr-2 h-4 w-4" /> Buka Link Rundown Acara
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>

            </div>

            {/* Tamu VVIP Sidebar */}
            <div className="h-full">
              <Card className="rounded-[24px] bg-white border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="flex items-center gap-4 p-6 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center justify-center h-10 w-10 bg-amber-50 rounded-xl border border-amber-100 text-amber-600 shadow-sm">
                      <Crown className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-800">Tamu VVIP</h2>
                      <p className="text-xs font-medium text-slate-500 mt-1">Daftar kehadiran</p>
                    </div>
                  </div>
                  <div className="p-6 flex-1">
                    {!keg.tamu_vvip?.length ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-50 rounded-xl border border-slate-100 h-full">
                        <Crown className="h-8 w-8 text-amber-200 mb-3" />
                        <p className="text-sm font-bold text-slate-700">Belum Ada Tamu VVIP</p>
                        <p className="text-[12px] text-slate-500 mt-1 max-w-[200px]">Daftar kehadiran tamu kehormatan masih kosong.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {keg.tamu_vvip.map((t: any, idx: number) => {
                          const isString = typeof t === 'string';
                          return (
                            <div key={isString ? idx : t.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-100 to-orange-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600 group-hover:scale-110 transition-transform">
                                  <Crown className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-slate-900">{isString ? t : t.nama_tamu}</p>
                                  {!isString && (
                                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">{t.jabatan} · {t.instansi}</p>
                                  )}
                                </div>
                              </div>
                              
                              {!isString && t.tipe && (
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                                  <span className="bg-slate-50 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-slate-200">{t.tipe}</span>
                                  <span className="text-[11px] font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{t.jumlah_rombongan} Orang</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}


        {/* ── Tab REKRUTMEN & PENUGASAN ── */}
        {tab === "rekrutmen" && (
          <div className="grid lg:grid-cols-3 gap-6 items-stretch min-h-[500px]">
            <div className="lg:col-span-2 flex flex-col gap-6 h-full">
              {/* Admin: Pengaturan Open Recruitment */}
              {isAdmin && (
                <Card className="rounded-[24px] bg-white border border-slate-200 shadow-sm overflow-hidden relative shrink-0">
                  <div className="p-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center h-10 w-10 rounded-xl border shadow-sm transition-colors ${isDaftarOpen ? "bg-green-50 border-green-100 text-green-600" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                        <UserCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Status Open Recruitment</h2>
                        <p className="text-[13px] font-medium text-slate-500 mt-0.5">Buka atau tutup pendaftaran untuk seluruh anggota</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                      <span className={`text-[13px] font-bold uppercase tracking-wider ${isDaftarOpen ? "text-green-600" : "text-slate-500"}`}>{isDaftarOpen ? "Dibuka" : "Ditutup"}</span>
                      <Switch
                        checked={isDaftarOpen}
                        onCheckedChange={v => updateChecklist.mutate({ is_open_recruitment: v })}
                        className="data-[state=checked]:bg-green-500 shadow-sm"
                      />
                    </div>
                  </div>
                </Card>
              )}

              {/* Mahasiswa: Bursa Tugas */}
              {!isAdmin && (
                <Card className="rounded-[24px] bg-white border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`flex items-center justify-center h-12 w-12 rounded-xl border shadow-sm ${isDaftarOpen ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                        <Briefcase className="h-6 w-6 stroke-[2]" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-800">Bursa Tugas (Open Recruitment)</h2>
                        <p className="text-xs font-medium text-slate-500 mt-1">
                          {isDaftarOpen ? "Pendaftaran untuk tugas ini sedang dibuka." : "Pendaftaran untuk tugas ini ditutup."}
                        </p>
                      </div>
                    </div>

                    {!isDaftarOpen && !statusPendaftaran ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center flex-1 min-h-[160px]">
                        <UserCheck className="h-8 w-8 text-slate-300 mb-3" />
                        <h3 className="text-sm font-bold text-slate-700">Rekrutmen Ditutup</h3>
                        <p className="text-xs text-slate-500 mt-1">Saat ini pendaftaran kepanitiaan tidak tersedia.</p>
                      </div>
                    ) : !statusPendaftaran ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-600 mb-4">Anda dapat mengajukan diri untuk ikut serta.</p>
                        
                        <div className="mb-5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Pilih Peran</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button 
                              onClick={() => setSelectedRole('Protokoler')}
                              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-bold transition-all ${selectedRole === 'Protokoler' ? 'bg-orange-100 border-orange-500 text-orange-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                              <Users className="h-4 w-4" /> Protokoler
                            </button>
                            <button 
                              onClick={() => setSelectedRole('Liaison Officer')}
                              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-bold transition-all ${selectedRole === 'Liaison Officer' ? 'bg-blue-100 border-blue-500 text-blue-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                              <UserCheck className="h-4 w-4" /> Liaison Officer
                            </button>
                          </div>
                        </div>

                        <Button onClick={() => daftar.mutate()} disabled={daftar.isPending} className="w-full sm:w-auto rounded-xl bg-orange-500 text-white hover:bg-orange-600 font-semibold h-11 px-8 shadow-md transition-all">
                          {daftar.isPending ? "Mengajukan..." : `Ajukan Diri sebagai ${selectedRole}`}
                        </Button>
                      </div>
                    ) : (
                      <div className={`p-5 rounded-xl border backdrop-blur-sm shadow-sm ${isDiterima ? "bg-green-50/50 border-green-200/50" : statusPendaftaran === 'ditolak' ? "bg-red-50/50 border-red-200/50" : "bg-amber-50/50 border-amber-200/50"}`}>
                        <div className="flex items-start gap-4">
                          {isDiterima ? <CheckCircle2 className="h-6 w-6 text-green-500 mt-0.5" /> : statusPendaftaran === 'ditolak' ? <XCircle className="h-6 w-6 text-red-500 mt-0.5" /> : <Clock className="h-6 w-6 text-[#d2ad5c] mt-0.5" />}
                          <div>
                            <h3 className={`text-sm font-bold uppercase tracking-wider ${isDiterima ? "text-green-700" : statusPendaftaran === 'ditolak' ? "text-red-700" : "text-amber-700"}`}>
                              Status: {statusPendaftaran}
                            </h3>
                            <p className={`text-sm font-medium mt-1 ${isDiterima ? "text-green-600" : statusPendaftaran === 'ditolak' ? "text-red-600" : "text-slate-800"}`}>
                              {isDiterima ? "Selamat! Anda telah ditugaskan." : statusPendaftaran === 'ditolak' ? "Mohon maaf, Anda belum terpilih." : "Menunggu verifikasi dari pimpinan."}
                            </p>
                            {isDiterima && (
                              <Button variant="outline" onClick={() => toast.success("Mendownload Surat Tugas...")} className="mt-5 rounded-lg bg-white/60 border-green-200/60 text-green-700 hover:bg-white/80 h-9 px-5 text-xs font-semibold shadow-sm transition-all">
                                <FileSignature className="mr-2 h-4 w-4" /> Unduh Surat Tugas
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Admin: Seleksi Pendaftar */}
              {isAdmin && (
                <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden bg-white flex-1 flex flex-col">
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-slate-50/50 shrink-0">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center h-10 w-10 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-sm">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-[15px] font-bold text-slate-800 uppercase tracking-wider">Seleksi Pendaftar</h2>
                          <p className="text-[12px] text-slate-500 mt-0.5 font-medium">Kelola anggota yang telah mengajukan diri</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 overflow-auto bg-white">
                      {keg.pendaftar && keg.pendaftar.length > 0 ? (
                        <Table>
                          <TableHeader className="bg-white border-b border-slate-100">
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400 py-3 pl-6">Nama Pendaftar</TableHead>
                              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400 py-3">Performa</TableHead>
                              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400 py-3">Waktu Daftar</TableHead>
                              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400 py-3">Status</TableHead>
                              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-slate-400 py-3 text-right pr-6">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {keg.pendaftar.map((p: any) => {
                              const mockRating = (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1);
                              const isValidDate = p.tanggal_daftar && !isNaN(new Date(p.tanggal_daftar).getTime());
                              
                              return (
                              <TableRow key={p.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                                <TableCell className="py-4 pl-6">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-[14px] text-slate-800">{p.nama_lengkap}</span>
                                    <span className="text-[11px] text-slate-500 font-medium mt-0.5">Role: <span className="text-slate-700">{p.role || 'Protokoler'}</span></span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[13px] bg-amber-50 w-fit px-2 py-1 rounded-md border border-amber-100">
                                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> {mockRating}
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 text-slate-500 text-[13px] font-medium">
                                  {isValidDate ? new Date(p.tanggal_daftar).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }) : "—"}
                                </TableCell>
                                <TableCell className="py-4">
                                  <Badge variant="outline" className={`rounded-lg capitalize font-bold text-[11px] px-2.5 py-1 ${
                                    p.status === 'diterima' ? 'bg-green-50 text-green-700 border-green-200' :
                                    p.status === 'ditolak' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                                  }`}>
                                    {p.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-4 text-right pr-6">
                                  {p.status === 'pending' ? (
                                    <div className="flex justify-end gap-2">
                                      <Button size="sm" variant="outline" onClick={() => verifikasi.mutate({ pId: p.id, status: 'ditolak' })} className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 h-8 text-[11px] font-bold px-3 shadow-sm transition-all">
                                        <X className="h-3.5 w-3.5 mr-1" /> Tolak
                                      </Button>
                                      <Button size="sm" onClick={() => verifikasi.mutate({ pId: p.id, status: 'diterima' })} className="rounded-xl bg-green-500 hover:bg-green-600 text-white h-8 text-[11px] font-bold px-3 shadow-sm transition-all">
                                        <Check className="h-3.5 w-3.5 mr-1" /> Terima
                                      </Button>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 font-bold">—</span>
                                  )}
                                </TableCell>
                              </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full p-12 text-center min-h-[300px]">
                          <Briefcase className="h-10 w-10 text-slate-300 mb-4" />
                          <h3 className="font-bold text-slate-800">Belum ada pendaftar</h3>
                          <p className="text-sm text-slate-500 mt-1">Anggota protokoler dapat mendaftar jika status Open Recruitment aktif.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar Rekrutmen */}
            <div className="flex flex-col gap-6 h-full">
              {isAdmin && (
                <Card className="rounded-[24px] bg-white border border-slate-200 shadow-sm overflow-hidden shrink-0">
                  <div className="p-6 flex flex-col justify-center items-center h-[104px]">
                    <Button variant="outline" className="w-full rounded-xl border-green-200 bg-green-50 shadow-sm h-11 font-bold hover:bg-green-100 text-green-700 transition-colors" onClick={() => toast.success("Menerbitkan & membagikan surat tugas...")}>
                      <FileSignature className="mr-2 h-4 w-4" /> Terbitkan Surat Tugas
                    </Button>
                    <p className="text-[11px] font-medium text-slate-500 mt-2 text-center">Terbitkan surat jika tim sudah final</p>
                  </div>
                </Card>
              )}
              
              <Card className="rounded-[24px] bg-white border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
                   <h2 className="text-[15px] font-bold text-slate-800">Kebutuhan Petugas</h2>
                   <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Kuota tim yang diperlukan</p>
                </div>
                <div className="p-4 grid gap-2.5 flex-1 content-start bg-white">
                  <div className="flex justify-between items-center bg-white border border-slate-100 p-3 rounded-xl shadow-sm hover:border-slate-200 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                        <Users className="h-4 w-4" />
                      </div>
                      <span className="text-[13px] font-bold text-slate-700">Protokoler</span>
                    </div>
                    <span className="font-bold text-slate-800 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md text-[12px]">{keg.jumlah_protokoler_dibutuhkan || 0} Orang</span>
                  </div>
                  
                  <div className="flex justify-between items-center bg-white border border-slate-100 p-3 rounded-xl shadow-sm hover:border-slate-200 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <span className="text-[13px] font-bold text-slate-700">Liaison Officer</span>
                    </div>
                    <span className="font-bold text-slate-800 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md text-[12px]">{keg.jumlah_lo_dibutuhkan || 0} Orang</span>
                  </div>

                  <div className="flex justify-between items-center bg-white border border-slate-100 p-3 rounded-xl shadow-sm hover:border-slate-200 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Camera className="h-4 w-4" />
                      </div>
                      <span className="text-[13px] font-bold text-slate-700">Dokumentasi</span>
                    </div>
                    <span className="font-bold text-slate-800 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md text-[12px]">{keg.jumlah_dokumentasi_dibutuhkan || 0} Orang</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── Tab ABSENSI ── */}
        {tab === "absensi" && (
          <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden bg-white min-h-[500px] flex flex-col">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 bg-white border border-slate-200 text-slate-600 rounded-xl">
                    <CheckSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Rekap Absensi</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">Pantau kehadiran petugas bertugas</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {absensi && (
                <div className="flex gap-6 mb-6 p-4 bg-slate-50 border border-slate-200">
                  <div className="text-center">
                    <div className="text-3xl  font-bold text-green-600">{absensi.filter((a: any) => a.status === "hadir").length}</div>
                    <div className="text-xs text-slate-500 font-semibold uppercase">Hadir</div>
                  </div>
                  <div className="w-px bg-slate-200" />
                  <div className="text-center">
                    <div className="text-3xl  font-bold text-red-500">{absensi.filter((a: any) => a.status !== "hadir").length}</div>
                    <div className="text-xs text-slate-500 font-semibold uppercase">Tidak Hadir</div>
                  </div>
                  <div className="w-px bg-slate-200" />
                  <div className="text-center">
                    <div className="text-3xl  font-bold text-slate-800">{absensi.length}</div>
                    <div className="text-xs text-slate-500 font-semibold uppercase">Total</div>
                  </div>
                </div>
              )}
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold">Protokoler</TableHead>
                    <TableHead className="font-bold">Waktu Absen</TableHead>
                    <TableHead className="font-bold">Foto Selfie</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!absensi?.length ? (
                    <TableRow><TableCell colSpan={4} className="h-32 text-center text-slate-400">Belum ada data absensi.</TableCell></TableRow>
                  ) : (
                    absensi.map((a: any) => (
                      <TableRow key={a.id} className="border-b border-white/20">
                        <TableCell>
                          <p className="font-bold text-slate-800">{a.protokoler?.nama_lengkap}</p>
                          <p className="text-xs text-slate-500 font-mono">{a.protokoler?.nim}</p>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {new Date(a.waktu_absen).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </TableCell>
                        <TableCell>
                          {a.foto_selfie_url ? (
                            <a href={a.foto_selfie_url} target="_blank">
                              <div className="h-12 w-12 border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
                                <Image className="h-5 w-5 text-slate-400" />
                              </div>
                            </a>
                          ) : "—"}
                        </TableCell>
                        <TableCell><BadgeStatus status={a.status} /></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Tab EVALUASI ── */}
        {tab === "evaluasi" && (() => {
          const totalTestimoni = testimoni?.length || 0;
          const avgRating = totalTestimoni > 0 ? (testimoni.reduce((acc: any, curr: any) => acc + curr.rating, 0) / totalTestimoni).toFixed(1) : "0.0";
          const positiveCount = testimoni?.filter((t: any) => t.rating >= 4).length || 0;
          const hasSubmittedEvaluasi = isSuccessSubmit || evaluasi?.some((e: any) => e.protokoler_id === user?.id);

          return (
          <div className="space-y-6 min-h-[500px]">
            {/* Form Pengisian Evaluasi untuk Protokoler */}
            {/* Form Pengisian Evaluasi untuk Protokoler */}
            {!isAdmin && !hasSubmittedEvaluasi && (
              <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden bg-slate-50">
                 <div className="p-6 md:p-8">
                    <div className="flex items-start md:items-center gap-4 mb-6">
                      <div className="flex items-center justify-center h-12 w-12 bg-white rounded-xl shadow-sm text-slate-600 shrink-0 border border-slate-200">
                        <FileSignature className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-1">Pengisian Evaluasi Kegiatan</h2>
                        <p className="text-sm text-slate-600">Silakan isi evaluasi kinerja dan masukan untuk mendapatkan e-sertifikat tugas Anda.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                       <div>
                          <label className="text-[13px] font-bold text-slate-700 block mb-2">Rating Acara</label>
                          <div className="flex gap-2" onMouseLeave={() => setHoverRating(0)}>
                             {[1,2,3,4,5].map(star => (
                               <Star 
                                 key={star} 
                                 onClick={() => setRatingAcara(star)}
                                 onMouseEnter={() => setHoverRating(star)}
                                 className={`h-7 w-7 cursor-pointer transition-colors ${star <= (hoverRating || ratingAcara) ? "text-amber-500 fill-amber-500" : "text-slate-200"}`} 
                               />
                             ))}
                          </div>
                       </div>
                       <div className="grid md:grid-cols-2 gap-5">
                          <div>
                            <label className="text-[13px] font-bold text-slate-700 block mb-2">Evaluasi Diri</label>
                            <Textarea value={evaluasiDiri} onChange={(e) => setEvaluasiDiri(e.target.value)} placeholder="Bagaimana performa Anda selama bertugas..." className="bg-slate-50 border-slate-200 focus:bg-white min-h-[100px] text-[13px]" />
                          </div>
                          <div>
                            <label className="text-[13px] font-bold text-slate-700 block mb-2">Kendala</label>
                            <Textarea value={kendala} onChange={(e) => setKendala(e.target.value)} placeholder="Tuliskan kendala yang dihadapi di lapangan..." className="bg-slate-50 border-slate-200 focus:bg-white min-h-[100px] text-[13px]" />
                          </div>
                       </div>
                       <div>
                          <label className="text-[13px] font-bold text-slate-700 block mb-2">Saran & Masukan</label>
                          <Textarea value={saran} onChange={(e) => setSaran(e.target.value)} placeholder="Saran Anda untuk perbaikan kepanitiaan atau kegiatan berikutnya..." className="bg-slate-50 border-slate-200 focus:bg-white min-h-[100px] text-[13px]" />
                       </div>
                       <div className="flex justify-end pt-2">
                          <Button 
                            onClick={() => {
                              if (!ratingAcara) return toast.error('Silakan berikan rating acara terlebih dahulu');
                              setIsSuccessSubmit(true);
                              toast.success('Evaluasi berhasil dikirim!');
                            }} 
                            className="rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold h-11 px-8 shadow-md"
                          >
                            Kirim Evaluasi
                          </Button>
                       </div>
                    </div>
                 </div>
              </Card>
            )}

            {/* Indikator Evaluasi Berhasil Disubmit */}
            {!isAdmin && hasSubmittedEvaluasi && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                <div className="flex items-center justify-center h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-800">Evaluasi Berhasil Disubmit</h3>
                  <p className="text-[11px] md:text-xs text-emerald-600 mt-0.5">Terima kasih atas partisipasi dan masukan Anda. Anda kini dapat melihat hasil evaluasi keseluruhan di bawah ini.</p>
                </div>
              </div>
            )}

            {/* Floating Stats Grid */}
            {isAdmin && (
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { label: 'Rata-rata Rating', value: avgRating, hint: 'Dari tamu undangan', icon: Star },
                  { label: 'Total Testimoni', value: totalTestimoni.toString(), hint: 'Umpan balik masuk', icon: MessageSquare },
                  { label: 'Respon Positif', value: positiveCount.toString(), hint: 'Rating 4 ke atas', icon: ClipboardCheck },
                ].map((stat, index) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }}>
                    <div className="bg-white border border-slate-200 rounded-[24px] py-6 px-6 flex flex-col justify-between hover:shadow-lg hover:shadow-slate-100 transition-all group relative overflow-hidden h-full shadow-sm">
                      <div className="flex items-center justify-between relative z-10">
                        <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl transition-colors bg-slate-50 text-slate-600 border border-slate-100 group-hover:bg-slate-100">
                          <stat.icon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="mt-4 relative z-10">
                        <p className="text-[32px] font-bold leading-tight text-slate-900">{stat.value}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[11px] font-medium text-slate-400">{stat.hint}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            {/* Detail Panel */}
            {(isAdmin || hasSubmittedEvaluasi) && (
              <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-0 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 bg-white text-slate-600 rounded-xl border border-slate-200">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Detail Hasil Evaluasi</h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">Ringkasan evaluasi, testimoni, dan feedback admin.</p>
                    </div>
                  </div>
                  <Badge className="rounded-md border border-emerald-200 text-emerald-700 bg-emerald-50 shadow-sm">Selesai</Badge>
                </div>
                
                <div className="p-6 flex flex-col space-y-6">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'evaluasi', label: 'Evaluasi' },
                      { key: 'testimoni', label: 'Testimoni' },
                      { key: 'feedback', label: 'Feedback' },
                    ].map((item) => {
                      const active = evaluasiTab === item.key;
                      return (
                        <button
                          key={item.key}
                          onClick={() => setEvaluasiTab(item.key as any)}
                          className={`border px-3 py-2.5 text-sm transition-all rounded-xl font-bold ${active ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="min-h-[400px] flex flex-col">
                  {evaluasiTab === 'evaluasi' && (
                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                        {!evaluasi?.length ? (
                          <div className="p-8 text-center text-slate-400">Belum ada evaluasi dari protokoler.</div>
                        ) : (
                          evaluasi.map((item: any) => (
                            <div key={item.id} className="p-5">
                              <div className="flex items-center justify-between gap-3 mb-2">
                                <div>
                                  <div className="font-semibold text-slate-800 text-sm md:text-base">{item.protokoler?.nama_lengkap}</div>
                                  <div className="text-xs text-slate-500 mt-0.5">
                                    {new Date(item.waktu_pengisian).toLocaleString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':')} · {item.dalam_batas_waktu ? "Tepat waktu" : "Melewati batas"}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-amber-500">
                                  {[...Array(5)].map((_, index) => (
                                    <Star key={index} className={`h-4 w-4 ${index < item.rating_kegiatan ? "fill-current" : "text-slate-200"}`} />
                                  ))}
                                </div>
                              </div>
                              <p className="mt-3 text-[13px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                                {item.saran ? item.saran : "Evaluasi diselesaikan dengan baik dan lancar. Kendala dapat diatasi dengan sigap."}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="flex justify-end pt-4 mt-auto">
                        <Button onClick={() => toast.success('File ekspor berhasil disiapkan')} className="rounded-xl bg-slate-950 text-white hover:bg-slate-800 font-bold h-11 px-5 shadow-md">
                          <Download className="mr-2 h-4 w-4" /> Export Data
                        </Button>
                      </div>
                    </div>
                  )}

                  {evaluasiTab === 'testimoni' && (
                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-4">
                        {!testimoni?.length ? (
                          <div className="p-8 text-center border border-slate-200 rounded-xl text-slate-400">Belum ada testimoni dari tamu.</div>
                        ) : (
                          testimoni.map((item: any) => (
                            <div key={item.id} className="border border-slate-200 bg-white rounded-xl p-5 shadow-sm">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="font-semibold text-slate-800 text-sm md:text-base">{item.nama_tamu}</div>
                                  <div className="text-xs text-slate-500 mt-0.5">{item.jabatan_tamu || "Tamu Undangan"}</div>
                                </div>
                                <Badge className={`rounded-lg font-bold shadow-sm ${item.rating >= 4 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
                                  {item.rating >= 4 ? "Positif" : "Netral"}
                                </Badge>
                              </div>
                              <div className="mt-3 flex items-center gap-1 text-amber-500 mb-3">
                                {[...Array(5)].map((_, index) => (
                                  <Star key={index} className={`h-4 w-4 ${index < item.rating ? "fill-current" : "text-slate-200"}`} />
                                ))}
                              </div>
                              <p className="text-[13px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                                {item.isi_testimoni}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="flex justify-end pt-4 mt-auto">
                        <Button onClick={() => toast.success('File ekspor berhasil disiapkan')} className="rounded-xl bg-slate-950 text-white hover:bg-slate-800 font-bold h-11 px-5 shadow-md">
                          <Download className="mr-2 h-4 w-4" /> Export Testimoni
                        </Button>
                      </div>
                    </div>
                  )}

                  {evaluasiTab === 'feedback' && (
                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-4 flex-1 flex flex-col">
                        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Catatan Admin</div>
                        {isAdmin ? (
                          <>
                            <Textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Tuliskan catatan atau umpan balik khusus untuk kegiatan ini..." className="flex-1 min-h-[160px] rounded-xl border-slate-200 bg-slate-50 focus:bg-white text-[13px] leading-relaxed p-4" />
                            <div className="flex items-center justify-between gap-3 pt-4">
                              <p className="text-[11px] text-slate-400 font-medium">Feedback ini akan menjadi ringkasan yang terlihat oleh seluruh admin dan protokoler.</p>
                              <Button onClick={() => toast.success('Feedback admin berhasil disimpan')} className="rounded-xl bg-slate-950 text-white hover:bg-slate-800 font-bold h-11 px-6 shadow-md shrink-0">
                                <MessageSquare className="mr-2 h-4 w-4" /> Simpan
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="flex-1 min-h-[160px] rounded-xl border border-slate-200 bg-slate-50 p-5 flex flex-col items-center justify-center">
                            {feedbackText ? (
                              <p className="text-[13px] leading-relaxed text-slate-700 w-full h-full">{feedbackText}</p>
                            ) : (
                              <div className="text-center">
                                <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-[13px] text-slate-400">Belum ada catatan atau umpan balik dari pimpinan untuk kegiatan ini.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              </CardContent>
            </Card>
            )}
          </div>
          );
        })()}
        {/* ── Tab DOKUMENTASI ── */}
        {tab === "dokumentasi" && (
          <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden bg-white min-h-[500px] flex flex-col">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 bg-white border border-slate-200 text-slate-600 rounded-xl">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Galeri Dokumentasi</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">Kumpulan foto dan dokumen kegiatan</p>
                  </div>
                </div>
              </div>
              <div className="p-12 text-center text-slate-500 bg-slate-50 border-t border-white/20">
                <Image className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">Galeri dokumentasi kegiatan akan tampil di sini.</p>
              {isAdmin && (
                <Button variant="outline" className="rounded-xl border-slate-300 mt-4">
                  + Upload Foto / Dokumen
                </Button>
              )}
              </div>
            </CardContent>
          </Card>
        )}

      </motion.div>
      </div>
    </div>
  );
}
