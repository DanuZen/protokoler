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
    <div className="flex flex-col min-h-full pb-10 px-6 md:px-8 pt-4">
      {/* ─── HEADER SECTION ─── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200/60">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20 text-white">
            <BookOpen className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
                Pedoman
              </span>
            </div>
            <h2 className="text-3xl md:text-[2.5rem] font-black tracking-tight leading-none mb-1.5 text-slate-900 drop-shadow-sm">Regulasi & SOP</h2>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">Pusat informasi standar operasional dan tata tertib keprotokolan.</p>
          </div>
        </div>
        
        {role === "admin" && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-[#1a1a1a] hover:bg-black text-white font-bold px-6 h-11 text-sm shadow-sm">
                <Plus className="h-5 w-5 mr-2" />
                Tambah Regulasi
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl rounded-[24px] border border-slate-200 shadow-xl p-0 bg-white">
              <div className="bg-slate-50 border-b border-slate-100 p-6">
                <DialogTitle className="text-lg font-bold text-slate-900">Tambah Regulasi Baru</DialogTitle>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Judul / Nama SOP</label>
                  <Input 
                    className="rounded-xl border-slate-200 bg-white text-slate-900 focus-visible:ring-slate-200" 
                    placeholder="Contoh: SOP Tata Upacara Bendera"
                    value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori</label>
                  <Input 
                    className="rounded-xl border-slate-200 bg-white text-slate-900 focus-visible:ring-slate-200" 
                    placeholder="Contoh: SOP Kegiatan"
                    value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Isi Regulasi</label>
                  <Textarea 
                    className="rounded-xl border-slate-200 bg-white text-slate-900 focus-visible:ring-slate-200 min-h-[150px]" 
                    placeholder="Tuliskan isi aturan atau dekskripsi lengkap..."
                    value={form.konten} onChange={(e) => setForm({ ...form, konten: e.target.value })} 
                  />
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50">Batal</Button>
                <Button 
                  onClick={() => createRegulasi.mutate()} 
                  disabled={createRegulasi.isPending || !form.judul}
                  className="rounded-xl bg-orange-500 text-white hover:bg-orange-600 font-bold"
                >
                  Simpan Regulasi
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      {/* ─── Floating Toolbar (Search) ─── */}
      <section className="relative z-20 pb-0">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-200 bg-white rounded-[24px] p-5 shadow-sm">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input className="pl-12 bg-white border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl h-11 text-base focus-visible:ring-slate-200 shadow-sm" placeholder="Cari SOP atau regulasi..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="text-sm font-semibold text-slate-500 shrink-0 bg-slate-50 px-4 py-2 border border-slate-200 rounded-xl">
            <span className="text-slate-900">{filtered.length}</span> dokumen
          </div>
        </motion.div>
      </section>

      {/* ─── BODY CONTENT ─── */}
      <div className="flex-1 mt-8">
        <section className="pb-12 space-y-6">

          {/* Regulasi List */}
          <motion.div initial="hidden" animate="visible" variants={stagger} className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 bg-white border border-slate-200 text-slate-600 rounded-xl">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Daftar SOP & Regulasi</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">Seluruh dokumen tata tertib keprotokolan.</p>
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
                          <h4 className="font-bold text-slate-900 group-hover:text-orange-500 transition-colors">{r.judul}</h4>
                          <span className="inline-block mt-1 text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 rounded-md px-2 py-0.5 uppercase tracking-wider">{r.kategori}</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5">
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-slate-700 leading-relaxed text-sm">
                        {r.konten}
                        <div className="mt-5 pt-5 border-t border-slate-200 flex justify-end">
                          <Button className="rounded-xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm font-bold gap-2 transition-colors">
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
