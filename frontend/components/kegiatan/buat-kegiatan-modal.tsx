"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kegiatanApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Check, Plus, Trash2, ChevronRight, ChevronLeft,
  CalendarDays, MapPin, Users, GraduationCap, Handshake,
  Megaphone, Landmark, ClipboardList, Camera, FileText, Info,
  UserCheck, Star, X, Mic, Crown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AnalogTimePicker } from "@/components/ui/analog-time-picker";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const STEPS = [
  { id: 1, label: "Info Dasar",     desc: "Nama, jenis, dan waktu",    icon: Info },
  { id: 2, label: "Detail Acara",   desc: "Target, MC, & rundown",     icon: Star },
  { id: 3, label: "Tamu VVIP",      desc: "Daftar tamu penting",       icon: Crown },
  { id: 4, label: "Kebutuhan Tim",  desc: "Jumlah petugas lapangan",   icon: Users },
];

const BENTUK_OPTIONS = [
  { value: "wisuda",      label: "Wisuda",         icon: GraduationCap },
  { value: "kunjungan",   label: "Kunjungan Tamu", icon: Handshake },
  { value: "seminar",     label: "Seminar",         icon: Megaphone },
  { value: "pelantikan",  label: "Pelantikan",      icon: Landmark },
  { value: "rapat_resmi", label: "Rapat Resmi",     icon: ClipboardList },
  { value: "lainnya",     label: "Lainnya",         icon: CalendarDays },
];

function FieldGroup({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[13px] font-bold text-slate-700 flex items-center gap-1">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {hint && <p className="text-[11px] text-slate-400 font-medium -mt-1">{hint}</p>}
      {children}
    </div>
  );
}

const initialForm = {
  nama_kegiatan: "",
  bentuk_kegiatan: "lainnya",
  tanggal: "",
  tanggal_selesai: "",
  jam_mulai: "",
  jam_selesai: "",
  lokasi: "",
  audience: "",
  keynote: "",
  mc: "",
  rundown_url: "",
  jumlah_protokoler_dibutuhkan: 1,
  jumlah_lo_dibutuhkan: 1,
  jumlah_dokumentasi_dibutuhkan: 1,
  is_open_recruitment: true,
};

