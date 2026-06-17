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
    { label: 'Rata-rata rating', value: '4.2', hint: 'Evaluasi protokoler', icon: Star },
    { label: 'Total evaluasi', value: '12', hint: 'Masuk dalam batas waktu', icon: ClipboardList },
    { label: 'Testimoni tamu', value: '8', hint: 'Sentimen positif dominan', icon: MessageSquare },
    { label: 'Kegiatan selesai', value: selesai.length, hint: 'Sumber dashboard', icon: CalendarCheck },
  ];

  const activeDetail = selected ?? filtered[0] ?? null;

  const handleExport = () => toast.success('File ekspor berhasil disiapkan');

  return (
    <div className="flex flex-col min-h-full pb-10 px-6 md:px-8 pt-4">
      {/* ─── HEADER SECTION ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200/60">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20 text-white">
            <BarChart3 className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
                Data Penilaian
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 text-slate-900 drop-shadow-sm">Transparansi Hasil Evaluasi</h2>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Pantau ringkasan evaluasi protokoler, testimoni tamu, dan feedback admin.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/evaluasi">
            <Button variant="outline" className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Form Evaluasi
            </Button>
          </Link>
          <Button onClick={handleExport} className="rounded-xl bg-[#1a1a1a] text-white hover:bg-black font-bold shadow-sm">
            <Download className="mr-2 h-4 w-4" /> Export Excel
          </Button>
        </div>
      </motion.div>

      {/* ─── Floating Stats Row ─── */}
      <section className="relative z-20 pb-0">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summary.map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }}>
                <div className="bg-white border border-slate-200 rounded-[24px] py-6 px-6 flex flex-col justify-between hover:shadow-lg hover:shadow-slate-100 transition-all group relative overflow-hidden h-full shadow-sm">
                  <div className="flex items-center justify-between relative z-10">
                    <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl transition-colors bg-slate-50 text-slate-600 border border-slate-100 group-hover:bg-slate-100">
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 relative z-10">
                    <p className="text-[32px] font-bold leading-tight text-slate-900">{stat.value}</p>
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
        <section className="pb-12 grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch h-[calc(100vh-12rem)] min-h-[600px]">
          <div className="w-full">
            <Card className="rounded-[24px] border-slate-200 shadow-sm overflow-hidden h-full flex flex-col bg-white">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="border-b border-slate-100 px-6 py-4 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 bg-white text-slate-600 rounded-xl border border-slate-200">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Daftar Kegiatan</h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">Filter dan pilih kegiatan yang ingin ditinjau.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col flex-1 bg-white">
                  <div className="p-4 border-b border-slate-100 bg-white">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama kegiatan atau lokasi..." className="rounded-xl border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 pl-9 h-11" />
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
                    {filtered.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">
                      <Sparkles className="mx-auto h-10 w-10 mb-3 text-slate-300" />
                      Belum ada kegiatan selesai yang cocok dengan pencarian.
                    </div>
                  ) : (
                    filtered.map((item: any) => {
                      const active = activeDetail?.id === item.id;
                      return (
                        <button key={item.id} onClick={() => setSelectedId(item.id)} className={cn('w-full text-left px-5 py-4 transition-colors border-l-4', active ? 'bg-slate-50 border-orange-500' : 'border-transparent hover:bg-slate-50')}>
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
                            <ChevronRight className={cn('h-4 w-4 shrink-0', active ? 'text-orange-500' : 'text-slate-300')} />
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

          <div className="w-full h-full">
              <Card className="rounded-[24px] border-slate-200 shadow-sm h-full flex flex-col bg-white">
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-10 w-10 bg-white text-slate-600 rounded-xl border border-slate-200">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Detail Hasil Evaluasi</h2>
                        <p className="text-[11px] text-slate-500 mt-0.5">Ringkasan evaluasi, testimoni, dan feedback admin.</p>
                      </div>
                    </div>
                    {activeDetail && <Badge className="rounded-md border border-emerald-200 text-emerald-700 bg-emerald-50">Selesai</Badge>}
                  </div>
                  <div className="p-6 flex flex-col flex-1 overflow-y-auto space-y-4">

                  {activeDetail ? (
                    <>
                      <div className="grid grid-cols-3 gap-2">
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
                                active ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50',
                              )}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>

                      {tab === 'evaluasi' && (
                        <div className="space-y-3">
                          <div className="divide-y divide-white/20 border border-slate-200 bg-white">
                            {mockDetail.evaluasi.map((item) => (
                              <div key={item.nama} className="p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <div className="font-semibold text-slate-800">{item.nama}</div>
                                    <div className="text-xs text-slate-500 mt-1">
                                      {item.waktu} · {item.status}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 text-amber-500">
                                    {[...Array(item.rating)].map((_, index) => (
                                      <Star key={index} className="h-4 w-4 fill-current" />
                                    ))}
                                  </div>
                                </div>
                                <p className="mt-3 text-sm text-slate-600">{item.ringkasan}</p>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end">
                            <Button onClick={handleExport} className="rounded-xl bg-slate-950 text-white hover:bg-slate-800">
                              <Download className="mr-2 h-4 w-4" /> Export Data
                            </Button>
                          </div>
                        </div>
                      )}

                      {tab === 'testimoni' && (
                        <div className="space-y-3">
                          {mockDetail.testimoni.map((item) => (
                            <div key={item.nama} className="border border-slate-200 bg-white p-4">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <div className="font-semibold text-slate-800">{item.nama}</div>
                                  <div className="text-xs text-slate-500 mt-1">Sentimen: {item.sentimen}</div>
                                </div>
                                <Badge className={cn('rounded-xl', item.sentimen === 'Positif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-600 border border-slate-200')}>{item.sentimen}</Badge>
                              </div>
                              <div className="mt-3 flex items-center gap-1 text-amber-500">
                                {[...Array(item.rating)].map((_, index) => (
                                  <Star key={index} className="h-4 w-4 fill-current" />
                                ))}
                              </div>
                              <p className="mt-3 text-sm text-slate-600">{item.isi}</p>
                            </div>
                          ))}
                          <div className="flex justify-end">
                            <Button onClick={handleExport} className="rounded-xl bg-slate-950 text-white hover:bg-slate-800">
                              <Download className="mr-2 h-4 w-4" /> Export Testimoni
                            </Button>
                          </div>
                        </div>
                      )}

                      {tab === 'feedback' && (
                        <div className="space-y-3">
                          <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Catatan Admin</div>
                          <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} className="min-h-[160px] rounded-xl border-slate-200 bg-slate-50" />
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs text-slate-400">Feedback ini terlihat oleh admin dan protokoler pada dashboard evaluasi.</p>
                            <Button onClick={() => toast.success('Feedback admin berhasil disimpan')} className="rounded-xl bg-slate-950 text-white hover:bg-slate-800">
                              <MessageSquare className="mr-2 h-4 w-4" /> Simpan
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">Pilih kegiatan selesai untuk melihat hasil evaluasi.</div>
                  )}
                </div>
              </CardContent>
              </Card>
            </div>
          </section>
        </div>
    </div>
  );
}
