"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { testimoniApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Star, CheckCircle2, Loader2 } from "lucide-react";
import Image from "next/image";

export default function TestimoniPage({ params }: { params: Promise<{ token: string }> }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    nama_tamu: "",
    jabatan_tamu: "",
    isi_testimoni: "",
    rating: 0,
  });
  const [hoveredStar, setHoveredStar] = useState(0);

  const submitMutation = useMutation({
    mutationFn: () => testimoniApi.create(form),
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.rating) return;
    submitMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="relative h-16 w-16 mx-auto mb-4 bg-white/10 p-2 backdrop-blur-sm border border-white/20 overflow-hidden">
            <Image src="/logo protokoler.png" alt="Protokoler" fill sizes="64px" className="object-contain p-1" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Testimoni Tamu</h1>
          <p className="text-white/70 text-sm mt-2">Bagikan pengalaman Anda atas pelayanan protokol kami.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white/95 backdrop-blur-xl border border-white/50 shadow-2xl p-8">

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onSubmit={handleSubmit} className="space-y-5">

                {/* Rating Stars */}
                <div className="space-y-2 text-center">
                  <Label className="font-bold text-slate-700 block">Rating Pelayanan <span className="text-red-500">*</span></Label>
                  <p className="text-xs text-slate-400">Klik bintang untuk memberikan nilai</p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm({ ...form, rating: s })}
                        onMouseEnter={() => setHoveredStar(s)}
                        onMouseLeave={() => setHoveredStar(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-10 w-10 transition-colors ${
                            s <= (hoveredStar || form.rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-slate-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {form.rating > 0 && (
                    <p className="text-sm font-bold text-slate-700">
                      {["", "Sangat Kurang", "Kurang", "Cukup", "Baik", "Sangat Baik"][form.rating]}
                    </p>
                  )}
                </div>

                <div className="h-px bg-slate-200" />

                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700">Nama Anda <span className="text-red-500">*</span></Label>
                  <Input
                    required
                    className="rounded-none border-slate-300 bg-slate-50 h-11"
                    placeholder="Contoh: Prof. Dr. Budi Santoso"
                    value={form.nama_tamu}
                    onChange={e => setForm({ ...form, nama_tamu: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700">Jabatan / Instansi</Label>
                  <Input
                    className="rounded-none border-slate-300 bg-slate-50 h-11"
                    placeholder="Contoh: Kepala Dinas Pendidikan Sumbar"
                    value={form.jabatan_tamu}
                    onChange={e => setForm({ ...form, jabatan_tamu: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700">Testimoni <span className="text-red-500">*</span></Label>
                  <Textarea
                    required
                    rows={4}
                    className="rounded-none border-slate-300 bg-slate-50 resize-none"
                    placeholder="Tuliskan kesan dan pesan Anda mengenai pelayanan protokol dalam acara ini..."
                    value={form.isi_testimoni}
                    onChange={e => setForm({ ...form, isi_testimoni: e.target.value })}
                  />
                  <p className="text-xs text-slate-400 text-right">{form.isi_testimoni.length} karakter</p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-none font-bold text-base"
                  disabled={!form.rating || !form.nama_tamu || !form.isi_testimoni || submitMutation.isPending}
                  variant="gold"
                >
                  {submitMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Mengirim...</>
                  ) : (
                    "Kirim Testimoni 🙏"
                  )}
                </Button>
              </motion.form>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-4">
                <div className="h-20 w-20 mx-auto bg-green-100 border-2 border-green-300 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="font-display text-2xl font-bold text-slate-900">Terima Kasih!</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Testimoni Anda telah berhasil dikirim. Masukan Anda sangat berarti bagi pengembangan tim protokol kami.
                </p>
                <div className="flex justify-center gap-1 mt-2">
                  {Array.from({ length: form.rating }).map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="text-center text-xs text-white/40 mt-6">
          © 2026 Protokoler · Universitas Negeri Padang
        </p>
      </div>
    </div>
  );
}
