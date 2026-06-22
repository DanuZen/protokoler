"use client";
import { useAuth, useRole } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Download, BadgeCheck, Calendar, MapPin, ChevronDown, CheckCircle2, Clock, Users, X, Check, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const fadeUp  = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

import { useQuery } from "@tanstack/react-query";
import { sertifikatApi } from "@/lib/api";

function AdminSertifikatView() {
  const { data: sertifikatList } = useQuery({
    queryKey: ["sertifikat-all"],
    queryFn: () => sertifikatApi.listAll(),
  });
  const data = sertifikatList || [];

  const [tab, setTab] = useState<'semua' | 'acara' | 'penghargaan' | 'pending'>('semua');
  const [search, setSearch] = useState('');
  
  const pendingCount = data.filter((s: any) => s.status === 'dalam_proses').length;
  const issuedCount = data.filter((s: any) => s.status === 'diterbitkan').length;
  
  const filtered = data.filter((s: any) => {
    const matchSearch = (s.nama_protokoler || '').toLowerCase().includes(search.toLowerCase()) || (s.judul || '').toLowerCase().includes(search.toLowerCase());
    const matchTab = 
      tab === 'semua' ? true : 
      tab === 'pending' ? s.status === 'dalam_proses' :
      s.kategori === tab;
    return matchSearch && matchTab;
  });

  const handleApprove = (id: string) => toast.success(`Sertifikat berhasil diterbitkan.`);
  const handleReject = (id: string) => toast.success(`Permintaan sertifikat ditolak.`);

  return (
    <div className="flex flex-col h-auto md:h-dvh md:overflow-hidden pb-6 px-6 md:px-8 pt-4">
      {/* HEADER SECTION */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 pb-6 border-b border-slate-200/60">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-700 to-red-800 shadow-lg shadow-red-700/20 text-white">
            <Award className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-red-800">
                Pimpinan
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 text-slate-900 drop-shadow-sm">Manajemen Sertifikat</h2>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Verifikasi, kelola, dan terbitkan sertifikat untuk tim protokoler.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => toast.success("Fitur ini sedang dikembangkan")} className="rounded-xl bg-red-800 text-white hover:bg-red-900 shadow-sm font-bold shadow-red-700/20">
            <BadgeCheck className="mr-2 h-4 w-4" /> Buat Penghargaan Khusus
          </Button>
        </div>
      </motion.div>

      {/* STATS */}
      <section className="shrink-0 relative z-20 pb-0">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Menunggu Persetujuan", value: pendingCount, icon: Clock, hint: "Butuh verifikasi" },
            { label: "Total Diterbitkan", value: issuedCount, icon: BadgeCheck, hint: "Sertifikat & Penghargaan" },
            { label: "Total Pengajuan", value: data.length, icon: Award, hint: "Seluruh riwayat" },
          ].map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }}>
              <div className="bg-white border border-slate-200 rounded-[24px] py-6 px-6 flex flex-col justify-between hover:shadow-md transition-all group relative overflow-hidden h-full shadow-sm">
                <div className="flex items-center justify-between relative z-10">
                  <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-800 transition-colors">
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 relative z-10">
                  <p className="text-[32px] font-bold leading-tight text-red-800">{stat.value}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[11px] font-medium text-slate-400">{stat.hint}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BODY CONTENT */}
      <main className="flex-1 min-h-0 flex flex-col mt-8 overflow-hidden">
        <section className="flex-1 flex flex-col min-h-0 pb-12 pr-2">
          
          <motion.div initial="hidden" animate="visible" variants={stagger} className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[24px] overflow-hidden flex flex-col flex-1 min-h-0">
            <div className="px-6 md:px-8 py-5 bg-slate-50 border-b border-slate-100 flex flex-col xl:flex-row justify-between xl:items-center gap-4 shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center h-12 w-12 bg-white border border-slate-200 text-primary rounded-[14px] shadow-sm shrink-0">
                  <BadgeCheck className="h-6 w-6 text-red-700" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900 leading-tight">Daftar Sertifikat</h2>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-1">Kelola dan filter data seluruh sertifikat protokoler.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto [&::-webkit-scrollbar]:hidden">
                  <button onClick={() => setTab('semua')} className={cn("px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 whitespace-nowrap", tab === 'semua' ? "bg-[#6B0000] text-white border-[#6B0000] shadow-md shadow-red-700/20" : "bg-white text-slate-600 border-slate-200 shadow-sm hover:text-slate-900 hover:shadow-md")}>Semua Sertifikat</button>
                  <button onClick={() => setTab('acara')} className={cn("px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 whitespace-nowrap", tab === 'acara' ? "bg-[#6B0000] text-white border-[#6B0000] shadow-md shadow-red-700/20" : "bg-white text-slate-600 border-slate-200 shadow-sm hover:text-slate-900 hover:shadow-md")}>Sertifikat Acara</button>
                  <button onClick={() => setTab('penghargaan')} className={cn("px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 whitespace-nowrap", tab === 'penghargaan' ? "bg-[#6B0000] text-white border-[#6B0000] shadow-md shadow-red-700/20" : "bg-white text-slate-600 border-slate-200 shadow-sm hover:text-slate-900 hover:shadow-md")}>Penghargaan</button>
                  <button onClick={() => setTab('pending')} className={cn("px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 whitespace-nowrap flex items-center", tab === 'pending' ? "bg-[#6B0000] text-white border-[#6B0000] shadow-md shadow-red-700/20" : "bg-white text-slate-600 border-slate-200 shadow-sm hover:text-slate-900 hover:shadow-md")}>
                    Menunggu <span className={cn("ml-2 inline-flex items-center justify-center px-1.5 py-0.5 rounded-md text-[10px]", tab === 'pending' ? "bg-white/20" : "bg-slate-100 text-slate-500")}>{pendingCount}</span>
                  </button>
                </div>
                <div className="relative w-full sm:w-64 shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="Cari nama atau kegiatan..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 rounded-xl bg-white border-slate-200 text-sm shadow-sm focus-visible:ring-red-700 w-full" />
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 bg-white overflow-auto flex flex-col relative">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-slate-500 font-semibold border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4">Protokoler</th>
                    <th className="px-6 py-4">Sertifikat / Kegiatan</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length > 0 && filtered.map((s: any) => (
                    <motion.tr key={s.id} variants={fadeUp} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 align-top">
                        <div className="font-bold text-slate-900">{s.nama_protokoler}</div>
                        <div className="text-xs text-slate-500 mt-1">{s.peran}</div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="font-bold text-slate-700">{s.judul}</div>
                        <div className="text-xs text-slate-500 mt-1">{s.kegiatan}</div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span className={cn("inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border",
                          s.status === "diterbitkan"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-600 border-amber-200"
                        )}>
                          {s.status === "diterbitkan" ? <><BadgeCheck className="h-3 w-3" /> Diterbitkan</> : "Dalam Proses"}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top text-right">
                        {s.status === "dalam_proses" ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" onClick={() => handleApprove(s.id)} className="h-8 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg shadow-sm text-xs px-3">
                              <Check className="h-3.5 w-3.5 mr-1" /> Terbitkan
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleReject(s.id)} className="h-8 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg px-2">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" className="h-8 border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg text-xs px-3 font-medium">
                            <Download className="h-3.5 w-3.5 mr-1.5" /> PDF
                          </Button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              
              {filtered.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 min-h-[350px]">
                  <Sparkles className="mx-auto h-12 w-12 mb-4 text-slate-300" />
                  <h3 className="text-sm font-bold text-slate-700 mb-1">Tidak Ada Data</h3>
                  <p className="text-xs">Belum ada sertifikat yang cocok dengan filter atau pencarian Anda.</p>
                </div>
              )}
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}

