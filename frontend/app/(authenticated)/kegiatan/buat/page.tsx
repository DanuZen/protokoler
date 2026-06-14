"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { kegiatanApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  ArrowLeft, Check, Plus, Trash2, ChevronRight, ChevronLeft,
  CalendarDays, Clock, MapPin, Users, GraduationCap, Handshake,
  Megaphone, Landmark, ClipboardList, Camera, FileText, Info,
  UserCheck, Star
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { id: 1, label: "Info Dasar",     desc: "Nama, jenis, dan waktu",    icon: Info },
  { id: 2, label: "Detail Acara",   desc: "Tamu VVIP & rundown",       icon: Star },
  { id: 3, label: "Kebutuhan Tim",  desc: "Jumlah petugas lapangan",   icon: Users },
];

const BENTUK_OPTIONS = [
  { value: "wisuda",      label: "Wisuda",         icon: GraduationCap },
  { value: "kunjungan",   label: "Kunjungan Tamu", icon: Handshake },
  { value: "seminar",     label: "Seminar",         icon: Megaphone },
  { value: "pelantikan",  label: "Pelantikan",      icon: Landmark },
  { value: "rapat_resmi", label: "Rapat Resmi",     icon: ClipboardList },
  { value: "dokumentasi", label: "Dokumentasi",     icon: Camera },
  { value: "lainnya",     label: "Lainnya",         icon: CalendarDays },
];

function FieldGroup({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-orange-500">*</span>}
      </Label>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
      {children}
    </div>
  );
}

