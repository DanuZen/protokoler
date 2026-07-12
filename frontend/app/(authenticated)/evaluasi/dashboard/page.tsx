'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { kegiatanApi, evaluasiApi, testimoniApi } from '@/lib/api';
import { useAuth, useRole } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, BarChart3, CalendarDays, ChevronRight, ChevronDown, Clock, Search, Sparkles, Star, MessageSquare, Users, FileText, Download, CalendarCheck, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type DetailTab = 'evaluasi' | 'testimoni' | 'feedback';

const mockDetail = {
  evaluasi: [
    { nama: 'Budi Santoso', rating: 5, waktu: '2026-05-20 13:20', status: 'Tepat waktu', ringkasan: 'Koordinasi sangat solid dan alur acara lancar.' },
    { nama: 'Siti Nurhaliza', rating: 4, waktu: '2026-05-20 13:45', status: 'Tepat waktu', ringkasan: 'Tata ruang rapi, konsumsi bisa ditingkatkan.' },
    { nama: 'Rizky Pratama', rating: 3, waktu: '2026-05-21 08:00', status: 'Melewati batas', ringkasan: 'Bagian registrasi masih perlu dipercepat.' },
  ],
  testimoni: [
    { nama: 'Tamu Undangan 1', rating: 5, sentimen: 'Positif', isi: 'Acara sangat tertib dan berkelas.' },
    { nama: 'Tamu Undangan 2', rating: 4, sentimen: 'Positif', isi: 'Suasana nyaman dan respons cepat.' },
    { nama: 'Anonim', rating: 3, sentimen: 'Netral', isi: 'Sudah baik, tinggal sedikit penyempurnaan.' },
  ],
  feedback: 'Acara berhasil dengan baik. Fokus berikutnya adalah memperpendek waktu registrasi dan menambah visual signage di area depan venue.',
};

