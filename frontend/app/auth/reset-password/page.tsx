'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Lock, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ViewportFitGrid } from '@/components/ViewportFitGrid';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    // Check if recovery session or active session is available
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setHasSession(true);
        } else {
          // Listen to state changes (sometimes hash tokens take a moment to parse by Supabase Client)
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
              setHasSession(true);
            }
          });
          return () => subscription.unsubscribe();
        }
      } catch (err) {
        console.error('Error checking recovery session:', err);
      } finally {
        // Give it a small timeout to let client parse the URL hash
        setTimeout(() => {
          setVerifyingSession(false);
        }, 1500);
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      toast.error('Password tidak cocok!');
      return;
    }
    if (password.length < 8) {
      toast.error('Kata sandi minimal harus 8 karakter!');
      return;
    }

    setLoading(true);
    try {
      // 1. Update password in Supabase Auth
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast.error(error.message || 'Gagal mengubah kata sandi di Supabase');
        return;
      }

      // 2. Sync to local database via Backend endpoint
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (token) {
        const res = await fetch('/api/auth/reset-password', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ password }),
        });

        if (!res.ok) {
          const errData = await res.json();
          console.error('Failed to sync to database:', errData.message);
        }
      }

      toast.success('Kata sandi Anda berhasil diperbarui!');
      setSuccess(true);

      // Sign out to force re-login with the new password
      await supabase.auth.signOut();

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push('/auth');
      }, 3000);
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat memproses data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-slate-50">
      <main className="flex-1 min-h-0 overflow-hidden relative">
        <ViewportFitGrid forceScaleOnMobile gap={0} minScale={0.5} gridTemplateColumns="1fr" className="w-full h-full">
          <div className="grid lg:grid-cols-2 w-full h-full lg:min-h-[750px]">
            {/* Left Branding Panel */}
            <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#5b1511] via-[#4a100e] to-[#7a2c00] relative z-10 p-12 xl:p-20 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex items-center gap-5">
                <div className="relative h-20 w-20 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <Image src="/logo-protokoler-new.png" alt="Protokoler Logo" fill sizes="80px" className="object-contain" priority />
                </div>
                <div>
                  <span className="font-display text-3xl font-bold tracking-tight leading-none block text-white drop-shadow-sm mb-1">PROTOKOLER</span>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">UNIVERSITAS NEGERI PADANG</span>
                </div>
              </div>

              <div className="relative z-10 flex-1 flex flex-col justify-center w-full max-w-xl">
                <div>
                  <h1 className="font-display text-4xl xl:text-5xl font-bold tracking-tight text-white leading-tight mb-4 drop-shadow-sm">
                    Atur Ulang<br />
                    <span className="text-amber-400 drop-shadow-sm">Kata Sandi Anda</span>
                  </h1>
                  <p className="text-white/90 text-base leading-relaxed font-medium max-w-md drop-shadow-sm">
                    Silakan masukkan kata sandi baru untuk mengamankan dan mengakses kembali akun Protokoler Anda.
                  </p>
                </div>
              </div>

              <p className="text-xs text-white/60 font-medium relative z-10">© 2026 Unit Protokoler Universitas Negeri Padang</p>
            </div>

            {/* Right Form Panel */}
            <div className="flex items-center justify-center h-full p-4 lg:p-6 relative bg-slate-50 lg:bg-red-50/50">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-200/30 rounded-full blur-[120px] pointer-events-none" />
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
              >
                {/* Mobile Logo Header */}
                <div className="flex flex-col items-center justify-center gap-3 mb-6 lg:hidden text-center">
                  <div className="relative h-20 w-20 drop-shadow-sm">
                    <Image src="/logo-protokoler-new.png" alt="Protokoler" fill sizes="80px" className="object-contain" priority />
                  </div>
                  <div>
                    <span className="font-display text-2xl font-bold tracking-tight text-slate-900 leading-none mb-1 block">PROTOKOLER</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 block">UNIVERSITAS NEGERI PADANG</span>
                  </div>
                </div>

                {/* Form Card */}
                <div className="bg-white border border-slate-100 shadow-[0_20px_60px_rgb(0,0,0,0.05)] rounded-[2rem] p-6 lg:p-10">
                  {verifyingSession ? (
                    <div className="text-center py-8 space-y-4">
                      <Loader2 className="h-10 w-10 animate-spin mx-auto text-[#5b1511]" />
                      <p className="text-sm text-slate-500 font-medium">Memverifikasi sesi pemulihan akun...</p>
                    </div>
                  ) : success ? (
                    <div className="text-center py-6 space-y-5">
                      <div className="h-20 w-20 mx-auto bg-green-50 border-2 border-green-200 rounded-2xl flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                      </div>
                      <div>
                        <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">Berhasil Diperbarui</h2>
                        <p className="text-sm text-slate-500 leading-relaxed">Kata sandi akun Anda telah sukses diganti. Mengarahkan Anda kembali ke halaman login...</p>
                      </div>
                    </div>
                  ) : !hasSession ? (
                    <div className="text-center py-6 space-y-5">
                      <div className="h-20 w-20 mx-auto bg-red-50 border-2 border-red-200 rounded-2xl flex items-center justify-center">
                        <span className="text-2xl">⚠️</span>
                      </div>
                      <div>
                        <h2 className="font-display text-xl font-bold text-slate-900 mb-2">Tautan Tidak Valid</h2>
                        <p className="text-sm text-slate-500 leading-relaxed">Tautan pemulihan kadaluwarsa atau tidak valid. Silakan ajukan lupa password kembali dari halaman login.</p>
                      </div>
                      <Button onClick={() => router.push('/auth')} className="w-full rounded-xl h-11 bg-[#5b1511] hover:bg-[#4a100e] text-white font-bold transition-all shadow-md">
                        Kembali ke Login
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-6 text-center">
                        <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2">Kata Sandi Baru</h2>
                        <p className="text-sm text-slate-500 font-medium">Buat kata sandi baru yang aman dan mudah Anda ingat.</p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kata Sandi Baru</Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Lock className="h-4 w-4 text-slate-400" />
                            </div>
                            <Input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="rounded-xl h-11 lg:h-12 pl-10 border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-red-600 transition-colors shadow-sm"
                              placeholder="Minimal 8 karakter"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Konfirmasi Kata Sandi Baru</Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                              <Lock className="h-4 w-4 text-slate-400" />
                            </div>
                            <Input
                              type="password"
                              value={passwordConfirm}
                              onChange={(e) => setPasswordConfirm(e.target.value)}
                              className="rounded-xl h-11 lg:h-12 pl-10 border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-red-600 transition-colors shadow-sm"
                              placeholder="Ketik ulang kata sandi baru"
                              required
                            />
                          </div>
                          {password && passwordConfirm && password !== passwordConfirm && (
                            <p className="text-xs text-red-500 font-semibold">Kata sandi tidak cocok</p>
                          )}
                        </div>

                        <Button
                          type="submit"
                          disabled={loading || !password || password !== passwordConfirm}
                          className="w-full rounded-xl h-11 lg:h-12 font-bold bg-[#5b1511] hover:bg-[#4a100e] text-white mt-2 shadow-lg shadow-[#5b1511]/20 transition-all"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Memperbarui...
                            </>
                          ) : (
                            'Simpan Kata Sandi'
                          )}
                        </Button>
                      </form>
                    </div>
                  )}
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
  );
}