export default function BuatKegiatanPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    nama_kegiatan: "",
    bentuk_kegiatan: "lainnya",
    tanggal: "",
    jam_mulai: "",
    jam_selesai: "",
    lokasi: "",
    audience: "",
    keynote: "",
    rundown_url: "",
    jumlah_protokoler_dibutuhkan: 1,
    jumlah_lo_dibutuhkan: 1,
    jumlah_dokumentasi_dibutuhkan: 1,
    is_open_recruitment: true,
  });

  const [tamuVvip, setTamuVvip] = useState<any[]>([]);

  const addTamu = () =>
    setTamuVvip([...tamuVvip, { nama_tamu: "", jabatan: "", instansi: "", tipe: "eksternal", jumlah_rombongan: 1 }]);

  const removeTamu = (idx: number) =>
    setTamuVvip(tamuVvip.filter((_, i) => i !== idx));

  const updateTamu = (idx: number, field: string, value: any) => {
    const nw = [...tamuVvip];
    nw[idx][field] = value;
    setTamuVvip(nw);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        status: "terjadwal",
        tamu_vvip: tamuVvip,
        tanggal: form.tanggal ? new Date(form.tanggal).toISOString() : "",
      };
      return kegiatanApi.create(payload);
    },
    onSuccess: () => {
      toast.success("Kegiatan berhasil dibuat dan dipublikasikan");
      qc.invalidateQueries({ queryKey: ["kegiatan"] });
      router.push("/kegiatan");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleNext = () => {
    // Validate step 1
    if (step === 1) {
      if (!form.nama_kegiatan.trim()) { toast.error("Nama kegiatan wajib diisi"); return; }
      if (!form.tanggal) { toast.error("Tanggal kegiatan wajib diisi"); return; }
      if (!form.jam_mulai || !form.jam_selesai) { toast.error("Jam mulai dan selesai wajib diisi"); return; }
      if (!form.lokasi.trim()) { toast.error("Lokasi kegiatan wajib diisi"); return; }
    }
    setStep(s => Math.min(3, s + 1));
  };

  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  const stepInputCls = "rounded-xl border-slate-200 bg-white h-11 text-sm focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all shadow-sm";

  return (
    <div className="min-h-full px-6 md:px-8 pt-4 pb-24">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Back + Title */}
        <div className="flex items-center gap-4">
          <Link href="/kegiatan">
            <button className="flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-colors">
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </button>
          </Link>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-orange-500 mb-0.5">Admin</p>
            <h1 className="text-2xl font-black text-slate-900 leading-none">Buat Kegiatan Baru</h1>
          </div>
        </div>

        {/* ── Stepper ── */}
        <div className="flex items-start gap-0">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className={`h-10 w-10 flex items-center justify-center rounded-full font-bold text-sm transition-all duration-300 shadow-sm ${
                    isDone  ? "bg-orange-500 text-white shadow-orange-200" :
                    isActive ? "bg-slate-900 text-white shadow-slate-200" :
                               "bg-white border-2 border-slate-200 text-slate-400"
                  }`}>
                    {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-bold leading-none ${isActive || isDone ? "text-slate-900" : "text-slate-400"}`}>{s.label}</p>
                    <p className={`text-[10px] mt-0.5 ${isActive ? "text-orange-500" : "text-slate-400"}`}>{s.desc}</p>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-[2px] flex-1 mx-3 mt-[-20px] transition-all duration-500 ${step > s.id ? "bg-orange-400" : "bg-slate-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Form Card ── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Langkah {step} dari {STEPS.length}</p>
            <h2 className="text-lg font-bold text-slate-800 mt-0.5">{STEPS[step - 1].label}</h2>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">

              {/* ─── Step 1: Info Dasar ─── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }} className="space-y-6">

                  <FieldGroup label="Nama Kegiatan" required>
                    <Input
                      className={stepInputCls}
                      placeholder="Contoh: Wisuda Periode 131 UNP"
                      value={form.nama_kegiatan}
                      onChange={e => setForm({ ...form, nama_kegiatan: e.target.value })}
                    />
                  </FieldGroup>

                  <FieldGroup label="Bentuk / Jenis Kegiatan" required>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {BENTUK_OPTIONS.map(opt => {
                        const BentukIcon = opt.icon;
                        const selected = form.bentuk_kegiatan === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setForm({ ...form, bentuk_kegiatan: opt.value })}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                              selected
                                ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm shadow-orange-100"
                                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <BentukIcon className={`h-5 w-5 ${selected ? "text-orange-500" : "text-slate-400"}`} />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </FieldGroup>

                  <div className="grid grid-cols-3 gap-4">
                    <FieldGroup label="Tanggal" required>
                      <Input type="date" className={stepInputCls} value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} />
                    </FieldGroup>
                    <FieldGroup label="Jam Mulai" required>
                      <Input type="time" className={stepInputCls} value={form.jam_mulai} onChange={e => setForm({ ...form, jam_mulai: e.target.value })} />
                    </FieldGroup>
                    <FieldGroup label="Jam Selesai" required>
                      <Input type="time" className={stepInputCls} value={form.jam_selesai} onChange={e => setForm({ ...form, jam_selesai: e.target.value })} />
                    </FieldGroup>
                  </div>

                  <FieldGroup label="Lokasi / Tempat" required>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        className={`${stepInputCls} pl-9`}
                        placeholder="Contoh: Auditorium UNP, Padang"
                        value={form.lokasi}
                        onChange={e => setForm({ ...form, lokasi: e.target.value })}
                      />
                    </div>
                  </FieldGroup>
                </motion.div>
              )}

              {/* ─── Step 2: Detail Acara ─── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }} className="space-y-6">

                  <div className="grid md:grid-cols-2 gap-4">
                    <FieldGroup label="Target Peserta / Audiens" hint="Contoh: Mahasiswa Baru 2026">
                      <Input className={stepInputCls} placeholder="Mahasiswa dan Dosen UNP" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} />
                    </FieldGroup>
                    <FieldGroup label="Keynote / Narasumber Utama" hint="Opsional">
                      <Input className={stepInputCls} placeholder="Contoh: Prof. Dr. Rektor UNP" value={form.keynote} onChange={e => setForm({ ...form, keynote: e.target.value })} />
                    </FieldGroup>
                  </div>

                  <FieldGroup label="Link Rundown Acara" hint="Opsional — tautan ke dokumen Google Drive, PDF, dll.">
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input type="url" className={`${stepInputCls} pl-9`} placeholder="https://drive.google.com/..." value={form.rundown_url} onChange={e => setForm({ ...form, rundown_url: e.target.value })} />
                    </div>
                  </FieldGroup>

                  {/* Tamu VVIP */}
                  <div className="border-t border-slate-100 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Daftar Tamu VVIP</p>
                        <p className="text-xs text-slate-400 mt-0.5">Tambahkan tamu penting yang akan hadir</p>
                      </div>
                      <Button type="button" variant="outline" size="sm" className="rounded-xl border-slate-200 text-slate-600 bg-white hover:bg-slate-50 h-9 text-xs font-semibold shadow-sm" onClick={addTamu}>
                        <Plus className="h-3.5 w-3.5 mr-1.5" /> Tambah Tamu
                      </Button>
                    </div>

                    {tamuVvip.length === 0 ? (
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50">
                        <Users className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-sm text-slate-400 font-medium">Belum ada tamu VVIP yang ditambahkan</p>
                        <p className="text-xs text-slate-300 mt-1">Opsional — lewati jika tidak ada</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tamuVvip.map((tamu, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tamu #{idx + 1}</span>
                              <button type="button" onClick={() => removeTamu(idx)} className="flex items-center justify-center h-7 w-7 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="col-span-2 space-y-1">
                                <Label className="text-xs text-slate-500">Nama Lengkap</Label>
                                <Input className="h-9 rounded-lg border-slate-200 text-sm bg-white" placeholder="Nama tamu" value={tamu.nama_tamu} onChange={e => updateTamu(idx, "nama_tamu", e.target.value)} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-slate-500">Jabatan</Label>
                                <Input className="h-9 rounded-lg border-slate-200 text-sm bg-white" placeholder="Jabatan" value={tamu.jabatan} onChange={e => updateTamu(idx, "jabatan", e.target.value)} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-slate-500">Jumlah Rombongan</Label>
                                <Input type="number" min={1} className="h-9 rounded-lg border-slate-200 text-sm bg-white" value={tamu.jumlah_rombongan} onChange={e => updateTamu(idx, "jumlah_rombongan", Number(e.target.value))} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ─── Step 3: Kebutuhan Tim ─── */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }} className="space-y-8">

                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start gap-3">
                    <Info className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-orange-700">Tentukan jumlah petugas yang dibutuhkan. Anggota akan dapat mendaftarkan diri melalui fitur Open Recruitment jika diaktifkan.</p>
                  </div>

                  {/* Open Recruitment Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white border border-slate-200 text-slate-600 shadow-sm">
                        <UserCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Aktifkan Open Recruitment</p>
                        <p className="text-xs text-slate-500 mt-0.5">Anggota dapat mendaftarkan diri untuk kegiatan ini</p>
                      </div>
                    </div>
                    <Switch
                      checked={form.is_open_recruitment}
                      onCheckedChange={v => setForm({ ...form, is_open_recruitment: v })}
                      className="data-[state=checked]:bg-orange-500"
                    />
                  </div>

                  {/* Jumlah Petugas */}
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { key: "jumlah_protokoler_dibutuhkan", label: "Protokoler", desc: "Tata acara & pendampingan VVIP", icon: UserCheck, color: "orange" },
                      { key: "jumlah_lo_dibutuhkan",         label: "Liaison Officer (LO)", desc: "Pemandu utama audiens/tamu",    icon: Handshake, color: "blue" },
                      { key: "jumlah_dokumentasi_dibutuhkan", label: "Dokumentasi", desc: "Foto & video kegiatan",         icon: Camera, color: "purple" },
                    ].map(item => {
                      const ItemIcon = item.icon;
                      const val = (form as any)[item.key];
                      return (
                        <div key={item.key} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <ItemIcon className="h-4 w-4 text-slate-500" />
                            <p className="text-xs font-bold text-slate-700">{item.label}</p>
                          </div>
                          <p className="text-[11px] text-slate-400 mb-4">{item.desc}</p>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setForm({ ...form, [item.key]: Math.max(0, val - 1) })}
                              className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold text-lg transition-colors"
                            >−</button>
                            <span className="flex-1 text-center text-2xl font-black text-slate-900">{val}</span>
                            <button
                              type="button"
                              onClick={() => setForm({ ...form, [item.key]: val + 1 })}
                              className="h-9 w-9 flex items-center justify-center rounded-lg border border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100 font-bold text-lg transition-colors"
                            >+</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Ringkasan */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ringkasan Kegiatan</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Nama</p>
                        <p className="font-semibold text-slate-800 truncate">{form.nama_kegiatan || "—"}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Bentuk</p>
                        <p className="font-semibold text-slate-800 capitalize">{form.bentuk_kegiatan.replace(/_/g, " ")}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Tanggal</p>
                        <p className="font-semibold text-slate-800">{form.tanggal ? new Date(form.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "—"}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Waktu</p>
                        <p className="font-semibold text-slate-800">{form.jam_mulai && form.jam_selesai ? `${form.jam_mulai} – ${form.jam_selesai} WIB` : "—"}</p>
                      </div>
                      <div className="col-span-2 space-y-0.5">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Lokasi</p>
                        <p className="font-semibold text-slate-800">{form.lokasi || "—"}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* ── Navigation ── */}
        <div className="flex justify-between items-center">
          {step > 1 ? (
            <Button type="button" variant="outline" className="rounded-xl border-slate-200 bg-white text-slate-700 shadow-sm h-11 px-5 font-semibold" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Kembali
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button type="button" className="rounded-xl bg-slate-900 text-white hover:bg-black h-11 px-6 font-bold shadow-sm" onClick={handleNext}>
              Lanjut <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white h-11 px-8 font-bold shadow-md shadow-orange-200 transition-all"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <span className="flex items-center gap-2"><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</span>
              ) : (
                <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Buat Kegiatan</span>
              )}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
