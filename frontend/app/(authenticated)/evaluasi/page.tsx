"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { kegiatanApi, evaluasiApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MapPin, Search, ClipboardCheck, ChevronRight, ChevronLeft, CheckCircle2, User } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };

const slideLeft  = { initial: { x: 40, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -40, opacity: 0 } };
const slideRight = { initial: { x: -40, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 40, opacity: 0 } };

const INIT_FORM = {
  // Step 1 — Evaluasi Kegiatan
  rating_acara: 0,
  rating_protokoler: 0,
  komentar: "",
  // Step 2 — Evaluasi Diri
  diri_kedisiplinan: 0,
  diri_penampilan: 0,
  diri_komunikasi: 0,
  catatan_diri: "",
};

function StarRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.15em]">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={cn(
              "h-10 w-10 flex items-center justify-center border transition-all rounded-xl",
              value >= s
                ? "bg-[#6b0000] border-[#d2ad5c] text-white"
                : "bg-slate-50 border-slate-200 text-slate-300 hover:border-[#6b0000] hover:text-[#d2ad5c]"
            )}
          >
            <Star className="h-5 w-5" fill={value >= s ? "currentColor" : "none"} />
          </button>
        ))}
        <span className="ml-2 self-center text-sm font-bold text-slate-700">{value > 0 ? `${value}/5` : "-"}</span>
      </div>
    </div>
  );
}

function SelfStarRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.15em]">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={cn(
              "h-10 w-10 flex items-center justify-center border transition-all rounded-xl",
              value >= s
                ? "bg-[#6b0000] border-[#6b0000] text-[#d2ad5c]"
                : "bg-slate-50 border-slate-200 text-slate-300 hover:border-[#6b0000] hover:text-slate-800"
            )}
          >
            <Star className="h-5 w-5" fill={value >= s ? "currentColor" : "none"} />
          </button>
        ))}
        <span className="ml-2 self-center text-sm font-bold text-slate-700">{value > 0 ? `${value}/5` : "-"}</span>
      </div>
    </div>
  );
}

