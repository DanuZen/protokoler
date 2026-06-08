"use client";
import { useQuery } from "@tanstack/react-query";
import { useAuth, useRole } from "@/hooks/use-auth";
import { protokolerApi, kegiatanApi } from "@/lib/api";
import { BadgeKategori } from "@/components/BadgeKategori";
import { BadgeStatus } from "@/components/BadgeStatus";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, MapPin, Clock, Trophy, Star } from "lucide-react";
import Link from "next/link";

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

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      
      {/* Hero Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-slate-900 text-white p-8">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="relative z-10">
          <p className="text-slate-400 text-sm font-medium mb-1">Selamat datang kembali 👋</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">{protokoler?.nama_lengkap ?? "Protokoler"}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <BadgeKategori kategori={kategori} />
            <BadgeStatus status={protokoler?.status_akun ?? "pending"} />
            <span className="text-slate-400 text-sm">{protokoler?.prodi ?? ""}</span>
          </div>
        </div>
      </motion.div>

      {/* Gamification Progress Card */}
      {protokoler?.status_akun === "aktif" && (
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Pencapaian Sertifikat
                  </div>
                  <span className="text-sm font-bold text-slate-500">{total} kegiatan</span>
                </div>

                {next ? (
                  <>
                    <p className="text-xs text-slate-500 mb-3">Butuh <strong>{remaining} kegiatan</strong> lagi untuk mencapai level <strong>{next}</strong></p>
                    <div className="w-full h-3 bg-slate-100 border border-slate-200 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-slate-700 to-slate-900"
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-slate-400">{total} / {target}</span>
                      <span className="text-[10px] text-slate-400">{progress}%</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3 mt-3 bg-yellow-50 border border-yellow-200 p-3">
                    <span className="text-2xl">🏆</span>
                    <p className="text-sm font-bold text-yellow-800">Selamat! Anda telah mencapai level Gold!</p>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  {GAMIFICATION.map(g => (
                    <div key={g.level} className={`flex-1 p-2 text-center text-xs font-bold border ${kategori === g.level.toLowerCase() ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-400 bg-slate-50"}`}>
                      <div className="text-lg mb-0.5">{g.icon}</div>
                      {g.level}
                      <div className="text-[10px] font-normal mt-0.5">{g.min === 20 ? "≥20" : `${g.min}–${g.max}`} keg.</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Kegiatan Tersedia */}
      <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-display text-xl font-bold text-slate-900">Kegiatan Tersedia</h2>
          <Link href="/kegiatan">
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 -mr-2">
              Lihat Semua <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        {recentKegiatan.length === 0 ? (
          <Card><CardContent className="pt-6 text-center text-slate-400 py-10">
            <Calendar className="h-10 w-10 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Belum ada kegiatan yang tersedia saat ini.</p>
          </CardContent></Card>
        ) : (
          recentKegiatan.map((k: any) => (
            <motion.div key={k.id} variants={fadeUp}>
              <Link href={`/kegiatan/${k.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{k.bentuk_kegiatan?.replace(/_/g, " ")}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors">{k.nama_kegiatan}</h3>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(k.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {k.jam_mulai?.slice(0, 5)} WIB
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {k.lokasi}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-600 mt-1 shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Quick Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Kegiatan", value: total, icon: Star },
            { label: "Sertifikat", value: total, icon: Trophy },
            { label: "Level", value: kategori ? kategori.toUpperCase() : "–", icon: Star },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="pt-4 pb-4 text-center">
                <div className="text-2xl font-display font-bold text-slate-900">{s.value}</div>
                <div className="text-xs text-slate-400 font-semibold mt-1">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
