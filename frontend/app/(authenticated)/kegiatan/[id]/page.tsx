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
import { ArrowLeft, MapPin, Clock, Calendar, Users, CheckSquare, Square, Star, Image, FileText, Info, Crown, ClipboardCheck, MessageSquare, Camera, Briefcase, FileSignature, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

type Tab = "info" | "pendaftar" | "absensi" | "evaluasi" | "dokumentasi";

export default function KegiatanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const isAdmin = role === "admin";
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("info");

  const { data: keg, isLoading } = useQuery({
    queryKey: ["kegiatan", id],
    queryFn: () => kegiatanApi.get(id),
  });

  const { data: pendaftaran } = useQuery({
    queryKey: ["pendaftaran-kegiatan", id],
    queryFn: () => pendaftaranApi.byKegiatan(id),
    enabled: tab === "pendaftar",
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
    mutationFn: async () => { await kegiatanApi.daftar(id, user?.id || "", user?.user_metadata?.nama_lengkap || "Mahasiswa"); },
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

  const baseTabs: { key: Tab; label: string }[] = [
    { key: "info", label: "Info" },
    { key: "absensi", label: "Absensi" },
    { key: "evaluasi", label: "Evaluasi" },
    { key: "dokumentasi", label: "Dokumentasi" },
  ];

  const tabs = isAdmin && isDaftarOpen 
    ? [{ key: "info", label: "Info" } as {key: Tab, label: string}, { key: "pendaftar", label: "Pendaftar" } as {key: Tab, label: string}, ...baseTabs.slice(1)]
    : baseTabs;

  return (
    <div className="min-h-full relative z-10">
      <div className="space-y-6 px-6 md:px-8 py-6 pb-20">
      {/* Back & Header */}
      <div>
        <Link href="/kegiatan">
          <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Kegiatan
          </button>
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl font-bold text-slate-900">{keg.nama_kegiatan}</h1>
              <Badge variant="outline" className="rounded-full capitalize border-slate-200 bg-slate-100 text-slate-600 shadow-sm">
                {keg.bentuk_kegiatan?.replace(/_/g, " ")}
              </Badge>
              <BadgeStatus status={keg.status} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(keg.tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {keg.jam_mulai?.slice(0, 5)} – {keg.jam_selesai?.slice(0, 5)} WIB
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {keg.lokasi}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" /> {keg.jumlah_protokoler_dibutuhkan} Protokoler · {keg.jumlah_lo_dibutuhkan} LO
              </span>
            </div>
          </div>

          {isAdmin && (
            <Link href={`/kegiatan/buat?edit=${id}`}>
              <Button variant="outline" className="rounded-xl border-slate-200 bg-white shadow-sm hover:bg-slate-50 text-slate-700">Edit Kegiatan</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto mb-8 pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap shadow-sm border ${
              tab === t.key
                ? "bg-slate-900 border-slate-900 text-white shadow-md"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
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
          <div className="grid lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Widget Bursa Tugas (Hanya untuk Mahasiswa) */}
              {!isAdmin && isDaftarOpen && (
                <Card className="rounded-[24px] bg-white border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center justify-center h-12 w-12 bg-orange-50 rounded-xl border border-orange-100 text-orange-600 shadow-sm">
                        <Briefcase className="h-6 w-6 stroke-[2]" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-800">Bursa Tugas (Open Recruitment)</h2>
                        <p className="text-xs font-medium text-slate-500 mt-1">Dibutuhkan: <span className="text-slate-700 font-semibold">{keg.jumlah_protokoler_dibutuhkan} Protokoler</span> & <span className="text-slate-700 font-semibold">{keg.jumlah_lo_dibutuhkan} LO</span></p>
                      </div>
                    </div>

                    {!statusPendaftaran ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-600 mb-5">Pendaftaran untuk tugas ini sedang dibuka. Anda dapat mengajukan diri untuk ikut serta.</p>
                        <Button onClick={() => daftar.mutate()} disabled={daftar.isPending} className="w-full sm:w-auto rounded-xl bg-orange-500 text-white hover:bg-orange-600 font-semibold h-11 px-8 shadow-md transition-all">
                          {daftar.isPending ? "Mengajukan..." : "Ajukan Diri untuk Tugas Ini"}
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

              {/* Informasi Tambahan */}
              <Card className="rounded-[24px] bg-white border border-slate-200 shadow-sm overflow-hidden mt-6">
                <div className="flex items-center gap-4 p-6 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center justify-center h-10 w-10 bg-white rounded-xl border border-slate-200 text-slate-600 shadow-sm">
                    <Info className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">Informasi Tambahan</h2>
                    <p className="text-xs font-medium text-slate-500 mt-1">Detail audiens dan rundown acara</p>
                  </div>
                </div>
                
                <div className="p-6">
                  {!((keg as any).audience || (keg as any).keynote || (keg as any).rundown_url || (keg as any).peserta) ? (
                    <div className="border border-slate-200 border-dashed rounded-xl p-8 text-center bg-slate-50">
                      <p className="text-sm font-medium text-slate-500">Belum ada detail informasi tercatat.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid sm:grid-cols-2 gap-6">
                        {((keg as any).audience || (keg as any).peserta) && (
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Target Peserta</p>
                            <p className="font-semibold text-slate-900 text-base capitalize">{(keg as any).audience || (keg as any).peserta}</p>
                          </div>
                        )}
                        {(keg as any).keynote && (
                          <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100/50 shadow-sm">
                            <p className="text-amber-700/70 text-xs font-bold uppercase tracking-wider mb-1">Keynote / Pemateri</p>
                            <p className="font-semibold text-amber-900 text-base">{(keg as any).keynote}</p>
                          </div>
                        )}
                      </div>
                      
                      {(keg as any).rundown_url && (
                        <div className="mt-8">
                          <a href={(keg as any).rundown_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-full sm:w-auto h-11 px-8 bg-white/60 text-slate-800 font-semibold rounded-xl border border-white/80 shadow-sm hover:bg-white/80 transition-all">
                            <FileText className="mr-2 h-4 w-4" /> Lihat Rundown Acara
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>

              {/* Checklist 3 Tata Protokol */}
              {isAdmin && (
                <Card className="rounded-[24px] bg-white border border-slate-200 shadow-sm overflow-hidden mt-6">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 p-6 border-b border-slate-100 bg-slate-50">
                      <div className="flex items-center justify-center h-10 w-10 bg-white rounded-xl border border-slate-200 text-slate-600 shadow-sm">
                        <ClipboardCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-800">Checklist Tata Protokol</h2>
                        <p className="text-xs font-medium text-slate-500 mt-1">Verifikasi pemenuhan 3 tata protokol dasar</p>
                      </div>
                    </div>
                    <div className="p-6 bg-transparent">
                      <div className="space-y-3">
                        {[
                          { key: "checklist_tata_tempat", label: "Tata Tempat" },
                          { key: "checklist_tata_upacara", label: "Tata Upacara" },
                          { key: "checklist_tata_penghormatan", label: "Tata Penghormatan" },
                        ].map(({ key, label }) => {
                          const checked = keg[key as keyof typeof keg] ?? false;
                          return (
                            <button
                              key={key}
                              onClick={() => isAdmin && updateChecklist.mutate({ [key]: !checked })}
                              className={`flex items-center gap-3 w-full p-4 border transition-all text-left rounded-xl shadow-sm ${
                                checked ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {checked ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-slate-400" />}
                              <span className="font-semibold">{label}</span>
                              {checked && <span className="ml-auto text-xs font-bold uppercase tracking-wider text-slate-800">✓ Terpenuhi</span>}
                            </button>
                          );
                        })}
                      </div>
                      {keg.checklist_tata_tempat && keg.checklist_tata_upacara && keg.checklist_tata_penghormatan && (
                        <div className="mt-5 bg-emerald-500 p-3.5 rounded-xl text-white text-sm font-semibold text-center shadow-md">
                          ✓ Semua 3 Tata Protokol Terpenuhi
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Tamu VVIP Sidebar */}
            <div className="h-full">
              {isAdmin && isDaftarOpen && (
                <div className="mb-6">
                  <Button variant="outline" className="w-full rounded-xl border-white/40 bg-white/40 backdrop-blur-sm shadow-sm h-11 font-semibold hover:bg-white/60 text-slate-700" onClick={() => toast.success("Menerbitkan & membagikan surat tugas...")}>
                    <FileSignature className="mr-2 h-4 w-4" /> Terbitkan Surat Tugas
                  </Button>
                  <p className="text-[10px] text-slate-400 mt-2 text-center">Terbitkan surat jika tim sudah final</p>
                </div>
              )}

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
                      <div className="border border-slate-200 border-dashed rounded-xl p-8 text-center bg-slate-50">
                        <p className="text-sm font-medium text-slate-500">Belum ada tamu VVIP tercatat.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {keg.tamu_vvip.map((t: any) => (
                          <div key={t.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm">
                            <p className="font-semibold text-base text-slate-900">{t.nama_tamu}</p>
                            <p className="text-xs font-medium text-slate-500 mt-1">{t.jabatan} · {t.instansi}</p>
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                              <span className="bg-white text-slate-600 text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider border border-slate-200">{t.tipe}</span>
                              <span className="text-xs font-bold text-slate-800">{t.jumlah_rombongan} Orang</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}


        {tab === "pendaftar" && isAdmin && (
          <div className="space-y-6">
            <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 bg-white border border-slate-200 text-slate-600 rounded-xl">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Seleksi Pendaftar</h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">Dibutuhkan: {keg.jumlah_protokoler_dibutuhkan} Protokoler & {keg.jumlah_lo_dibutuhkan} LO</p>
                    </div>
                  </div>
                </div>
                
                {keg.pendaftar && keg.pendaftar.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50 border-b border-white/20">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500 py-3 pl-6">Nama Pendaftar</TableHead>
                          <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500 py-3">Performa</TableHead>
                          <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500 py-3">Waktu Daftar</TableHead>
                          <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500 py-3">Status</TableHead>
                          <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500 py-3 text-right pr-6">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {keg.pendaftar.map((p: any) => {
                          const mockRating = (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1); // Mock rating 4.0 - 5.0
                          return (
                          <TableRow key={p.id} className="border-b border-white/20 hover:bg-slate-50/50">
                            <TableCell className="py-4 font-semibold text-slate-800 pl-6">
                              <div className="flex flex-col">
                                <span>{p.nama_lengkap}</span>
                                <span className="text-[10px] text-slate-400 font-medium">Role: {p.role || 'Protokoler'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                                <span className="text-[13px] text-amber-500">★</span> {mockRating}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 text-slate-500 text-sm">{new Date(p.tanggal_daftar).toLocaleDateString("id-ID")}</TableCell>
                            <TableCell className="py-4">
                              <Badge variant="outline" className={`rounded-xl capitalize ${
                                p.status === 'diterima' ? 'bg-green-50 text-green-700 border-green-200' :
                                p.status === 'ditolak' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                              }`}>
                                {p.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 text-right pr-6">
                              {p.status === 'pending' ? (
                                <div className="flex justify-end gap-2">
                                  <Button size="sm" variant="outline" onClick={() => verifikasi.mutate({ pId: p.id, status: 'ditolak' })} className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 h-8 text-xs font-bold px-3 shadow-sm">Tolak</Button>
                                  <Button size="sm" onClick={() => verifikasi.mutate({ pId: p.id, status: 'diterima' })} className="rounded-xl bg-green-600 hover:bg-green-700 text-white h-8 text-xs font-bold px-3 shadow-sm">Terima</Button>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 font-medium tracking-wide uppercase bg-slate-100 px-2 py-1 rounded-md">Selesai</span>
                              )}
                            </TableCell>
                          </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-16 text-center">
                    <Briefcase className="h-10 w-10 mx-auto text-slate-300 mb-4" />
                    <h3 className="font-bold text-slate-800">Belum ada pendaftar</h3>
                    <p className="text-sm text-slate-500 mt-1">Anggota protokoler dapat mendaftar jika status Open Recruitment aktif.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Tab ABSENSI ── */}
        {tab === "absensi" && (
          <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden bg-white">
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
        {tab === "evaluasi" && (
          <div className="space-y-6">
            <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 bg-white border border-slate-200 text-slate-600 rounded-xl">
                      <Star className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Angket Evaluasi Protokoler</h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">Hasil penilaian pasca kegiatan</p>
                    </div>
                  </div>
                </div>
                <div className="p-0 overflow-x-auto">
                  <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="font-bold">Protokoler</TableHead>
                      <TableHead className="font-bold">Waktu Isi</TableHead>
                      <TableHead className="font-bold">Rating</TableHead>
                      <TableHead className="font-bold">Dalam Batas</TableHead>
                      <TableHead className="font-bold">Sertifikat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!evaluasi?.length ? (
                      <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-400">Belum ada evaluasi yang diisi.</TableCell></TableRow>
                    ) : (
                      evaluasi.map((e: any) => (
                        <TableRow key={e.id} className="border-b border-white/20">
                          <TableCell>
                            <p className="font-bold text-slate-800">{e.protokoler?.nama_lengkap}</p>
                            <BadgeKategori kategori={e.protokoler?.kategori_sertifikat} className="mt-1" />
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {new Date(e.waktu_pengisian).toLocaleDateString("id-ID")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < e.rating_kegiatan ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`} />
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {e.dalam_batas_waktu ? (
                              <span className="text-green-600 font-bold text-sm">✓ Ya</span>
                            ) : (
                              <span className="text-red-500 font-bold text-sm">✗ Terlambat</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {e.dalam_batas_waktu ? (
                              <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 border border-green-200">Diterbitkan</span>
                            ) : (
                              <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 border border-slate-200">Tidak Diterbitkan</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>

            {/* Testimoni Tamu */}
            <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 bg-white border border-slate-200 text-slate-600 rounded-xl">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Testimoni Tamu</h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">Umpan balik dari tamu undangan</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {!testimoni?.length ? (
                  <p className="text-sm text-slate-400 py-4 text-center">Belum ada testimoni dari tamu.</p>
                ) : (
                  <div className="space-y-4">
                    {testimoni.map((t: any) => (
                      <div key={t.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-slate-900">{t.nama_tamu}</p>
                            {t.jabatan_tamu && <p className="text-xs text-slate-500">{t.jabatan_tamu}</p>}
                          </div>
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < t.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 italic">"{t.isi_testimoni}"</p>
                      </div>
                    ))}
                  </div>
                )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Tab DOKUMENTASI ── */}
        {tab === "dokumentasi" && (
          <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden bg-white">
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
