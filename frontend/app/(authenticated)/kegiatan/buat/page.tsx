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
    catatan: "",
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
    <div className="flex-1 flex flex-col min-h-0 px-6 md:px-8 pt-4 pb-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20 text-white">
            <CalendarDays className="h-7 w-7" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-orange-500 mb-0.5">Manajemen Kegiatan</p>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-slate-900 leading-none">Buat Kegiatan Baru</h1>
          </div>
        </div>
        <Link href="/kegiatan" className="shrink-0">
          <Button variant="outline" className="gap-2 rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold shadow-sm w-full md:w-auto px-6 h-11">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Button>
        </Link>
      </div>

      {/* ── Main Content Split ── */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row-reverse gap-6 lg:gap-8">
        
        {/* ── Left: Vertical Stepper ── */}
        <div className="w-full lg:w-72 xl:w-80 shrink-0">
          <div id="left-stepper-card" className="bg-white border border-slate-100 shadow-sm rounded-[20px] flex flex-col relative overflow-hidden lg:h-full" style={{ backgroundColor: '#ffffff', isolation: 'isolate' }}>
            
            {/* Stepper Header */}
            <div className="shrink-0 flex items-center gap-4 border-b border-slate-100 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 bg-white text-[#5b1511] rounded-xl border border-slate-100 shadow-sm shrink-0">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Tahapan</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">Progres form kegiatan</p>
                </div>
              </div>
            </div>

            {/* Stepper Body */}
            <div className="p-6 lg:p-8 lg:flex-1 lg:flex lg:flex-col lg:justify-center">
              {/* Horizontal for Mobile, Vertical for Desktop */}
              <div className="flex lg:flex-col items-start lg:items-stretch gap-4 lg:gap-4 relative w-full">
              {/* Line connector (Desktop only, behind cards, centered) */}
              <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-[40px] bottom-[40px] w-[2px] bg-slate-200 z-0" />
              {/* Line connector (Mobile only) */}
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const isActive = step === s.id;
                const isDone = step > s.id;
                return (
                  <div key={s.id} className={`relative flex flex-col items-center justify-center gap-2 lg:gap-2 flex-1 lg:flex-none text-center group transition-all duration-500 w-full z-10 ${
                    isActive ? "lg:bg-gradient-to-br lg:from-[#7a1b15]/5 lg:to-[#5b1511]/5 lg:border lg:border-[#5b1511]/20 lg:shadow-sm lg:p-6 lg:rounded-[24px]" :
                    isDone ? "lg:bg-white lg:border lg:border-slate-200 lg:shadow-sm lg:p-6 lg:rounded-[24px]" :
                    "lg:bg-slate-50 lg:border lg:border-slate-100 lg:p-6 lg:rounded-[24px]"
                  }`}>
                    {/* Line connector (Mobile) */}
                    {i < STEPS.length - 1 && (
                      <div className={`lg:hidden h-[2px] absolute top-6 left-[60%] right-[-40%] transition-all duration-500 ${step > s.id ? "bg-orange-400" : "bg-slate-100"}`} />
                    )}
                    
                    <div className="flex justify-center shrink-0 lg:mb-2">
                      <div className={`relative z-10 flex items-center justify-center rounded-full lg:rounded-2xl font-bold text-sm transition-all duration-500 ${
                        isDone  ? "h-10 w-10 lg:h-14 lg:w-14 bg-orange-50 text-orange-600 border border-orange-200 lg:border-none lg:shadow-inner mt-1 lg:mt-0" :
                        isActive ? "h-12 w-12 lg:h-16 lg:w-16 bg-gradient-to-br from-[#7a1b15] to-[#5b1511] text-white shadow-xl shadow-[#5b1511]/30 ring-4 ring-[#5b1511]/10 lg:ring-0" :
                                   "h-10 w-10 lg:h-14 lg:w-14 bg-white border-2 border-slate-100 text-slate-300 mt-1 lg:mt-0 lg:border lg:bg-slate-100"
                      }`}>
                        {isDone ? <Check className="h-4 w-4 lg:h-6 lg:w-6" /> : <Icon className={`transition-all duration-500 ${isActive ? "h-5 w-5 lg:h-8 lg:w-8" : "h-4 w-4 lg:h-6 lg:w-6"}`} />}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <p className={`text-xs lg:text-[15px] font-bold leading-tight transition-colors duration-300 ${isActive ? "text-[#5b1511]" : isDone ? "text-slate-800" : "text-slate-400"}`}>{s.label}</p>
                      <p className={`hidden lg:block text-[11px] mt-1 text-center transition-colors duration-300 ${isActive ? "text-slate-600 font-medium" : "text-slate-400"}`}>{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
          </div>
        </div>

        {/* ── Right: Form Area ── */}
        <div id="right-form-card" className="flex-1 min-h-0 bg-white border border-slate-100 shadow-sm rounded-[20px] flex flex-col relative overflow-hidden" style={{ backgroundColor: '#ffffff', isolation: 'isolate' }}>
          {/* Form Header */}
          <div className="shrink-0 flex items-center justify-between gap-4 border-b border-slate-100 bg-white px-6 lg:px-10 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 bg-white text-[#5b1511] rounded-xl border border-slate-100 shadow-sm shrink-0">
                {(() => {
                  const StepIcon = STEPS[step - 1].icon;
                  return <StepIcon className="h-5 w-5" />;
                })()}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Langkah {step}: {STEPS[step - 1].label}
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">{STEPS[step - 1].desc}</p>
              </div>
            </div>
          </div>

          {/* Form Content Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-8 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <AnimatePresence mode="wait">

              {/* ─── Step 1: Info Dasar ─── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-8 w-full">

                  <div className="grid lg:grid-cols-2 gap-8">
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
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          className={`${stepInputCls} pl-9`}
                          placeholder="Contoh: Auditorium UNP, Padang"
                          value={form.lokasi}
                          onChange={e => setForm({ ...form, lokasi: e.target.value })}
                        />
                      </div>
                    </FieldGroup>
                  </div>

                  <FieldGroup label="Bentuk / Jenis Kegiatan" required>
                    <div className="flex flex-wrap gap-3">
                      {BENTUK_OPTIONS.map(opt => {
                        const BentukIcon = opt.icon;
                        const selected = form.bentuk_kegiatan === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setForm({ ...form, bentuk_kegiatan: opt.value })}
                            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border-2 text-[13px] font-bold transition-all text-left ${
                              selected
                                ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm shadow-orange-100"
                                : "border-slate-100 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <BentukIcon className={`h-4 w-4 shrink-0 ${selected ? "text-orange-600" : "text-slate-400"}`} />
                            <span className="leading-tight">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </FieldGroup>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 border border-slate-100 rounded-2xl p-6">
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

              {/* ─── Step 2: Detail Acara ─── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-8 w-full">

                  <div className="grid lg:grid-cols-2 gap-8">
                    <FieldGroup label="Target Peserta / Audiens" hint="Contoh: Mahasiswa Baru 2026">
                      <Input className={stepInputCls} placeholder="Mahasiswa dan Dosen UNP" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} />
                    </FieldGroup>
                    <FieldGroup label="Keynote / Narasumber Utama" hint="Opsional">
                      <Input className={stepInputCls} placeholder="Contoh: Prof. Dr. Rektor UNP" value={form.keynote} onChange={e => setForm({ ...form, keynote: e.target.value })} />
                    </FieldGroup>
                  </div>

                  <FieldGroup label="Rundown Acara (PDF)" hint="Opsional — unggah dokumen rundown dalam format PDF.">
                    <div className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-all ${
                        form.rundown_url ? "bg-orange-50 border-orange-200" : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <input 
                        type="file" 
                        accept=".pdf,application/pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        title="Drag and drop file PDF di sini"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
                              toast.error("Format file tidak didukung. Harap unggah file PDF.");
                              e.target.value = "";
                              return;
                            }
                            setForm({ ...form, rundown_url: file.name });
                          }
                        }}
                      />
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none px-4 text-center">
                        {form.rundown_url ? (
                          <>
                            <div className="h-10 w-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-2 shadow-sm border border-orange-200">
                              <FileText className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-bold text-slate-700 truncate max-w-[250px]">{form.rundown_url}</p>
                            <p className="text-xs text-orange-600 font-medium mt-1">Klik atau drop file untuk mengganti</p>
                          </>
                        ) : (
                          <>
                            <div className="h-10 w-10 bg-white shadow-sm border border-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-2">
                              <FileText className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-medium text-slate-600"><span className="font-bold text-[#5b1511]">Klik untuk unggah</span> atau drag and drop</p>
                            <p className="text-xs text-slate-400 mt-1">Hanya mendukung format PDF</p>
                          </>
                        )}
                      </div>
                    </div>
                  </FieldGroup>

                  {/* Tamu VVIP */}
                  <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Daftar Tamu VVIP</p>
                        <p className="text-xs text-slate-500 mt-0.5">Tambahkan tamu penting yang akan hadir</p>
                      </div>
                      <Button type="button" variant="outline" size="sm" className="rounded-xl border-slate-200 text-slate-700 bg-white hover:bg-slate-100 h-9 text-xs font-bold shadow-sm" onClick={addTamu}>
                        <Plus className="h-3.5 w-3.5 mr-1.5" /> Tambah Tamu
                      </Button>
                    </div>

                    <div className="p-6 bg-white">
                      {tamuVvip.length === 0 ? (
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                          <Users className="h-8 w-8 mx-auto text-slate-300 mb-3" />
                          <p className="text-sm text-slate-500 font-bold">Belum ada tamu VVIP yang ditambahkan</p>
                          <p className="text-xs text-slate-400 mt-1">Opsional — lewati jika tidak ada</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {tamuVvip.map((tamu, idx) => (
                            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-5 relative group">
                              <button type="button" onClick={() => removeTamu(idx)} className="absolute top-4 right-4 flex items-center justify-center h-8 w-8 rounded-lg text-red-400 bg-white border border-red-100 hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 shadow-sm">
                                <Trash2 className="h-4 w-4" />
                              </button>
                              
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Tamu #{idx + 1}</p>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2 space-y-1.5">
                                  <Label className="text-xs font-semibold text-slate-600">Nama Lengkap</Label>
                                  <Input className="h-10 rounded-xl border-slate-200 text-sm bg-white shadow-sm" placeholder="Contoh: Ir. Joko Widodo" value={tamu.nama_tamu} onChange={e => updateTamu(idx, "nama_tamu", e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold text-slate-600">Jabatan</Label>
                                  <Input className="h-10 rounded-xl border-slate-200 text-sm bg-white shadow-sm" placeholder="Jabatan" value={tamu.jabatan} onChange={e => updateTamu(idx, "jabatan", e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold text-slate-600">Rombongan</Label>
                                  <Input type="number" min={1} className="h-10 rounded-xl border-slate-200 text-sm bg-white shadow-sm" value={tamu.jumlah_rombongan} onChange={e => updateTamu(idx, "jumlah_rombongan", Number(e.target.value))} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── Step 3: Kebutuhan Tim ─── */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-8 w-full">

                  {/* Open Recruitment Toggle */}
                  <div className="flex items-center justify-between p-6 bg-[#5b1511] rounded-[24px] shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/10 text-white shadow-sm border border-white/5">
                        <UserCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-white">Open Recruitment Anggota</p>
                        <p className="text-xs text-slate-400 mt-0.5">Izinkan mahasiswa protokoler mendaftar sebagai panitia/petugas acara ini.</p>
                      </div>
                    </div>
                    <Switch
                      checked={form.is_open_recruitment}
                      onCheckedChange={v => setForm({ ...form, is_open_recruitment: v })}
                      className="data-[state=checked]:bg-orange-500"
                    />
                  </div>

                  {/* Jumlah Petugas */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800">Kebutuhan Personel Lapangan</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { key: "jumlah_protokoler_dibutuhkan", label: "Protokoler", desc: "Tata acara & pendampingan", icon: UserCheck },
                        { key: "jumlah_lo_dibutuhkan",         label: "Liaison Officer (LO)", desc: "Pemandu utama tamu",    icon: Handshake },
                      ].map(item => {
                        const ItemIcon = item.icon;
                        const val = (form as any)[item.key];
                        return (
                          <div key={item.key} className="flex flex-col items-center justify-center border border-slate-200 rounded-[24px] p-6 bg-white shadow-sm hover:border-slate-300 hover:shadow-md transition-all group">
                            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                              item.key === 'jumlah_protokoler_dibutuhkan' ? 'bg-rose-50 text-rose-900' :
                              item.key === 'jumlah_lo_dibutuhkan' ? 'bg-blue-50 text-blue-700' :
                              'bg-emerald-50 text-emerald-700'
                            }`}>
                              <ItemIcon className="h-8 w-8" />
                            </div>
                            <p className="text-[15px] font-bold text-slate-800 mb-1">{item.label}</p>
                            <p className="text-[11px] text-slate-500 mb-6 text-center line-clamp-1">{item.desc}</p>
                            
                            <div className="flex items-center justify-between w-full bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                              <button
                                type="button"
                                onClick={() => setForm({ ...form, [item.key]: Math.max(0, val - 1) })}
                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-100 transition-colors font-bold text-xl shrink-0"
                              >−</button>
                              <span className="flex-1 text-center font-display text-2xl font-bold text-slate-900">{val}</span>
                              <button
                                type="button"
                                onClick={() => setForm({ ...form, [item.key]: val + 1 })}
                                className={`h-10 w-10 shrink-0 flex items-center justify-center rounded-xl text-white shadow-md transition-colors font-bold text-xl ${
                                  item.key === 'jumlah_protokoler_dibutuhkan' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/20' :
                                  item.key === 'jumlah_lo_dibutuhkan' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20' :
                                  'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                                }`}
                              >+</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Catatan Tambahan */}
                  <FieldGroup label="Catatan / Instruksi Khusus" hint="Opsional — instruksi tambahan terkait penugasan panitia.">
                    <div className="relative">
                      <div className="absolute top-3.5 left-3.5 h-9 w-9 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-sm text-slate-400 pointer-events-none">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <textarea
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl shadow-sm focus:bg-white focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all text-sm text-slate-800 placeholder:text-slate-400 py-4 pr-5 pl-[4.5rem] h-32 resize-none leading-relaxed"
                        placeholder="Contoh: Dresscode panitia menggunakan almamater, kumpul 1 jam sebelum acara dimulai..."
                        value={form.catatan}
                        onChange={e => setForm({ ...form, catatan: e.target.value })}
                      />
                    </div>
                  </FieldGroup>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* ── Form Footer Navigation (Sticky) ── */}
          <div className="shrink-0 border-t border-slate-100 bg-white px-6 lg:px-10 py-5 z-10 rounded-b-[20px]">
            <div className="w-full flex justify-between items-center">
              {step > 1 ? (
                <Button type="button" variant="outline" className="rounded-xl border-slate-200 bg-white/80 text-slate-700 hover:bg-white shadow-sm h-11 px-5 font-bold transition-all" onClick={handlePrev}>
                  <ChevronLeft className="h-4 w-4 mr-1.5" /> Sebelumnya
                </Button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button type="button" className="rounded-xl bg-[#5b1511] text-white hover:bg-rose-950 h-11 px-8 font-bold shadow-md shadow-[#5b1511]/20 transition-all" onClick={handleNext}>
                  Lanjut <ChevronRight className="h-4 w-4 ml-1.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white h-11 px-8 font-bold shadow-lg shadow-orange-500/25 transition-all"
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? (
                    <span className="flex items-center gap-2"><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Publikasikan Kegiatan</span>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
