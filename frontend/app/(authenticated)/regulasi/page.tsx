"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { regulasiApi } from "@/lib/api";
import { useRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, Plus, FileText, Download, FileCheck, ShieldAlert, AlertCircle } from "lucide-react";
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
  const role = useRole();
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
      <div className="relative px-6 md:px-10 pt-24 pb-32 overflow-hidden">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight">Regulasi & SOP</h1>
            <p className="mt-3 text-slate-300 text-lg">Pusat informasi standar operasional dan tata tertib keprotokolan.</p>
          </div>
          
          {role === "admin" && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-none bg-[#C9A84C] hover:bg-[#b8963f] text-slate-900 font-bold px-6 py-6 h-auto text-sm shadow-xl">
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
      </div>

      {/* ─── Main Content ─── */}
      <div className="bg-slate-50 min-h-screen pt-4 pb-12">
        <div className="px-6 md:px-10 -mt-10 relative z-10 space-y-6">

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-4 rounded-none">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input className="pl-12 bg-slate-50 border-slate-200 rounded-none h-11 text-base focus-visible:ring-slate-900" placeholder="Cari SOP atau regulasi..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="text-sm font-semibold text-slate-500 shrink-0 bg-slate-50 px-4 py-2 border border-slate-200">
              <span className="text-slate-900">{filtered.length}</span> dokumen
            </div>
          </motion.div>

          {/* Guidelines Header */}
          <div className="bg-slate-900 border border-slate-800 p-6 flex items-start gap-4 shadow-lg text-white rounded-none">
             <ShieldAlert className="h-8 w-8 text-[#C9A84C] shrink-0 mt-1" />
             <div>
               <h3 className="text-lg font-bold">Panduan Umum Keprotokolan</h3>
               <p className="text-slate-400 mt-1 text-sm leading-relaxed">
                 Semua anggota Protokoler Universitas Negeri Padang diwajibkan untuk membaca, memahami, dan mengamalkan seluruh Standar Operasional Prosedur (SOP) yang terlampir. Pelanggaran terhadap tata tertib dapat berakibat pada sanksi administratif dan pemberhentian tugas.
               </p>
             </div>
          </div>

          <motion.div initial="hidden" animate="visible" variants={stagger} className="bg-white border border-slate-200 shadow-sm rounded-none">
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
                    <AccordionTrigger className="hover:no-underline py-6">
                      <div className="flex flex-col sm:flex-row sm:items-center text-left gap-3 w-full">
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 text-lg">{r.judul}</h4>
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{r.kategori}</div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <div className="bg-slate-50 border border-slate-200 p-6 text-slate-700 leading-relaxed text-base">
                        {r.konten}
                        
                        <div className="mt-6 pt-6 border-t border-slate-200 flex justify-end">
                          <Button variant="outline" className="rounded-none border-slate-300 text-slate-700 gap-2 hover:bg-slate-900 hover:text-white transition-colors">
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

        </div>
      </div>
    </div>
  );
}
