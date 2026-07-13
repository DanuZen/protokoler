'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Upload, User, BookOpen, ChevronRight, ChevronLeft, Check, Loader2, Clock, Shield, Briefcase, GraduationCap, CalendarDays, Trophy, ScrollText, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ViewportFitGrid } from '@/components/ViewportFitGrid';
import { SplashScreen } from '@/components/splash-screen';
import { cn } from '@/lib/utils';

type AuthMode = 'login' | 'register' | 'forgot-password';
type RegisterStep = 1 | 2 | 3;

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [enteringDashboard, setEnteringDashboard] = useState<string | null>(null);

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Register multi-step state
  const [step, setStep] = useState<RegisterStep>(1);
  const [regForm, setRegForm] = useState({
    nim: '', nama_lengkap: '', prodi: '', departemen: '',
    fakultas: '', email: '', password: '', password_confirm: '',
  });
  const [fotoSetengahPreview, setFotoSetengahPreview] = useState<string | null>(null);
  const [fotoFullPreview, setFotoFullPreview] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }).then(res => {
          if (res.ok) {
            res.json().then(userMe => {
              let route = '/beranda';
              if (userMe.role === 'admin') route = '/dashboard';
              else if (userMe.role === 'dokumentasi') route = '/dokumentasi/dashboard';
              router.replace(route);
            });
          }
        });
      }
    });
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
        },
      });
      
      if (res.ok) {
        const userMe = await res.json();
        let route = '/beranda';
        if (userMe.role === 'admin') route = '/dashboard';
        else if (userMe.role === 'dokumentasi') route = '/dokumentasi/dashboard';
        
        setEnteringDashboard(route);
      } else {
        toast.error('Gagal memverifikasi role di backend');
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal login');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const resData = await res.json();
      if (res.ok) {
        toast.success(resData.message || 'Email instruksi reset kata sandi telah dikirim!');
        setMode('login');
      } else {
        toast.error(resData.message || 'Gagal mengirim email reset');
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat memproses permintaan');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (regForm.password !== regForm.password_confirm) {
      toast.error('Password tidak cocok!');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', regForm.email);
      formData.append('password', regForm.password);
      formData.append('nim', regForm.nim);
      formData.append('nama_lengkap', regForm.nama_lengkap);
      formData.append('prodi', regForm.prodi);
      formData.append('departemen', regForm.departemen || 'Teknik');
      formData.append('fakultas', regForm.fakultas || 'FT');

      const responseSetengah = await fetch(fotoSetengahPreview!);
      const blobSetengah = await responseSetengah.blob();
      formData.append('foto_setengah_badan', blobSetengah, 'foto_setengah_badan.jpg');

      const responseFull = await fetch(fotoFullPreview!);
      const blobFull = await responseFull.blob();
      formData.append('foto_full_body', blobFull, 'foto_full_body.jpg');

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const resData = await res.json();
        toast.success(resData.message || 'Pendaftaran berhasil!');
        setRegistered(true);
      } else {
        const errData = await res.json();
        toast.error(errData.message || 'Gagal melakukan pendaftaran');
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat pendaftaran');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (file: File | null, type: 'setengah' | 'full') => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Ukuran foto maksimal 2MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Format harus berupa gambar'); return; }
    const url = URL.createObjectURL(file);
    if (type === 'setengah') setFotoSetengahPreview(url);
    else setFotoFullPreview(url);
  };

  const steps = [
    { label: 'Data Diri', icon: User },
    { label: 'Upload Foto', icon: Upload },
    { label: 'Buat Password', icon: BookOpen },
  ];

  return (
    <>
      {enteringDashboard && (
        <SplashScreen 
          text="MEMASUKI DASHBOARD..." 
          durationMs={2000} 
          onComplete={() => router.replace(enteringDashboard)} 
        />
      )}

      {/* Sembunyikan form login jika sedang masuk dashboard */}
      <div className={cn("flex flex-col h-dvh overflow-hidden bg-slate-50", enteringDashboard ? "hidden" : "flex")}>
        <main className="flex-1 min-h-0 overflow-hidden relative">
        <ViewportFitGrid forceScaleOnMobile gap={0} minScale={0.5} gridTemplateColumns="1fr" className="w-full h-full">
          <div className="grid lg:grid-cols-2 w-full h-full lg:min-h-[750px]">
            {/* ── Left Panel (branding) - Primary & Secondary Background ── */}
            <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#5b1511] via-[#4a100e] to-[#7a2c00] relative z-10 p-12 xl:p-20 shadow-2xl overflow-hidden">
        {/* Subtle Decorative Gradient Overlays */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#5b1511]/60 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-20 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px] pointer-events-none" />

        {/* Header: Logo ditaruh paling atas */}
        <div className="relative z-10 flex items-center gap-5">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden">
            <Image src="/logo-protokoler-new.webp" alt="Protokoler" fill sizes="80px" className="object-contain" priority />
          </div>
          <div>
            <span className="font-display text-3xl font-bold tracking-tight leading-none block text-white drop-shadow-sm mb-1">PROTOKOLER</span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">UNIVERSITAS NEGERI PADANG</span>
          </div>
        </div>

        {/* Body: Konten teks di tengah secara vertikal, namun rata kiri */}
        <div className="relative z-10 flex-1 flex flex-col justify-center w-full max-w-xl">
          <div className="space-y-8">
            <div>
              <h1 className="font-display text-4xl xl:text-5xl font-bold tracking-tight text-white leading-tight mb-4 drop-shadow-sm">
                Sistem Informasi<br />
                <span className="text-amber-400 drop-shadow-sm">Protokoler UNP</span>
              </h1>
              <p className="text-white/90 text-base leading-relaxed font-medium max-w-md drop-shadow-sm">
                Platform manajemen keprotokolan terintegrasi — absensi, jadwal, evaluasi, dan sertifikasi digital dalam satu sistem.
              </p>
            </div>

            <div className="space-y-4 max-w-md">
              {[
                { icon: CalendarDays, label: 'Manajemen Jadwal', desc: 'Pantau kegiatan secara real-time' },
                { icon: Trophy, label: 'Gamifikasi Kinerja', desc: 'Poin & medali untuk protokoler aktif' },
                { icon: ScrollText, label: 'e-Sertifikat Otomatis', desc: 'Terbit setelah evaluasi selesai' },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-4 p-5 bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:bg-black/40 transition-colors">
                  <div className="h-12 w-12 flex items-center justify-center bg-white/10 text-amber-400 rounded-xl shrink-0 border border-white/5">
                    <f.icon className="h-6 w-6 drop-shadow-sm" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white drop-shadow-sm">{f.label}</div>
                    <div className="text-xs text-white/80 font-medium">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-white/60 font-medium relative z-10">© 2026 Unit Protokoler Universitas Negeri Padang</p>
      </div>

      {/* ── Right Panel: Auth Card & Orange Background ── */}
      <div className="flex items-center justify-center h-full p-4 lg:p-6 relative bg-slate-50 lg:bg-red-50/50">
        {/* Back to Home Button */}
        <div className="absolute top-4 right-4 lg:top-8 lg:right-8 z-20">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="bg-white/80 backdrop-blur-md hover:bg-white border-slate-200 text-slate-700 hover:text-red-800 rounded-xl font-bold h-10 px-4 shadow-sm transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
          </Button>
        </div>

        {/* Gradients specific to right panel */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-200/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-100/40 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex flex-col items-center justify-center gap-3 mb-6 lg:hidden text-center">
            <div className="relative h-20 w-20 drop-shadow-sm">
              <Image src="/logo-protokoler-new.webp" alt="Protokoler" fill sizes="80px" className="object-contain" priority />
            </div>
            <div>
              <span className="font-display text-2xl font-bold tracking-tight text-slate-900 leading-none mb-1 block">PROTOKOLER</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 block">UNIVERSITAS NEGERI PADANG</span>
            </div>
          </div>

          {/* Main card */}
          <div className="bg-white border border-slate-100 shadow-[0_20px_60px_rgb(0,0,0,0.05)] rounded-[2rem] p-6 lg:p-10">
            <AnimatePresence mode="wait">
              {/* ── LOGIN MODE ── */}
              {mode === 'login' && (
                <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                  <div className="mb-5 text-center">
                    <h2 className="font-display text-3xl font-bold text-slate-900 tracking-tight mb-1 lg:mb-2">Selamat Datang</h2>
                    <p className="text-sm text-slate-500 font-medium">Masukkan kredensial Anda untuk melanjutkan.</p>
                  </div>

                  {/* Login Form */}
                  <form onSubmit={handleLogin} className="space-y-4 lg:space-y-5 mb-5 lg:mb-8">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-slate-400" />
                        </div>
                        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl h-11 lg:h-12 pl-10 border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-red-600 transition-colors shadow-sm" placeholder="nama@kampus.ac.id" required />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</Label>
                        <button type="button" onClick={() => setMode('forgot-password')} className="text-xs font-bold text-red-700 hover:text-red-800 transition-colors">Lupa password?</button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Lock className="h-4 w-4 text-slate-400" />
                        </div>
                        <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="rounded-xl h-11 lg:h-12 pl-10 pr-10 border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-red-600 transition-colors shadow-sm" placeholder="Masukkan password Anda" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full rounded-xl h-11 lg:h-12 font-bold bg-[#5b1511] hover:bg-[#4a100e] text-white mt-1 shadow-lg shadow-[#5b1511]/20 transition-all hover:-translate-y-0.5 active:translate-y-0">
                      Masuk
                    </Button>
                  </form>

                  <div className="my-4 lg:my-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-100" />
                    <span className="text-xs text-slate-400 font-medium">Belum punya akun?</span>
                    <div className="h-px flex-1 bg-slate-100" />
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => { setMode('register'); setStep(1); }}
                    className="w-full rounded-xl border-slate-200 h-12 font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                  >
                    Daftar Sebagai Protokoler
                  </Button>
                </motion.div>
              )}

              {/* ── FORGOT PASSWORD MODE ── */}
              {mode === 'forgot-password' && (
                <motion.div key="forgot-password" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <button onClick={() => setMode('login')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-5 font-semibold transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Kembali ke Login
                  </button>

                  <div className="mb-5 text-center">
                    <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-1 lg:mb-2">Lupa Kata Sandi</h2>
                    <p className="text-sm text-slate-500 font-medium">Masukkan email Anda untuk menerima instruksi pemulihan.</p>
                  </div>

                  <form onSubmit={handleForgotPassword} className="space-y-4 lg:space-y-5">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-slate-400" />
                        </div>
                        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl h-11 lg:h-12 pl-10 border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-red-600 transition-colors shadow-sm" placeholder="nama@kampus.ac.id" required />
                      </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full rounded-xl h-11 lg:h-12 font-bold bg-[#5b1511] hover:bg-[#4a100e] text-white mt-1 shadow-lg shadow-[#5b1511]/20 transition-all">
                      {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Mengirim...</> : 'Kirim Link Reset'}
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* ── REGISTER MODE ── */}
              {mode === 'register' && !registered && (
                <motion.div key="register" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <button onClick={() => setMode('login')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-5 font-semibold transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Kembali ke Login
                  </button>

                  {/* Stepper */}
                  <div className="flex items-center gap-1 mb-6">
                    {steps.map((s, i) => (
                      <div key={i} className="flex items-center gap-1 flex-1">
                        <div className={`h-7 w-7 flex items-center justify-center text-xs font-bold rounded-lg transition-all ${step > i + 1 ? 'bg-red-700 text-white' : step === i + 1 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {step > i + 1 ? <Check className="h-3.5 w-3.5" /> : i + 1}
                        </div>
                        {i < steps.length - 1 && <div className={`h-px flex-1 mx-1 ${step > i + 1 ? 'bg-red-600' : 'bg-slate-200'}`} />}
                      </div>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {/* Step 1 */}
                    {step === 1 && (
                      <motion.div key="s1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                        <h2 className="font-display text-xl font-bold text-slate-900">Data Diri</h2>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">NIM <span className="text-red-500">*</span></Label>
                          <Input className="rounded-xl h-10 border-slate-200 text-sm bg-white" value={regForm.nim} onChange={(e) => setRegForm({ ...regForm, nim: e.target.value })} placeholder="22000XXXXX" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap <span className="text-red-500">*</span></Label>
                          <Input className="rounded-xl h-10 border-slate-200 text-sm bg-white" value={regForm.nama_lengkap} onChange={(e) => setRegForm({ ...regForm, nama_lengkap: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Program Studi <span className="text-red-500">*</span></Label>
                          <Input className="rounded-xl h-10 border-slate-200 text-sm bg-white" value={regForm.prodi} onChange={(e) => setRegForm({ ...regForm, prodi: e.target.value })} />
                        </div>
                        <Button className="w-full rounded-xl h-11 font-bold bg-red-700 hover:bg-red-800 text-white mt-2 transition-colors" disabled={!regForm.nim || !regForm.nama_lengkap || !regForm.prodi} onClick={() => setStep(2)}>
                          Lanjut <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </motion.div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                      <motion.div key="s2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                        <h2 className="font-display text-xl font-bold text-slate-900">Upload Foto</h2>
                        <p className="text-xs text-slate-500 -mt-2">Format JPG/PNG, maks. 2MB.</p>
                        {[
                          { label: 'Foto Setengah Badan', desc: 'Tampak depan, formal', type: 'setengah' as const, preview: fotoSetengahPreview },
                          { label: 'Foto Full Body', desc: 'Tampak depan, seragam lengkap', type: 'full' as const, preview: fotoFullPreview },
                        ].map(({ label, desc, type, preview }) => (
                          <div key={type}>
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label} <span className="text-red-500">*</span></Label>
                            <p className="text-xs text-slate-400 mb-2">{desc}</p>
                            <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed cursor-pointer transition-colors rounded-xl ${preview ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                              {preview ? (
                                <div className="relative h-full w-full">
                                  <Image src={preview} alt="preview" fill className="object-contain p-1 rounded-xl" />
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-2 text-slate-400">
                                  <Upload className="h-6 w-6" />
                                  <span className="text-xs font-medium">Klik atau seret foto ke sini</span>
                                </div>
                              )}
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null, type)} />
                            </label>
                          </div>
                        ))}
                        <div className="flex gap-3 pt-1">
                          <Button variant="outline" className="flex-1 rounded-xl border-slate-200" onClick={() => setStep(1)}><ChevronLeft className="h-4 w-4 mr-1" /> Kembali</Button>
                          <Button className="flex-1 rounded-xl font-bold bg-red-700 hover:bg-red-800 text-white" onClick={() => setStep(3)}>Lanjut <ChevronRight className="h-4 w-4 ml-2" /></Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3 */}
                    {step === 3 && (
                      <motion.div key="s3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                        <h2 className="font-display text-xl font-bold text-slate-900">Akun & Password</h2>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email <span className="text-red-500">*</span></Label>
                          <Input type="email" className="rounded-xl h-10 border-slate-200 text-sm bg-white" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} placeholder="nama@kampus.ac.id" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password <span className="text-red-500">*</span></Label>
                          <div className="relative">
                            <Input type={showPassword ? 'text' : 'password'} className="rounded-xl h-10 border-slate-200 text-sm bg-white pr-10" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} placeholder="Min. 8 karakter" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Konfirmasi Password <span className="text-red-500">*</span></Label>
                          <div className="relative">
                            <Input type={showConfirmPassword ? 'text' : 'password'} className="rounded-xl h-10 border-slate-200 text-sm bg-white pr-10" value={regForm.password_confirm} onChange={(e) => setRegForm({ ...regForm, password_confirm: e.target.value })} />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {regForm.password && regForm.password_confirm && regForm.password !== regForm.password_confirm && <p className="text-xs text-red-500 font-medium">Password tidak cocok</p>}
                        </div>
                        <div className="flex gap-3 pt-1">
                          <Button variant="outline" className="flex-1 rounded-xl border-slate-200" onClick={() => setStep(2)}><ChevronLeft className="h-4 w-4 mr-1" /> Kembali</Button>
                          <Button className="flex-1 rounded-xl font-bold bg-red-700 hover:bg-red-800 text-white" disabled={loading || !regForm.email || !regForm.password || regForm.password !== regForm.password_confirm} onClick={handleRegister}>
                            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Mendaftarkan...</> : 'Kirim Pendaftaran'}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* ── REGISTERED: Waiting Verification ── */}
              {mode === 'register' && registered && (
                <motion.div key="pending" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4 space-y-5">
                  <div className="h-20 w-20 mx-auto bg-red-100 border-2 border-red-200 rounded-2xl flex items-center justify-center">
                    <Clock className="h-10 w-10 text-red-700" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">Pendaftaran Terkirim!</h2>
                    <p className="text-sm text-slate-500 leading-relaxed">Data Anda sedang ditinjau oleh Admin. Anda akan dinotifikasi setelah akun diverifikasi.</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-900 text-left font-medium">
                    ℹ️ Proses verifikasi biasanya memakan waktu 1×24 jam kerja.
                  </div>
                  <Button variant="outline" onClick={() => { setMode('login'); setRegistered(false); }} className="w-full rounded-xl border-slate-200 font-semibold">
                    Kembali ke Login
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400 font-medium lg:hidden">
            © 2026 Protokoler · Universitas Negeri Padang
          </p>
        </motion.div>
      </div>
          </div>
        </ViewportFitGrid>
      </main>
    </div>
    </>
  );
}
