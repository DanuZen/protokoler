"use client";
import { useAuth, useRole } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Download, BadgeCheck, Calendar, MapPin, ChevronDown, CheckCircle2, Clock, Users, X, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const fadeUp  = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

// Mock sertifikat data with names (kosongkan data dummy untuk saat ini)
const mockSertifikat: any[] = [];

function AdminSertifikatView() {
  const [tab, setTab] = useState<'semua' | 'acara' | 'penghargaan' | 'pending'>('semua');
  const [search, setSearch] = useState('');
  
  const pendingCount = mockSertifikat.filter(s => s.status === 'dalam_proses').length;
  const issuedCount = mockSertifikat.filter(s => s.status === 'diterbitkan').length;
  
  const filtered = mockSertifikat.filter(s => {
    const matchSearch = s.nama_protokoler.toLowerCase().includes(search.toLowerCase()) || s.judul.toLowerCase().includes(search.toLowerCase());
    const matchTab = 
      tab === 'semua' ? true : 
      tab === 'pending' ? s.status === 'dalam_proses' :
      s.kategori === tab;
    return matchSearch && matchTab;
  });

  const handleApprove = (id: string) => toast.success(`Sertifikat berhasil diterbitkan.`);
  const handleReject = (id: string) => toast.success(`Permintaan sertifikat ditolak.`);

  return (
    <div className="flex-1 flex flex-col min-h-0 pb-6 px-6 md:px-8 pt-4">
      {/* ─── HEADER SECTION (Adapted Layout) ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-8 pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
              Pimpinan
            </span>
          </div>
          <h2 className="font-display text-[28px] md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 md:mb-2 text-slate-900 drop-shadow-sm">Manajemen Sertifikat</h2>
          <p className="text-[13px] md:text-base text-slate-600 font-medium max-w-xl">
            Verifikasi, kelola, dan terbitkan sertifikat untuk tim protokoler.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <Button onClick={() => toast.success("Fitur ini sedang dikembangkan")} className="w-full md:w-auto h-[52px] md:h-12 rounded-[1rem] md:rounded-xl bg-gradient-to-r from-[#5b1511] to-orange-700 hover:from-[#4a110e] hover:to-orange-800 text-white shadow-sm font-bold shadow-orange-500/20 text-[15px] md:text-sm transition-all">
            <BadgeCheck className="mr-2 h-5 w-5 md:h-4 md:w-4" /> Buat Penghargaan Khusus
          </Button>
        </div>
      </motion.div>

      {/* STATS */}
      <section className="relative z-20 pb-0 shrink-0 mb-6 md:mb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {[
            { label: "Menunggu Persetujuan", value: pendingCount, icon: Clock, hint: "Butuh verifikasi", color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Total Diterbitkan", value: issuedCount, icon: BadgeCheck, hint: "Sertifikat & Penghargaan", color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Total Pengajuan", value: mockSertifikat.length, icon: Award, hint: "Seluruh riwayat", color: "text-orange-600", bg: "bg-orange-50", className: "hidden md:block" },
          ].map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }} className={stat.className || ""}>
              <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-4 md:p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-orange-50/80 transition-all group relative overflow-hidden h-full">
                <div className="flex items-center justify-between relative z-10 mb-2 md:mb-0">
                  <p className="text-xs md:text-sm font-semibold text-slate-500 truncate pr-2">{stat.label}</p>
                  <div className={cn("flex-shrink-0 h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-xl transition-colors", stat.bg, stat.color)}>
                    <stat.icon className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                </div>
                <div className="mt-1 md:mt-4 relative z-10">
                  <p className="text-2xl md:text-[32px] font-bold leading-tight text-slate-900">{stat.value}</p>
                  <span className="text-[9px] md:text-[11px] font-medium text-slate-400 mt-0.5 md:mt-1 block truncate">{stat.hint}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BODY CONTENT */}
      <div className="flex-1 flex flex-col min-h-0 mt-8 pb-4">
        <section className="flex-1 flex flex-col min-h-0 pb-0 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-3 pl-3 md:pl-6 pr-3 md:pr-6">
            <div className="flex items-center p-1 bg-white/50 border border-slate-100/50 rounded-xl w-full md:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden">
              <button onClick={() => setTab('semua')} className={cn("flex-1 md:flex-none px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap", tab === 'semua' ? "bg-[#5b1511] text-white shadow-sm border border-[#5b1511]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50")}>Semua Sertifikat</button>
              <button onClick={() => setTab('acara')} className={cn("flex-1 md:flex-none px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap", tab === 'acara' ? "bg-[#5b1511] text-white shadow-sm border border-[#5b1511]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50")}>Sertifikat Acara</button>
              <button onClick={() => setTab('penghargaan')} className={cn("flex-1 md:flex-none px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap", tab === 'penghargaan' ? "bg-[#5b1511] text-white shadow-sm border border-[#5b1511]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50")}>Penghargaan</button>
              <button onClick={() => setTab('pending')} className={cn("flex-1 md:flex-none px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap", tab === 'pending' ? "bg-[#5b1511] text-white shadow-sm border border-[#5b1511]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50")}>Menunggu <span className="ml-1.5 inline-flex items-center justify-center bg-white/20 px-1.5 py-0.5 rounded-md text-[10px]">{pendingCount}</span></button>
            </div>
            <div className="relative w-full md:w-auto min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Cari nama atau kegiatan..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 rounded-full bg-white border-slate-200 text-slate-900 shadow-sm focus-visible:ring-slate-200 w-full" />
            </div>
          </div>

          <motion.div initial="hidden" animate="visible" variants={stagger} className="flex-1 flex flex-col min-h-0 bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl overflow-hidden">
            <div className="shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 bg-white text-[#5b1511] rounded-xl border border-slate-100 shadow-sm">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    {tab === 'semua' ? 'Semua Sertifikat' : tab === 'acara' ? 'Sertifikat Acara' : tab === 'penghargaan' ? 'Penghargaan' : 'Sertifikat Menunggu'}
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">{filtered.length} data ditemukan</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Protokoler</th>
                    <th className="px-6 py-4">Sertifikat / Kegiatan</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        Tidak ada data yang ditemukan.
                      </td>
                    </tr>
                  ) : filtered.map((s) => (
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
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

function UserSertifikatView() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [kategori, setKategori] = useState<'acara' | 'penghargaan'>('acara');

  const issued   = mockSertifikat.filter((s) => s.status === "diterbitkan").length;
  const inProcess = mockSertifikat.filter((s) => s.status === "dalam_proses").length;
  
  const displayedSertifikat = mockSertifikat.filter(s => s.kategori === kategori);

  return (
    <div className="flex-1 flex flex-col min-h-0 pb-6 px-6 md:px-8 pt-4">
      {/* ─── HEADER SECTION ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-4 md:gap-6 mb-4 md:mb-8 pt-2">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20 text-white">
            <Award className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
                Penghargaan
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 text-slate-900 drop-shadow-sm">Sertifikat Saya</h2>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Riwayat sertifikat penugasan dan keaktifan protokoler.</p>
          </div>
        </div>
      </motion.div>

      {/* ─── Floating Stats Row ─── */}
      <section className="relative z-20 pb-0 shrink-0">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {[
            { label: "Diterbitkan", value: issued, icon: BadgeCheck, hint: "Siap diunduh", color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Dalam Proses", value: inProcess, icon: Clock, hint: "Menunggu admin", color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Total", value: mockSertifikat.length, icon: Award, hint: "Seluruh riwayat", color: "text-orange-600", bg: "bg-orange-50", className: "hidden md:block" },
          ].map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }} className={stat.className || ""}>
              <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-4 md:p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-orange-50/80 transition-all group relative overflow-hidden h-full">
                <div className="flex items-center justify-between relative z-10 mb-2 md:mb-0">
                  <p className="text-xs md:text-sm font-semibold text-slate-500 truncate pr-2">{stat.label}</p>
                  <div className={cn("flex-shrink-0 h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-xl transition-colors", stat.bg, stat.color)}>
                    <stat.icon className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                </div>
                <div className="mt-1 md:mt-4 relative z-10">
                  <p className="text-2xl md:text-[32px] font-bold leading-tight text-slate-900">{stat.value}</p>
                  <span className="text-[9px] md:text-[11px] font-medium text-slate-400 mt-0.5 md:mt-1 block truncate">{stat.hint}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── BODY CONTENT ─── */}
      <div className="flex-1 flex flex-col min-h-0 mt-4 md:mt-8 pb-4">
        <section className="flex-1 flex flex-col min-h-0 pb-0 space-y-4 md:space-y-6">

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-3 pl-3 md:pl-6 pr-3 md:pr-6">
            <div className="flex items-center p-1 bg-white/50 border border-slate-100/50 rounded-xl w-full md:w-auto">
              <button 
                onClick={() => setKategori('acara')} 
                className={cn("flex-1 md:flex-none px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap", kategori === 'acara' ? "bg-[#5b1511] text-white shadow-sm border border-[#5b1511]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50")}
              >
                Sertifikat Acara
              </button>
              <button 
                onClick={() => setKategori('penghargaan')} 
                className={cn("flex-1 md:flex-none px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap", kategori === 'penghargaan' ? "bg-[#5b1511] text-white shadow-sm border border-[#5b1511]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50")}
              >
                Penghargaan
              </button>
            </div>
          </div>

          {displayedSertifikat.length === 0 ? (
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-16 text-center text-slate-400">
              <Award className="h-12 w-12 mx-auto mb-3 text-slate-300 opacity-50" />
              <p className="font-medium text-sm text-slate-400 mb-1">Belum ada {kategori === 'acara' ? 'sertifikat' : 'penghargaan'}</p>
              <p className="text-xs text-slate-400 max-w-sm">{kategori === 'acara' ? 'Sertifikat akan diterbitkan setelah kegiatan selesai.' : 'Anda belum menerima penghargaan khusus.'}</p>
            </div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={stagger} className="flex-1 flex flex-col min-h-0 bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl overflow-hidden">
              <div className="shrink-0 flex flex-col md:flex-row items-center gap-4 border-b border-slate-100/50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 bg-white text-[#5b1511] rounded-xl border border-slate-100 shadow-sm">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      {kategori === 'acara' ? 'Sertifikat Acara' : 'Penghargaan'}
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">{displayedSertifikat.length} data ditemukan</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden divide-y divide-slate-100">
                {displayedSertifikat.map((s) => (
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
                            <h3 className="font-bold text-slate-900 text-base group-hover:text-orange-500 transition-colors truncate">{s.judul}</h3>
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
              </div>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function SertifikatPage() {
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const isAdmin = role === "admin" || (role as string) === "pimpinan";

  if (isAdmin) {
    return <AdminSertifikatView />;
  }

  return <UserSertifikatView />;
}
