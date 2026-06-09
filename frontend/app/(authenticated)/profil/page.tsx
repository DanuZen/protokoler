"use client";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { User, Mail, Phone, GraduationCap, Hash, Shield, Camera, Edit3, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };

export default function ProfilPage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    nama:   "Budi Santoso",
    nim:    "20010101",
    prodi:  "Pendidikan Teknik Informatika",
    angkatan: "2020",
    no_hp:  "081234567890",
    email:  user?.email ?? "budi@example.com",
    tingkat: "Gold",
    status: "Aktif",
  });

  const handleSave = () => {
    toast.success("Profil berhasil diperbarui");
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* ─── Hero Banner ─── */}
      <div className="relative px-6 md:px-10 pt-24 pb-32 overflow-hidden">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight">Profil Saya</h1>
            <p className="mt-3 text-slate-300 text-lg">Informasi akun dan data keanggotaan protokoler.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 bg-[#C9A84C] text-slate-900 px-4 py-2 font-bold text-sm rounded-none">
              <Shield className="h-4 w-4" /> {form.tingkat} Member
            </span>
            <span className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 px-4 py-2 font-bold text-sm rounded-none">
              <CheckCircle2 className="h-4 w-4" /> {form.status}
            </span>
          </div>
        </motion.div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="bg-slate-50 min-h-screen pt-4 pb-12">
        <div className="px-6 md:px-10 -mt-10 relative z-10 space-y-6">

          <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6">

            {/* ── Avatar Card ── */}
            <motion.div variants={fadeUp} className="bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden h-fit">
              <div className="bg-slate-900 px-6 py-8 flex flex-col items-center gap-4">
                {/* Avatar circle */}
                <div className="relative">
                  <div className="h-24 w-24 rounded-none bg-[#C9A84C] flex items-center justify-center border-4 border-slate-700">
                    <span className="text-3xl font-display font-bold text-slate-900">
                      {form.nama.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </span>
                  </div>
                  <button className="absolute -bottom-2 -right-2 h-8 w-8 bg-slate-700 border border-slate-600 flex items-center justify-center hover:bg-[#C9A84C] transition-colors rounded-none">
                    <Camera className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{form.nama}</div>
                  <div className="text-sm text-slate-400">{form.nim}</div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {[
                  { icon: GraduationCap, label: "Prodi",    value: form.prodi },
                  { icon: Hash,          label: "Angkatan", value: form.angkatan },
                  { icon: Shield,        label: "Tingkat",  value: form.tingkat },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 px-5 py-3.5">
                    <Icon className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
                      <div className="text-sm font-semibold text-slate-900">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── Detail Edit Card ── */}
            <motion.div variants={fadeUp} className="bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden">
              {/* Card header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 uppercase tracking-wider text-sm">Informasi Kontak & Akun</h2>
                {!editing ? (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="rounded-none border-slate-200 gap-1.5 text-slate-700 hover:bg-slate-900 hover:text-white transition-colors">
                    <Edit3 className="h-4 w-4" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="rounded-none text-slate-500">Batal</Button>
                    <Button size="sm" onClick={handleSave} className="rounded-none bg-slate-900 text-white hover:bg-[#C9A84C] hover:text-slate-900 transition-colors gap-1.5">
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
                        className="rounded-none border-slate-200 bg-slate-50 focus-visible:ring-slate-900"
                        disabled={key === "nim" || key === "email"}
                      />
                    ) : (
                      <div className={cn("px-4 py-2.5 border text-sm font-medium",
                        key === "nim" || key === "email"
                          ? "bg-slate-50 border-slate-100 text-slate-400 border-dashed"
                          : "bg-white border-slate-200 text-slate-900"
                      )}>
                        {form[key as keyof typeof form]}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Change password section */}
              <div className="border-t border-slate-100 px-6 py-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Keamanan Akun</h3>
                <Button variant="outline" className="rounded-none border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-sm">
                  Ubah Password
                </Button>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
