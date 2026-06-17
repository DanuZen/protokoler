'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { kegiatanApi } from '@/lib/api';
import { useAuth, useRole } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, ArrowLeft, Info, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';


export default function DokumentasiDashboardPage() {
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const displayName = user?.user_metadata?.nama_lengkap || user?.email?.split('@')[0] || 'Tim Dokumentasi';
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState('foto');
  const [caption, setCaption] = useState('');

  const { data: kegiatan } = useQuery({
    queryKey: ['dokumentasi-dashboard-kegiatan'],
    queryFn: () => kegiatanApi.list(),
  });

  const selesai = useMemo(() => (kegiatan ?? []).filter((item: any) => item.status === 'selesai'), [kegiatan]);
  const selected = selesai.find((item: any) => item.id === selectedId) ?? selesai[0] ?? null;

  const stats = [
    { 
      label: 'Kegiatan selesai', 
      value: selesai.length, 
      hint: 'Siap didokumentasikan', 
      trend: '+12%',
      isUp: true,
      chart: (
        <div className="flex items-end gap-1 h-10 mt-2">
          {[40, 70, 45, 90].map((h, i) => (
            <div key={i} className="w-4 bg-orange-500 rounded-sm transition-all hover:opacity-80" style={{ height: `${h}%` }} />
          ))}
        </div>
      )
    },
    { 
      label: 'Terdokumentasi', 
      value: selesai.length ? 1 : 0, 
      hint: 'Upload aktif', 
      trend: '+2',
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
      label: 'File unggahan', 
      value: '8', 
      hint: 'Foto, video, dokumen', 
      trend: '+5%',
      isUp: true,
      chart: (
        <div className="w-8 h-8 rounded-full border-4 border-slate-100 border-t-blue-500 mt-2" />
      )
    },
    { 
      label: 'Antrian review', 
      value: '2', 
      hint: 'Menunggu verifikasi', 
      trend: '-1',
      isUp: false,
      chart: (
        <div className="flex items-end gap-0.5 h-10 mt-2 opacity-50">
          {[80, 70, 85, 95, 70, 60, 50, 40].map((h, i) => (
            <div key={i} className="w-2 bg-slate-400 rounded-sm" style={{ height: `${h}%` }} />
          ))}
        </div>
      )
    },
  ];

  return (
    <div className="flex flex-col min-h-full pb-10 px-6 md:px-8 pt-4">
      {/* ─── HEADER SECTION ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-200/60">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20 text-white">
            <Camera className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
                Dashboard Dokumentasi
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 text-slate-900 drop-shadow-sm">Selamat Datang, {displayName}</h1>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Ruang kerja ringkasan statistik dan rekapitulasi data dokumentasi kegiatan.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/kegiatan">
            <Button variant="outline" className="rounded-xl border-slate-200 bg-white shadow-sm hover:bg-slate-50 text-slate-700">
              <ArrowLeft className="mr-2 h-4 w-4" /> Ke Kegiatan
            </Button>
          </Link>
          <Link href="/dokumentasi/upload">
            <Button className="rounded-xl bg-orange-500 text-white hover:bg-orange-600 font-bold shadow-md">
              <Upload className="mr-2 h-4 w-4" /> Buka Workspace Upload
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* ─── Floating Stats Row ─── */}
      <section className="relative z-20 pb-0">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }}>
                <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-6 flex flex-col justify-between hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 h-full">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <span className="text-sm font-semibold">{stat.label}</span>
                        <Info className="h-3.5 w-3.5 opacity-60" />
                      </div>
                      <div className={cn("px-2 py-0.5 rounded-md text-[11px] font-bold", stat.isUp ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                        {stat.trend}
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-[32px] font-bold text-slate-900 leading-none mb-1">{stat.value}</div>
                        <div className="text-[11px] font-medium text-slate-400">{stat.hint}</div>
                      </div>
                      {stat.chart}
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

      {/* ─── BODY CONTENT (Simplified) ─── */}
      <div className="flex-1 mt-8">
        <section className="pb-12 space-y-6">
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
            <div className="h-20 w-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-6">
              <Upload className="h-10 w-10" />
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-3">Workspace Upload Terpisah</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              Untuk memberikan pengalaman yang lebih lega dan fokus, seluruh proses pengunggahan file media (foto, video, dokumen) kini dipindahkan ke halaman Workspace Upload khusus.
            </p>
            <Link href="/dokumentasi/upload">
              <Button className="rounded-xl bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/30 h-12 px-8 font-bold text-base">
                Buka Workspace Upload <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