export default function EvaluasiDashboardPage() {
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<DetailTab>('evaluasi');
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [expandedEval, setExpandedEval] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(mockDetail.feedback);

  const { data: kegiatan } = useQuery({
    queryKey: ['evaluasi-dashboard-kegiatan'],
    queryFn: () => kegiatanApi.list(),
  });

  const selesai = useMemo(() => (kegiatan ?? []).filter((item: any) => item.status === 'selesai'), [kegiatan]);
  const filtered = selesai.filter((item: any) => item.nama_kegiatan.toLowerCase().includes(search.toLowerCase()) || item.lokasi.toLowerCase().includes(search.toLowerCase()));
  const selected = filtered.find((item: any) => item.id === selectedId) ?? filtered[0] ?? null;

  const summary = [
    { label: 'Rata-rata rating', value: '4.2', hint: 'Evaluasi protokoler', icon: Star, color: 'text-red-800', bg: 'bg-red-50 border-red-100' },
    { label: 'Total evaluasi', value: '12', hint: 'Masuk dalam batas waktu', icon: ClipboardList, color: 'text-red-800', bg: 'bg-red-50 border-red-100' },
    { label: 'Testimoni tamu', value: '8', hint: 'Sentimen positif dominan', icon: MessageSquare, color: 'text-red-800', bg: 'bg-red-50 border-red-100' },
    { label: 'Kegiatan selesai', value: selesai.length, hint: 'Sumber dashboard', icon: CalendarCheck, color: 'text-red-800', bg: 'bg-red-50 border-red-100' },
  ];

  const activeDetail = selected ?? filtered[0] ?? null;

  const { data: realEvaluasi } = useQuery({
    queryKey: ['evaluasi-kegiatan', activeDetail?.id],
    queryFn: () => evaluasiApi.byKegiatan(activeDetail?.id!),
    enabled: !!activeDetail?.id,
  });

  const { data: realTestimoni } = useQuery({
    queryKey: ['testimoni-kegiatan', activeDetail?.id],
    queryFn: () => testimoniApi.byKegiatan(activeDetail?.id!),
    enabled: !!activeDetail?.id,
  });

  const handleExport = () => toast.success('File ekspor berhasil disiapkan');

  return (
    <div className="flex flex-col h-auto md:h-dvh md:overflow-hidden pb-0 md:pb-6 px-4 md:px-8 pt-4">
      {/* ─── MOBILE COLORED HEADER ─── */}
      <div className="md:hidden -mx-3 -mt-3 mb-0 pb-12 pt-6 px-4 bg-gradient-to-br from-red-800 to-[#5a0000] rounded-b-[1.5rem] relative shadow-lg shrink-0">
        <div className="absolute inset-0 overflow-hidden rounded-b-[1.5rem] pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-48 h-48 rounded-full bg-red-500/20 blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 rounded-full bg-orange-500/10 blur-2xl" />
        </div>

        <div className="flex justify-end items-start relative z-10 mb-4 min-h-[40px]" />

        <div className="relative z-10 text-center flex flex-col items-center">
          <h1 className="font-display text-[26px] font-bold text-white mb-1.5 leading-tight tracking-tight">Evaluasi Kinerja</h1>
          <p className="text-[14px] text-red-100/90 font-medium leading-relaxed max-w-[95%] mx-auto">
            Pantau ulasan, umpan balik, dan sentimen kegiatan.
          </p>
        </div>
      </div>

      {/* ─── DESKTOP HEADER SECTION ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="shrink-0 hidden md:flex flex-row md:items-center justify-between gap-3 md:gap-4 mb-3 pb-3 md:mb-8 md:pb-6 border-b border-slate-200/60 relative z-10">
        <div className="flex items-center gap-3">
          <div className="hidden md:flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-700 to-red-800 shadow-lg shadow-red-700/20 text-white">
            <BarChart3 className="h-6 w-6 md:h-7 md:w-7" />
          </div>
          <div>
            <div className="flex items-center gap-1 md:gap-2 mb-0.5 md:mb-1.5">
              <span className="inline-flex items-center text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-red-800">
                Data Penilaian
              </span>
            </div>
            <h2 className="font-display text-xl md:text-[2.5rem] font-bold tracking-tight leading-none mb-1 md:mb-1.5 text-slate-900 drop-shadow-sm">Transparansi Hasil Evaluasi</h2>
            <p className="text-[11px] md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Pantau ringkasan evaluasi protokoler, testimoni tamu, dan feedback admin.</p>
          </div>
        </div>

      </motion.div>

      {/* ─── Floating Stats Row ─── */}
      <section className="shrink-0 relative z-20 pb-0 md:mt-0 -mt-8">
        <div className="grid grid-cols-2 gap-2 md:gap-4 xl:grid-cols-4">
            {summary.map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }}>
                <div className="bg-white border border-slate-200 rounded-[16px] md:rounded-[24px] p-3 md:py-6 md:px-6 flex flex-col justify-between hover:shadow-lg hover:shadow-slate-100 transition-all group relative h-full shadow-sm">
                  <div className="flex items-start justify-between relative z-10 gap-2">
                    <p className="text-[11px] md:text-sm font-semibold text-slate-500 leading-tight">{stat.label}</p>
                    <div className={cn("flex-shrink-0 h-7 w-7 md:h-10 md:w-10 flex items-center justify-center rounded-lg md:rounded-xl transition-colors border group-hover:opacity-80", stat.bg, stat.color)}>
                      <stat.icon className="h-3.5 w-3.5 md:h-5 md:w-5" />
                    </div>
                  </div>
                  <div className="mt-2 md:mt-4 relative z-10">
                    <p className="text-[22px] md:text-[32px] font-bold leading-tight text-slate-900">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-0.5 md:mt-1.5">
                      <span className="text-[9px] md:text-[11px] font-medium text-slate-400">{stat.hint}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </section>

      {/* ─── BODY CONTENT ─── */}
      <main className="flex-1 min-h-0 flex flex-col mt-4 md:mt-8 overflow-hidden relative z-10">
        <section className="flex-1 flex flex-col min-h-0 pb-2 md:pb-12 pr-0 md:pr-2">
          <div className="flex flex-col xl:grid xl:grid-cols-2 gap-4 md:gap-6 flex-1 min-h-0">
            <div className={cn("w-full min-h-0 flex-col flex-1", showMobileDetail ? "hidden xl:flex" : "flex")}>
              <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0 flex-1 bg-white">
                <CardContent className="p-0 flex flex-col flex-1 min-h-0">
                  <div className="px-3 md:px-8 py-3 md:py-5 bg-slate-50 border-b border-slate-100 flex flex-col lg:flex-row justify-between lg:items-center gap-3 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 bg-white border border-slate-200 text-primary rounded-xl md:rounded-[14px] shadow-sm shrink-0">
                        <ClipboardList className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-[15px] md:text-xl font-bold text-slate-900 leading-tight">Daftar Kegiatan</h2>
                        <p className="text-[11px] md:text-sm text-slate-500 mt-0.5 md:mt-1 line-clamp-1">Filter dan pilih kegiatan yang ingin ditinjau.</p>
                      </div>
                    </div>
                    <div className="relative w-full lg:w-72 shrink-0">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama kegiatan atau lokasi..." className="rounded-xl border-slate-200 bg-white text-slate-900 placeholder-slate-400 pl-9 h-10 shadow-sm text-xs md:text-sm" />
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 bg-white min-h-0">

                    <div className="divide-y divide-slate-100 flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {filtered.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-slate-400 h-full min-h-[200px]">
                        <Sparkles className="mx-auto h-12 w-12 mb-4 text-slate-300" />
                        <h3 className="text-sm font-bold text-slate-700 mb-1">Tidak Ada Kegiatan</h3>
                        <p className="text-xs">Belum ada kegiatan selesai yang cocok dengan pencarian Anda.</p>
                      </div>
                    ) : (
                      filtered.map((item: any) => {
                        const active = activeDetail?.id === item.id;
                        return (
                          <button key={item.id} onClick={() => { setSelectedId(item.id); setShowMobileDetail(true); }} className={cn('w-full text-left px-5 py-4 transition-colors md:border-l-4', active ? 'bg-slate-50 md:border-l-red-700' : 'md:border-l-transparent hover:bg-slate-50')}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className={cn('font-semibold', active ? 'text-slate-900' : 'text-slate-900')}>{item.nama_kegiatan}</div>
                                <div className={cn('mt-1 flex flex-wrap items-center gap-2 md:gap-3 text-[10px] md:text-xs', active ? 'text-slate-600' : 'text-slate-500')}>
                                  <span className="inline-flex items-center gap-1">
                                    <CalendarDays className="h-3 w-3 md:h-3.5 md:w-3.5" /> {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="h-3 w-3 md:h-3.5 md:w-3.5" /> {item.jam_mulai?.slice(0, 5)} WIB
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    <Users className="h-3 w-3 md:h-3.5 md:w-3.5" /> 12 evaluasi
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className={cn('h-4 w-4 shrink-0', active ? 'text-red-700' : 'text-slate-300')} />
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className={cn("w-full min-h-0 flex-col flex-1", showMobileDetail ? "flex" : "hidden xl:flex")}>
                <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0 flex-1 bg-white">
                  <CardContent className="p-0 flex flex-col flex-1 min-h-0">
                    <div className="p-3 md:px-8 md:py-6 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-3 md:gap-4 shrink-0">
                      <div className="flex items-center gap-3 md:gap-4">
                        <button onClick={() => setShowMobileDetail(false)} className="xl:hidden flex items-center justify-center h-10 w-10 bg-white border border-slate-200 text-slate-500 rounded-xl shadow-sm hover:bg-slate-50 active:scale-95 transition-all shrink-0">
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="hidden xl:flex items-center justify-center h-12 w-12 bg-white border border-slate-200 text-primary rounded-[14px] shadow-sm shrink-0">
                          <BarChart3 className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-[15px] md:text-xl font-bold text-slate-900 leading-tight">Detail Hasil Evaluasi</h2>
                          <p className="text-[11px] md:text-sm text-slate-500 mt-0.5 md:mt-1 line-clamp-1">Ringkasan evaluasi, testimoni, dan feedback admin.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {activeDetail && (
                          <Button onClick={handleExport} size="sm" className="h-9 md:h-10 rounded-xl bg-[#6B0000] text-white hover:bg-[#4A0000] text-[11px] md:text-[13px] font-bold px-3 md:px-4 shadow-sm transition-colors w-full md:w-auto">
                            <Download className="mr-1.5 h-3.5 w-3.5 md:h-4 md:w-4" /> Export Data
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="p-3 md:p-6 flex flex-col flex-1 min-h-0 space-y-3 md:space-y-4">

                    {activeDetail ? (
                      <>
                        <div className="grid grid-cols-3 gap-1.5 md:gap-2 shrink-0">
                          {[
                            { key: 'evaluasi', label: 'Evaluasi' },
                            { key: 'testimoni', label: 'Testimoni' },
                            { key: 'feedback', label: 'Feedback' },
                          ].map((item) => {
                            const active = tab === item.key;
                            return (
                              <button
                                key={item.key}
                                onClick={() => setTab(item.key as DetailTab)}
                                className={cn(
                                  'border px-3 py-2 text-sm transition-all rounded-xl font-bold',
                                  active ? 'bg-red-800 border-red-800 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50',
                                )}
                              >
                                {item.label}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex-1 flex flex-col overflow-y-auto min-h-0 pr-1 pt-2 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {tab === 'evaluasi' && (
                          <>
                              {!realEvaluasi || realEvaluasi.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-center h-full flex-1 w-full">
                                  <ClipboardList className="h-12 w-12 text-slate-300 mb-3" />
                                  <p className="text-[13px] font-medium text-slate-500">Belum ada evaluasi dari protokoler.</p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {realEvaluasi.map((item: any) => (
                                    <div key={item.id} className="border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
                                      <div 
                                        className="flex items-start justify-between gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                                        onClick={() => setExpandedEval(expandedEval === item.id ? null : item.id)}
                                      >
                                        <div>
                                          <div className="font-semibold text-slate-800">{item.protokoler?.nama_lengkap}</div>
                                          <div className="flex items-center gap-2 text-xs mt-1">
                                            <span className="text-slate-500">
                                              {new Date(item.waktu_pengisian).toLocaleString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':')}
                                            </span>
                                            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                            <span className={cn("font-medium", item.dalam_batas_waktu ? 'text-emerald-600' : 'text-red-800')}>{item.dalam_batas_waktu ? "Tepat waktu" : "Melewati batas"}</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                          <div className="flex items-center gap-1 text-amber-500">
                                            {[...Array(5)].map((_, index) => (
                                              <Star key={index} className={cn("h-3.5 w-3.5", index < item.rating_kegiatan ? "fill-current" : "text-slate-200")} />
                                            ))}
                                          </div>
                                          <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", expandedEval === item.id && "rotate-180")} />
                                        </div>
                                      </div>
                                      <AnimatePresence>
                                        {expandedEval === item.id && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="px-4 pb-4 border-t border-slate-100 bg-slate-50/50"
                                          >
                                            <div className="mt-3 space-y-3 overflow-hidden">
                                              <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Evaluasi Diri</span>
                                                <p className="mt-1 text-[13px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed font-medium">
                                                  {item.refleksi_diri || "-"}
                                                </p>
                                              </div>
                                              {item.kendala && (
                                                <div>
                                                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">Kendala Lapangan</span>
                                                  <p className="mt-1 text-[13px] text-slate-600 bg-red-50/50 p-2.5 rounded-lg border border-red-100/50 leading-relaxed font-medium">
                                                    {item.kendala}
                                                  </p>
                                                </div>
                                              )}
                                              <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Saran & Masukan</span>
                                                <p className="mt-1 text-[13px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed font-medium">
                                                  {item.saran || "-"}
                                                </p>
                                              </div>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </>
                        )}

                        {tab === 'testimoni' && (
                          <>
                            {!realTestimoni || realTestimoni.length === 0 ? (
                              <div className="flex flex-col items-center justify-center p-12 text-center h-full flex-1 w-full">
                                <MessageSquare className="h-12 w-12 text-slate-300 mb-3" />
                                <p className="text-[13px] font-medium text-slate-500">Belum ada testimoni dari tamu.</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {realTestimoni.map((item: any) => (
                                  <div key={item.id} className="border border-slate-200 bg-white p-4 rounded-xl shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                                          {item.nama_tamu}
                                          <span className={cn(
                                            "text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border",
                                            item.tipe_tamu === 'eksternal' 
                                              ? "bg-blue-50 text-blue-700 border-blue-200" 
                                              : "bg-purple-50 text-purple-700 border-purple-200"
                                          )}>
                                            {item.tipe_tamu || "internal"}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs mt-1">
                                          <span className="text-slate-500">{item.jabatan_tamu || "Tamu Undangan"}</span>
                                          <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                          <span className={cn("font-medium", item.rating >= 4 ? 'text-emerald-600' : 'text-slate-500')}>{item.rating >= 4 ? "Positif" : "Netral"}</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 text-amber-500 shrink-0">
                                        {[...Array(5)].map((_, index) => (
                                          <Star key={index} className={cn("h-3.5 w-3.5", index < item.rating ? "fill-current" : "text-slate-200")} />
                                        ))}
                                      </div>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">{item.isi_testimoni}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}

                        {tab === 'feedback' && (
                          <div className="space-y-3 flex flex-col flex-1">
                            <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Catatan Admin</div>
                            <div className="flex-1 min-h-[160px] rounded-xl border border-slate-200 bg-slate-50 p-5 flex flex-col justify-start">
                              {activeDetail?.feedback_admin ? (
                                <p className="text-[13px] leading-relaxed text-slate-700 w-full h-full whitespace-pre-wrap font-medium">
                                  {activeDetail.feedback_admin}
                                </p>
                              ) : (
                                <div className="text-center my-auto">
                                  <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                  <p className="text-[13px] text-slate-400">Belum ada catatan atau umpan balik dari pimpinan untuk kegiatan ini.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-slate-400 h-full">
                        <BarChart3 className="mx-auto h-12 w-12 mb-4 text-slate-300" />
                        <h3 className="text-sm font-bold text-slate-700 mb-1">Belum Ada Pilihan</h3>
                        <p className="text-xs">Pilih salah satu kegiatan selesai di daftar sebelah kiri untuk melihat hasil evaluasi.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>
    </div>
  );
}
