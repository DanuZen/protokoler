"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { kegiatanApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Check, Plus, Trash2, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
    jumlah_protokoler_dibutuhkan: 0,
    jumlah_lo_dibutuhkan: 0,
    status: "draf", // draf atau publik
  });

  const [tamuVvip, setTamuVvip] = useState<any[]>([]);

  const addTamu = () => {
    setTamuVvip([...tamuVvip, { nama_tamu: "", jabatan: "", instansi: "", tipe: "eksternal", jumlah_rombongan: 1 }]);
  };

  const removeTamu = (idx: number) => {
    setTamuVvip(tamuVvip.filter((_, i) => i !== idx));
  };

  const updateTamu = (idx: number, field: string, value: any) => {
    const nw = [...tamuVvip];
    nw[idx][field] = value;
    setTamuVvip(nw);
  };

  const saveMutation = useMutation({
    mutationFn: async (status: "draf" | "publik") => {
      const payload = { ...form, status, tamu_vvip: tamuVvip };
      // Transform date to ISO string to ensure backend accepts it correctly
      if (payload.tanggal) {
        payload.tanggal = new Date(payload.tanggal).toISOString();
      }
      return kegiatanApi.create(payload);
    },
    onSuccess: (data, status) => {
      toast.success(`Kegiatan berhasil disimpan sebagai ${status}`);
      qc.invalidateQueries({ queryKey: ["kegiatan"] });
      router.push("/kegiatan");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleNext = () => setStep(s => Math.min(3, s + 1));
  const handlePrev = () => setStep(s => Math.max(1, s - 1));
  const handleSubmit = (status: "draf" | "publik") => saveMutation.mutate(status);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/kegiatan">
          <Button variant="outline" size="icon" className="rounded-none"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Buat Kegiatan Baru</h1>
          <p className="text-slate-500">Isi formulir untuk menambahkan kegiatan ke dalam sistem.</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center flex-1 relative">
            <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold z-10 transition-colors ${step >= i ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"}`}>
              {step > i ? <Check className="h-5 w-5" /> : i}
            </div>
            <span className={`text-sm mt-2 font-medium ${step >= i ? "text-slate-900" : "text-slate-400"}`}>
              {i === 1 ? "Info Dasar" : i === 2 ? "Detail & Tamu" : "Kebutuhan SDM"}
            </span>
            {i < 3 && (
              <div className={`absolute top-5 left-1/2 w-full h-[2px] -z-0 ${step > i ? "bg-slate-900" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
      </div>

      <Card className="p-2">
        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold">Nama Kegiatan <span className="text-red-500">*</span></Label>
                    <Input className="rounded-none border-slate-300 bg-white" placeholder="Cth: Seminar Nasional Teknologi 2026" value={form.nama_kegiatan} onChange={e => setForm({...form, nama_kegiatan: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Bentuk Kegiatan <span className="text-red-500">*</span></Label>
                    <Select value={form.bentuk_kegiatan} onValueChange={v => setForm({...form, bentuk_kegiatan: v})}>
                      <SelectTrigger className="rounded-none border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-none">
                        <SelectItem value="wisuda">Wisuda</SelectItem>
                        <SelectItem value="kunjungan_tamu">Kunjungan Tamu</SelectItem>
                        <SelectItem value="seminar">Seminar</SelectItem>
                        <SelectItem value="pelantikan">Pelantikan</SelectItem>
                        <SelectItem value="rapat_resmi">Rapat Resmi</SelectItem>
                        <SelectItem value="upacara">Upacara</SelectItem>
                        <SelectItem value="lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold">Tanggal <span className="text-red-500">*</span></Label>
                    <Input type="date" className="rounded-none border-slate-300 bg-white" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Jam Mulai <span className="text-red-500">*</span></Label>
                    <Input type="time" className="rounded-none border-slate-300 bg-white" value={form.jam_mulai} onChange={e => setForm({...form, jam_mulai: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Jam Selesai <span className="text-red-500">*</span></Label>
                    <Input type="time" className="rounded-none border-slate-300 bg-white" value={form.jam_selesai} onChange={e => setForm({...form, jam_selesai: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">Lokasi <span className="text-red-500">*</span></Label>
                  <Input className="rounded-none border-slate-300 bg-white" placeholder="Cth: Auditorium Universitas" value={form.lokasi} onChange={e => setForm({...form, lokasi: e.target.value})} />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold">Target Audience / Peserta</Label>
                    <Input className="rounded-none border-slate-300 bg-white" placeholder="Cth: Mahasiswa Baru 2026" value={form.audience} onChange={e => setForm({...form, audience: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Keynote / Narasumber Utama</Label>
                    <Input className="rounded-none border-slate-300 bg-white" placeholder="Cth: Prof. Dr. Ir. Rektor" value={form.keynote} onChange={e => setForm({...form, keynote: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">Link Rundown Acara (Opsional)</Label>
                  <Input type="url" className="rounded-none border-slate-300 bg-white" placeholder="https://drive.google.com/..." value={form.rundown_url} onChange={e => setForm({...form, rundown_url: e.target.value})} />
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="font-bold text-lg">Daftar Tamu VVIP</Label>
                    <Button variant="outline" size="sm" className="rounded-none border-slate-300 bg-white" onClick={addTamu}>
                      <Plus className="h-4 w-4 mr-2" /> Tambah Tamu
                    </Button>
                  </div>

                  {tamuVvip.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 bg-slate-50 border border-dashed border-slate-300">
                      Belum ada data tamu VVIP yang ditambahkan.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tamuVvip.map((tamu, idx) => (
                        <div key={idx} className="flex flex-wrap items-end gap-4 p-4 border border-slate-200 bg-white">
                          <div className="flex-1 min-w-[200px] space-y-1">
                            <Label className="text-xs">Nama Tamu</Label>
                            <Input className="rounded-none border-slate-300" value={tamu.nama_tamu} onChange={e => updateTamu(idx, "nama_tamu", e.target.value)} />
                          </div>
                          <div className="flex-1 min-w-[150px] space-y-1">
                            <Label className="text-xs">Jabatan</Label>
                            <Input className="rounded-none border-slate-300" value={tamu.jabatan} onChange={e => updateTamu(idx, "jabatan", e.target.value)} />
                          </div>
                          <div className="flex-1 min-w-[150px] space-y-1">
                            <Label className="text-xs">Tipe</Label>
                            <Select value={tamu.tipe} onValueChange={v => updateTamu(idx, "tipe", v)}>
                              <SelectTrigger className="rounded-none border-slate-300 bg-white"><SelectValue /></SelectTrigger>
                              <SelectContent className="rounded-none">
                                <SelectItem value="internal">Internal</SelectItem>
                                <SelectItem value="eksternal">Eksternal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="w-24 space-y-1">
                            <Label className="text-xs">Rombongan</Label>
                            <Input type="number" className="rounded-none border-slate-300" value={tamu.jumlah_rombongan} onChange={e => updateTamu(idx, "jumlah_rombongan", Number(e.target.value))} />
                          </div>
                          <Button variant="destructive" size="icon" className="rounded-none" onClick={() => removeTamu(idx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 p-4 text-blue-800 mb-6">
                  Tentukan berapa jumlah tim lapangan yang dibutuhkan untuk menyukseskan kegiatan ini.
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="font-bold text-lg">Jumlah Protokoler Dibutuhkan</Label>
                    <p className="text-sm text-slate-500 mb-2">Bertugas mengatur tata acara, tata tempat, dan pendampingan VVIP.</p>
                    <Input type="number" className="rounded-none border-slate-300 text-2xl h-14 bg-white" min="0" value={form.jumlah_protokoler_dibutuhkan} onChange={e => setForm({...form, jumlah_protokoler_dibutuhkan: Number(e.target.value)})} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-bold text-lg">Jumlah LO Dibutuhkan</Label>
                    <p className="text-sm text-slate-500 mb-2">Liaison Officer bertugas sebagai pemandu utama audiens/tamu.</p>
                    <Input type="number" className="rounded-none border-slate-300 text-2xl h-14 bg-white" min="0" value={form.jumlah_lo_dibutuhkan} onChange={e => setForm({...form, jumlah_lo_dibutuhkan: Number(e.target.value)})} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center pt-4">
        {step > 1 ? (
          <Button variant="outline" className="rounded-none bg-white" onClick={handlePrev}>
            <ChevronLeft className="h-4 w-4 mr-2" /> Kembali
          </Button>
        ) : <div />}
        
        {step < 3 ? (
          <Button className="rounded-none bg-slate-900 text-white" onClick={handleNext}>
            Lanjut <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-none bg-white text-slate-700" onClick={() => handleSubmit("draf")} disabled={saveMutation.isPending}>
              Simpan sebagai Draf
            </Button>
            <Button variant="gold" className="rounded-none" onClick={() => handleSubmit("publik")} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Menyimpan..." : "Publikasikan Kegiatan"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
