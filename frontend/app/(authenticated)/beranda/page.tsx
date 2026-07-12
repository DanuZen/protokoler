"use client";
import { useQuery } from "@tanstack/react-query";
import { useAuth, useRole } from "@/hooks/use-auth";
import { protokolerApi, kegiatanApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, MapPin, Clock, Trophy, Star, Medal, Award, CheckCircle2, AlertCircle, ShieldCheck, Info, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ViewportFitGrid } from "@/components/ViewportFitGrid";

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const GAMIFICATION = [
  { level: "Perak", min: 1, max: 9, icon: Medal, color: "text-slate-500", bg: "bg-slate-100", activeBg: "bg-slate-600 text-white", border: "border-slate-200" },
  { level: "Silver", min: 10, max: 19, icon: Award, color: "text-slate-400", bg: "bg-slate-100", activeBg: "bg-slate-700 text-white", border: "border-slate-200" },
  { level: "Gold", min: 20, max: Infinity, icon: Trophy, color: "text-amber-500", bg: "bg-amber-50", activeBg: "bg-amber-500 text-white", border: "border-amber-200" },
];

function getNextLevel(total: number) {
  if (total < 10) return { next: "Silver", remaining: 10 - total, target: 10 };
  if (total < 20) return { next: "Gold", remaining: 20 - total, target: 20 };
  return { next: null, remaining: 0, target: total };
}

