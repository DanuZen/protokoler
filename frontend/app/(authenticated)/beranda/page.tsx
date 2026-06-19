"use client";
import { useQuery } from "@tanstack/react-query";
import { useAuth, useRole } from "@/hooks/use-auth";
import { protokolerApi, kegiatanApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, MapPin, Clock, Trophy, Star, Medal, CheckCircle2, AlertCircle, ShieldCheck, Info, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const GAMIFICATION = [
  { level: "Perak", min: 1, max: 9, color: "from-slate-400 to-slate-600", textColor: "text-white", icon: "🥈" },
  { level: "Silver", min: 10, max: 19, color: "from-zinc-500 to-zinc-700", textColor: "text-white", icon: "🥇" },
  { level: "Gold", min: 20, max: Infinity, color: "from-yellow-400 to-amber-600", textColor: "text-white", icon: "🏆" },
];

function getNextLevel(total: number) {
  if (total < 10) return { next: "Silver", remaining: 10 - total, target: 10 };
  if (total < 20) return { next: "Gold", remaining: 20 - total, target: 20 };
  return { next: null, remaining: 0, target: total };
}

export default function BerandaPage() {
  const { user } = useAuth();
  const { data: role } = useRole(user);

  const { data: protokoler } = useQuery({
    queryKey: ["protokoler-me"],
    queryFn: () => protokolerApi.list().then((list: any[]) =>
      list.find((p: any) => p.user_id === user?.id) ?? null
    ),
    enabled: !!user,
  });

  const { data: kegiatan } = useQuery({
    queryKey: ["kegiatan-publik"],
    queryFn: () => kegiatanApi.list({ status: "publik" }),
  });

  const total = protokoler?.total_kegiatan ?? 0;
  const kategori = protokoler?.kategori_sertifikat ?? null;
  const { next, remaining, target } = getNextLevel(total);
  const progress = target > 0 ? Math.min(100, Math.round((total / target) * 100)) : 100;
  const recentKegiatan = (kegiatan ?? []).slice(0, 3);

  const displayName = protokoler?.nama_lengkap || user?.user_metadata?.nama_lengkap || user?.email?.split('@')[0] || 'Protokoler';

  return (
    <div className="flex flex-col min-h-full pb-10 px-6 md:px-8 pt-4">
      
      {/* ─── HEADER SECTION ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-200/60">
        {/* Left: Title & Description */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-700 to-red-800 shadow-lg shadow-red-700/20 text-white">
            <Trophy className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-red-800">
                Dashboard Anggota
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 text-slate-900 drop-shadow-sm">Selamat Datang, {displayName}</h1>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">{protokoler?.prodi ? `${protokoler.prodi} · Unit Protokoler UNP` : "Anggota aktif unit keprotokolan Universitas Negeri Padang."}</p>
          </div>
        </div>

        {/* Right: Premium Badges */}
        <div className="flex flex-col gap-2 md:items-end">
          {/* Level Badge */}
          {kategori ? (
            <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${
              kategori === 'gold' ? 'bg-red-50 border-red-200 text-red-800' :
              kategori === 'silver' ? 'bg-slate-100 border-slate-200 text-slate-600' :
              'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              {kategori === 'gold' ? <Trophy className="h-4 w-4" /> : <Medal className="h-4 w-4" />}
              <span className="text-xs font-bold uppercase tracking-widest">{kategori.charAt(0).toUpperCase() + kategori.slice(1)}</span>
            </div>
          ) : null}

          {/* Status Badge */}
          {(() => {
            const s = (protokoler?.status_akun ?? 'pending').toLowerCase();
            const isAktif = s === 'aktif';
            const isPending = s === 'pending';
            return (
              <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${
                isAktif  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                isPending ? 'bg-amber-50 border-amber-200 text-amber-600' :
                            'bg-red-50 border-red-200 text-red-600'
              }`}>
                {isAktif ? <CheckCircle2 className="h-4 w-4" /> :
                 isPending ? <AlertCircle className="h-4 w-4" /> :
                             <ShieldCheck className="h-4 w-4" />}
                <span className="text-xs font-bold uppercase tracking-widest capitalize">{s}</span>
              </div>
            );
          })()}
        </div>
      </motion.div>

      {/* ─── FLOATING STATS ─── */}
      <section className="relative z-20 pb-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { 
              label: "Total Kegiatan", 
              value: total, 
              hint: "Total penugasan aktif & selesai", 
              trend: "+12%", 
              isUp: true,
              chart: (
                <div className="flex items-end gap-1 h-10 mt-2">
                  {[40, 70, 45, 90].map((h, i) => (
                    <div key={i} className="w-4 bg-red-700 rounded-sm transition-all hover:opacity-80" style={{ height: `${h}%` }} />
                  ))}
                </div>
              )
            },
            { 
              label: "Sertifikat", 
              value: total, 
              hint: "Sertifikat berhasil diklaim", 
              trend: "+5%", 
              isUp: true,
              chart: (
                <div className="w-16 h-10 mt-2 relative overflow-hidden">
                  <svg viewBox="0 0 100 40" className="w-full h-full stroke-emerald-500 fill-none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5,30 L25,15 L45,25 L70,5 L95,15" />
                  </svg>
                </div>
              )
            },
            { 
              label: "Level Saat Ini", 
              value: kategori ? kategori.toUpperCase() : "–", 
              hint: "Peringkat protokoler", 
              trend: "+1", 
              isUp: true,
              chart: (
                <div className="w-10 h-10 mt-2 rounded-full border-4 border-amber-500/20 border-r-amber-500 border-t-amber-500 rotate-45" />
              )
            },
          ].map((s, index) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }}>
              <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-6 flex flex-col justify-between hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 h-full">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="text-sm font-semibold">{s.label}</span>
                      <Info className="h-3.5 w-3.5 opacity-60" />
                    </div>
                    <div className={cn("px-2 py-0.5 rounded-md text-[11px] font-bold", s.isUp ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                      {s.trend}
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[32px] font-bold text-slate-900 leading-none mb-1">{s.value}</div>
                      <div className="text-[11px] font-medium text-slate-400">{s.hint}</div>
                    </div>
                    {s.chart}
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button className="w-full flex items-center justify-center gap-2 text-[13px] font-bold text-slate-600 hover:text-slate-900 transition-colors">
                    Lihat Detail <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── BODY CONTENT ─── */}
      <div className="flex-1 mt-8">
        <section className="pb-12">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Gamification Progress Card */}
            {protokoler?.status_akun === "aktif" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="xl:col-span-5">
                <Card className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl h-full flex flex-col relative overflow-hidden">
                  <div className="border-b border-slate-100 px-6 py-4 bg-slate-50 rounded-t-[24px]">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-10 w-10 bg-white text-slate-600 rounded-xl border border-slate-200">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Pencapaian</h2>
                        <p className="text-[11px] text-slate-500 mt-0.5">Pantau target sertifikat Anda.</p>
                      </div>
                    </div>
                  </div>

                  <CardContent className="pt-6 flex-1 flex flex-col">
                    {next ? (
                      <div className="mb-6">
                        <p className="text-sm text-slate-600 mb-3">Butuh <span className="font-bold text-slate-900">{remaining} kegiatan</span> lagi untuk mencapai level <strong className="text-red-800">{next}</strong></p>
                        <div className="w-full h-3 bg-slate-100 border border-slate-200 overflow-hidden rounded-xl relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="absolute top-0 bottom-0 left-0 bg-red-700"
                          />
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="text-xs font-bold text-slate-500">{total} / {target} Kegiatan</span>
                          <span className="text-xs font-bold text-red-800">{progress}%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 mb-6 bg-yellow-50 border border-yellow-200 p-4">
                        <span className="text-3xl">🏆</span>
                        <p className="text-sm font-bold text-yellow-800 leading-relaxed">Selamat! Anda telah menyelesaikan seluruh target kegiatan dan mencapai level <strong>Gold</strong>!</p>
                      </div>
                    )}

                    <div className="flex gap-3 mt-auto">
                      {GAMIFICATION.map(g => (
                        <div key={g.level} className={`flex flex-col items-center justify-center flex-1 py-3 px-2 text-center border transition-colors rounded-xl ${kategori === g.level.toLowerCase() ? "border-red-700 bg-red-700 text-white shadow-md" : "border-slate-200 text-slate-500 bg-slate-50"}`}>
                          <div className="text-xl mb-1.5">{g.icon}</div>
                          <div className="text-[11px] font-bold uppercase tracking-wider">{g.level}</div>
                          <div className="text-[10px] font-medium mt-1 opacity-80">{g.min === 20 ? "≥20" : `${g.min}–${g.max}`} keg.</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Kegiatan Tersedia */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`space-y-4 ${protokoler?.status_akun === 'aktif' ? 'xl:col-span-7' : 'xl:col-span-12'}`}>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h2 className=" text-xl font-bold text-slate-800">Kegiatan Terbaru</h2>
                  <p className="text-sm text-slate-500 mt-1">Kegiatan yang baru saja diterbitkan.</p>
                </div>
                <Link href="/kegiatan">
                  <Button variant="outline" className="rounded-xl border-slate-300 text-slate-700 font-bold bg-white hover:bg-white/50 hover:text-slate-800">
                    Semua Kegiatan <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {recentKegiatan.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-10 text-center text-slate-400">
                  <Calendar className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                  <p className="font-medium text-sm">Belum ada kegiatan yang tersedia saat ini.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentKegiatan.map((k: any) => (
                    <Link key={k.id} href={`/kegiatan/${k.id}`} className="block">
                      <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-5 hover:shadow-xl hover:shadow-red-50/80 transition-all group relative">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-600 bg-slate-100 uppercase tracking-wider">{k.bentuk_kegiatan?.replace(/_/g, " ")}</span>
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg group-hover:text-red-700 transition-colors line-clamp-1">{k.nama_kegiatan}</h3>
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-medium text-slate-500">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                {new Date(k.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                {k.jam_mulai?.slice(0, 5)} WIB
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                <span className="line-clamp-1">{k.lokasi}</span>
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-red-50 transition-colors border border-slate-200 group-hover:border-red-200">
                            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-red-700" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
