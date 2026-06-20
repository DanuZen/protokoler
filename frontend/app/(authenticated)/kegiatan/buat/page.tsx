"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { kegiatanApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  ArrowLeft, Check, Plus, Trash2, ChevronRight, ChevronLeft,
  CalendarDays, MapPin, Users, GraduationCap, Handshake,
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
    <div className="space-y-2">
      <Label className="text-[13px] font-bold text-slate-700 flex items-center gap-1">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {hint && <p className="text-[11px] text-slate-400 font-medium -mt-1">{hint}</p>}
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
    if (step === 1) {
      if (!form.nama_kegiatan.trim()) { toast.error("Nama kegiatan wajib diisi"); return; }
      if (!form.tanggal) { toast.error("Tanggal kegiatan wajib diisi"); return; }
      if (!form.jam_mulai || !form.jam_selesai) { toast.error("Jam mulai dan selesai wajib diisi"); return; }
      if (!form.lokasi.trim()) { toast.error("Lokasi kegiatan wajib diisi"); return; }
    }
    setStep(s => Math.min(3, s + 1));
  };

  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  const stepInputCls = "rounded-[14px] border-slate-200 bg-white h-[46px] text-sm focus:ring-2 focus:ring-red-400/20 focus:border-[#6B0000] transition-all shadow-sm";

  return (
    <div className="flex flex-col h-auto md:h-dvh md:overflow-hidden pb-6 px-6 md:px-10 pt-8 lg:pt-10 max-w-[1400px] mx-auto w-full">
      
      {/* ── Header ── */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-[1.25rem] bg-[#6B0000] text-white flex items-center justify-center shadow-md shadow-[#6B0000]/20 shrink-0">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#6B0000] mb-1">Manajemen Kegiatan</p>
            <h1 className="font-display text-2xl lg:text-[28px] font-black text-slate-900 leading-none">Buat Kegiatan Baru</h1>
          </div>
        </div>

        <Link href="/kegiatan">
          <button className="flex items-center justify-center gap-2 h-10 px-5 rounded-full border border-slate-200 bg-white text-[13px] font-bold text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </button>
        </Link>
      </div>

      {/* ── Main Layout: 2 Columns ── */}
      <main className="flex-1 min-h-0 flex flex-col mt-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2">
          <div className="grid lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-8 pb-12 items-start">
            
            {/* Kolom Kiri: Form Card */}
            <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm relative min-h-[500px] flex flex-col">
              
              {/* Header Card Kiri */}
              <div className="flex items-start gap-3 mb-8">
                <div className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center shrink-0">
                  {step === 1 && <Info className="h-4 w-4 text-slate-500" />}
                  {step === 2 && <Star className="h-4 w-4 text-slate-500" />}
                  {step === 3 && <Users className="h-4 w-4 text-slate-500" />}
                </div>
                <div>
                  <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Langkah {step}: {STEPS[step-1].label}</h2>
                  <p className="text-[11px] text-slate-400 mt-1">{STEPS[step-1].desc}</p>
                </div>
              </div>

              {/* Isi Form */}
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  
                  {/* Step 1: Info Dasar */}
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-7">
                      
                      <div className="grid md:grid-cols-2 gap-5">
                        <FieldGroup label="Nama Kegiatan" required>
                          <Input
                            className={stepInputCls}
                            placeholder="Contoh: Wisuda Periode 131 UNP"
                            value={form.nama_kegiatan}
                            onChange={e => setForm({ ...form, nama_kegiatan: e.target.value })}
                          />
                        </FieldGroup>
                        <FieldGroup label="Lokasi / Tempat" required>
                          <div className="relative">
                            <MapPin className="absolute left-3.5 top-[15px] h-4 w-4 text-slate-400" />
                            <Input
                              className={`${stepInputCls} pl-10`}
                              placeholder="Contoh: Auditorium UNP, Padang"
                              value={form.lokasi}
                              onChange={e => setForm({ ...form, lokasi: e.target.value })}
                            />
                          </div>
                        </FieldGroup>
                      </div>

                      <FieldGroup label="Bentuk / Jenis Kegiatan" required>
                        <div className="flex flex-wrap gap-2.5">
                          {BENTUK_OPTIONS.map(opt => {
                            const BentukIcon = opt.icon;
                            const selected = form.bentuk_kegiatan === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setForm({ ...form, bentuk_kegiatan: opt.value })}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-[13px] font-bold transition-all ${
                                  selected
                                    ? "border-[#6B0000] bg-red-50 text-[#6B0000] shadow-sm"
                                    : "border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                <BentukIcon className={`h-4 w-4 ${selected ? "text-[#6B0000]" : "text-slate-400"}`} />
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </FieldGroup>

                      <div className="grid grid-cols-3 gap-5">
                        <FieldGroup label="Tanggal Pelaksanaan" required>
                          <Input type="date" className={stepInputCls} value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} />
                        </FieldGroup>
                        <FieldGroup label="Jam Mulai" required>
                          <Input type="time" className={stepInputCls} value={form.jam_mulai} onChange={e => setForm({ ...form, jam_mulai: e.target.value })} />
                        </FieldGroup>
                        <FieldGroup label="Jam Selesai" required>
                          <Input type="time" className={stepInputCls} value={form.jam_selesai} onChange={e => setForm({ ...form, jam_selesai: e.target.value })} />
                        </FieldGroup>
                      </div>
                      
                    </motion.div>
                  )}

                  {/* Step 2: Detail Acara */}
                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-7">
                      <div className="grid md:grid-cols-2 gap-5">
                        <FieldGroup label="Target Peserta / Audiens" hint="Contoh: Mahasiswa Baru 2026">
                          <Input className={stepInputCls} placeholder="Mahasiswa dan Dosen UNP" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} />
                        </FieldGroup>
                        <FieldGroup label="Keynote / Narasumber Utama" hint="Opsional">
                          <Input className={stepInputCls} placeholder="Contoh: Prof. Dr. Rektor UNP" value={form.keynote} onChange={e => setForm({ ...form, keynote: e.target.value })} />
                        </FieldGroup>
                      </div>

                      <FieldGroup label="Link Rundown Acara" hint="Opsional — tautan ke dokumen Google Drive, PDF, dll.">
                        <div className="relative">
                          <FileText className="absolute left-3.5 top-[15px] h-4 w-4 text-slate-400" />
                          <Input type="url" className={`${stepInputCls} pl-10`} placeholder="https://drive.google.com/..." value={form.rundown_url} onChange={e => setForm({ ...form, rundown_url: e.target.value })} />
                        </div>
                      </FieldGroup>

                      <div className="border border-slate-100 bg-slate-50 rounded-[1.5rem] p-6">
                        <div className="flex items-center justify-between mb-5">
                          <div>
                            <p className="text-sm font-bold text-slate-800">Daftar Tamu VVIP</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">Tambahkan tamu penting yang akan hadir</p>
                          </div>
                          <Button type="button" variant="outline" size="sm" className="rounded-xl bg-white border-slate-200 text-slate-700 hover:bg-slate-100 h-9 font-bold shadow-sm" onClick={addTamu}>
                            <Plus className="h-4 w-4 mr-1.5" /> Tambah Tamu
                          </Button>
                        </div>

                        {tamuVvip.length === 0 ? (
                          <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center bg-white/50">
                            <Users className="h-6 w-6 mx-auto text-slate-300 mb-3" />
                            <p className="text-xs font-bold text-slate-400">Belum ada tamu VVIP</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {tamuVvip.map((tamu, idx) => (
                              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tamu #{idx + 1}</span>
                                  <button type="button" onClick={() => removeTamu(idx)} className="h-7 w-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="col-span-2 space-y-1">
                                    <Label className="text-[11px] font-bold text-slate-500">Nama Lengkap</Label>
                                    <Input className="h-9 rounded-lg border-slate-200 text-sm" placeholder="Nama tamu" value={tamu.nama_tamu} onChange={e => updateTamu(idx, "nama_tamu", e.target.value)} />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[11px] font-bold text-slate-500">Jabatan</Label>
                                    <Input className="h-9 rounded-lg border-slate-200 text-sm" placeholder="Jabatan" value={tamu.jabatan} onChange={e => updateTamu(idx, "jabatan", e.target.value)} />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-[11px] font-bold text-slate-500">Rombongan</Label>
                                    <Input type="number" min={1} className="h-9 rounded-lg border-slate-200 text-sm" value={tamu.jumlah_rombongan} onChange={e => updateTamu(idx, "jumlah_rombongan", Number(e.target.value))} />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Kebutuhan Tim */}
                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-7">
                      
                      <div className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
                            <UserCheck className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">Aktifkan Open Recruitment</p>
                            <p className="text-xs text-slate-500 mt-0.5">Anggota dapat mendaftar sebagai panitia</p>
                          </div>
                        </div>
                        <Switch checked={form.is_open_recruitment} onCheckedChange={v => setForm({ ...form, is_open_recruitment: v })} className="data-[state=checked]:bg-[#6B0000]" />
                      </div>

                      <div className="grid md:grid-cols-3 gap-5">
                        {[
                          { key: "jumlah_protokoler_dibutuhkan", label: "Protokoler", desc: "Tata acara & pendampingan VVIP", icon: UserCheck },
                          { key: "jumlah_lo_dibutuhkan",         label: "Liaison Officer (LO)", desc: "Pemandu utama audiens/tamu",    icon: Handshake },
                          { key: "jumlah_dokumentasi_dibutuhkan", label: "Dokumentasi", desc: "Foto & video kegiatan",         icon: Camera },
                        ].map(item => {
                          const ItemIcon = item.icon;
                          const val = (form as any)[item.key];
                          return (
                            <div key={item.key} className="border border-slate-100 bg-white rounded-[1.5rem] p-5 shadow-sm">
                              <div className="flex items-center gap-2 mb-2">
                                <ItemIcon className="h-4 w-4 text-slate-400" />
                                <p className="text-[13px] font-bold text-slate-800">{item.label}</p>
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium mb-6">{item.desc}</p>
                              <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl">
                                <button type="button" onClick={() => setForm({ ...form, [item.key]: Math.max(0, val - 1) })} className="h-10 w-10 flex items-center justify-center rounded-[14px] bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-lg transition-colors shadow-sm">−</button>
                                <span className="flex-1 text-center font-display text-2xl font-black text-slate-900">{val}</span>
                                <button type="button" onClick={() => setForm({ ...form, [item.key]: val + 1 })} className="h-10 w-10 flex items-center justify-center rounded-[14px] bg-[#6B0000] text-white hover:bg-red-900 font-bold text-lg transition-colors shadow-sm">+</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* Navigasi Kiri-Kanan Bawah */}
              <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-100">
                {step > 1 ? (
                  <Button type="button" variant="outline" className="rounded-xl border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-sm h-11 px-5 font-bold transition-all" onClick={handlePrev}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Kembali
                  </Button>
                ) : <div />}

                {step < 3 ? (
                  <Button type="button" className="rounded-xl bg-[#0F172A] hover:bg-black text-white h-11 px-8 font-bold shadow-md transition-all" onClick={handleNext}>
                    Lanjut <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button type="button" className="rounded-xl bg-[#6B0000] hover:bg-red-950 text-white h-11 px-8 font-bold shadow-md shadow-red-900/20 transition-all" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? "Menyimpan..." : <><Check className="h-4 w-4 mr-2" /> Selesai & Buat</>}
                  </Button>
                )}
              </div>
            </div>

            {/* Kolom Kanan: Vertical Stepper */}
            <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm h-fit sticky top-0">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <ClipboardList className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-800">Tahapan</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Progres form kegiatan</p>
                </div>
              </div>

              <div className="relative pl-2">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const isActive = step === s.id;
                  const isDone = step > s.id;
                  
                  return (
                    <div key={s.id} className="relative mb-8 last:mb-0">
                      {/* Connector */}
                      {i < STEPS.length - 1 && (
                        <div className={`absolute top-10 left-[19px] bottom-[-32px] w-[2px] transition-colors duration-300 ${isDone ? "bg-[#6B0000]" : "bg-slate-100"}`} />
                      )}

                      <div className="flex gap-5 relative z-10">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isActive ? "bg-[#6B0000] text-white shadow-md shadow-[#6B0000]/20 ring-4 ring-red-50" :
                          isDone ? "bg-red-50 text-[#6B0000] border border-red-100" :
                          "bg-white border-2 border-slate-100 text-slate-300"
                        }`}>
                          {isDone ? <Check className="h-4 w-4 stroke-[3]" /> : <Icon className="h-4 w-4" />}
                        </div>
                        <div className="pt-2">
                          <p className={`text-sm font-black leading-none mb-1 transition-colors ${isActive ? "text-[#6B0000]" : isDone ? "text-slate-800" : "text-slate-400"}`}>{s.label}</p>
                          <p className="text-[11px] font-medium text-slate-400 leading-tight">{s.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
