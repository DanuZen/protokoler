"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kegiatanApi, pendaftaranApi, absensiApi, evaluasiApi, testimoniApi, protokolerApi } from "@/lib/api";
import { useAuth, useRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BadgeStatus } from "@/components/BadgeStatus";
import { BadgeKategori } from "@/components/BadgeKategori";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MapPin, Clock, Calendar, Users, CheckSquare, Square, Star, Image, FileText, Info, Crown, ClipboardCheck, MessageSquare, Camera, Briefcase, FileSignature, CheckCircle2, XCircle, UserCheck, Check, X, BarChart3, Download, AlertCircle } from "lucide-react";
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
  
  // State untuk Kamera (Absensi)
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAbsenSuccess, setIsAbsenSuccess] = useState(false);
  const [attendanceType, setAttendanceType] = useState<'hadir' | 'izin' | null>(null);
  const [izinReason, setIzinReason] = useState('');

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      setIsCameraOpen(true);
    } catch (err) {
      toast.error('Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  useEffect(() => {
    if (isCameraOpen && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraOpen, stream]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const { data: keg, isLoading } = useQuery({
    queryKey: ["kegiatan", id],
    queryFn: () => kegiatanApi.get(id),
  });

  const { data: protokoler } = useQuery({
    queryKey: ["protokoler-me"],
    queryFn: () => protokolerApi.list().then((list: any[]) =>
      list.find((p: any) => p.user_id === user?.id) ?? null
    ),
    enabled: !!user,
  });
  const isPendingAccount = (protokoler?.status_akun ?? 'pending').toLowerCase() === 'pending';

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

  const isDaftarOpen = true; // (keg as any).is_open_recruitment; // Diubah untuk demo agar selalu terbuka
  const statusPendaftaran = (keg as any).pendaftar?.find((p: any) => p.protokoler_id === user?.id)?.status;
  const isDiterima = isPendingAccount ? false : true; // Diubah untuk demo, aslinya statusPendaftaran === 'diterima'

  const tabs: { key: Tab; label: string }[] = [
    { key: "info", label: "Info" },
    { key: "rekrutmen", label: "Rekrutmen & Penugasan" },
    { key: "absensi", label: "Absensi" },
    { key: "evaluasi", label: "Evaluasi" },
    { key: "dokumentasi", label: "Dokumentasi" },
  ];

  return (
    <div className="flex flex-col h-auto md:h-dvh md:overflow-hidden pb-6 px-6 md:px-8 pt-4 relative z-10">
      {/* ─── HEADER SECTION ──────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 pb-6 border-b border-slate-200/60">
        <div className="flex items-start md:items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-700 to-red-800 shadow-lg shadow-red-800/20 text-white">
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
              <Button className="rounded-xl bg-red-800 hover:bg-red-900 text-white shadow-md shadow-red-800/10 h-11 px-5 font-bold transition-all">
                Edit Kegiatan
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="shrink-0 flex gap-2 overflow-x-auto mb-8 pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap shadow-sm border ${
              tab === t.key
                ? "bg-red-800 border-red-800 text-white shadow-md shadow-red-800/20"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-red-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-2 pb-12">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="h-full flex flex-col">
            
            {/* ── Tab INFO ── */}
        {tab === "info" && (
          <div className="grid lg:grid-cols-3 gap-6 items-stretch min-h-[500px]">
            {/* Left Card: Informasi Kegiatan */}
            <div className="lg:col-span-2 flex flex-col h-full">
              <Card className="rounded-[24px] bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex items-center justify-center h-12 w-12 bg-slate-50 rounded-xl shadow-sm text-slate-600 shrink-0 border border-slate-200">
                      <Info className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 mb-1">Informasi Kegiatan</h2>
                      <p className="text-sm text-slate-600">Detail spesifik mengenai waktu, lokasi, dan tamu VIP kegiatan.</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-8 flex-1">
              
              {/* Info Dasar */}
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center justify-center h-10 w-10 bg-slate-50 rounded-xl text-slate-600">
                    <Info className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-slate-800">Info Dasar</h2>
                    <p className="text-[12px] font-medium text-slate-500 mt-0.5">Waktu dan lokasi pelaksanaan kegiatan</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5 bg-slate-50/50 p-4 rounded-xl">
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
                  <div className="space-y-1.5 bg-slate-50/50 p-4 rounded-xl">
                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Waktu Pelaksanaan</p>
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-red-50 text-red-800">
                        <Clock className="h-4 w-4" />
                      </div>
                      <p className="font-bold text-slate-800 text-[14px]">
                        {keg.jam_mulai?.slice(0, 5)} – {keg.jam_selesai?.slice(0, 5)} WIB
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5 bg-slate-50/50 p-4 rounded-xl">
                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Lokasi / Tempat</p>
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <p className="font-bold text-slate-800 text-[14px]">{keg.lokasi}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 bg-slate-50/50 p-4 rounded-xl">
                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Bentuk / Jenis Kegiatan</p>
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600">
                        <FileText className="h-4 w-4" />
                      </div>
                      <p className="font-bold text-slate-800 text-[14px] capitalize">{(keg.bentuk || keg.bentuk_kegiatan || "Kegiatan").replace(/_/g, " ")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Acara */}
              <div className="flex flex-col flex-1 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center justify-center h-10 w-10 bg-amber-50 rounded-xl text-amber-600">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-slate-800">Detail Acara</h2>
                    <p className="text-[12px] font-medium text-slate-500 mt-0.5">Target audiens, narasumber, dan rundown</p>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col">
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
                          <a href={(keg as any).rundown_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-full sm:w-auto h-10 px-6 bg-red-800 text-white font-bold text-[13px] rounded-xl shadow-sm hover:bg-red-900 transition-all">
                            <FileText className="mr-2 h-4 w-4" /> Buka Link Rundown Acara
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
                </div>
              </Card>
            </div>

            {/* Right Card: Tamu VVIP */}
            <div className="lg:col-span-1 flex flex-col h-full">
              <Card className="rounded-[24px] bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="p-6 md:p-8 border-b border-slate-100 shrink-0 text-center">
                   <h2 className="text-[15px] font-bold text-slate-800">Tamu VVIP</h2>
                   <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Daftar kehadiran</p>
                </div>
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <div className="flex-1">
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
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-100 to-red-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600 group-hover:scale-110 transition-transform">
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
                </div>
              </Card>
            </div>
          </div>
        )}


        {/* ── Tab REKRUTMEN & PENUGASAN ── */}
        {tab === "rekrutmen" && (
          <div className="grid lg:grid-cols-4 gap-6 items-stretch min-h-[550px]">
            <div className="lg:col-span-3 flex flex-col gap-6 h-full">
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
                  <div className="p-6 md:p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`flex items-center justify-center h-12 w-12 rounded-xl border shadow-sm ${isDaftarOpen ? 'bg-rose-50 border-rose-100 text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
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
                      <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center flex-1 min-h-[200px]">
                        <UserCheck className="h-10 w-10 text-slate-300 mb-3" />
                        <h3 className="text-[15px] font-bold text-slate-700">Rekrutmen Ditutup</h3>
                        <p className="text-[13px] text-slate-500 mt-1 max-w-[250px]">Saat ini pendaftaran kepanitiaan tidak tersedia atau telah ditutup.</p>
                      </div>
                    ) : isPendingAccount && !statusPendaftaran ? (
                      <div className="bg-amber-50/50 border border-amber-100 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center flex-1 min-h-[250px] p-8">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 text-amber-600 mb-4 mx-auto shadow-sm border border-amber-200">
                          <AlertCircle className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-bold text-amber-900 mb-2">Menunggu Verifikasi Akun</h3>
                        <p className="text-[13px] text-amber-700/80 max-w-[320px] leading-relaxed mx-auto">
                          Anda belum dapat mendaftar kegiatan ini karena akun Anda masih berstatus <strong className="text-amber-700">Pending</strong>. Harap tunggu admin untuk memverifikasi akun Anda.
                        </p>
                      </div>
                    ) : !statusPendaftaran ? (
                      <div className="bg-slate-50/50 border border-slate-100 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center flex-1 min-h-[250px] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/80 via-white to-blue-50/80 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="relative z-10 w-full max-w-md mx-auto p-8 flex flex-col h-full justify-center">
                          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 text-rose-900 mb-4 mx-auto shadow-sm border border-rose-200">
                            <Star className="h-6 w-6 fill-rose-900 text-rose-900" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 mb-2">Mari Bergabung Bersama Tim!</h3>
                          <p className="text-[13px] text-slate-500 mb-8 leading-relaxed max-w-[300px] mx-auto">
                            Pilih peran yang paling sesuai dengan minat dan kemampuan Anda untuk ikut serta dalam menyukseskan kegiatan ini.
                          </p>
                          
                          <div className="mb-6 text-left w-full">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 block text-center">Pilih Peran Penugasan</label>
                            <div className="grid grid-cols-2 gap-4">
                              <button 
                                onClick={() => setSelectedRole('Protokoler')}
                                className={`flex flex-col items-center justify-center gap-3 py-5 rounded-2xl border-2 transition-all duration-300 ${selectedRole === 'Protokoler' ? 'bg-rose-50 border-rose-900 text-rose-900 shadow-md scale-[1.02]' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:scale-[1.02]'}`}>
                                <Users className={`h-7 w-7 transition-colors ${selectedRole === 'Protokoler' ? 'text-rose-900' : 'text-slate-400'}`} /> 
                                <span className="text-[14px] font-bold">Protokoler</span>
                              </button>
                              <button 
                                onClick={() => setSelectedRole('Liaison Officer')}
                                className={`flex flex-col items-center justify-center gap-3 py-5 rounded-2xl border-2 transition-all duration-300 ${selectedRole === 'Liaison Officer' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md scale-[1.02]' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:scale-[1.02]'}`}>
                                <UserCheck className={`h-7 w-7 transition-colors ${selectedRole === 'Liaison Officer' ? 'text-blue-600' : 'text-slate-400'}`} /> 
                                <span className="text-[14px] font-bold">Liaison Officer</span>
                              </button>
                            </div>
                          </div>

                          <Button onClick={() => daftar.mutate()} disabled={daftar.isPending} className="w-full rounded-xl bg-[#5B1015] text-white hover:bg-rose-950 font-bold h-12 shadow-lg shadow-rose-900/20 hover:shadow-xl hover:shadow-rose-900/30 transition-all mt-auto">
                            {daftar.isPending ? "Memproses..." : `Ajukan Diri sebagai ${selectedRole}`}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className={`p-6 rounded-2xl border backdrop-blur-sm shadow-sm flex-1 flex flex-col justify-center ${isDiterima ? "bg-green-50/50 border-green-200/50" : statusPendaftaran === 'ditolak' ? "bg-red-50/50 border-red-200/50" : "bg-amber-50/50 border-amber-200/50"}`}>
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${isDiterima ? 'bg-green-100 text-green-600' : statusPendaftaran === 'ditolak' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                            {isDiterima ? <CheckCircle2 className="h-6 w-6" /> : statusPendaftaran === 'ditolak' ? <XCircle className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                          </div>
                          <div className="flex-1">
                            <h3 className={`text-sm font-bold uppercase tracking-wider mb-1 ${isDiterima ? "text-green-700" : statusPendaftaran === 'ditolak' ? "text-red-700" : "text-amber-700"}`}>
                              Status Pengajuan: {statusPendaftaran}
                            </h3>
                            <p className={`text-[13px] font-medium leading-relaxed ${isDiterima ? "text-green-600" : statusPendaftaran === 'ditolak' ? "text-red-600" : "text-amber-800"}`}>
                              {isDiterima ? "Selamat! Anda telah resmi ditugaskan untuk kegiatan ini. Persiapkan diri Anda dengan baik." : statusPendaftaran === 'ditolak' ? "Mohon maaf, Anda belum terpilih untuk penugasan kali ini. Tetap semangat untuk kegiatan berikutnya." : "Pengajuan Anda sedang menunggu verifikasi dan persetujuan dari pimpinan atau admin."}
                            </p>
                            {isDiterima && (
                              <Button variant="outline" onClick={() => toast.success("Mendownload Surat Tugas...")} className="mt-5 rounded-xl bg-white/80 border-green-200 text-green-700 hover:bg-white h-10 px-6 text-[13px] font-bold shadow-sm transition-all w-full sm:w-auto">
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
                                    p.status === 'ditolak' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-red-50 text-red-900 border-red-200'
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
            <div className="flex flex-col gap-6 h-full lg:col-span-1">
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
                <div className="p-6 md:p-8 border-b border-slate-100 shrink-0 text-center">
                   <h2 className="text-[15px] font-bold text-slate-800">Kebutuhan Petugas</h2>
                   <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Kuota tim yang diperlukan</p>
                </div>
                <div className="p-6 md:p-8 flex flex-col gap-5 flex-1 bg-white">
                  <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl shadow-sm hover:border-slate-200 transition-all flex-1 p-5 group">
                    <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Users className="h-7 w-7" />
                    </div>
                    <span className="text-[15px] font-bold text-slate-800 mb-2">Protokoler</span>
                    <span className="font-bold text-rose-900 bg-white border border-rose-200 px-4 py-1.5 rounded-lg text-[13px] shadow-sm">{keg.jumlah_protokoler_dibutuhkan || 0} Orang</span>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl shadow-sm hover:border-slate-200 transition-all flex-1 p-5 group">
                    <div className="h-14 w-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <UserCheck className="h-7 w-7" />
                    </div>
                    <span className="text-[15px] font-bold text-slate-800 mb-2">Liaison Officer</span>
                    <span className="font-bold text-blue-700 bg-white border border-blue-200 px-4 py-1.5 rounded-lg text-[13px] shadow-sm">{keg.jumlah_lo_dibutuhkan || 0} Orang</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── Tab ABSENSI ── */}
        {tab === "absensi" && (
          <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden bg-slate-50 min-h-[500px] flex flex-col">
            <div className="p-6 md:p-8 flex flex-col flex-1">
              <div className="flex items-start md:items-center justify-between gap-4 mb-6">
                <div className="flex items-start md:items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 bg-white rounded-xl shadow-sm text-slate-600 shrink-0 border border-slate-200">
                    <CheckSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-1">{isAdmin ? "Rekap Absensi" : "Pengisian Kehadiran"}</h2>
                    <p className="text-sm text-slate-600">{isAdmin ? "Pantau kehadiran petugas bertugas secara real-time." : "Silakan ambil selfie atau ajukan izin sebagai konfirmasi kehadiran."}</p>
                  </div>
                </div>
                {!isAdmin && isDiterima && attendanceType && !isAbsenSuccess && (
                  <Button variant="ghost" size="sm" onClick={() => { setAttendanceType(null); setPhoto(null); stopCamera(); setIzinReason(''); }} className="text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
                  </Button>
                )}
              </div>
              
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm w-full flex-1 flex flex-col justify-center">
                
                {/* Modul Kamera Absensi untuk Protokoler (Non-Admin & Diterima) */}
                {!isAdmin && isDiterima && (
                  <div className="w-full flex flex-col items-center justify-center flex-1">
                      {isAbsenSuccess ? (
                        <div className="text-center py-8">
                          <div className={`mx-auto h-16 w-16 ${attendanceType === 'hadir' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'} rounded-full flex items-center justify-center mb-4`}>
                            {attendanceType === 'hadir' ? <CheckCircle2 className="h-8 w-8" /> : <ClipboardCheck className="h-8 w-8" />}
                          </div>
                          <h4 className="font-bold text-slate-800 text-lg">{attendanceType === 'hadir' ? 'Kehadiran Tercatat!' : 'Izin Tercatat!'}</h4>
                          <p className="text-sm text-slate-500 mt-1">{attendanceType === 'hadir' ? 'Terima kasih, selamat bertugas.' : 'Terima kasih atas konfirmasinya.'}</p>
                        </div>
                      ) : (
                        <div className="w-full max-w-md">
                          {!attendanceType ? (
                            <div className="flex gap-4">
                              <div className="flex-1 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-white hover:bg-green-50 hover:border-green-200 transition-colors cursor-pointer group shadow-sm hover:shadow-md" onClick={() => setAttendanceType('hadir')}>
                                <div className="h-14 w-14 rounded-full bg-slate-50 text-slate-400 group-hover:bg-green-100 group-hover:text-green-600 flex items-center justify-center mb-4 transition-colors">
                                  <Camera className="h-6 w-6" />
                                </div>
                                <h4 className="font-bold text-slate-700 group-hover:text-green-700">Saya Hadir</h4>
                                <p className="text-xs text-slate-500 text-center mt-1">Ambil selfie di lokasi</p>
                              </div>
                              <div className="flex-1 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-white hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer group shadow-sm hover:shadow-md" onClick={() => setAttendanceType('izin')}>
                                <div className="h-14 w-14 rounded-full bg-slate-50 text-slate-400 group-hover:bg-red-100 group-hover:text-red-800 flex items-center justify-center mb-4 transition-colors">
                                  <XCircle className="h-6 w-6" />
                                </div>
                                <h4 className="font-bold text-slate-700 group-hover:text-red-900">Tidak Hadir</h4>
                                <p className="text-xs text-slate-500 text-center mt-1">Berikan alasan (Izin)</p>
                              </div>
                            </div>
                          ) : attendanceType === 'izin' ? (
                            <div className="flex flex-col gap-4">
                              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <label className="text-[13px] font-bold text-slate-700 mb-2 block">Alasan Berhalangan Hadir <span className="text-red-500">*</span></label>
                                <Textarea 
                                  placeholder="Tuliskan alasan Anda berhalangan hadir..." 
                                  className="bg-white border-slate-200 focus-visible:ring-red-700 resize-none h-32"
                                  value={izinReason}
                                  onChange={(e) => setIzinReason(e.target.value)}
                                />
                              </div>
                              <Button 
                                onClick={() => { 
                                  if(!izinReason.trim()) return toast.error('Harap isi alasan tidak hadir');
                                  setIsAbsenSuccess(true); toast.success('Status izin berhasil dikirim!'); 
                                }} 
                                className="w-full rounded-xl bg-red-800 hover:bg-red-900 text-white h-12 font-bold shadow-md shadow-red-800/20"
                              >
                                Kirim Keterangan Izin
                              </Button>
                            </div>
                          ) : (
                            // Camera UI for 'hadir'
                            <div>
                              {!isCameraOpen && !photo ? (
                                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={startCamera}>
                                  <div className="h-14 w-14 rounded-full bg-red-100 text-red-800 flex items-center justify-center mb-4">
                                    <Camera className="h-6 w-6" />
                                  </div>
                                  <h4 className="font-bold text-slate-700 mb-1">Buka Kamera</h4>
                                  <p className="text-xs text-slate-500 text-center">Klik untuk mengambil foto selfie</p>
                                </div>
                              ) : isCameraOpen ? (
                                <div className="flex flex-col items-center">
                                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] w-full shadow-inner mb-4">
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                    {/* Overlay guides */}
                                    <div className="absolute inset-0 border-[3px] border-white/20 m-4 rounded-xl pointer-events-none"></div>
                                  </div>
                                  <div className="flex gap-3 w-full">
                                    <Button variant="outline" onClick={stopCamera} className="flex-1 rounded-xl border-slate-200 h-12 font-bold text-slate-600">Batal</Button>
                                    <Button onClick={capturePhoto} className="flex-1 rounded-xl bg-red-800 hover:bg-red-900 text-white h-12 font-bold shadow-md shadow-red-800/20">Ambil Foto</Button>
                                  </div>
                                  <canvas ref={canvasRef} className="hidden" />
                                </div>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-[3/4] w-full shadow-sm border border-slate-200 mb-4">
                                    <img src={photo || ""} alt="Selfie Absensi" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex gap-3 w-full mb-4">
                                    <Button variant="outline" onClick={() => { setPhoto(null); startCamera(); }} className="flex-1 rounded-xl border-slate-200 h-12 font-bold text-slate-600">Foto Ulang</Button>
                                    <Button onClick={() => { setIsAbsenSuccess(true); toast.success('Absensi berhasil disimpan!'); }} className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white h-12 font-bold shadow-md shadow-green-600/20">Kirim Absensi</Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                )}
                
                {!isAdmin && !isDiterima && (
                  <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50 rounded-2xl border border-slate-200 border-dashed w-full max-w-2xl mx-auto">
                    <Camera className="h-10 w-10 text-slate-300 mb-4" />
                    <h3 className="text-[15px] font-bold text-slate-700">Tidak Dapat Mengisi Kehadiran</h3>
                    <p className="text-[13px] text-slate-500 mt-1 max-w-[300px]">Anda belum berstatus ditugaskan untuk kegiatan ini sehingga tidak dapat mengakses form absensi.</p>
                  </div>
                )}

                {isAdmin && (
                  <div className="w-full">
                    {absensi && (
                    <div className="flex gap-6 mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl justify-center w-fit mx-auto md:w-full md:mx-0">
                      <div className="text-center px-4">
                        <div className="text-3xl font-bold text-green-600">{absensi.filter((a: any) => a.status === "hadir").length}</div>
                        <div className="text-xs text-slate-500 font-semibold uppercase mt-1">Hadir</div>
                      </div>
                      <div className="w-px bg-slate-200" />
                      <div className="text-center px-4">
                        <div className="text-3xl font-bold text-red-500">{absensi.filter((a: any) => a.status !== "hadir").length}</div>
                        <div className="text-xs text-slate-500 font-semibold uppercase mt-1">Tidak Hadir</div>
                      </div>
                      <div className="w-px bg-slate-200" />
                      <div className="text-center px-4">
                        <div className="text-3xl font-bold text-slate-800">{absensi.length}</div>
                        <div className="text-xs text-slate-500 font-semibold uppercase mt-1">Total</div>
                      </div>
                    </div>
                    )}
                    <div className="rounded-xl overflow-hidden border border-slate-200 w-full">
                      <Table className="w-full">
                        <TableHeader className="bg-slate-50/50">
                          <TableRow>
                            <TableHead className="font-bold pl-6 py-4">Protokoler</TableHead>
                            <TableHead className="font-bold py-4">Waktu Absen</TableHead>
                            <TableHead className="font-bold py-4">Foto Selfie</TableHead>
                            <TableHead className="font-bold py-4">Status</TableHead>
                            <TableHead className="font-bold text-right pr-6 py-4">Verifikasi Admin</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {!absensi?.length ? (
                            <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-400">Belum ada data absensi.</TableCell></TableRow>
                          ) : (
                            absensi.map((a: any) => (
                              <TableRow key={a.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                                <TableCell className="py-3 pl-6">
                                  <p className="font-bold text-slate-800">{a.protokoler?.nama_lengkap}</p>
                                  <p className="text-xs text-slate-500 font-mono mt-0.5">{a.protokoler?.nim}</p>
                                </TableCell>
                                <TableCell className="text-sm font-medium text-slate-600 py-3">
                                  {new Date(a.waktu_absen).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                                </TableCell>
                                <TableCell className="py-3">
                                  {a.foto_selfie_url ? (
                                    <a href={a.foto_selfie_url} target="_blank" className="block group w-fit">
                                      <div className="h-14 w-14 rounded-xl border border-slate-200 overflow-hidden bg-white flex items-center justify-center group-hover:border-red-300 shadow-sm transition-all relative">
                                        <img src={a.foto_selfie_url} alt="Selfie" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Camera className="h-5 w-5 text-white drop-shadow-md" />
                                        </div>
                                      </div>
                                    </a>
                                  ) : (
                                    <div className="h-10 w-10 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center text-slate-300">
                                      <X className="h-4 w-4" />
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="py-3">
                                  <BadgeStatus status={a.status} />
                                </TableCell>
                                <TableCell className="py-3 pr-6 text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="outline" onClick={() => toast.success('Absensi ditolak')} className="rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 h-8 text-[11px] font-bold px-3 shadow-sm transition-all">
                                      <X className="h-3.5 w-3.5 mr-1.5" /> Tolak
                                    </Button>
                                    <Button size="sm" onClick={() => toast.success('Kehadiran tervalidasi')} className="rounded-lg bg-green-500 hover:bg-green-600 text-white h-8 text-[11px] font-bold px-3 shadow-sm transition-all">
                                      <Check className="h-3.5 w-3.5 mr-1.5" /> Valid
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
        {tab === "evaluasi" && (() => {
          const totalTestimoni = testimoni?.length || 0;
          const avgRating = totalTestimoni > 0 ? ((testimoni || []).reduce((acc: any, curr: any) => acc + curr.rating, 0) / totalTestimoni).toFixed(1) : "0.0";
          const positiveCount = testimoni?.filter((t: any) => t.rating >= 4).length || 0;
          const hasSubmittedEvaluasi = isSuccessSubmit || evaluasi?.some((e: any) => e.protokoler_id === user?.id);

          return (
          <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden bg-slate-50 min-h-[500px] flex flex-col">
            <div className="p-6 md:p-8 flex flex-col flex-1">
              <div className="flex items-start md:items-center justify-between gap-4 mb-6">
                <div className="flex items-start md:items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 bg-white rounded-xl shadow-sm text-slate-600 shrink-0 border border-slate-200">
                    <FileSignature className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-1">Evaluasi Kegiatan</h2>
                    <p className="text-sm text-slate-600">Feedback, saran, dan rekapitulasi penilaian kinerja kegiatan.</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm w-full flex-1 flex flex-col space-y-8">
            
            {/* Form Pengisian Evaluasi untuk Protokoler */}
            {!isAdmin && !hasSubmittedEvaluasi && (
              <div className="w-full">
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
              <div className="rounded-[24px] border border-slate-200 shadow-sm overflow-hidden bg-white">
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
              </div>
            )}
              </div>
            </div>
          </Card>
          );
        })()}
        {/* ── Tab DOKUMENTASI ── */}
        {tab === "dokumentasi" && (
          <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden bg-slate-50 min-h-[500px] flex flex-col">
            <div className="p-6 md:p-8 flex flex-col flex-1">
              <div className="flex items-start md:items-center justify-between gap-4 mb-6">
                <div className="flex items-start md:items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 bg-white rounded-xl shadow-sm text-slate-600 shrink-0 border border-slate-200">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-1">Galeri Dokumentasi</h2>
                    <p className="text-sm text-slate-600">Kumpulan foto dan dokumen kegiatan.</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm w-full flex-1 flex flex-col items-center justify-center">
                <div className="text-center text-slate-500">
                  <Image className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p className="font-medium">Galeri dokumentasi kegiatan akan tampil di sini.</p>
                  {isAdmin && (
                    <Button variant="outline" className="rounded-xl border-slate-300 mt-4">
                      + Upload Foto / Dokumen
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

          </motion.div>
        </div>
      </main>
    </div>
  );
}
