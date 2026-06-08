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
import { ArrowLeft, MapPin, Clock, Calendar, Users, CheckSquare, Square, Star, Image, FileText } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

type Tab = "info" | "pendaftar" | "absensi" | "evaluasi" | "dokumentasi";

export default function KegiatanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const isAdmin = role === "admin" || role === "pimpinan";
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
    mutationFn: (data: any) => kegiatanApi.update(id, data),
    onSuccess: () => { toast.success("Checklist diperbarui"); qc.invalidateQueries({ queryKey: ["kegiatan", id] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const reviewPendaftaran = useMutation({
    mutationFn: ({ pendaftaranId, status }: { pendaftaranId: string; status: string }) =>
      pendaftaranApi.update(pendaftaranId, { status }),
    onSuccess: (_, { status }) => {
      toast.success(status === "diterima" ? "Protokoler diterima" : "Pendaftaran ditolak");
      qc.invalidateQueries({ queryKey: ["pendaftaran-kegiatan", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Memuat detail kegiatan...</div>;
  }

  if (!keg) {
    return <div className="p-8 text-center text-red-500">Kegiatan tidak ditemukan.</div>;
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "info", label: "Info" },
    { key: "pendaftar", label: "Pendaftar" },
    { key: "absensi", label: "Absensi" },
    { key: "evaluasi", label: "Evaluasi" },
    { key: "dokumentasi", label: "Dokumentasi" },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Back & Header */}
      <div>
        <Link href="/kegiatan">
          <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Kegiatan
          </button>
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-3xl font-display font-bold text-slate-900">{keg.nama_kegiatan}</h1>
              <Badge variant="outline" className="rounded-none capitalize border-slate-300 text-slate-600">
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
              <Button variant="outline" className="rounded-none border-slate-300">Edit Kegiatan</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 flex gap-0 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-6 py-3 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${
              tab === t.key
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
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
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    {keg.audience && (
                      <div><p className="text-slate-400 text-xs font-semibold uppercase mb-1">Target Audience</p><p className="font-medium">{keg.audience}</p></div>
                    )}
                    {keg.keynote && (
                      <div><p className="text-slate-400 text-xs font-semibold uppercase mb-1">Keynote / Narasumber</p><p className="font-medium">{keg.keynote}</p></div>
                    )}
                  </div>
                  {keg.rundown_url && (
                    <a href={keg.rundown_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
                      <FileText className="h-4 w-4" /> Lihat Rundown Acara
                    </a>
                  )}
                </CardContent>
              </Card>

              {/* Checklist 3 Tata Protokol */}
              {isAdmin && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-display font-bold text-lg mb-4">Checklist 3 Tata Protokol</h3>
                    <div className="space-y-3">
                      {[
                        { key: "checklist_tata_tempat", label: "Tata Tempat" },
                        { key: "checklist_tata_upacara", label: "Tata Upacara" },
                        { key: "checklist_tata_penghormatan", label: "Tata Penghormatan" },
                      ].map(({ key, label }) => {
                        const checked = keg[key] ?? false;
                        return (
                          <button
                            key={key}
                            onClick={() => isAdmin && updateChecklist.mutate({ [key]: !checked })}
                            className={`flex items-center gap-3 w-full p-3 border transition-colors text-left ${
                              checked ? "bg-green-50 border-green-200 text-green-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {checked ? <CheckSquare className="h-5 w-5 text-green-600" /> : <Square className="h-5 w-5 text-slate-400" />}
                            <span className="font-semibold">{label}</span>
                            {checked && <span className="ml-auto text-xs font-bold text-green-600">✓ Terpenuhi</span>}
                          </button>
                        );
                      })}
                    </div>
                    {keg.checklist_tata_tempat && keg.checklist_tata_upacara && keg.checklist_tata_penghormatan && (
                      <div className="mt-4 bg-green-100 border border-green-200 p-3 text-green-800 text-sm font-bold text-center">
                        ✅ Semua 3 Tata Protokol terpenuhi
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Tamu VVIP Sidebar */}
            <div>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-display font-bold text-lg mb-4">Tamu VVIP</h3>
                  {!keg.tamu_vvip?.length ? (
                    <p className="text-sm text-slate-400">Belum ada tamu VVIP tercatat.</p>
                  ) : (
                    <div className="space-y-3">
                      {keg.tamu_vvip.map((t: any) => (
                        <div key={t.id} className="border border-slate-200 p-3 bg-white">
                          <p className="font-bold text-sm">{t.nama_tamu}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{t.jabatan} · {t.instansi}</p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="outline" className="rounded-none text-[10px] border-slate-300">{t.tipe}</Badge>
                            <span className="text-xs text-slate-500">{t.jumlah_rombongan} orang</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ── Tab PENDAFTAR ── */}
        {tab === "pendaftar" && (
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold">Protokoler</TableHead>
                    <TableHead className="font-bold">Peran</TableHead>
                    <TableHead className="font-bold">Waktu Daftar</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    {isAdmin && <TableHead className="font-bold text-right">Aksi</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!pendaftaran?.length ? (
                    <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-400">Belum ada pendaftar.</TableCell></TableRow>
                  ) : (
                    pendaftaran.map((p: any) => (
                      <TableRow key={p.id} className="border-b border-slate-100">
                        <TableCell>
                          <p className="font-bold text-slate-900">{p.protokoler?.nama_lengkap}</p>
                          <p className="text-xs text-slate-500 font-mono">{p.protokoler?.nim}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-none uppercase text-xs border-slate-300">{p.peran}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {new Date(p.created_at).toLocaleDateString("id-ID")}
                        </TableCell>
                        <TableCell><BadgeStatus status={p.status} /></TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            {p.status === "pending" && (
                              <div className="flex items-center justify-end gap-2">
                                <Button size="sm" className="rounded-none bg-green-600 hover:bg-green-700 text-white shadow-none text-xs h-8"
                                  onClick={() => reviewPendaftaran.mutate({ pendaftaranId: p.id, status: "diterima" })}>
                                  Terima
                                </Button>
                                <Button size="sm" variant="destructive" className="rounded-none shadow-none text-xs h-8"
                                  onClick={() => reviewPendaftaran.mutate({ pendaftaranId: p.id, status: "ditolak" })}>
                                  Tolak
                                </Button>
                              </div>
                            )}
                            {p.status === "diterima" && p.surat_tugas_url && (
                              <a href={p.surat_tugas_url} target="_blank" className="text-blue-600 text-xs hover:underline flex items-center justify-end gap-1">
                                <FileText className="h-3 w-3" /> Surat Tugas
                              </a>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* ── Tab ABSENSI ── */}
        {tab === "absensi" && (
          <Card>
            <CardContent className="pt-6">
              {absensi && (
                <div className="flex gap-6 mb-6 p-4 bg-slate-50 border border-slate-200">
                  <div className="text-center">
                    <div className="text-3xl font-display font-bold text-green-600">{absensi.filter((a: any) => a.status === "hadir").length}</div>
                    <div className="text-xs text-slate-500 font-semibold uppercase">Hadir</div>
                  </div>
                  <div className="w-px bg-slate-200" />
                  <div className="text-center">
                    <div className="text-3xl font-display font-bold text-red-500">{absensi.filter((a: any) => a.status !== "hadir").length}</div>
                    <div className="text-xs text-slate-500 font-semibold uppercase">Tidak Hadir</div>
                  </div>
                  <div className="w-px bg-slate-200" />
                  <div className="text-center">
                    <div className="text-3xl font-display font-bold text-slate-900">{absensi.length}</div>
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
                      <TableRow key={a.id} className="border-b border-slate-100">
                        <TableCell>
                          <p className="font-bold text-slate-900">{a.protokoler?.nama_lengkap}</p>
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
            </CardContent>
          </Card>
        )}

        {/* ── Tab EVALUASI ── */}
        {tab === "evaluasi" && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-display font-bold text-lg mb-4">Angket Evaluasi Protokoler</h3>
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
                        <TableRow key={e.id} className="border-b border-slate-100">
                          <TableCell>
                            <p className="font-bold text-slate-900">{e.protokoler?.nama_lengkap}</p>
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
              </CardContent>
            </Card>

            {/* Testimoni Tamu */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-display font-bold text-lg mb-4">Testimoni Tamu</h3>
                {!testimoni?.length ? (
                  <p className="text-sm text-slate-400 py-4 text-center">Belum ada testimoni dari tamu.</p>
                ) : (
                  <div className="space-y-4">
                    {testimoni.map((t: any) => (
                      <div key={t.id} className="border border-slate-200 p-4 bg-white">
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
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Tab DOKUMENTASI ── */}
        {tab === "dokumentasi" && (
          <Card>
            <CardContent className="pt-6 text-center text-slate-500">
              <Image className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">Galeri dokumentasi kegiatan akan tampil di sini.</p>
              {isAdmin && (
                <Button variant="outline" className="rounded-none border-slate-300 mt-4">
                  + Upload Foto / Dokumen
                </Button>
              )}
            </CardContent>
          </Card>
        )}

      </motion.div>
    </div>
  );
}
