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
import { ArrowLeft, BarChart3, CalendarDays, ChevronRight, Clock, Search, Sparkles, Star, MessageSquare, Users, FileText, Download } from 'lucide-react';
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
    { label: 'Rata-rata rating', value: '4.2', hint: 'Evaluasi protokoler' },
    { label: 'Total evaluasi', value: '12', hint: 'Masuk dalam batas waktu' },
    { label: 'Testimoni tamu', value: '8', hint: 'Sentimen positif dominan' },
    { label: 'Kegiatan selesai', value: selesai.length, hint: 'Sumber dashboard' },
  ];

  const activeDetail = selected ?? filtered[0] ?? null;

  const handleExport = () => toast.success('File ekspor berhasil disiapkan');

  return (
    <div className="min-h-screen bg-transparent pb-16">
      <div className="relative px-6 md:px-10 pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at top left, rgba(201,168,76,0.28), transparent 35%), radial-gradient(circle at right, rgba(34,197,94,0.12), transparent 30%)' }} />

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="rounded-none border border-emerald-300/40 bg-emerald-300/10 text-emerald-200">Dashboard Evaluasi</Badge>
            <span className="text-xs uppercase tracking-[0.25em] text-slate-400">Role {role || '...'}</span>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">Transparansi Hasil Evaluasi Kegiatan</h1>
              <p className="mt-3 text-slate-300 text-base md:text-lg leading-relaxed">Pantau ringkasan evaluasi protokoler, testimoni tamu, dan feedback admin dalam satu ruang kerja yang terstruktur.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/evaluasi">
                <Button variant="outline" className="rounded-none border-slate-600 bg-slate-950/40 text-white hover:bg-slate-800/70">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Form Evaluasi
                </Button>
              </Link>
              <Button onClick={handleExport} className="rounded-none bg-[#C9A84C] text-slate-950 hover:bg-[#b8963f] font-bold">
                <Download className="mr-2 h-4 w-4" /> Export Excel
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-slate-50 pt-4">
        <div className="px-6 md:px-10 -mt-16 relative z-10 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summary.map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }}>
                <Card className="rounded-none border-slate-200 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                        <div className="mt-2 text-3xl font-display font-bold text-slate-900">{stat.value}</div>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center bg-slate-950 text-[#C9A84C]">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">{stat.hint}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <Card className="rounded-none border-slate-200 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="border-b border-slate-200 px-5 py-4 bg-white space-y-4">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900">Daftar Kegiatan</h2>
                    <p className="text-xs text-slate-400 mt-1">Filter dan pilih kegiatan yang ingin ditinjau.</p>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama kegiatan atau lokasi..." className="rounded-none border-slate-200 pl-9 bg-slate-50" />
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">
                      <Sparkles className="mx-auto h-10 w-10 mb-3 text-slate-300" />
                      Belum ada kegiatan selesai yang cocok dengan pencarian.
                    </div>
                  ) : (
                    filtered.map((item: any) => {
                      const active = activeDetail?.id === item.id;
                      return (
                        <button key={item.id} onClick={() => setSelectedId(item.id)} className={cn('w-full text-left px-5 py-4 transition-colors', active ? 'bg-slate-950 text-white' : 'hover:bg-slate-50')}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className={cn('font-semibold', active ? 'text-white' : 'text-slate-900')}>{item.nama_kegiatan}</div>
                              <div className={cn('mt-1 flex flex-wrap items-center gap-3 text-xs', active ? 'text-slate-300' : 'text-slate-500')}>
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
                            <ChevronRight className={cn('h-4 w-4 shrink-0', active ? 'text-[#C9A84C]' : 'text-slate-300')} />
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-none border-slate-200 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900">Detail Hasil Evaluasi</h2>
                      <p className="text-xs text-slate-400 mt-1">Tab ini menampilkan ringkasan evaluasi, testimoni, dan feedback admin.</p>
                    </div>
                    {activeDetail && <Badge className="rounded-none bg-emerald-50 text-emerald-700 border border-emerald-200">Selesai</Badge>}
                  </div>

                  {activeDetail ? (
                    <>
                      <div className="space-y-2 border border-slate-200 bg-slate-50 p-4">
                        <div className="text-sm font-semibold text-slate-900">{activeDetail.nama_kegiatan}</div>
                        <div className="text-xs text-slate-500">
                          {activeDetail.lokasi} · {new Date(activeDetail.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>

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
                                'border px-3 py-2 text-sm font-semibold transition-colors rounded-none',
                                active ? 'border-slate-900 bg-slate-900 text-[#C9A84C]' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-400',
                              )}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>

                      {tab === 'evaluasi' && (
                        <div className="space-y-3">
                          <div className="grid gap-3 md:grid-cols-3">
                            {[
                              { value: '4.2', label: 'Rata-rata rating' },
                              { value: '12/12', label: 'Tepat waktu' },
                              { value: '6/4/2', label: 'Breakdown 5/4/3' },
                            ].map((item) => (
                              <div key={item.label} className="border border-slate-200 bg-white p-3">
                                <div className="text-2xl font-display font-bold text-slate-900">{item.value}</div>
                                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-1">{item.label}</div>
                              </div>
                            ))}
                          </div>
                          <div className="space-y-2">
                            {mockDetail.evaluasi.map((item) => (
                              <div key={item.nama} className="border border-slate-200 bg-white p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <div className="font-semibold text-slate-900">{item.nama}</div>
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
                            <Button onClick={handleExport} className="rounded-none bg-slate-950 text-white hover:bg-slate-800">
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
                                  <div className="font-semibold text-slate-900">{item.nama}</div>
                                  <div className="text-xs text-slate-500 mt-1">Sentimen: {item.sentimen}</div>
                                </div>
                                <Badge className={cn('rounded-none', item.sentimen === 'Positif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-600 border border-slate-200')}>{item.sentimen}</Badge>
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
                            <Button onClick={handleExport} variant="outline" className="rounded-none border-slate-300 text-slate-900">
                              <Download className="mr-2 h-4 w-4" /> Export Testimoni
                            </Button>
                          </div>
                        </div>
                      )}

                      {tab === 'feedback' && (
                        <div className="space-y-3">
                          <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Catatan Admin</div>
                          <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} className="min-h-[160px] rounded-none border-slate-200 bg-slate-50" />
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs text-slate-400">Feedback ini terlihat oleh admin dan protokoler pada dashboard evaluasi.</p>
                            <Button onClick={() => toast.success('Feedback admin berhasil disimpan')} className="rounded-none bg-[#C9A84C] text-slate-950 hover:bg-[#b8963f]">
                              <MessageSquare className="mr-2 h-4 w-4" /> Simpan
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">Pilih kegiatan selesai untuk melihat hasil evaluasi.</div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-none border-slate-200 shadow-sm">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900">
                    <FileText className="h-4 w-4 text-[#C9A84C]" />
                    <span className="text-sm font-bold uppercase tracking-[0.2em]">Hak Akses</span>
                  </div>
                  <p className="text-sm text-slate-600">Dashboard ini dapat dibuka oleh admin dan protokoler. Admin mengelola feedback, sementara protokoler melihat hasil evaluasi dan testimoni dalam mode baca.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