function UserSertifikatView() {
  const { data: sertifikatList } = useQuery({
    queryKey: ["sertifikat-me"],
    queryFn: () => sertifikatApi.byProtokoler(),
  });
  const data = sertifikatList || [];

  const [expanded, setExpanded] = useState<string | null>(null);
  const [kategori, setKategori] = useState<'acara' | 'penghargaan'>('acara');

  const issued   = data.filter((s: any) => s.status === "diterbitkan").length;
  const inProcess = data.filter((s: any) => s.status === "dalam_proses").length;
  
  const displayedSertifikat = data.filter((s: any) => s.kategori === kategori);

  return (
    <div className="flex flex-col h-auto md:h-dvh md:overflow-hidden pb-6 px-6 md:px-8 pt-4">
      {/* ─── HEADER SECTION ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200/60">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-700 to-red-800 shadow-lg shadow-red-700/20 text-white">
            <Award className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-red-800">
                Penghargaan
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 text-slate-900 drop-shadow-sm">Sertifikat Saya</h2>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Riwayat sertifikat penugasan dan keaktifan protokoler.</p>
          </div>
        </div>
      </motion.div>

      {/* ─── Floating Stats Row ─── */}
      <section className="shrink-0 relative z-20 pb-0">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Diterbitkan", value: issued, icon: BadgeCheck, hint: "Siap diunduh" },
            { label: "Dalam Proses", value: inProcess, icon: Clock, hint: "Menunggu admin" },
            { label: "Total", value: data.length, icon: Award, hint: "Seluruh riwayat" },
          ].map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }}>
              <div className="bg-white border border-slate-200 rounded-[24px] py-6 px-6 flex flex-col justify-between hover:shadow-md transition-all group relative overflow-hidden h-full shadow-sm">
                <div className="flex items-center justify-between relative z-10">
                  <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-800 transition-colors">
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 relative z-10">
                  <p className="text-[32px] font-bold leading-tight text-red-800">{stat.value}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[11px] font-medium text-slate-400">{stat.hint}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── BODY CONTENT ─── */}
      <main className="flex-1 min-h-0 flex flex-col mt-8 overflow-hidden">
        <section className="flex-1 flex flex-col min-h-0 pb-12 pr-2">

          <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[24px] overflow-hidden flex flex-col flex-1 min-h-0">
            <div className="px-6 md:px-8 py-5 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4 shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center h-12 w-12 bg-white border border-slate-200 text-primary rounded-[14px] shadow-sm shrink-0">
                  <Award className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900 leading-tight">Daftar Sertifikat</h2>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-1">Arsip sertifikat dan penghargaan yang Anda terima.</p>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 [&::-webkit-scrollbar]:hidden">
                <button 
                  onClick={() => setKategori('acara')} 
                  className={cn("px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 whitespace-nowrap", kategori === 'acara' ? "bg-[#6B0000] text-white border-[#6B0000] shadow-md shadow-red-700/20" : "bg-white text-slate-600 border-slate-200 shadow-sm hover:text-slate-900 hover:shadow-md")}
                >
                  Sertifikat Acara
                </button>
                <button 
                  onClick={() => setKategori('penghargaan')} 
                  className={cn("px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 whitespace-nowrap", kategori === 'penghargaan' ? "bg-[#6B0000] text-white border-[#6B0000] shadow-md shadow-red-700/20" : "bg-white text-slate-600 border-slate-200 shadow-sm hover:text-slate-900 hover:shadow-md")}
                >
                  Penghargaan
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 bg-white overflow-y-auto">
              {displayedSertifikat.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-16 text-center">
                  <Award className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <h3 className="font-bold text-slate-900 text-lg">Belum ada {kategori === 'acara' ? 'sertifikat' : 'penghargaan'}</h3>
                  <p className="text-slate-500 text-sm mt-1">{kategori === 'acara' ? 'Sertifikat akan diterbitkan setelah kegiatan selesai.' : 'Anda belum menerima penghargaan khusus.'}</p>
                </div>
              ) : (
                <motion.div initial="hidden" animate="visible" variants={stagger} className="divide-y divide-slate-100">
                {displayedSertifikat.map((s: any) => (
                  <motion.div key={s.id} variants={fadeUp}>
                    {/* Row */}
                    <button
                      className="w-full text-left group hover:bg-slate-50 transition-colors"
                      onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5">
                        {/* Icon + info */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={cn(
                            "h-12 w-12 flex items-center justify-center shrink-0 rounded-xl",
                            s.status === "diterbitkan" ? "bg-emerald-50" : "bg-slate-100"
                          )}>
                            <Award className={cn("h-5 w-5", s.status === "diterbitkan" ? "text-emerald-600" : "text-slate-400")} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 text-base group-hover:text-red-700 transition-colors truncate">{s.judul}</h3>
                            <p className="text-slate-500 text-sm truncate">{s.kegiatan}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 md:shrink-0">
                          <span className={cn("inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border",
                            s.status === "diterbitkan"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-600 border-amber-200"
                          )}>
                            {s.status === "diterbitkan" ? <><BadgeCheck className="h-3 w-3" /> Diterbitkan</> : "Dalam Proses"}
                          </span>
                          <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", expanded === s.id && "rotate-180")} />
                        </div>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {expanded === s.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-50 border-t border-slate-100 px-6 py-5"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nomor Sertifikat</div>
                            <div className="text-sm font-mono font-bold text-slate-900">{s.nomor}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Peran Penugasan</div>
                            <div className="text-sm font-bold text-slate-900">{s.peran}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tanggal Kegiatan</div>
                            <div className="text-sm font-bold text-slate-900">
                              {new Date(s.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                            </div>
                          </div>
                          <div className="md:col-span-3">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Lokasi</div>
                            <div className="text-sm text-slate-700 flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" /> {s.lokasi}
                            </div>
                          </div>
                        </div>
                        {s.status === "diterbitkan" && (
                          <Button className="rounded-xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm transition-colors gap-2 font-bold">
                            <Download className="h-4 w-4" /> Unduh Sertifikat PDF
                          </Button>
                        )}
                        {s.status === "dalam_proses" && (
                          <p className="text-xs text-amber-600 font-medium">Sertifikat sedang diproses oleh admin. Harap tunggu notifikasi.</p>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function SertifikatPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: role, loading: isRoleLoading } = useRole(user);
  const isAdmin = role === "admin" || (role as string) === "pimpinan";

  if (authLoading || isRoleLoading) return null;

  if (isAdmin) {
    return <AdminSertifikatView />;
  }

  return <UserSertifikatView />;
}
