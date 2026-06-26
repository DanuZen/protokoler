"use client";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { User, Mail, Phone, GraduationCap, Hash, Shield, Camera, Edit3, CheckCircle2, Building2, Library, LogOut, RefreshCw, Home as HomeIcon, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import Cropper from 'react-easy-crop';
import { getCroppedImg } from "@/lib/canvasUtils";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { protokolerApi } from "@/lib/api";
import { ViewportFitGrid } from "@/components/ViewportFitGrid";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };

export default function ProfilPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [view, setView] = useState<'overview' | 'detail'>('overview');

  const { data: protokoler } = useQuery({
    queryKey: ["protokoler-me"],
    queryFn: () => protokolerApi.me(),
    enabled: !!user,
    retry: false,
  });

  const [editing, setEditing] = useState(false);
  const [photoHalf, setPhotoHalf] = useState<string | null>(null);
  const [photoFull, setPhotoFull] = useState<string | null>(null);
  const halfInputRef = useRef<HTMLInputElement>(null);
  const fullInputRef = useRef<HTMLInputElement>(null);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);
  const [currentCropType, setCurrentCropType] = useState<'half' | 'full' | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'half' | 'full') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentImageSrc(reader.result as string);
        setCurrentCropType(type);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
      // Reset input value so same file can be selected again
      e.target.value = '';
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    try {
      if (!currentImageSrc || !croppedAreaPixels || !protokoler) return;
      const croppedImage = await getCroppedImg(currentImageSrc, croppedAreaPixels);
      
      toast.loading("Sedang memperbarui foto profil...");
      const formData = new FormData();
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      
      if (currentCropType === 'half') {
        formData.append('foto_setengah_badan', blob, 'foto_setengah_badan.jpg');
        setPhotoHalf(croppedImage);
        window.localStorage.setItem('demo_avatar', croppedImage);
        window.dispatchEvent(new Event('demo_avatar_updated'));
      } else if (currentCropType === 'full') {
        formData.append('foto_full_body', blob, 'foto_full_body.jpg');
        setPhotoFull(croppedImage);
      }
      
      await protokolerApi.update(protokoler.id, formData);
      await queryClient.invalidateQueries({ queryKey: ["protokoler-me"] });
      
      toast.dismiss();
      toast.success(`Foto ${currentCropType === 'half' ? '1/2 Badan' : 'Full Body'} berhasil diperbarui`);
      setCropModalOpen(false);
      setCurrentImageSrc(null);
    } catch (e: any) {
      toast.dismiss();
      console.error(e);
      toast.error('Gagal memperbarui foto: ' + (e.message || 'Error'));
    }
  };

  const [form, setForm] = useState({
    nama: "",
    nim: "",
    prodi: "",
    departemen: "",
    fakultas: "",
    angkatan: "",
    no_hp: "",
    email: "",
    tingkat: "Bronze",
    status: "pending",
  });

  useEffect(() => {
    if (protokoler) {
      setForm({
        nama: protokoler.nama_lengkap || "",
        nim: protokoler.nim || "",
        prodi: protokoler.prodi || "",
        departemen: protokoler.departemen || "",
        fakultas: protokoler.fakultas || "",
        angkatan: protokoler.nim ? "20" + protokoler.nim.slice(0, 2) : "2020",
        no_hp: protokoler.no_hp || "",
        email: protokoler.user?.email || user?.email || "",
        tingkat: protokoler.kategori_sertifikat || "Bronze",
        status: protokoler.status_akun || "pending",
      });
      setPhotoHalf(protokoler.foto_setengah_badan_url || null);
      setPhotoFull(protokoler.foto_full_body_url || null);
    }
  }, [protokoler, user]);

  const handleSave = async () => {
    if (!protokoler) return;
    toast.loading("Sedang menyimpan data profil...");
    try {
      await protokolerApi.update(protokoler.id, {
        nama_lengkap: form.nama,
        no_hp: form.no_hp,
        prodi: form.prodi,
        departemen: form.departemen,
        fakultas: form.fakultas,
      });
      
      window.localStorage.setItem('demo_name', form.nama);
      window.dispatchEvent(new Event('demo_name_updated'));
      await queryClient.invalidateQueries({ queryKey: ["protokoler-me"] });
      
      toast.dismiss();
      toast.success("Profil berhasil diperbarui");
      setEditing(false);
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || "Gagal memperbarui profil");
    }
  };

  const handleSignOut = async () => {
    toast.loading("Keluar dari akun...");
    await supabase.auth.signOut();
    toast.dismiss();
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-auto md:h-dvh md:overflow-hidden pb-6 px-4 md:px-8 pt-4">
      {/* ─── HEADER SECTION ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className={`shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 mb-4 pb-4 md:mb-8 md:pb-6 border-b border-slate-200/60 ${view === 'overview' ? 'flex' : 'hidden md:flex'}`}>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-700 to-red-800 shadow-lg shadow-red-700/20 text-white">
            <User className="h-6 w-6 md:h-7 md:w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-red-800">
                Pengaturan Akun
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-[2.5rem] font-bold tracking-tight leading-none mb-1 md:mb-1.5 text-slate-900 drop-shadow-sm">Profil Saya</h2>
            <p className="hidden md:block text-xs md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Informasi akun dan data keanggotaan protokoler.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 font-bold text-sm rounded-xl">
            <Shield className="h-4 w-4" /> {form.tingkat} Member
          </span>
          <span className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 font-bold text-sm rounded-xl">
            <CheckCircle2 className="h-4 w-4" /> {form.status}
          </span>
        </div>
      </motion.div>

      {/* ─── MOBILE DETAIL HEADER (WITH BACK BUTTON) ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className={`md:hidden shrink-0 flex items-center gap-3 mb-4 pb-4 border-b border-slate-200/60 ${view === 'detail' ? 'flex' : 'hidden'}`}>
        <button onClick={() => setView('overview')} className="h-10 w-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 shadow-sm">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="font-bold text-lg text-slate-900 leading-none">Detail Profil</h2>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Perbarui foto dan data diri Anda</p>
        </div>
      </motion.div>

      {/* ─── MOBILE OVERVIEW ─── */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className={`md:hidden flex-1 flex flex-col gap-6 ${view === 'overview' ? 'flex' : 'hidden'}`}>
        {/* Profile Summary Card */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <div className="h-24 w-24 rounded-2xl bg-[#6b0000] border-4 border-slate-50 shadow-md overflow-hidden mb-4 flex items-center justify-center">
             {photoHalf ? <img src={photoHalf} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-3xl font-bold text-white">{form.nama.charAt(0)}</span>}
          </div>
          <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1">{form.nama}</h3>
          <p className="text-xs text-slate-500 font-medium mb-4 tracking-wide">{form.nim}</p>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 bg-red-50 text-red-800 text-[10px] font-bold rounded-lg uppercase tracking-widest border border-red-100">{form.tingkat}</span>
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg uppercase tracking-widest border border-emerald-100">{form.status}</span>
          </div>
        </div>

        {/* Menu Buttons */}
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <button onClick={() => setView('detail')} className="flex items-center gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left w-full">
            <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-800 text-[15px]">Lihat Profil</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">Edit foto dan data diri</div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300" />
          </button>
          
          <Link href="/" className="flex items-center gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left w-full">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <HomeIcon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-800 text-[15px]">Beranda Utama</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">Kembali ke website publik</div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300" />
          </Link>

          <button onClick={handleSignOut} className="flex items-center gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left w-full">
            <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-800 text-[15px]">Ganti Akun</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">Masuk dengan akun berbeda</div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300" />
          </button>

          <button onClick={handleSignOut} className="flex items-center gap-4 p-4 hover:bg-red-50 transition-colors text-left w-full group">
            <div className="h-12 w-12 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0 group-hover:bg-red-100">
              <LogOut className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-red-600 text-[15px]">Logout</div>
              <div className="text-[11px] text-red-400 font-medium mt-0.5">Keluar dari sesi saat ini</div>
            </div>
          </button>
        </div>
      </motion.div>

      {/* ─── Main Content ─── */}
      <main className={`flex-1 min-h-0 flex-col mt-4 overflow-visible md:overflow-hidden relative ${view === 'detail' ? 'flex' : 'hidden md:flex'}`}>
        <ViewportFitGrid gap={0} minScale={0.5} gridTemplateColumns="1fr" className="w-full h-full max-h-full">
          
          <div className="flex flex-col xl:flex-row gap-6 w-full h-full items-stretch">

            {/* ── Avatar Card ── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-slate-200 rounded-[24px] overflow-hidden flex flex-col mx-auto xl:mx-0 shadow-sm shrink-0 aspect-[9/16] h-auto w-full xl:w-auto relative">
              
              <input type="file" accept="image/*" className="hidden" ref={fullInputRef} onChange={(e) => handlePhotoUpload(e, 'full')} />
              <input type="file" accept="image/*" className="hidden" ref={halfInputRef} onChange={(e) => handlePhotoUpload(e, 'half')} />

              {/* Header section with Full Body Background */}
              <div 
                className="relative w-full h-full bg-[#6b0000] flex flex-col items-start justify-end p-6 group cursor-pointer overflow-hidden"
                onClick={() => fullInputRef.current?.click()}
              >
                {/* Background Image Placeholder for Full Body */}
                {photoFull ? (
                  <img src={photoFull} alt="Full Body" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="absolute inset-0 bg-slate-800 flex items-center justify-center opacity-40 group-hover:opacity-30 transition-opacity">
                    <User className="h-40 w-40 text-slate-700/50" />
                  </div>
                )}
                
                {/* Overlay gradient for readability - reduced for better photo visibility */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent pointer-events-none" />

                {/* Edit Full Body Photo Button (Top Right) */}
                <div className="absolute top-4 right-4 bg-[#6b0000]/80 p-2 opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700 hover:border-[#6b0000] hover:bg-[#6b0000] group-hover:text-white z-20 flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  <span className="text-[9px] font-bold uppercase tracking-wider hidden md:block">Edit</span>
                </div>

                {/* 1/2 Badan Photo & Name (Foreground) */}
                <div className="relative z-10 w-full flex flex-row items-end gap-4">
                  <div 
                    className="group/avatar relative cursor-pointer shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      halfInputRef.current?.click();
                    }}
                  >
                    <div className="h-24 w-24 rounded-xl bg-[#6b0000] flex items-center justify-center border-4 border-[#6b0000] shadow-2xl overflow-hidden relative transition-all group-hover/avatar:border-slate-700">
                      {photoHalf ? (
                        <img src={photoHalf} alt="1/2 Badan" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl  font-bold text-slate-800">
                          {form.nama.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                        </span>
                      )}
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-[#6b0000]/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center flex-col gap-1">
                        <Camera className="h-5 w-5 text-white" />
                        <span className="text-[8px] text-white font-bold uppercase tracking-wider">Edit</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left pb-1 overflow-hidden">
                    <div className="text-2xl font-bold text-white drop-shadow-md leading-tight truncate">{form.nama}</div>
                    <div className="text-sm font-medium text-slate-300 drop-shadow-md mt-0.5 tracking-wider">{form.nim}</div>
                  </div>
                </div>
              </div>


            </motion.div>

            {/* ── Right Column ── */}
            <div className="flex-1 flex flex-col gap-6">
              {/* ── Detail Edit Card ── */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-slate-200 rounded-[24px] overflow-hidden flex-1 flex flex-col shadow-sm">
              {/* Card header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-white border border-slate-200 shadow-sm shrink-0">
                    <User className="h-5 w-5 text-red-800" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-lg">Informasi Kontak & Akun</h2>
                    <p className="text-[13px] text-slate-500 font-medium mt-0.5">Kelola data diri dan informasi keanggotaan Anda.</p>
                  </div>
                </div>
                {!editing ? (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="rounded-xl border-slate-200 gap-1.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors bg-white">
                    <Edit3 className="h-4 w-4" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="rounded-xl text-slate-500">Batal</Button>
                    <Button size="sm" onClick={handleSave} className="rounded-xl bg-red-700 text-white hover:bg-red-800 transition-colors gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Simpan
                    </Button>
                  </div>
                )}
              </div>

              {/* Fields */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: User,  key: "nama",  label: "Nama Lengkap" },
                  { icon: Hash,  key: "nim",   label: "NIM" },
                  { icon: GraduationCap, key: "prodi", label: "Program Studi" },
                  { icon: Building2, key: "departemen", label: "Departemen" },
                  { icon: Library, key: "fakultas", label: "Fakultas" },
                  { icon: Hash,  key: "angkatan", label: "Angkatan" },
                  { icon: Shield, key: "tingkat", label: "Tingkat Member" },
                  { icon: Mail,  key: "email", label: "Email Akun" },
                  { icon: Phone, key: "no_hp", label: "Nomor HP / WA" },
                ].map(({ icon: Icon, key, label }) => (
                  <div key={key} className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </label>
                    {editing ? (
                      <Input
                        value={form[key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-slate-900"
                        disabled={key === "nim" || key === "email" || key === "tingkat"}
                      />
                    ) : (
                      <div className={cn("px-4 py-2.5 border text-sm font-medium truncate",
                        key === "nim" || key === "email" || key === "tingkat"
                          ? "bg-slate-50 border-slate-100 text-slate-400 border-dashed"
                          : "bg-white border-slate-200 text-slate-800"
                      )}>
                        {form[key as keyof typeof form]}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              </motion.div>

              {/* ── Keamanan Akun Card ── */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border border-slate-200 rounded-[24px] overflow-hidden flex flex-col shadow-sm shrink-0">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-white border border-slate-200 shadow-sm shrink-0">
                      <Shield className="h-5 w-5 text-red-800" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Keamanan Akun</h3>
                      <p className="text-[13px] text-slate-500 font-medium mt-0.5">Perbarui kata sandi untuk menjaga privasi dan keamanan Anda.</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <Button variant="outline" className="rounded-xl border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-sm">
                    Ubah Password
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </ViewportFitGrid>
      </main>
      {/* ── Crop Modal ── */}
      {cropModalOpen && currentImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/20 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Sesuaikan Foto</h3>
              <button onClick={() => setCropModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                ✕
              </button>
            </div>
            
            <div className="relative w-full h-[400px] bg-black">
              <Cropper
                image={currentImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={currentCropType === 'half' ? 1 : 9 / 16}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                showGrid={false}
              />
            </div>
            
            <div className="p-4 bg-white flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-500 uppercase">Zoom</span>
                <input 
                  type="range" 
                  value={zoom} 
                  min={1} 
                  max={3} 
                  step={0.1} 
                  aria-labelledby="Zoom" 
                  onChange={(e) => setZoom(Number(e.target.value))} 
                  className="flex-1 accent-slate-900"
                />
              </div>
              
              <div className="flex gap-2 justify-end mt-2">
                <Button variant="ghost" className="rounded-xl text-slate-500" onClick={() => setCropModalOpen(false)}>
                  Batal
                </Button>
                <Button className="rounded-xl bg-white/40 text-slate-800 hover:bg-white/60 backdrop-blur-sm border border-white/50" onClick={handleCropSave}>
                  Simpan Foto
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
