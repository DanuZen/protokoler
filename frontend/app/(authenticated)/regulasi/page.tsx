"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { regulasiApi } from "@/lib/api";
import { useAuth, useRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, Plus, FileText, Download, FileCheck, ShieldAlert, AlertCircle, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

// Initial Mock Data since API mock returns empty array
const initialRegulasi = [
  { id: "1", judul: "SOP Penyambutan Tamu VIP/VVIP", kategori: "SOP Kegiatan", konten: "Tamu VIP/VVIP harus disambut dengan pakaian sipil lengkap (PSL) atau jas almamater. Posisi berdiri protokoler berada 1 meter di samping pintu masuk. Saat tamu tiba, berikan salam hormat dengan sedikit membungkuk dan tersenyum ramah. Pandu tamu ke kursi kehormatan yang telah disediakan sesuai dengan protokoler penempatan kursi (seating arrangement)." },
  { id: "2", judul: "Tata Tertib Seragam & Penampilan", kategori: "Atribut", konten: "Anggota protokoler diwajibkan menggunakan seragam lengkap dengan pin keprotokolan saat bertugas. Rambut bagi pria harus rapi (tidak menyentuh kerah baju). Bagi wanita berhijab, menggunakan jilbab hitam rapi yang dimasukkan ke dalam kerah baju. Dilarang menggunakan perhiasan mencolok saat bertugas." },
  { id: "3", judul: "Prosedur Absensi & Evaluasi", kategori: "Administrasi", konten: "Setiap anggota protokoler wajib melakukan absensi selambat-lambatnya 15 menit sebelum acara dimulai. Setelah kegiatan selesai, anggota diwajibkan mengisi form evaluasi internal maksimal 1x24 jam. Keterlambatan lebih dari 3 kali dalam satu semester akan berakibat pada penahanan sertifikat tugas." },
];

export default function RegulasiPage() {
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  
  const [form, setForm] = useState({ judul: "", kategori: "", konten: "" });

  const { data: regulasi, isLoading } = useQuery({
    queryKey: ["regulasi"],
    queryFn: async () => {
      const res = await regulasiApi.list();
      return res.length > 0 ? res : initialRegulasi;
    }
  });

  const createRegulasi = useMutation({
    mutationFn: () => regulasiApi.create(form),
    onSuccess: () => {
      toast.success("Regulasi berhasil ditambahkan");
      setOpen(false);
      setForm({ judul: "", kategori: "", konten: "" });
      queryClient.invalidateQueries({ queryKey: ["regulasi"] });
    }
  });

  const filtered = (regulasi || []).filter((r: any) => 
    r.judul.toLowerCase().includes(search.toLowerCase()) || 
    r.kategori.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-transparent">
      {/* ─── Hero Banner ─── */}
      <section className="relative px-6 md:px-10 pt-10 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute -right-24 -top-8 h-80 w-80 rounded-full bg-[#C9A84C]/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <p className="text-[#C9A84C] text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Sistem Informasi Protokoler</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight">Regulasi & SOP</h1>
            <p className="mt-2 text-slate-400 text-sm">Pusat informasi standar operasional dan tata tertib keprotokolan.</p>
          </div>
          
          {role === "admin" && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-none bg-[#C9A84C] hover:bg-[#b8963f] text-white font-bold px-6 py-6 h-auto text-sm shadow-xl">
                  <Plus className="h-5 w-5 mr-2" />
                  Tambah Regulasi
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl rounded-none border border-slate-200 shadow-xl p-0">
                <div className="bg-slate-900 p-6 text-white">
                  <DialogTitle className="text-xl font-display font-bold">Tambah Regulasi Baru</DialogTitle>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Judul / Nama SOP</label>
                    <Input 
                      className="rounded-none border-slate-300 bg-slate-50 focus-visible:ring-slate-900" 
                      placeholder="Contoh: SOP Tata Upacara Bendera"
                      value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori</label>
                    <Input 
                      className="rounded-none border-slate-300 bg-slate-50 focus-visible:ring-slate-900" 
                      placeholder="Contoh: SOP Kegiatan"
                      value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Isi Regulasi</label>
                    <Textarea 
                      className="rounded-none border-slate-300 bg-slate-50 focus-visible:ring-slate-900 min-h-[150px]" 
                      placeholder="Tuliskan isi aturan atau dekskripsi lengkap..."
                      value={form.konten} onChange={(e) => setForm({ ...form, konten: e.target.value })} 
                    />
                  </div>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setOpen(false)} className="rounded-none border-slate-300">Batal</Button>
                  <Button 
                    onClick={() => createRegulasi.mutate()} 
                    disabled={createRegulasi.isPending || !form.judul}
                    className="rounded-none bg-slate-900 text-white hover:bg-slate-800"
                  >
                    Simpan Regulasi
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>
      </section>

      {/* ─── Floating Toolbar (Search) ─── */}
      <section className="px-6 md:px-10 -mt-12 relative z-20 pb-0">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 shadow-xl p-4 rounded-none">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input className="pl-12 bg-slate-800 border-slate-700 text-white placeholder-slate-500 rounded-none h-11 text-base focus-visible:ring-[#C9A84C]" placeholder="Cari SOP atau regulasi..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="text-sm font-semibold text-slate-400 shrink-0 bg-slate-800 px-4 py-2 border border-slate-700">
            <span className="text-white">{filtered.length}</span> dokumen
          </div>
        </motion.div>
      </section>

      {/* ─── BODY CONTENT ─── */}
      <div className="bg-slate-50 min-h-screen -mt-6">
        <div className="h-16" />
        <section className="px-6 md:px-10 pb-12 space-y-6">

          {/* Regulasi List */}
          <motion.div initial="hidden" animate="visible" variants={stagger} className="bg-white border border-slate-200 shadow-sm rounded-none overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-900 px-5 py-3.5 bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 bg-[#C9A84C] text-white">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Daftar SOP & Regulasi</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Seluruh dokumen tata tertib keprotokolan.</p>
                </div>
              </div>
            </div>
            {filtered.length === 0 ? (
              <div className="p-16 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <h3 className="font-bold text-slate-900 text-lg">Regulasi tidak ditemukan</h3>
                <p className="text-slate-500 text-sm mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {filtered.map((r: any) => (
                  <AccordionItem value={r.id} key={r.id} className="border-b border-slate-100 last:border-b-0 px-6">
                    <AccordionTrigger className="hover:no-underline py-5">
                      <div className="flex flex-col sm:flex-row sm:items-center text-left gap-3 w-full">
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900">{r.judul}</h4>
                          <span className="inline-block mt-1 text-[10px] font-bold text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/20 px-2 py-0.5 uppercase tracking-wider">{r.kategori}</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5">
                      <div className="bg-slate-50 border border-slate-200 p-5 text-slate-700 leading-relaxed text-sm">
                        {r.konten}
                        <div className="mt-5 pt-5 border-t border-slate-200 flex justify-end">
                          <Button className="rounded-none bg-slate-950 text-white hover:bg-[#C9A84C] hover:text-white font-bold gap-2 transition-colors">
                            <Download className="h-4 w-4" />
                            Unduh PDF Lampiran
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </motion.div>

        </section>
      </div>
    </div>
  );
}
