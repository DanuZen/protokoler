"use client";
import { useAuth, useRole } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Download, BadgeCheck, MapPin, ChevronDown, Clock, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { sertifikatApi } from "@/lib/api";

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const fadeUp  = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

function AdminSertifikatView() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'semua' | 'perak' | 'silver' | 'gold'>('semua');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchCerts() {
      try {
        const res = await sertifikatApi.listAll();
        setCertificates(res || []);
      } catch (err: any) {
        toast.error("Gagal mengambil data sertifikat: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCerts();
  }, []);

  const totalCount = certificates.length;
  const goldCount = certificates.filter(s => s.kategori === 'gold').length;
  const silverCount = certificates.filter(s => s.kategori === 'silver').length;

  const filtered = certificates.filter(s => {
    const protokolerName = s.protokoler?.nama_lengkap || "";
    const matchSearch = 
      protokolerName.toLowerCase().includes(search.toLowerCase()) || 
      (s.nomor_sertifikat || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.kegiatan?.nama_kegiatan || "").toLowerCase().includes(search.toLowerCase());
    
    const matchTab = tab === 'semua' ? true : s.kategori === tab;
    return matchSearch && matchTab;
  });

  return (
    <div className="flex flex-col min-h-full pb-10 px-6 md:px-8 pt-4">
      {/* HEADER SECTION */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 pb-6 border-b border-slate-200/60">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20 text-white">
            <Award className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
                Pimpinan
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 text-slate-900 drop-shadow-sm">Manajemen Sertifikat</h2>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Kelola dan unduh sertifikat kelulusan penugasan tim protokoler.</p>
          </div>
        </div>
      </motion.div>

      {/* STATS */}
      <section className="relative z-20 pb-0">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Total Diterbitkan", value: totalCount, icon: BadgeCheck, hint: "Total sertifikat sistem", color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Kategori Gold", value: goldCount, icon: Award, hint: "Total sertifikat Gold", color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Kategori Silver", value: silverCount, icon: Award, hint: "Total sertifikat Silver", color: "text-slate-600", bg: "bg-slate-50" },
          ].map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }}>
              <div className="bg-white border border-slate-200 rounded-[24px] py-6 px-6 flex flex-col justify-between hover:shadow-lg hover:shadow-slate-100 transition-all group relative overflow-hidden h-full shadow-sm">
                <div className="flex items-center justify-between relative z-10">
                  <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                  <div className={cn("flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl transition-colors", stat.bg, stat.color)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 relative z-10">
                  <p className={cn("text-[32px] font-bold leading-tight", stat.color || "text-slate-900")}>{stat.value}</p>
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
      <div className="flex-1 mt-8">
        <section className="pb-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 [&::-webkit-scrollbar]:hidden">
              {(['semua', 'perak', 'silver', 'gold'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap",
                    tab === t ? "bg-orange-600 text-white shadow-md shadow-orange-500/20" : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {t === 'semua' ? 'Semua Sertifikat' : `Kategori ${t.charAt(0).toUpperCase() + t.slice(1)}`}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Cari nama atau kegiatan..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-orange-500" />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 bg-white border border-slate-200 rounded-2xl">
              <Loader2 className="h-10 w-10 animate-spin text-orange-600 mb-2" />
              <p className="text-slate-500 text-sm">Memuat data sertifikat...</p>
            </div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={stagger} className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Nomor Sertifikat</th>
                      <th className="px-6 py-4">Nama Kegiatan</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                          Tidak ada data sertifikat yang ditemukan.
                        </td>
                      </tr>
                    ) : filtered.map((s) => (
                      <motion.tr key={s.id} variants={fadeUp} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 align-top">
                          <div className="font-bold text-slate-900">{s.nomor_sertifikat || "—"}</div>
                          <div className="text-xs text-slate-500 mt-1">Diterbitkan pada {new Date(s.tanggal_terbit).toLocaleDateString('id-ID')}</div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="font-bold text-slate-700">{s.kegiatan?.nama_kegiatan || "—"}</div>
                          <div className="text-xs text-slate-500 mt-1">{new Date(s.kegiatan?.tanggal).toLocaleDateString('id-ID')}</div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <span className={cn("inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border",
                            s.kategori === "gold" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            s.kategori === "silver" ? "bg-slate-50 text-slate-700 border-slate-200" :
                            "bg-orange-50 text-orange-700 border-orange-200"
                          )}>
                            <BadgeCheck className="h-3 w-3" /> {s.kategori}
                          </span>
                        </td>
                        <td className="px-6 py-4 align-top text-right">
                          <a href={`/api/sertifikat/${s.id}/download`} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="h-8 border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg text-xs px-3 font-medium">
                              <Download className="h-3.5 w-3.5 mr-1.5" /> PDF
                            </Button>
                          </a>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}

function UserSertifikatView() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [kategori, setKategori] = useState<'perak' | 'silver' | 'gold'>('perak');
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyCerts() {
      try {
        const res = await sertifikatApi.byProtokoler();
        setCertificates(res || []);
      } catch (err: any) {
        toast.error("Gagal memuat sertifikat Anda: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMyCerts();
  }, []);

  const totalCount = certificates.length;
  const goldCount = certificates.filter(s => s.kategori === 'gold').length;
  const silverCount = certificates.filter(s => s.kategori === 'silver').length;

  const displayedSertifikat = certificates.filter(s => s.kategori === kategori);

  return (
    <div className="flex flex-col min-h-full pb-10 px-6 md:px-8 pt-4">
      {/* ─── HEADER SECTION ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200/60">
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
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Riwayat sertifikat penugasan dan tingkatan level keaktifan protokoler.</p>
          </div>
        </div>
      </motion.div>

      {/* ─── Floating Stats Row ─── */}
      <section className="relative z-20 pb-0">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Level Gold", value: goldCount, icon: BadgeCheck, hint: "Kegiatan > 15", color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Level Silver", value: silverCount, icon: BadgeCheck, hint: "Kegiatan 6-15", color: "text-slate-600", bg: "bg-slate-50" },
            { label: "Total Sertifikat", value: totalCount, icon: Award, hint: "Akumulasi jam tugas", color: "text-orange-600", bg: "bg-orange-50" },
          ].map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }}>
              <div className="bg-white border border-slate-200 rounded-[24px] py-6 px-6 flex flex-col justify-between hover:shadow-lg hover:shadow-slate-100 transition-all group relative overflow-hidden h-full shadow-sm">
                <div className="flex items-center justify-between relative z-10">
                  <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                  <div className={cn("flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl transition-colors", stat.bg, stat.color)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 relative z-10">
                  <p className={cn("text-[32px] font-bold leading-tight", stat.color || "text-slate-900")}>{stat.value}</p>
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
      <div className="flex-1 mt-8">
        <section className="pb-12 space-y-6">
          <div className="flex gap-2">
            {(['perak', 'silver', 'gold'] as const).map(k => (
              <button 
                key={k}
                onClick={() => setKategori(k)} 
                className={cn("px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200", kategori === k ? "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-500/20" : "bg-white text-slate-600 border-white shadow-sm hover:text-slate-900 hover:shadow-md")}
              >
                Level {k.charAt(0).toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 bg-white border border-slate-200 rounded-2xl">
              <Loader2 className="h-10 w-10 animate-spin text-orange-600 mb-2" />
              <p className="text-slate-500 text-sm">Memuat sertifikat Anda...</p>
            </div>
          ) : displayedSertifikat.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-16 text-center">
              <Award className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <h3 className="font-bold text-slate-900 text-lg">Belum ada sertifikat level {kategori}</h3>
              <p className="text-slate-500 text-sm mt-1">Sertifikat tingkat ini akan diterbitkan setelah Anda memenuhi kriteria jumlah penugasan.</p>
            </div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={stagger} className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl overflow-hidden">
              <div className="divide-y divide-slate-100">
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
                          <div className="h-12 w-12 flex items-center justify-center shrink-0 rounded-xl bg-orange-50 text-orange-600">
                            <Award className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 text-base group-hover:text-orange-500 transition-colors truncate">Sertifikat Kelulusan Tugas</h3>
                            <p className="text-slate-500 text-sm truncate">{s.kegiatan?.nama_kegiatan || "—"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 md:shrink-0">
                          <span className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border bg-emerald-50 text-emerald-700 border-emerald-200">
                            <BadgeCheck className="h-3 w-3" /> Diterbitkan
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
                            <div className="text-sm font-mono font-bold text-slate-900">{s.nomor_sertifikat}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Kategori Tingkat</div>
                            <div className="text-sm font-bold text-slate-900 uppercase">{s.kategori}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tanggal Terbit</div>
                            <div className="text-sm font-bold text-slate-900">
                              {new Date(s.tanggal_terbit).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                            </div>
                          </div>
                        </div>
                        <a href={`/api/sertifikat/${s.id}/download`} target="_blank" rel="noopener noreferrer">
                          <Button className="rounded-xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm transition-colors gap-2 font-bold">
                            <Download className="h-4 w-4" /> Unduh Sertifikat PDF
                          </Button>
                        </a>
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
