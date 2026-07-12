'use client';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { regulasiApi, regulasiMockData } from "@/lib/api";
import { useAuth, useRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Save, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function PengaturanSOPPage() {
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const queryClient = useQueryClient();
  const router = useRouter();
  
  // Only admins can access
  useEffect(() => {
    if (role !== undefined && role !== 'admin') {
      router.push('/dashboard');
    }
  }, [role, router]);

  const [forms, setForms] = useState<Record<string, { id?: string; file_url: string; deskripsi: string }>>({});

  const { data: sops, isLoading } = useQuery({
    queryKey: ["landing-sops"],
    queryFn: async () => {
      const res = await regulasiApi.getLandingSOPs();
      return res;
    }
  });

  useEffect(() => {
    if (sops) {
      const newForms: Record<string, any> = {};
      // Initialize with mock data titles to ensure we always have 3 inputs
      regulasiMockData.forEach(mock => {
        const existing = sops.find((s: any) => s.judul === mock.judul);
        newForms[mock.judul] = {
          id: existing?.id,
          file_url: existing?.file_url || '',
          deskripsi: existing?.deskripsi || mock.deskripsi,
        };
      });
      setForms(newForms);
    }
  }, [sops]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const promises = regulasiMockData.map(async (mock) => {
        const formData = forms[mock.judul];
        if (!formData) return;
        
        if (formData.id) {
          // Update existing
          return regulasiApi.update(formData.id, {
            file_url: formData.file_url,
          });
        } else {
          // Create new
          if (formData.file_url) {
            return regulasiApi.create({
              judul: mock.judul,
              kategori: 'SOP_LANDING_PAGE',
              konten: mock.deskripsi,
              file_url: formData.file_url,
            });
          }
        }
      });
      await Promise.all(promises);
    },
    onSuccess: () => {
      toast.success("Pengaturan SOP berhasil disimpan");
      queryClient.invalidateQueries({ queryKey: ["landing-sops"] });
    },
    onError: () => {
      toast.error("Gagal menyimpan pengaturan SOP");
    }
  });

  if (isLoading || role !== 'admin') return <div className="p-8">Memuat...</div>;

  return (
    <div className="flex flex-col h-auto md:h-dvh md:overflow-hidden pb-6 md:pb-8 px-4 md:px-8 pt-4">
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 md:mb-8 pb-4 md:pb-6 border-b border-slate-200/60">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-700 to-red-800 shadow-lg shadow-red-700/20 text-white">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-red-800">
                Landing Page
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-[2.5rem] font-bold tracking-tight leading-none mb-1 text-slate-900 drop-shadow-sm">Pengaturan</h2>
            <p className="text-xs md:text-base text-slate-500 font-medium max-w-xl">Atur tautan unduhan untuk 3 tombol SOP di halaman utama (landing page).</p>
          </div>
        </div>
        
        <Button 
          onClick={() => saveMutation.mutate()} 
          disabled={saveMutation.isPending}
          className="rounded-xl bg-[#6B0000] hover:bg-red-900 text-white font-bold px-6 h-11 text-sm shadow-sm"
        >
          {saveMutation.isPending ? "Menyimpan..." : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Simpan Perubahan
            </>
          )}
        </Button>
      </motion.div>

      {/* Outer Card (Fills remaining height) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[24px] overflow-hidden flex flex-col flex-1 min-h-0 w-full"
      >
        {/* Card Header */}
        <div className="p-4 md:px-8 md:py-6 bg-white/40 border-b border-slate-100/50 flex flex-col md:flex-row justify-between md:items-center gap-3 md:gap-4 shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 bg-red-50 border border-red-100 text-[#6B0000] rounded-[14px] shadow-sm shrink-0">
              <Settings className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <h2 className="text-base md:text-xl font-bold text-slate-900 leading-tight">Daftar Tautan SOP</h2>
              <p className="text-[11px] md:text-sm text-slate-500 mt-0.5 md:mt-1">Daftar dokumen SOP yang ditampilkan di halaman utama.</p>
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="shrink-0 hidden md:grid grid-cols-[1.5fr_2fr_150px] gap-6 px-8 py-3 bg-white/60 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <div>Judul & Deskripsi SOP</div>
          <div>Link Unduhan (File URL / G-Drive)</div>
          <div className="text-center">Status</div>
        </div>

        {/* Table Body / Rows (Scrollable) */}
        <div className="flex-1 overflow-y-auto flex flex-col divide-y divide-slate-100/50">
          {regulasiMockData.map((mock, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              key={mock.id} 
              className="flex flex-col md:grid md:grid-cols-[1.5fr_2fr_150px] gap-4 md:gap-6 px-6 md:px-8 py-6 items-start md:items-center hover:bg-slate-50/50 transition-colors"
            >
              {/* Col 1: Judul */}
              <div className="flex flex-col pr-4">
                <h3 className="font-bold text-sm text-slate-900 mb-1">{mock.judul}</h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{mock.deskripsi}</p>
              </div>

              {/* Col 2: Input */}
              <div className="w-full">
                <Input 
                  className="rounded-xl border-slate-200 bg-white text-slate-900 focus-visible:ring-red-200 focus-visible:border-red-400 h-11 transition-all" 
                  placeholder="https://drive.google.com/..."
                  value={forms[mock.judul]?.file_url || ''} 
                  onChange={(e) => setForms({
                    ...forms,
                    [mock.judul]: {
                      ...forms[mock.judul],
                      file_url: e.target.value
                    }
                  })} 
                />
              </div>

              {/* Col 3: Status */}
              <div className="w-full md:w-auto flex justify-start md:justify-center">
                {forms[mock.judul]?.id ? (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 whitespace-nowrap">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 whitespace-nowrap">
                    Belum Tersimpan
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
