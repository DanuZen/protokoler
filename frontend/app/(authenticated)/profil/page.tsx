"use client";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { User, Mail, Phone, GraduationCap, Hash, Shield, Camera, Edit3, CheckCircle2, Building2, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import Cropper from 'react-easy-crop';
import { getCroppedImg } from "@/lib/canvasUtils";
import { cn } from "@/lib/utils";

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };

export default function ProfilPage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [photoHalf, setPhotoHalf] = useState<string | null>(typeof window !== 'undefined' ? window.localStorage.getItem('demo_avatar') : null);
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
      if (!currentImageSrc || !croppedAreaPixels) return;
      const croppedImage = await getCroppedImg(currentImageSrc, croppedAreaPixels);
      
      if (currentCropType === 'half') {
        setPhotoHalf(croppedImage);
        window.localStorage.setItem('demo_avatar', croppedImage);
        window.dispatchEvent(new Event('demo_avatar_updated'));
      } else if (currentCropType === 'full') {
        setPhotoFull(croppedImage);
      }
      
      toast.success(`Foto ${currentCropType === 'half' ? '1/2 Badan' : 'Full Body'} berhasil diunggah`);
      setCropModalOpen(false);
      setCurrentImageSrc(null);
    } catch (e) {
      console.error(e);
      toast.error('Gagal memotong gambar');
    }
  };
  const [form, setForm] = useState({
    nama:   typeof window !== 'undefined' && window.localStorage.getItem('demo_name') ? window.localStorage.getItem('demo_name')! : user?.user_metadata?.nama_lengkap || "Budi Santoso",
    nim:    "20010101",
    prodi:  "Pendidikan Teknik Informatika",
    departemen: "Teknik Elektronika",
    fakultas: "Fakultas Teknik",
    angkatan: "2020",
    no_hp:  "081234567890",
    email:  user?.email ?? "budi@example.com",
    tingkat: "Gold",
    status: "Aktif",
  });

  const handleSave = () => {
    window.localStorage.setItem('demo_name', form.nama);
    window.dispatchEvent(new Event('demo_name_updated'));
    toast.success("Profil berhasil diperbarui");
    setEditing(false);
  };

  return (
    <div className="flex flex-col min-h-full pb-10 px-6 md:px-8 pt-4">
      {/* ─── HEADER SECTION ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200/60">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20 text-white">
            <User className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
                Pengaturan Akun
              </span>
            </div>
            <h2 className="text-3xl md:text-[2.5rem] font-black tracking-tight leading-none mb-1.5 text-slate-900 drop-shadow-sm">Profil Saya</h2>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Informasi akun dan data keanggotaan protokoler.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 font-bold text-sm rounded-xl">
            <Shield className="h-4 w-4" /> {form.tingkat} Member
          </span>
          <span className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 font-bold text-sm rounded-xl">
            <CheckCircle2 className="h-4 w-4" /> {form.status}
          </span>
        </div>
      </motion.div>

      {/* ─── Main Content ─── */}
      <div className="flex-1 mt-8">
        <div className="space-y-6">

          <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 xl:grid-cols-[auto_1fr] gap-6">

            {/* ── Avatar Card ── */}
            <motion.div variants={fadeUp} className="bg-white border border-slate-200 rounded-[24px] overflow-hidden h-full flex flex-col mx-auto xl:mx-0 shadow-sm">
              
              <input type="file" accept="image/*" className="hidden" ref={fullInputRef} onChange={(e) => handlePhotoUpload(e, 'full')} />
              <input type="file" accept="image/*" className="hidden" ref={halfInputRef} onChange={(e) => handlePhotoUpload(e, 'half')} />

              {/* Header section with Full Body Background */}
              <div 
                className="relative h-full w-auto aspect-[9/16] bg-[#6b0000] flex flex-col items-start justify-end p-6 group cursor-pointer overflow-hidden"
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

            {/* ── Detail Edit Card ── */}
            <motion.div variants={fadeUp} className="bg-white border border-slate-200 rounded-[24px] overflow-hidden h-full flex flex-col shadow-sm">
              {/* Card header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h2 className="font-bold text-slate-900 uppercase tracking-wider text-sm">Informasi Kontak & Akun</h2>
                {!editing ? (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="rounded-xl border-slate-200 gap-1.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors bg-white">
                    <Edit3 className="h-4 w-4" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="rounded-xl text-slate-500">Batal</Button>
                    <Button size="sm" onClick={handleSave} className="rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors gap-1.5">
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

              {/* Change password section */}
              <div className="border-t border-slate-100 px-6 py-5 bg-slate-50 mt-auto">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Keamanan Akun</h3>
                <Button variant="outline" className="rounded-xl border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-sm">
                  Ubah Password
                </Button>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
      {/* ── Crop Modal ── */}
      {cropModalOpen && currentImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#6b0000]/80 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/20 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Sesuaikan Foto</h3>
              <button onClick={() => setCropModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                ✕
              </button>
            </div>
            
            <div className="relative w-full h-[400px] bg-[#6b0000]">
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