export function BuatKegiatanModal({ isOpen, onClose, editId }: { isOpen: boolean; onClose: () => void; editId?: string }) {
  const qc = useQueryClient();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState(initialForm);
  const [tamuVvip, setTamuVvip] = useState<any[]>([]);
  const [timeView, setTimeView] = useState<"date" | "start" | "end">("date");
  const [isAddingTamu, setIsAddingTamu] = useState(false);
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [newTamu, setNewTamu] = useState({ nama_tamu: "", jabatan: "", instansi: "", tipe: "eksternal", jumlah_rombongan: 1 });

  // Load data for editing if editId is provided
  const { data: editData } = useQuery({
    queryKey: ["kegiatan-edit-data", editId],
    queryFn: () => kegiatanApi.get(editId!),
    enabled: !!editId && isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      if (editId && editData) {
        setStep(1);
        setForm({
          nama_kegiatan: editData.nama_kegiatan || "",
          bentuk_kegiatan: editData.bentuk_kegiatan || "lainnya",
          tanggal: editData.tanggal ? new Date(editData.tanggal).toISOString().split("T")[0] : "",
          tanggal_selesai: editData.tanggal_selesai ? new Date(editData.tanggal_selesai).toISOString().split("T")[0] : "",
          jam_mulai: editData.jam_mulai || "",
          jam_selesai: editData.jam_selesai || "",
          lokasi: editData.lokasi || "",
          audience: editData.audience || "",
          keynote: editData.keynote || "",
          mc: editData.mc || "",
          rundown_url: editData.rundown_url || "",
          jumlah_protokoler_dibutuhkan: editData.jumlah_protokoler_dibutuhkan || 1,
          jumlah_lo_dibutuhkan: editData.jumlah_lo_dibutuhkan || 1,
          jumlah_dokumentasi_dibutuhkan: 1,
          is_open_recruitment: true,
        });
        setTamuVvip(editData.tamu_vvip || []);
        setTimeView("date");
        setIsAddingTamu(false);
        setIsMultiDay(!!editData.tanggal_selesai);
      } else if (!editId) {
        setStep(1);
        setForm(initialForm);
        setTamuVvip([]);
        setTimeView("date");
        setIsAddingTamu(false);
        setIsMultiDay(false);
      }
    }
  }, [isOpen, editId, editData]);

  const addTamu = () => {
    setNewTamu({ nama_tamu: "", jabatan: "", instansi: "", tipe: "eksternal", jumlah_rombongan: 1 });
    setIsAddingTamu(true);
  };

  const saveNewTamu = () => {
    if (!newTamu.nama_tamu.trim()) {
      toast.error("Nama tamu wajib diisi");
      return;
    }
    setTamuVvip([...tamuVvip, newTamu]);
    setIsAddingTamu(false);
  };

  const removeTamu = (idx: number) =>
    setTamuVvip(tamuVvip.filter((_, i) => i !== idx));

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        status: editId && editData ? editData.status : "terjadwal",
        tamu_vvip: tamuVvip,
        tanggal: form.tanggal ? new Date(form.tanggal).toISOString() : "",
        tanggal_selesai: form.tanggal_selesai ? new Date(form.tanggal_selesai).toISOString() : undefined,
      };
      if (editId) {
        return kegiatanApi.update(editId, payload);
      }
      return kegiatanApi.create(payload);
    },
    onSuccess: () => {
      toast.success(editId ? "Kegiatan berhasil diperbarui!" : "Kegiatan berhasil dijadwalkan!");
      qc.invalidateQueries({ queryKey: ["kegiatan"] });
      if (editId) {
        qc.invalidateQueries({ queryKey: ["kegiatan", editId] });
      }
      onClose();
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
    setStep(s => Math.min(4, s + 1));
  };

  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  const stepInputCls = "rounded-[14px] border-slate-200 bg-white h-[46px] text-sm focus:ring-2 focus:ring-red-400/20 focus:border-[#6B0000] transition-all shadow-sm";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="[&>button]:hidden max-w-7xl p-0 overflow-hidden bg-transparent border-none shadow-none h-[90vh] md:h-[85vh] flex flex-col sm:rounded-[2rem]">
        {/* Screen Reader Only Title/Desc */}
        <div className="sr-only">
          <DialogTitle>{editId ? "Edit Kegiatan" : "Buat Kegiatan Baru"}</DialogTitle>
          <DialogDescription>
            {editId ? "Formulir untuk mengubah kegiatan di sistem protokoler." : "Formulir untuk membuat kegiatan baru di sistem protokoler."}
          </DialogDescription>
        </div>

        {/* Modal Container */}
        <div className="flex-1 flex flex-col min-h-0 bg-white sm:rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-black/5">
          
          <div className="grid lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] flex-1 min-h-0 bg-white">
            
            {/* Kolom Kiri: Form Card */}
            <div className="bg-white relative z-10 flex flex-col overflow-hidden h-full">
              
              {/* Header Card Kiri */}
              <div className="px-6 md:px-8 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 bg-white border border-slate-200 text-primary rounded-[14px] shadow-sm shrink-0">
                    {step === 1 && <Info className="h-6 w-6 text-[#6B0000]" />}
                    {step === 2 && <Star className="h-6 w-6 text-[#6B0000]" />}
                    {step === 3 && <Crown className="h-6 w-6 text-[#6B0000]" />}
                    {step === 4 && <Users className="h-6 w-6 text-[#6B0000]" />}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">Langkah {step}: {STEPS[step-1].label}</h2>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{STEPS[step-1].desc}</p>
                  </div>
                </div>
                {/* Mobile close button if stepper is hidden on small screens */}
                <button onClick={onClose} className="lg:hidden h-10 w-10 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-900">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Isi Form */}
              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="p-6 md:p-8 min-h-full flex flex-col">
                <AnimatePresence mode="wait">
                  
                  {/* Step 1: Info Dasar */}
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-5 pb-4">
                      
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
                        <div className="flex flex-nowrap overflow-x-auto gap-2.5 pb-1 -mb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                          {BENTUK_OPTIONS.map(opt => {
                            const BentukIcon = opt.icon;
                            const selected = form.bentuk_kegiatan === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setForm({ ...form, bentuk_kegiatan: opt.value })}
                                className={`flex items-center shrink-0 gap-2 px-3.5 py-2 rounded-xl border-2 text-xs font-bold transition-all ${
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

                      <FieldGroup label="Waktu Pelaksanaan" required>
                        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm flex flex-col md:flex-row w-full">
                          {/* Kiri: Kalender Selalu Terlihat */}
                          <div className="border-b md:border-b-0 md:border-r border-slate-100 bg-white p-1 md:p-4 flex-1 flex flex-col justify-center items-center">
                            <div className="flex items-center justify-between w-full px-2 mb-2 pb-2 border-b border-slate-100">
                              <span className="text-xs font-bold text-slate-600">Beberapa Hari?</span>
                              <Switch checked={isMultiDay} onCheckedChange={(v) => {
                                setIsMultiDay(v);
                                if (!v) setForm({...form, tanggal_selesai: ""});
                              }} className="data-[state=checked]:bg-[#6B0000]" />
                            </div>
                            <Calendar
                              mode={isMultiDay ? "range" : "single"}
                              className="p-1 [--cell-size:1.6rem] md:[--cell-size:1.8rem]"
                              selected={
                                isMultiDay
                                  ? {
                                      from: form.tanggal ? new Date(form.tanggal) : undefined,
                                      to: form.tanggal_selesai ? new Date(form.tanggal_selesai) : undefined,
                                    }
                                  : form.tanggal
                                  ? new Date(form.tanggal)
                                  : undefined
                              }
                              onSelect={(val: any) => {
                                if (isMultiDay) {
                                  if (val?.from) {
                                    const f = new Date(val.from.getTime() - val.from.getTimezoneOffset() * 60000);
                                    const t = val?.to ? new Date(val.to.getTime() - val.to.getTimezoneOffset() * 60000) : undefined;
                                    setForm({
                                      ...form,
                                      tanggal: f.toISOString().split("T")[0],
                                      tanggal_selesai: t ? t.toISOString().split("T")[0] : "",
                                    });
                                    if (t) setTimeView("start");
                                  } else {
                                    setForm({ ...form, tanggal: "", tanggal_selesai: "" });
                                  }
                                } else {
                                  if (val) {
                                    const d = new Date(val.getTime() - val.getTimezoneOffset() * 60000);
                                    setForm({ ...form, tanggal: d.toISOString().split("T")[0], tanggal_selesai: "" });
                                    setTimeView("start");
                                  } else {
                                    setForm({ ...form, tanggal: "", tanggal_selesai: "" });
                                  }
                                }
                              }}
                            />
                          </div>

                          {/* Kanan: Hasil Pilihan / Jam Analog */}
                          <div className="flex-1 flex flex-col bg-slate-50 relative min-w-[260px]">
                            {timeView === "date" && (
                              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-300">
                                {form.tanggal && form.jam_mulai && form.jam_selesai ? (
                                  <>
                                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 text-[#6B0000] shadow-inner">
                                      <Check className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Waktu Terpilih</span>
                                    <span className="text-sm font-semibold text-slate-800 mb-0.5">
                                      {format(new Date(form.tanggal), "PPP", { locale: id })} 
                                      {form.tanggal_selesai && form.tanggal_selesai !== form.tanggal ? ` - ${format(new Date(form.tanggal_selesai), "PPP", { locale: id })}` : ''}
                                    </span>
                                    <span className="text-lg font-bold text-[#6B0000] mb-4">
                                      {form.jam_mulai} - {form.jam_selesai}
                                    </span>
                                    <button type="button" onClick={() => setTimeView("start")} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900 shadow-sm transition-colors">
                                      Ubah Jam
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <CalendarDays className="w-10 h-10 mb-3 text-slate-300" />
                                    <p className="text-xs font-medium text-slate-500 leading-relaxed">
                                      {form.tanggal ? "Silakan atur jam kegiatan Anda" : "Pilih tanggal di kalender terlebih dahulu"}
                                    </p>
                                  </>
                                )}
                              </div>
                            )}
                            
                            {timeView === "start" && (
                              <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 bg-slate-50">
                                  <button type="button" onClick={() => setTimeView("date")} className="p-1 -ml-1 rounded hover:bg-slate-200 transition-colors">
                                    <ChevronLeft className="w-4 h-4 text-slate-500" />
                                  </button>
                                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mx-auto">Atur Jam Mulai</span>
                                </div>
                                <AnalogTimePicker 
                                  value={form.jam_mulai} 
                                  onChange={v => setForm({ ...form, jam_mulai: v })} 
                                  onComplete={() => setTimeView("end")} 
                                />
                              </div>
                            )}

                            {timeView === "end" && (
                              <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 bg-slate-50">
                                  <button type="button" onClick={() => setTimeView("start")} className="p-1 -ml-1 rounded hover:bg-slate-200 transition-colors">
                                    <ChevronLeft className="w-4 h-4 text-slate-500" />
                                  </button>
                                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mx-auto">Atur Jam Selesai</span>
                                </div>
                                <AnalogTimePicker 
                                  value={form.jam_selesai} 
                                  onChange={v => setForm({ ...form, jam_selesai: v })} 
                                  onComplete={() => setTimeView("date")} 
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </FieldGroup>
                      
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
                      
                      <FieldGroup label="MC yang Bertugas" hint="Opsional — Master of Ceremony untuk acara ini">
                        <div className="relative">
                          <Mic className="absolute left-3.5 top-[15px] h-4 w-4 text-slate-400" />
                          <Input className={`${stepInputCls} pl-10`} placeholder="Contoh: Dandi & Nisa" value={form.mc} onChange={e => setForm({ ...form, mc: e.target.value })} />
                        </div>
                      </FieldGroup>

                      <FieldGroup label="Link Rundown Acara" hint="Opsional — tautan ke dokumen Google Drive, PDF, dll.">
                        <div className="relative">
                          <FileText className="absolute left-3.5 top-[15px] h-4 w-4 text-slate-400" />
                          <Input type="url" className={`${stepInputCls} pl-10`} placeholder="https://drive.google.com/..." value={form.rundown_url} onChange={e => setForm({ ...form, rundown_url: e.target.value })} />
                        </div>
                      </FieldGroup>
                    </motion.div>
                  )}

                  {/* Step 3: Tamu VVIP */}
                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-7">
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

                        {isAddingTamu ? (
                          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-bold text-slate-800 text-sm">Tambah Tamu Baru</h4>
                              <button type="button" onClick={() => setIsAddingTamu(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-2 space-y-1">
                                <Label className="text-[11px] font-bold text-slate-500">Nama Lengkap *</Label>
                                <Input className="h-9 rounded-lg border-slate-200 text-sm" placeholder="Nama tamu" value={newTamu.nama_tamu} onChange={e => setNewTamu({ ...newTamu, nama_tamu: e.target.value })} />
                              </div>
                              <div className="col-span-2 sm:col-span-1 space-y-1">
                                <Label className="text-[11px] font-bold text-slate-500">Tipe Tamu</Label>
                                <select 
                                  className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400/20 focus-visible:border-[#6B0000]"
                                  value={newTamu.tipe} 
                                  onChange={e => setNewTamu({ ...newTamu, tipe: e.target.value })}
                                >
                                  <option value="eksternal">Eksternal</option>
                                  <option value="internal">Internal</option>
                                </select>
                              </div>
                              <div className="col-span-2 sm:col-span-1 space-y-1">
                                <Label className="text-[11px] font-bold text-slate-500">Jumlah Rombongan</Label>
                                <Input type="number" min={1} className="h-9 rounded-lg border-slate-200 text-sm" value={newTamu.jumlah_rombongan} onChange={e => setNewTamu({ ...newTamu, jumlah_rombongan: Number(e.target.value) })} />
                              </div>
                              <div className="col-span-2 sm:col-span-1 space-y-1">
                                <Label className="text-[11px] font-bold text-slate-500">Jabatan</Label>
                                <Input className="h-9 rounded-lg border-slate-200 text-sm" placeholder="Contoh: Rektor" value={newTamu.jabatan} onChange={e => setNewTamu({ ...newTamu, jabatan: e.target.value })} />
                              </div>
                              <div className="col-span-2 sm:col-span-1 space-y-1">
                                <Label className="text-[11px] font-bold text-slate-500">Instansi</Label>
                                <Input className="h-9 rounded-lg border-slate-200 text-sm" placeholder="Contoh: UNP" value={newTamu.instansi} onChange={e => setNewTamu({ ...newTamu, instansi: e.target.value })} />
                              </div>
                            </div>
                            <div className="mt-5 flex justify-end gap-2">
                              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingTamu(false)} className="h-8 text-xs font-bold text-slate-500 hover:text-slate-700">Batal</Button>
                              <Button type="button" size="sm" onClick={saveNewTamu} className="h-8 text-xs font-bold bg-[#6B0000] text-white hover:bg-red-900 rounded-lg">Simpan Tamu</Button>
                            </div>
                          </div>
                        ) : tamuVvip.length === 0 ? (
                          <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center bg-white/50">
                            <Users className="h-6 w-6 mx-auto text-slate-300 mb-3" />
                            <p className="text-xs font-bold text-slate-400">Belum ada tamu VVIP</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {tamuVvip.map((tamu, idx) => (
                              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-sm group">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                    <Crown className="h-4 w-4 text-slate-400 group-hover:text-[#6B0000] transition-colors" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-slate-800">{tamu.nama_tamu}</p>
                                    <p className="text-[10px] text-slate-500 leading-tight">
                                      {tamu.jabatan || 'Tamu'} {tamu.instansi ? `• ${tamu.instansi}` : ''} ({tamu.jumlah_rombongan} org)
                                    </p>
                                  </div>
                                </div>
                                <button type="button" onClick={() => removeTamu(idx)} className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Kebutuhan Tim */}
                  {step === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-7">
                      
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

                      <div className="grid md:grid-cols-2 gap-5">
                        {[
                          { key: "jumlah_protokoler_dibutuhkan", label: "Protokoler", desc: "Tata acara & pendampingan VVIP", icon: UserCheck },
                          { key: "jumlah_lo_dibutuhkan",         label: "Liaison Officer", desc: "Pemandu utama audiens/tamu",    icon: Handshake },
                        ].map(item => {
                          const ItemIcon = item.icon;
                          const val = (form as any)[item.key];
                          return (
                            <div key={item.key} className="border border-slate-100 bg-white rounded-[1.5rem] p-5 shadow-sm">
                              <div className="flex items-center gap-2 mb-2">
                                <ItemIcon className="h-4 w-4 text-slate-400" />
                                <p className="text-[13px] font-bold text-slate-800">{item.label}</p>
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium mb-6 line-clamp-2">{item.desc}</p>
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
              </div>

            </div>

            {/* Kolom Kanan: Vertical Stepper */}
            <div className="hidden lg:flex flex-col bg-slate-50/80 border-l border-slate-100 h-full overflow-hidden">
              <div className="px-6 xl:px-8 py-5 flex items-center justify-end shrink-0 mb-4">
                <button onClick={onClose} className="h-10 w-10 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-red-700 hover:bg-red-50 hover:border-red-200 shadow-sm transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative px-6 xl:px-8 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <h3 className="font-bold text-slate-800 text-lg mb-8 px-2">Progres Acara</h3>
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const isActive = step === s.id;
                  const isDone = step > s.id;
                  
                  return (
                    <div key={s.id} className="relative mb-8 last:mb-0 px-2">
                      {/* Connector */}
                      {i < STEPS.length - 1 && (
                        <div className={`absolute top-10 left-[27px] bottom-[-32px] w-[2px] transition-colors duration-300 ${isDone ? "bg-[#6B0000]" : "bg-slate-200"}`} />
                      )}

                      <div className="flex gap-5 relative z-10">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isActive ? "bg-[#6B0000] text-white shadow-md shadow-[#6B0000]/20 ring-4 ring-red-50/50" :
                          isDone ? "bg-white text-[#6B0000] border-2 border-red-100 shadow-sm" :
                          "bg-white/50 border-2 border-slate-200 text-slate-400"
                        }`}>
                          {isDone ? <Check className="h-4 w-4 stroke-[3]" /> : <Icon className="h-4 w-4" />}
                        </div>
                        <div className="pt-2">
                          <p className={`text-sm font-black leading-none mb-1 transition-colors ${isActive ? "text-[#6B0000]" : isDone ? "text-slate-800" : "text-slate-500"}`}>{s.label}</p>
                          <p className="text-[11px] font-medium text-slate-500 leading-tight pr-4">{s.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Navigasi Kiri-Kanan Bawah */}
          <div className="flex justify-between items-center mt-auto px-6 md:px-8 py-6 border-t border-slate-100 shrink-0 bg-white relative z-20">
            {step > 1 ? (
              <Button type="button" variant="outline" className="rounded-xl border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-sm h-11 px-5 font-bold transition-all" onClick={handlePrev}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Kembali
              </Button>
            ) : <div />}

            {step < 4 ? (
              <Button type="button" className="rounded-xl bg-[#6B0000] hover:bg-red-950 text-white h-11 px-8 font-bold shadow-md shadow-red-900/20 transition-all" onClick={handleNext}>
                Lanjut <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button type="button" className="rounded-xl bg-[#6B0000] hover:bg-red-950 text-white h-11 px-8 font-bold shadow-md shadow-red-900/20 transition-all" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Menyimpan..." : <><Check className="h-4 w-4 mr-2" /> {editId ? "Simpan Perubahan" : "Buat Acara"}</>}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