export default function BerandaPage() {
  const { user } = useAuth();
  const { data: role } = useRole(user);

  const { data: protokoler, isLoading: protokolerLoading } = useQuery({
    queryKey: ["protokoler-me"],
    queryFn: () => protokolerApi.me(),
    enabled: !!user,
    retry: false, // Jangan retry jika 403
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
    <div className="flex flex-col h-auto md:h-dvh md:overflow-hidden pb-0 md:pb-6 px-4 pt-4 md:px-8 md:pt-4">
      
      {/* ─── MOBILE COLORED HEADER ─── */}
      <div className="md:hidden -mx-4 -mt-4 mb-0 pb-12 pt-6 px-5 bg-gradient-to-br from-red-800 to-[#5a0000] rounded-b-[1.5rem] relative shadow-lg shrink-0">
        <div className="absolute inset-0 overflow-hidden rounded-b-[1.5rem] pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-48 h-48 rounded-full bg-red-500/20 blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 rounded-full bg-orange-500/10 blur-2xl" />
        </div>

        <div className="flex justify-end items-start relative z-10 mb-4 min-h-[40px]">
        </div>

        <div className="relative z-10 text-center flex flex-col items-center">
          <h1 className="font-display text-[26px] font-bold text-white mb-1.5 leading-tight tracking-tight">Hai, {displayName}</h1>
          <div className="text-[14px] text-red-100/90 font-medium leading-relaxed max-w-[95%] mx-auto">
            <span className="block mb-0.5">{total > 0 ? `Anda telah menyelesaikan ${total} penugasan.` : "Belum ada penugasan selesai."}</span>
            {next ? <span className="block">{remaining} penugasan lagi menuju level {next}.</span> : null}
          </div>
        </div>
      </div>

      {/* ─── DESKTOP HEADER SECTION ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="shrink-0 relative z-10 hidden md:flex flex-row items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-200/60">
        {/* Left: Title & Description */}
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-red-700 to-red-800 shadow-lg shadow-red-700/20 text-white">
            <Trophy className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-red-800">
                Dashboard Anggota
              </span>
            </div>
            <h1 className="font-display text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 text-slate-900 drop-shadow-sm">Selamat Datang, {displayName}</h1>
            <p className="text-base text-slate-500 font-medium max-w-xl leading-relaxed">{protokoler?.prodi ? `${protokoler.prodi} · Unit Protokoler UNP` : "Anggota aktif unit keprotokolan Universitas Negeri Padang."}</p>
          </div>
        </div>

        {/* Right: Premium Badges */}
        <div className="flex flex-row items-center gap-3">
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
      <section className="shrink-0 relative z-20 pb-0 md:mt-0 -mt-8">
        <div className="grid grid-cols-2 gap-3 md:gap-5 md:grid-cols-3">
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
              hiddenClass: "hidden md:block",
              chart: (
                <div className="w-10 h-10 mt-2 rounded-full border-4 border-amber-500/20 border-r-amber-500 border-t-amber-500 rotate-45" />
              )
            },
          ].map((s, index) => (
            <motion.div key={s.label} className={s.hiddenClass || ""} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }}>
              <div className="bg-white border border-slate-100 shadow-sm rounded-2xl md:rounded-[24px] p-3.5 md:p-6 flex flex-col justify-between hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 h-full">
                <div>
                  <div className="flex items-center justify-between mb-2 md:mb-4">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="text-[11px] md:text-sm font-semibold leading-tight">{s.label}</span>
                    </div>
                    <div className={cn("px-1.5 md:px-2 py-0.5 rounded-md text-[9px] md:text-[11px] font-bold", s.isUp ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                      {s.trend}
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-2xl md:text-[32px] font-bold text-slate-900 leading-none mb-1">{s.value}</div>
                      <div className="text-[9px] md:text-[11px] font-medium text-slate-400 max-w-[80%]">{s.hint}</div>
                    </div>
                    <div className="hidden md:block">{s.chart}</div>
                  </div>
                </div>
                
                <div className="mt-3 md:mt-6 pt-3 md:pt-4 border-t border-slate-100">
                  <button className="w-full flex items-center justify-center gap-1.5 md:gap-2 text-[11px] md:text-[13px] font-bold text-slate-600 hover:text-slate-900 transition-colors">
                    Lihat Detail <ArrowRight className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── BODY CONTENT ─── */}
      <main className="flex-1 min-h-0 mt-4 md:mt-8 relative overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 w-full overflow-y-auto md:absolute md:inset-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col">
          <ViewportFitGrid gridTemplateColumns="none" gap={0} outerClassName="flex-1 flex flex-col min-h-0" className="w-full flex-1 min-h-0">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8 w-full flex-1 pb-2 md:pb-12 pr-0 md:pr-2">
            {/* Gamification Progress Card */}
            {(protokolerLoading || protokoler?.status_akun === "aktif") && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="xl:col-span-5 flex-1 flex flex-col">
                <Card className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[24px] overflow-hidden flex-1 flex flex-col relative shrink-0">
                  <div className="px-5 md:px-8 py-4 md:py-5 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-3 md:gap-4 shrink-0 rounded-t-[24px]">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 bg-white border border-slate-200 text-primary rounded-xl shadow-sm shrink-0">
                        <Trophy className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">Pencapaian</h2>
                        <p className="text-[11px] md:text-sm text-slate-500 mt-0.5 line-clamp-1">Pantau target sertifikat Anda.</p>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-5 md:p-8 flex-1 flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                      {next ? (
                        <div className="mb-6 md:mb-10 text-center">
                          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-red-50 text-red-700 mb-3 md:mb-4 shadow-inner border border-red-100">
                            <Trophy className="h-6 w-6 md:h-8 md:w-8" />
                          </div>
                          <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1 md:mb-2">Menuju Level {next}</h3>
                          <p className="text-[11px] md:text-sm text-slate-600 mb-4 md:mb-6">Butuh <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{remaining} kegiatan</span> lagi.</p>
                          
                          <div className="relative">
                            <div className="flex justify-between mb-1.5 px-1">
                              <span className="text-[10px] md:text-xs font-bold text-slate-500 tracking-wider uppercase">Progres Anda</span>
                              <span className="text-[10px] md:text-xs font-bold text-red-700">{total} / {target}</span>
                            </div>
                            <div className="w-full h-3 md:h-4 bg-slate-100 border border-slate-200/60 overflow-hidden rounded-full relative shadow-inner">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-red-600 to-red-500 rounded-full"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center mb-10 bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/60 rounded-3xl p-8 shadow-sm">
                          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500 text-white mb-5 shadow-lg shadow-amber-500/30 border-4 border-white">
                            <Trophy className="h-10 w-10" />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 md:gap-3">
                        {GAMIFICATION.map((g) => {
                          const isActive = kategori === g.level.toLowerCase();
                          const Icon = g.icon;
                          return (
                            <div key={g.level} className={`flex flex-col items-center justify-center py-3 px-2 md:py-4 md:px-2 text-center border transition-all duration-300 rounded-[16px] md:rounded-2xl ${isActive ? g.activeBg + ' shadow-md scale-105 border-transparent z-10' : 'bg-white ' + g.border}`}>
                              <div className={`mb-1.5 md:mb-2.5 p-1.5 md:p-2 rounded-full ${isActive ? 'bg-white/20 text-white' : g.bg + ' ' + g.color}`}>
                                <Icon className="h-3.5 w-3.5 md:h-5 md:w-5" />
                              </div>
                              <div className={`text-[10px] md:text-[11px] font-bold uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-700'}`}>{g.level}</div>
                              <div className={`text-[9px] md:text-[10px] font-medium mt-0.5 md:mt-1 ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                                {g.min === 20 ? "≥20" : `${g.min}–${g.max}`} keg.
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Kegiatan Tersedia */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`hidden md:flex flex-col md:h-full ${(protokolerLoading || protokoler?.status_akun === 'aktif') ? 'xl:col-span-7' : 'xl:col-span-12'}`}>
              <Card className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[24px] md:h-full flex flex-col relative overflow-hidden">
                <div className="px-5 md:px-8 py-4 md:py-5 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-3 md:gap-4 shrink-0 rounded-t-[24px]">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 bg-white border border-slate-200 text-primary rounded-xl shadow-sm shrink-0">
                      <Calendar className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">Kegiatan Terbaru</h2>
                      <p className="text-[11px] md:text-sm text-slate-500 mt-0.5 line-clamp-1">Kegiatan yang baru saja diterbitkan.</p>
                    </div>
                  </div>
                  <Link href="/kegiatan">
                    <Button variant="outline" className="rounded-xl border-slate-300 text-slate-700 font-bold bg-white hover:bg-slate-100 hover:text-slate-800 h-9 px-3 md:h-10 md:px-4 text-[13px] md:text-sm">
                      Semua Kegiatan <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>

                <CardContent className="p-5 md:p-6 flex-1 flex flex-col overflow-y-auto">
                  {recentKegiatan.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 text-center text-slate-400 p-6 md:p-10 h-full">
                      <Calendar className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-slate-300" />
                      <h3 className="text-[13px] md:text-sm font-bold text-slate-700 mb-1">Tidak Ada Kegiatan</h3>
                      <p className="text-[11px] md:text-xs">Belum ada kegiatan terbaru yang tersedia saat ini.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentKegiatan.map((k: any) => (
                        <Link key={k.id} href={`/kegiatan/${k.id}`} className="block">
                          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 md:p-5 hover:shadow-md hover:border-red-200 transition-all group relative">
                            <div className="flex justify-between items-start gap-3 md:gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] md:text-[10px] font-bold text-slate-600 bg-slate-100 uppercase tracking-wider">{k.bentuk_kegiatan?.replace(/_/g, " ")}</span>
                                </div>
                                <h3 className="font-bold text-slate-900 text-[15px] md:text-lg group-hover:text-red-700 transition-colors line-clamp-1">{k.nama_kegiatan}</h3>
                                <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-2 md:mt-3 text-[11px] md:text-xs font-medium text-slate-500">
                                  <span className="flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3 md:h-3.5 md:w-3.5 text-slate-400" />
                                    {new Date(k.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <Clock className="h-3 w-3 md:h-3.5 md:w-3.5 text-slate-400" />
                                    {k.jam_mulai?.slice(0, 5)} WIB
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <MapPin className="h-3 w-3 md:h-3.5 md:w-3.5 text-slate-400" />
                                    <span className="line-clamp-1">{k.lokasi}</span>
                                  </span>
                                </div>
                              </div>
                              <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-red-50 transition-colors border border-slate-200 group-hover:border-red-200">
                                <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-slate-400 group-hover:text-red-700" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </ViewportFitGrid>
        </div>
      </main>
    </div>
  );
}