export default function EvaluasiPage() {
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [step, setStep]         = useState(1);      // 1 or 2
  const [form, setForm]         = useState(INIT_FORM);

  const closeDialog = () => { setSelected(null); setStep(1); setForm(INIT_FORM); };

  const { data: kegiatan, isLoading } = useQuery({
    queryKey: ["kegiatan-evaluasi"],
    queryFn: () => kegiatanApi.list(),
  });

  const submitEval = useMutation({
    mutationFn: () => evaluasiApi.create({ kegiatan_id: selected?.id, ...form }),
    onSuccess: () => { toast.success("Evaluasi berhasil dikirim!"); closeDialog(); },
    onError:   () => toast.error("Gagal mengirim evaluasi"),
  });

  const filtered = (kegiatan || [] as any[])
    .filter((k: any) => k.status === "selesai")
    .filter((k: any) =>
      k.nama_kegiatan.toLowerCase().includes(search.toLowerCase()) ||
      k.lokasi.toLowerCase().includes(search.toLowerCase())
    );

  const step1Valid = form.rating_acara > 0 && form.rating_protokoler > 0;
  const step2Valid = form.diri_kedisiplinan > 0 && form.diri_penampilan > 0 && form.diri_komunikasi > 0;

  const avgRating = 4.8;
  const totalEvaluated = 124;

  return (
    <div className="flex flex-col min-h-full pb-10 px-6 md:px-8 pt-4">
      {/* ─── HEADER SECTION ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 pb-6 border-b border-slate-200/60">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20 text-white">
            <ClipboardCheck className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
                Penilaian
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 text-slate-900 drop-shadow-sm">Evaluasi Kegiatan</h2>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Berikan masukan dan penilaian terhadap kinerja protokoler.</p>
          </div>
        </div>
        <div className="flex items-stretch gap-3 shrink-0">
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm rounded-2xl px-5 py-3 text-center">
            <div className="text-2xl font-extrabold text-orange-500 leading-none">{avgRating}</div>
            <div className="text-[9px] uppercase tracking-widest text-slate-400 mt-1 font-bold">Rata-rata</div>
          </div>
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm rounded-2xl px-5 py-3 text-center">
            <div className="text-2xl font-extrabold text-slate-800 leading-none">{totalEvaluated}</div>
            <div className="text-[9px] uppercase tracking-widest text-slate-400 mt-1 font-bold">Evaluasi</div>
          </div>
        </div>
      </motion.div>

      {/* ─── Floating Toolbar ─── */}
      <section className="relative z-20 pb-0">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row items-center justify-between gap-4 border border-white/80 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-5">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input className="pl-12 bg-white border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl h-11 text-base focus-visible:ring-slate-200 shadow-sm" placeholder="Cari kegiatan yang sudah selesai..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="text-sm font-semibold text-slate-500 shrink-0 bg-slate-50 px-4 py-2 border border-slate-200 rounded-xl">
              Menampilkan <span className="text-slate-900">{filtered.length}</span> kegiatan selesai
            </div>
          </motion.div>
      </section>

      {/* ─── BODY CONTENT ─── */}
      <div className="flex-1 mt-8">
        <section className="pb-12 space-y-6">

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-20 w-full bg-white border border-slate-200 animate-pulse rounded-[24px]" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-16 text-center">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <h3 className="font-bold text-slate-900 text-lg">Belum ada kegiatan untuk dievaluasi</h3>
              <p className="text-slate-500 text-sm mt-1">Kegiatan yang sudah selesai akan muncul di sini.</p>
            </div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={stagger} className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl overflow-hidden">
              <div className="divide-y divide-slate-100">
                {filtered.map((k: any) => (
                  <motion.div key={k.id} variants={fadeUp} className="group hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-6 py-5">
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-1">
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 border-emerald-200 bg-emerald-50 rounded-md">{k.status}</Badge>
                          <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">{k.bentuk.replace("_", " ")}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-orange-500 transition-colors truncate">{k.nama_kegiatan}</h3>
                      </div>
                      <div className="flex flex-col gap-1 min-w-[200px]">
                        <div className="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
                          <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{new Date(k.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" />
                          <span className="truncate">{k.lokasi}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-end md:w-[140px]">
                        <Button onClick={() => { setSelected(k); setStep(1); }} variant="outline" className="rounded-xl border-slate-200 text-slate-700 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-colors gap-2">
                          <Star className="h-4 w-4" /> Nilai
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </section>
      </div>

      {/* ─── Multi-Step Dialog ─── */}
      <Dialog open={selected !== null} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="sm:max-w-lg rounded-xl border border-slate-200 shadow-2xl p-0 overflow-hidden">

          {/* ── Step Indicator Header ── */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 pt-6 pb-0">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1 font-bold truncate">{selected?.nama_kegiatan}</p>
            <div className="flex items-center gap-0 mt-4">
              {/* Step 1 tab */}
              <div className={cn("flex-1 flex items-center gap-2 border-b-2 pb-3 pr-4 transition-colors",
                step === 1 ? "border-orange-500 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600 cursor-pointer"
              )} onClick={() => step === 2 && setStep(1)}>
                <div className={cn("h-6 w-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                  step === 1 ? "bg-orange-100 text-orange-600" : step > 1 ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                )}>
                  {step > 1 ? <CheckCircle2 className="h-4 w-4" /> : "1"}
                </div>
                <span className="text-sm font-bold">Evaluasi Kegiatan</span>
              </div>
              <div className="w-8 border-b-2 border-slate-200 mx-1 mb-3" />
              {/* Step 2 tab */}
              <div className={cn("flex-1 flex items-center gap-2 border-b-2 pb-3 pl-4 transition-colors",
                step === 2 ? "border-orange-500 text-slate-900" : "border-transparent text-slate-400"
              )}>
                <div className={cn("h-6 w-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                  step === 2 ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-400"
                )}>
                  <User className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-bold">Evaluasi Diri</span>
              </div>
            </div>
          </div>

          {/* ── Form Content (animated) ── */}
          <div className="overflow-hidden min-h-[320px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" {...slideLeft} transition={{ duration: 0.25 }} className="p-6 space-y-5">
                  <StarRow label="Rating Penyelenggaraan Acara"
                    value={form.rating_acara}
                    onChange={(v) => setForm({ ...form, rating_acara: v })} />
                  <StarRow label="Rating Kinerja Tim Protokoler"
                    value={form.rating_protokoler}
                    onChange={(v) => setForm({ ...form, rating_protokoler: v })} />
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.15em]">Komentar / Saran (opsional)</label>
                    <Textarea
                      placeholder="Bagaimana pelayanan tim protokoler pada acara ini?"
                      className="rounded-xl border-slate-200 min-h-[90px] focus-visible:ring-slate-900 bg-slate-50 text-sm"
                      value={form.komentar}
                      onChange={(e) => setForm({ ...form, komentar: e.target.value })}
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" {...slideRight} transition={{ duration: 0.25 }} className="p-6 space-y-5">
                  <p className="text-xs text-slate-500 leading-relaxed border-l-2 border-[#d2ad5c] pl-3">
                    Nilai kinerja <strong>diri sendiri</strong> secara jujur. Penilaian ini bersifat pribadi dan digunakan untuk refleksi pengembangan diri.
                  </p>
                  <SelfStarRow label="Kedisiplinan & Ketepatan Waktu"
                    value={form.diri_kedisiplinan}
                    onChange={(v) => setForm({ ...form, diri_kedisiplinan: v })} />
                  <SelfStarRow label="Penampilan & Kerapian Seragam"
                    value={form.diri_penampilan}
                    onChange={(v) => setForm({ ...form, diri_penampilan: v })} />
                  <SelfStarRow label="Komunikasi & Koordinasi"
                    value={form.diri_komunikasi}
                    onChange={(v) => setForm({ ...form, diri_komunikasi: v })} />
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.15em]">Catatan Refleksi (opsional)</label>
                    <Textarea
                      placeholder="Apa yang ingin saya tingkatkan untuk penugasan berikutnya?"
                      className="rounded-xl border-slate-200 min-h-[80px] focus-visible:ring-slate-900 bg-slate-50 text-sm"
                      value={form.catatan_diri}
                      onChange={(e) => setForm({ ...form, catatan_diri: e.target.value })}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Footer ── */}
          <div className="px-6 py-4 bg-slate-50 border-t border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {step === 2 && (
                <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl border-slate-300 gap-1 text-sm">
                  <ChevronLeft className="h-4 w-4" /> Kembali
                </Button>
              )}
              <Button variant="ghost" onClick={closeDialog} className="rounded-xl text-slate-500 text-sm">
                Batal
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">Langkah {step} dari 2</span>
              {step === 1 ? (
                <Button
                  onClick={() => setStep(2)}
                  disabled={!step1Valid}
                  className="rounded-xl bg-white/40 text-slate-800 hover:bg-white/60 backdrop-blur-sm border border-white/50 hover:text-white transition-colors gap-1 font-bold"
                >
                  Lanjut <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => submitEval.mutate()}
                  disabled={!step2Valid || submitEval.isPending}
                  className="rounded-xl bg-[#6b0000] text-white hover:bg-[#8b0000] font-bold gap-1"
                >
                  {submitEval.isPending ? "Mengirim..." : <>Kirim Evaluasi <CheckCircle2 className="h-4 w-4" /></>}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
