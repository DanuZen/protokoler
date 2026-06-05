"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace("/dashboard");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s?.user) router.replace("/dashboard");
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Berhasil masuk");
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { nama_lengkap: nama },
      },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Akun dibuat! Silakan masuk.");
  };

  const google = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    if (error) toast.error(error.message);
  };

  const quickLogin = (role: "admin" | "mahasiswa" | "pimpinan") => {
    if (role === "admin") { setEmail("admin@siproto.com"); setPassword("admin123"); }
    if (role === "mahasiswa") { setEmail("mhs@siproto.com"); setPassword("mhs123"); }
    if (role === "pimpinan") { setEmail("pimpinan@siproto.com"); setPassword("pimpinan123"); }
    toast.info("Kredensial diisi. Klik Masuk.");
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 overflow-hidden relative">
      {/* Animated Background Elements */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-none blur-[100px] -mr-20 -mt-20 pointer-events-none"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-none blur-[120px] -ml-40 -mb-40 pointer-events-none"
      />

      <div className="w-full max-w-md z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col items-center text-primary-foreground"
        >
          <div className="relative h-20 w-20 mb-4 bg-white/10 rounded-none p-2 backdrop-blur-sm shadow-xl border border-white/20 overflow-hidden">
            <Image 
              src="/logo protokoler.png" 
              alt="Logo Protokoler" 
              fill
              sizes="80px"
              className="object-contain p-2"
              priority
            />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight">PROTOKOLER</h1>
          <p className="text-sm text-primary-foreground/80 mt-1 font-medium">UNIVERSITAS NEGERI PADANG</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-none border border-white/50 bg-white/95 backdrop-blur-xl p-8 shadow-2xl"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 rounded-none bg-slate-100 p-1 mb-6">
              <TabsTrigger value="signin" className="rounded-none">Masuk</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-none">Daftar</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {activeTab === "signin" && (
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value="signin" className="mt-0 space-y-5" forceMount>
                    <form onSubmit={signIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-in" className="text-slate-700">Email</Label>
                        <Input id="email-in" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@kampus.ac.id" className="rounded-none bg-slate-50/50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pw-in" className="text-slate-700">Password</Label>
                        <Input id="pw-in" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-none bg-slate-50/50" />
                      </div>
                      <Button type="submit" disabled={loading} className="w-full h-11 rounded-none shadow-sm font-semibold mt-2">
                        {loading ? "Memproses..." : "Masuk ke Dashboard"}
                      </Button>
                    </form>
                  </TabsContent>
                </motion.div>
              )}

              {activeTab === "signup" && (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value="signup" className="mt-0 space-y-5" forceMount>
                    <form onSubmit={signUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nama" className="text-slate-700">Nama Lengkap</Label>
                        <Input id="nama" required value={nama} onChange={(e) => setNama(e.target.value)} className="rounded-none bg-slate-50/50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email-up" className="text-slate-700">Email</Label>
                        <Input id="email-up" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-none bg-slate-50/50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pw-up" className="text-slate-700">Password</Label>
                        <Input id="pw-up" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-none bg-slate-50/50" />
                      </div>
                      <Button type="submit" disabled={loading} className="w-full h-11 rounded-none shadow-sm font-semibold mt-2">
                        {loading ? "Memproses..." : "Daftar Sekarang"}
                      </Button>
                    </form>
                  </TabsContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>

          <div className="my-6 flex items-center gap-3 opacity-60">
            <div className="h-px flex-1 bg-slate-300" />
            <span className="text-xs text-slate-500 font-medium">atau</span>
            <div className="h-px flex-1 bg-slate-300" />
          </div>

          <Button variant="outline" type="button" onClick={google} className="w-full h-11 rounded-none bg-white">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.1,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" />
            </svg>
            Masuk dengan Google
          </Button>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Akses Demo Cepat</p>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="secondary" size="sm" type="button" onClick={() => quickLogin('admin')} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700">Admin</Button>
              <Button variant="secondary" size="sm" type="button" onClick={() => quickLogin('mahasiswa')} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700">Mahasiswa</Button>
              <Button variant="secondary" size="sm" type="button" onClick={() => quickLogin('pimpinan')} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700">Pimpinan</Button>
            </div>
          </div>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center text-xs text-primary-foreground/60"
        >
          Akun baru otomatis terdaftar sebagai <strong>Mahasiswa</strong>.
        </motion.p>
      </div>
    </div>
  );
}
