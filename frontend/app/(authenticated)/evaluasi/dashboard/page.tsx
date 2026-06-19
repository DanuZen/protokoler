'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { kegiatanApi } from '@/lib/api';
import { useAuth, useRole } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, BarChart3, CalendarDays, ChevronRight, Clock, Search, Sparkles, Star, MessageSquare, Users, FileText, Download, CalendarCheck, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
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
  const [mobileTab, setMobileTab] = useState<'list' | 'detail'>('list');
  const [tab, setTab] = useState<DetailTab>('evaluasi');
  const [feedback, setFeedback] = useState(mockDetail.feedback);

  const { data: kegiatan } = useQuery({
    queryKey: ['evaluasi-dashboard-kegiatan'],
    queryFn: () => kegiatanApi.list(),
  });

  const selesai = useMemo(() => (kegiatan ?? []).filter((item: any) => item.status === 'selesai'), [kegiatan]);
  const filtered = selesai.filter((item: any) => item.nama_kegiatan.toLowerCase().includes(search.toLowerCase()) || item.lokasi.toLowerCase().includes(search.toLowerCase()));
  const selected = filtered.find((item: any) => item.id === selectedId) ?? filtered[0] ?? null;

  const summary = [
    { label: 'Rata-rata rating', value: '4.2', hint: 'Evaluasi protokoler', icon: Star, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
    { label: 'Total evaluasi', value: '12', hint: 'Masuk dalam batas waktu', icon: ClipboardList, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
    { label: 'Testimoni tamu', value: '8', hint: 'Sentimen positif dominan', icon: MessageSquare, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
    { label: 'Kegiatan selesai', value: selesai.length, hint: 'Sumber dashboard', icon: CalendarCheck, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
  ];

  const activeDetail = selected ?? filtered[0] ?? null;

  const handleExport = () => toast.success('File ekspor berhasil disiapkan');

  return (
    <div className="flex-1 flex flex-col min-h-0 pb-6 px-6 md:px-8 pt-4">
      {/* ─── HEADER SECTION (Adapted Layout) ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-8 pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
              Data Penilaian
            </span>
          </div>
          <h2 className="font-display text-[28px] md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 md:mb-2 text-slate-900 drop-shadow-sm">Transparansi Hasil Evaluasi</h2>
          <p className="text-[13px] md:text-base text-slate-600 font-medium max-w-xl">
            Pantau ringkasan evaluasi protokoler, testimoni tamu, dan feedback admin.
          </p>
        </div>
      </motion.div>

      {/* ─── Floating Stats Row ─── */}
      <section className="relative z-20 pb-0 shrink-0 mb-6 md:mb-8">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
            {summary.map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }}>
                <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-4 md:p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-orange-50/80 transition-all group relative overflow-hidden h-full">
                  <div className="flex items-center justify-between relative z-10 mb-2 md:mb-0">
                    <p className="text-xs md:text-sm font-semibold text-slate-500 truncate pr-2">{stat.label}</p>
                    <div className={cn("flex-shrink-0 h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-xl transition-colors border group-hover:opacity-80", stat.bg, stat.color)}>
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
      <div className="flex-1 flex flex-col min-h-0 mt-8 pb-4">
        {/* ─── Mobile View Toggle ─── */}
        <div className="xl:hidden flex bg-slate-100/80 p-1.5 rounded-xl mb-4 shrink-0 border border-slate-200/50">
          <button
            onClick={() => setMobileTab('list')}
            className={cn("flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-all", mobileTab === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700')}
          >
            Daftar Kegiatan
          </button>
          <button
            onClick={() => setMobileTab('detail')}
            className={cn("flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-all", mobileTab === 'detail' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700')}
          >
            Detail Evaluasi
          </button>
        </div>

        <section className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch pb-0">
          <div className={cn("w-full flex-col min-h-0", mobileTab === 'list' ? 'flex' : 'hidden xl:flex')}>
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl overflow-hidden flex-1 flex flex-col min-h-0">
              <div className="p-0 flex flex-col flex-1 min-h-0">
                <div className="shrink-0 border-b border-slate-100 px-6 py-4 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 bg-white text-[#5b1511] rounded-xl border border-slate-100 shadow-sm">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Daftar Kegiatan</h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">Filter dan pilih kegiatan yang ingin ditinjau.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col flex-1 bg-white min-h-0">
                  <div className="p-4 border-b border-slate-100 bg-white">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama kegiatan atau lokasi..." className="rounded-xl border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 pl-9 h-11" />
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 flex-1 overflow-y-auto min-h-0">
                    {filtered.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-10 text-center text-slate-400">
                      <Sparkles className="mx-auto h-10 w-10 mb-3 text-slate-300 opacity-50" />
                      Belum ada kegiatan selesai yang cocok dengan pencarian.
                    </div>
                  ) : (
                    filtered.map((item: any) => {
                      const active = activeDetail?.id === item.id;
                      return (
                        <button key={item.id} onClick={() => { setSelectedId(item.id); setMobileTab('detail'); }} className={cn('w-full text-left px-5 py-4 transition-colors border-l-4', active ? 'bg-slate-50 border-[#5b1511]' : 'border-transparent hover:bg-slate-50')}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className={cn('font-semibold', active ? 'text-slate-900' : 'text-slate-900')}>{item.nama_kegiatan}</div>
                              <div className={cn('mt-1 flex flex-wrap items-center gap-3 text-xs', active ? 'text-slate-600' : 'text-slate-500')}>
                                <span className="inline-flex items-center gap-1">
                                  <CalendarDays className="h-3.5 w-3.5" /> {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" /> {item.jam_mulai?.slice(0, 5)} WIB
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Users className="h-3.5 w-3.5" /> 12 evaluasi
                                </span>
                              </div>
                            </div>
                            <ChevronRight className={cn('h-4 w-4 shrink-0', active ? 'text-[#5b1511]' : 'text-slate-300')} />
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
                </div>
              </div>
            </div>
          </div>

          <div className={cn("w-full flex-col min-h-0", mobileTab === 'detail' ? 'flex' : 'hidden xl:flex')}>
              <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl overflow-hidden flex-1 flex flex-col min-h-0">
                <div className="p-0 flex flex-col flex-1 min-h-0">
                  <div className="shrink-0 flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-10 w-10 bg-white text-[#5b1511] rounded-xl border border-slate-100 shadow-sm">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Detail Hasil Evaluasi</h2>
                        <p className="text-[11px] text-slate-500 mt-0.5">Ringkasan evaluasi, testimoni, dan feedback admin.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {activeDetail && (
                        <Button onClick={handleExport} size="sm" className="h-8 rounded-lg bg-[#5b1511] text-white hover:bg-[#4a100d] text-[11px] font-bold px-3 shadow-sm transition-colors">
                          <Download className="mr-1.5 h-3.5 w-3.5" /> Export Data
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1 min-h-0 space-y-4">

                  {activeDetail ? (
                    <>
                      <div className="grid grid-cols-3 gap-2 shrink-0">
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
                                active ? 'bg-[#5b1511] border-[#5b1511] text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50',
                              )}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex-1 overflow-y-auto min-h-0 pr-1 pt-2 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {tab === 'evaluasi' && (
                        <div className="space-y-3">
                            {mockDetail.evaluasi.map((item) => (
                              <div key={item.nama} className="border border-slate-200 bg-white p-4 rounded-xl shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="font-semibold text-slate-800">{item.nama}</div>
                                    <div className="flex items-center gap-2 text-xs mt-1">
                                      <span className="text-slate-500">{item.waktu}</span>
                                      <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                      <span className={cn("font-medium", item.status === 'Tepat waktu' ? 'text-emerald-600' : 'text-orange-600')}>{item.status}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 text-amber-500 shrink-0">
                                    {[...Array(item.rating)].map((_, index) => (
                                      <Star key={index} className="h-3.5 w-3.5 fill-current" />
                                    ))}
                                  </div>
                                </div>
                                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{item.ringkasan}</p>
                              </div>
                            ))}
                        </div>
                      )}

                      {tab === 'testimoni' && (
                        <div className="space-y-3">
                          {mockDetail.testimoni.map((item) => (
                            <div key={item.nama} className="border border-slate-200 bg-white p-4 rounded-xl shadow-sm">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="font-semibold text-slate-800">{item.nama}</div>
                                  <div className="flex items-center gap-2 text-xs mt-1">
                                    <span className="text-slate-500">Tamu Undangan</span>
                                    <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                    <span className={cn("font-medium", item.sentimen === 'Positif' ? 'text-emerald-600' : 'text-slate-500')}>{item.sentimen}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-amber-500 shrink-0">
                                  {[...Array(item.rating)].map((_, index) => (
                                    <Star key={index} className="h-3.5 w-3.5 fill-current" />
                                  ))}
                                </div>
                              </div>
                              <p className="mt-3 text-sm text-slate-600 leading-relaxed">{item.isi}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {tab === 'feedback' && (
                        <div className="space-y-3 flex flex-col flex-1">
                          <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Catatan Admin</div>
                          <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} className="flex-1 min-h-[160px] rounded-xl border-slate-200 bg-slate-50" />
                          <div className="flex items-center justify-between gap-3 mt-auto pt-2">
                            <p className="text-xs text-slate-400">Feedback ini terlihat oleh admin dan protokoler pada dashboard evaluasi.</p>
                            <Button onClick={() => toast.success('Feedback admin berhasil disimpan')} className="rounded-xl bg-[#5b1511] text-white hover:bg-[#4a100d] transition-colors">
                              <MessageSquare className="mr-2 h-4 w-4" /> Simpan
                            </Button>
                          </div>
                        </div>
                      )}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-slate-400">
                      <BarChart3 className="mx-auto h-10 w-10 mb-3 text-slate-300 opacity-50" />
                      Pilih kegiatan selesai untuk melihat hasil evaluasi.
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
          </section>
        </div>
    </div>
  );
}
