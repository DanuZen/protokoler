'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postinganApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Trash2, CalendarDays, Search, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ManajemenBeritaPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: postingan = [] } = useQuery({
    queryKey: ['postingan-list'],
    queryFn: postinganApi.list,
  });

  const deleteMutation = useMutation({
    mutationFn: postinganApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postingan-list'] });
      queryClient.invalidateQueries({ queryKey: ['postingan'] });
      toast.success('Berita berhasil dihapus!');
    }
  });

  const filteredPosts = postingan.filter((p: any) => p.judul.toLowerCase().includes(search.toLowerCase()) || p.kategori.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col min-h-full pb-10 px-6 md:px-8 pt-4">
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-200/60">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20 text-white">
            <BookOpen className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
                Dokumentasi
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight leading-none mb-1.5 text-slate-900 drop-shadow-sm">Manajemen Berita</h1>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Kelola postingan berita dan dokumentasi yang tampil di halaman utama.</p>
          </div>
        </div>

        <Link href="/dokumentasi/upload">
          <Button className="rounded-xl bg-orange-500 text-white hover:bg-orange-600 shadow-md font-bold h-11 px-6">
            <UploadCloud className="mr-2 h-5 w-5" /> Buka Workspace Upload
          </Button>
        </Link>
      </motion.div>

      {/* FILTER & LIST */}
      <div className="mb-6 flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center flex-1 gap-2 bg-slate-50 px-3 rounded-xl border border-slate-100">
          <Search className="h-4 w-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari judul atau kategori..." className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-1" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPosts.map((post: any, i: number) => (
          <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="h-full">
            <Card className="overflow-hidden rounded-2xl border-slate-200 hover:shadow-lg transition-all duration-300 flex flex-col h-full bg-white group">
              <div className="h-48 relative overflow-hidden bg-slate-100 shrink-0">
                <img src={post.gambar} alt={post.judul} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-slate-800 uppercase tracking-wider shadow-sm">
                  {post.kategori}
                </div>
              </div>
              <CardContent className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-medium">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {new Date(post.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <h3 className="font-bold text-lg text-slate-900 leading-tight mb-2 line-clamp-2">{post.judul}</h3>
                <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1">{post.ringkasan}</p>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-auto shrink-0">
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-wider">Published</span>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(post.id)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filteredPosts.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 border-dashed">
            <BookOpen className="h-10 w-10 mx-auto mb-3 text-slate-300" />
            <p>Tidak ada berita yang ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
