"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { protokolerApi } from "@/lib/api";
import { ArrowLeft, Upload, User, BookOpen, Phone, ChevronRight, ChevronLeft, Check, Loader2, Clock } from "lucide-react";

type AuthMode = "login" | "register";
type RegisterStep = 1 | 2 | 3;

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register multi-step state
  const [step, setStep] = useState<RegisterStep>(1);
  const [regForm, setRegForm] = useState({
    nim: "", nama_lengkap: "", prodi: "",
    departemen: "", fakultas: "", no_hp: "",
    email: "", password: "", password_confirm: "",
  });
  const [fotoSetengah, setFotoSetengah] = useState<File | null>(null);
  const [fotoFull, setFotoFull] = useState<File | null>(null);
  const [fotoSetengahPreview, setFotoSetengahPreview] = useState<string | null>(null);
  const [fotoFullPreview, setFotoFullPreview] = useState<string | null>(null);

  useEffect(() => {
    // Check demo mode
    const demoRole = localStorage.getItem("demo_role");
    if (demoRole) {
      router.replace(demoRole === "mahasiswa" ? "/beranda" : "/dashboard");
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        // Here we'd ideally check role, but for demo, just route to beranda if they have real auth
        router.replace("/beranda");
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s?.user) router.replace("/beranda");
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Berhasil masuk!");
  };

  const handleRegister = async () => {
    if (regForm.password !== regForm.password_confirm) {
      toast.error("Password tidak cocok!"); return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: regForm.email,
        password: regForm.password,
        options: { data: { nama_lengkap: regForm.nama_lengkap } },
      });
      if (error) throw new Error(error.message);

      await protokolerApi.create({
        user_id: data.user?.id,
        nim: regForm.nim,
        nama_lengkap: regForm.nama_lengkap,
        prodi: regForm.prodi,
        departemen: regForm.departemen,
        fakultas: regForm.fakultas,
        no_hp: regForm.no_hp,
      });

      setRegistered(true);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (file: File | null, type: "setengah" | "full") => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Ukuran foto maksimal 2MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Format harus berupa gambar"); return; }
    const url = URL.createObjectURL(file);
    if (type === "setengah") { setFotoSetengah(file); setFotoSetengahPreview(url); }
    else { setFotoFull(file); setFotoFullPreview(url); }
  };

  const steps = [
    { label: "Data Diri", icon: User },
    { label: "Upload Foto", icon: Upload },
    { label: "Buat Password", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center px-4 overflow-hidden relative py-12">
      {/* BG Decorative */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col items-center text-primary-foreground">
          <div className="relative h-20 w-20 mb-4 bg-white/10 p-2 backdrop-blur-sm shadow-xl border border-white/20 overflow-hidden">
            <Image src="/logo protokoler.png" alt="SiProto" fill sizes="80px" className="object-contain p-2" priority />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight">SiProto</h1>
          <p className="text-sm text-primary-foreground/80 mt-1 font-medium">Sistem Informasi Protokoler · UNP</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="border border-white/50 bg-white/95 backdrop-blur-xl p-8 shadow-2xl">

          <AnimatePresence mode="wait">

            {/* ── LOGIN MODE ── */}
            {mode === "login" && (
              <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <h2 className="font-display text-2xl font-bold text-slate-900 mb-1">Masuk ke SiProto</h2>
                <p className="text-sm text-slate-500 mb-6">Gunakan akun yang telah terdaftar dan diverifikasi.</p>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 text-sm mb-4 font-medium leading-relaxed">
                    <strong>Mode Demo Frontend:</strong> Pilih peran (role) di bawah ini untuk langsung masuk dan melihat dashboard tanpa perlu mengisi database.
                  </div>
                  
                  <Button 
                    onClick={() => { localStorage.setItem("demo_role", "admin"); window.location.href = "/dashboard"; }}
                    className="w-full h-12 rounded-none font-bold bg-slate-900 text-gold hover:bg-slate-800 flex justify-between px-6 shadow-md"
                  >
                    <span>Masuk sebagai Admin</span> <ChevronRight className="h-5 w-5" />
                  </Button>
                  
                  <Button 
                    onClick={() => { localStorage.setItem("demo_role", "pimpinan"); window.location.href = "/dashboard"; }}
                    className="w-full h-12 rounded-none font-bold bg-slate-700 text-white hover:bg-slate-600 flex justify-between px-6 shadow-md"
                  >
                    <span>Masuk sebagai Pimpinan</span> <ChevronRight className="h-5 w-5" />
                  </Button>
                  
                  <Button 
                    onClick={() => { localStorage.setItem("demo_role", "mahasiswa"); window.location.href = "/beranda"; }}
                    className="w-full h-12 rounded-none font-bold bg-gold text-slate-900 hover:bg-yellow-500 flex justify-between px-6 shadow-md"
                  >
                    <span>Masuk sebagai Protokoler</span> <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs text-slate-400 font-medium">Belum punya akun?</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <Button variant="outline" onClick={() => { setMode("register"); setStep(1); }} className="w-full rounded-none border-slate-300 h-11 font-semibold">
                  Daftar Sebagai Protokoler
                </Button>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Demo Cepat</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[["Admin", "admin@siproto.com", "admin123"], ["Protokoler", "mhs@siproto.com", "mhs123"]].map(([label, e, p]) => (
                      <button key={label} onClick={() => { setEmail(e); setPassword(p); toast.info("Kredensial diisi."); }}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 font-semibold transition-colors">
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── REGISTER MODE ── */}
            {mode === "register" && !registered && (
              <motion.div key="register" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <button onClick={() => setMode("login")} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-4">
                  <ArrowLeft className="h-4 w-4" /> Kembali ke Login
                </button>

                {/* Stepper Mini */}
                <div className="flex items-center gap-2 mb-6">
                  {steps.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 flex-1">
                      <div className={`h-7 w-7 flex items-center justify-center text-xs font-bold transition-colors ${step > i + 1 ? "bg-green-600 text-white" : step === i + 1 ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"}`}>
                        {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
                      </div>
                      {i < steps.length - 1 && <div className={`h-px flex-1 ${step > i + 1 ? "bg-green-500" : "bg-slate-200"}`} />}
                    </div>
                  ))}
                </div>

                <AnimatePresence mode="wait">

                  {/* Step 1: Data Diri */}
                  {step === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                      <h2 className="font-display text-xl font-bold text-slate-900">Data Diri</h2>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-600">NIM <span className="text-red-500">*</span></Label>
                          <Input className="rounded-none h-10 border-slate-300 text-sm" value={regForm.nim} onChange={e => setRegForm({...regForm, nim: e.target.value})} placeholder="22000XXXXX" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-600">No. HP <span className="text-red-500">*</span></Label>
                          <Input className="rounded-none h-10 border-slate-300 text-sm" value={regForm.no_hp} onChange={e => setRegForm({...regForm, no_hp: e.target.value})} placeholder="08XX" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-600">Nama Lengkap <span className="text-red-500">*</span></Label>
                        <Input className="rounded-none h-10 border-slate-300 text-sm" value={regForm.nama_lengkap} onChange={e => setRegForm({...regForm, nama_lengkap: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-600">Program Studi <span className="text-red-500">*</span></Label>
                        <Input className="rounded-none h-10 border-slate-300 text-sm" value={regForm.prodi} onChange={e => setRegForm({...regForm, prodi: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-600">Departemen</Label>
                          <Input className="rounded-none h-10 border-slate-300 text-sm" value={regForm.departemen} onChange={e => setRegForm({...regForm, departemen: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-600">Fakultas</Label>
                          <Input className="rounded-none h-10 border-slate-300 text-sm" value={regForm.fakultas} onChange={e => setRegForm({...regForm, fakultas: e.target.value})} />
                        </div>
                      </div>
                      <Button className="w-full rounded-none h-11 font-bold mt-2" disabled={!regForm.nim || !regForm.nama_lengkap || !regForm.prodi} onClick={() => setStep(2)}>
                        Lanjut <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </motion.div>
                  )}

                  {/* Step 2: Upload Foto */}
                  {step === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-5">
                      <h2 className="font-display text-xl font-bold text-slate-900">Upload Foto</h2>
                      <p className="text-xs text-slate-500">Foto akan digunakan untuk identitas tim dan sertifikat. Format JPG/PNG, maks. 2MB.</p>
                      {[
                        { label: "Foto Setengah Badan", desc: "Tampak depan, formal", type: "setengah" as const, preview: fotoSetengahPreview },
                        { label: "Foto Full Body", desc: "Tampak depan, seragam lengkap", type: "full" as const, preview: fotoFullPreview },
                      ].map(({ label, desc, type, preview }) => (
                        <div key={type}>
                          <Label className="text-xs font-bold text-slate-600">{label} <span className="text-red-500">*</span></Label>
                          <p className="text-xs text-slate-400 mb-2">{desc}</p>
                          <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed cursor-pointer transition-colors ${preview ? "border-green-300 bg-green-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100"}`}>
                            {preview ? (
                              <div className="relative h-full w-full">
                                <Image src={preview} alt="preview" fill className="object-contain p-1" />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-slate-400">
                                <Upload className="h-8 w-8" />
                                <span className="text-xs font-medium">Klik atau seret foto ke sini</span>
                              </div>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={e => handleFileChange(e.target.files?.[0] || null, type)} />
                          </label>
                        </div>
                      ))}
                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1 rounded-none border-slate-300" onClick={() => setStep(1)}><ChevronLeft className="h-4 w-4 mr-1" /> Kembali</Button>
                        <Button className="flex-1 rounded-none font-bold" onClick={() => setStep(3)}>Lanjut <ChevronRight className="h-4 w-4 ml-2" /></Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Akun */}
                  {step === 3 && (
                    <motion.div key="s3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                      <h2 className="font-display text-xl font-bold text-slate-900">Akun & Password</h2>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-600">Email <span className="text-red-500">*</span></Label>
                        <Input type="email" className="rounded-none h-10 border-slate-300 text-sm" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} placeholder="nama@kampus.ac.id" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-600">Password <span className="text-red-500">*</span></Label>
                        <Input type="password" className="rounded-none h-10 border-slate-300 text-sm" value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} placeholder="Min. 8 karakter" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-600">Konfirmasi Password <span className="text-red-500">*</span></Label>
                        <Input type="password" className="rounded-none h-10 border-slate-300 text-sm" value={regForm.password_confirm} onChange={e => setRegForm({...regForm, password_confirm: e.target.value})} />
                        {regForm.password && regForm.password_confirm && regForm.password !== regForm.password_confirm && (
                          <p className="text-xs text-red-500 font-medium">Password tidak cocok</p>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1 rounded-none border-slate-300" onClick={() => setStep(2)}><ChevronLeft className="h-4 w-4 mr-1" /> Kembali</Button>
                        <Button className="flex-1 rounded-none font-bold" disabled={loading || !regForm.email || !regForm.password || regForm.password !== regForm.password_confirm} onClick={handleRegister}>
                          {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Mendaftarkan...</> : "Kirim Pendaftaran"}
                        </Button>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </motion.div>
            )}

            {/* ── REGISTERED: Waiting Verification ── */}
            {mode === "register" && registered && (
              <motion.div key="pending" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4 space-y-4">
                <div className="h-20 w-20 mx-auto bg-orange-100 border-2 border-orange-300 flex items-center justify-center">
                  <Clock className="h-10 w-10 text-orange-500" />
                </div>
                <h2 className="font-display text-2xl font-bold text-slate-900">Pendaftaran Terkirim!</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Data Anda sedang ditinjau oleh Admin. Anda akan menerima notifikasi setelah akun diverifikasi.
                </p>
                <div className="bg-orange-50 border border-orange-200 p-3 text-xs text-orange-700 text-left font-medium">
                  ℹ️ Proses verifikasi biasanya memakan waktu 1×24 jam kerja.
                </div>
                <Button variant="outline" onClick={() => { setMode("login"); setRegistered(false); }} className="w-full rounded-none border-slate-300">
                  Kembali ke Login
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-6 text-center text-xs text-primary-foreground/50">
          © 2026 SiProto · Universitas Negeri Padang
        </motion.p>
      </div>
    </div>
  );
}
