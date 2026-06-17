/**
 * API client MOCK untuk keperluan Frontend Demo SiProto v1.2.
 * Semua request mengembalikan data dummy langsung tanpa memanggil backend.
 * Delay = 0 agar semua halaman render instan (tidak ada buffering).
 */

let mockKegiatan: any[] = [
  {
    id: 'keg-1',
    nama_kegiatan: 'Upacara Wisuda Periode 123',
    bentuk: 'upacara_resmi',
    kategori: 'eksternal',
    status: 'terjadwal',
    tanggal: '2026-06-25T08:00:00Z',
    jam_mulai: '08:00',
    jam_selesai: '12:00',
    lokasi: 'Auditorium UNP',
    deskripsi: 'Pelaksanaan upacara wisuda ke-123 Universitas Negeri Padang.',
    pendaftar: [
      { id: 'pend-1', protokoler_id: 'prot-1', nama_lengkap: 'Siti Nurhaliza', status: 'diterima' },
      { id: 'pend-2', protokoler_id: 'prot-2', nama_lengkap: 'Budi Santoso', status: 'pending' },
    ],
    tamu_vvip: ['Rektor UNP', 'Gubernur Sumbar'],
    audience: 'Mahasiswa Baru & Orang Tua',
    keynote: 'Prof. Dr. Ganefri, Ph.D. (Rektor UNP)',
    rundown_url: 'https://docs.google.com/document/d/12345/edit',
  },
  {
    id: 'keg-2',
    nama_kegiatan: 'Penerimaan Mahasiswa Baru',
    bentuk: 'kegiatan_pimpinan',
    kategori: 'internal',
    status: 'berlangsung',
    tanggal: '2026-06-18T07:00:00Z',
    jam_mulai: '07:00',
    jam_selesai: '15:00',
    lokasi: 'Lapangan Utama UNP',
    deskripsi: 'Penyambutan mahasiswa baru jalur SNBP dan SNBT.',
    pendaftar: [
      { id: 'pend-3', protokoler_id: 'prot-1', nama_lengkap: 'Siti Nurhaliza', status: 'diterima' },
    ],
    tamu_vvip: ['Rektor UNP'],
  },
  {
    id: 'keg-3',
    nama_kegiatan: 'Seminar Nasional Teknologi Pendidikan',
    bentuk: 'kunjungan_tamu',
    kategori: 'eksternal',
    status: 'selesai',
    tanggal: '2026-05-10T09:00:00Z',
    jam_mulai: '09:00',
    jam_selesai: '13:00',
    lokasi: 'Hotel Pangeran Beach',
    deskripsi: 'Seminar nasional yang dihadiri oleh Mendikbudristek.',
    pendaftar: [
      { id: 'pend-4', protokoler_id: 'prot-1', nama_lengkap: 'Siti Nurhaliza', status: 'diterima' },
      { id: 'pend-5', protokoler_id: 'prot-2', nama_lengkap: 'Budi Santoso', status: 'diterima' },
    ],
    tamu_vvip: ['Menteri Nadiem Makarim'],
  }
];

// ──────────────── PROTOKOLER ────────────────
let mockProtokoler: any[] = [
  { id: 'prot-1', nama_lengkap: 'Siti Nurhaliza', nim: '22001111', prodi: 'Manajemen', status: 'aktif', no_hp: '08123456789' },
  { id: 'prot-2', nama_lengkap: 'Budi Santoso', nim: '22002222', prodi: 'Ilmu Komputer', status: 'aktif', no_hp: '08987654321' },
  { id: 'prot-3', nama_lengkap: 'Andi Saputra', nim: '23003333', prodi: 'Teknik Sipil', status: 'pending_verification', no_hp: '081122334455' },
];

export const protokolerApi = {
  list: async (search?: string) => mockProtokoler,
  get: async (id: string) => mockProtokoler.find(p => p.id === id) || { id, nama_lengkap: 'Dummy User' },
  create: async (data: any) => ({ success: true, id: `prot-${Date.now()}` }),
  update: async (id: string, data: any) => ({ success: true }),
  remove: async (id: string) => ({ success: true }),
};

// ──────────────── KEGIATAN ────────────────
export const kegiatanApi = {
  list: async (params?: { status?: string; bentuk?: string }) => {
    let result = [...mockKegiatan];
    if (params?.status === 'publik') {
      result = result.filter((k) => k.status === 'terjadwal' || k.status === 'berlangsung');
    }
    return result;
  },
  get: async (id: string) => mockKegiatan.find((k) => k.id === id) || mockKegiatan[0],
  create: async (data: any) => {
    const newId = `keg-${Date.now()}`;
    mockKegiatan.unshift({
      id: newId,
      ...data,
      status: data.status || 'terjadwal',
      pendaftar: [],
      tamu_vvip: [],
    });
    return { success: true, id: newId };
  },
  update: async (id: string, data: any) => {
    const index = mockKegiatan.findIndex((k) => k.id === id);
    if (index !== -1) {
      mockKegiatan[index] = { ...mockKegiatan[index], ...data };
    }
    return { success: true };
  },
  remove: async (id: string) => {
    mockKegiatan = mockKegiatan.filter((k) => k.id !== id);
    return { success: true };
  },
  daftar: async (kegiatanId: string, protokolerId: string, namaLengkap: string, role: string = 'Protokoler') => {
    const kegiatan = mockKegiatan.find((k) => k.id === kegiatanId);
    if (kegiatan) {
      if (!kegiatan.pendaftar) kegiatan.pendaftar = [];
      kegiatan.pendaftar.push({
        id: `pend-${Date.now()}`,
        kegiatan_id: kegiatanId,
        protokoler_id: protokolerId,
        nama_lengkap: namaLengkap,
        role: role,
        status: 'pending',
        tanggal_daftar: new Date().toISOString(),
      });
    }
    return { success: true };
  },
  verifikasiPendaftar: async (kegiatanId: string, pendaftarId: string, status: 'diterima' | 'ditolak') => {
    const kegiatan = mockKegiatan.find((k) => k.id === kegiatanId);
    if (kegiatan && kegiatan.pendaftar) {
      const p = kegiatan.pendaftar.find((p: any) => p.id === pendaftarId);
      if (p) p.status = status;
    }
    return { success: true };
  }
};

// ──────────────── PENDAFTARAN ────────────────
export const pendaftaranApi = {
  byKegiatan: async (kegiatan_id: string) => mockKegiatan.find(k => k.id === kegiatan_id)?.pendaftar || [],
  byProtokoler: async (protokoler_id: string) => mockKegiatan.filter(k => k.pendaftar?.some((p:any) => p.protokoler_id === protokoler_id)).map(k => ({...k, pendaftaran_status: k.pendaftar.find((p:any)=>p.protokoler_id===protokoler_id)?.status})),
  create: async (data: any) => ({ success: true }),
  update: async (id: string, data: any) => ({ success: true }),
  remove: async (id: string) => ({ success: true }),
};

// ──────────────── ABSENSI & EVALUASI & TESTIMONI ────────────────
export const absensiApi = {
  create: async (data: any) => ({ success: true }),
  byKegiatan: async (kegiatan_id: string) => [
    { id: 'abs-1', protokoler_id: 'prot-1', nama_lengkap: 'Siti Nurhaliza', waktu_absen: '2026-05-10T08:30:00Z', status: 'hadir', foto_url: 'https://placehold.co/100x100?text=Siti' }
  ],
};

export const evaluasiApi = {
  create: async (data: any) => ({ success: true }),
  byKegiatan: async (kegiatan_id: string) => [
    { id: 'eval-1', protokoler_id: 'prot-1', nama_lengkap: 'Siti Nurhaliza', tata_tempat: 5, tata_upacara: 4, tata_penghormatan: 5, catatan: 'Sangat sigap dan responsif.' },
    { id: 'eval-2', protokoler_id: 'prot-2', nama_lengkap: 'Budi Santoso', tata_tempat: 4, tata_upacara: 3, tata_penghormatan: 4, catatan: 'Perlu lebih fokus.' }
  ],
};

export const testimoniApi = {
  create: async (data: any) => ({ success: true }),
  byKegiatan: async (kegiatan_id: string) => [
    { id: 'testi-1', nama_tamu: 'Menteri Nadiem Makarim', instansi: 'Kemdikbudristek', rating: 5, feedback: 'Pelayanan protokoler UNP sangat luar biasa dan profesional.' }
  ],
};

export const sertifikatApi = {
  byProtokoler: async (protokoler_id: string) => [
    { id: 'cert-1', kegiatan_id: 'keg-3', nama_kegiatan: 'Seminar Nasional Teknologi Pendidikan', url: '#', terbit_pada: '2026-05-11T10:00:00Z' }
  ],
};

// ──────────────── DASHBOARD / LAPORAN ────────────────
export const dashboardApi = {
  stats: async () => ({
    total_mahasiswa: 142,
    total_kegiatan: 86,
    kegiatan_mendatang: 3,
    total_penugasan: 512,
  }),
  upcoming: async (limit: number = 8) =>
    mockKegiatan.filter((k) => k.status === 'terjadwal' || k.status === 'berlangsung').slice(0, limit),
};

export const laporanApi = {
  stats: async () => dashboardApi.stats(),
  kegiatan: async (start: string, end: string, status?: string) => mockKegiatan,
  rekap: async (start: string, end: string) => ({
    rekap_mahasiswa: [
      { nim: '20010101', nama_lengkap: 'Budi Santoso', prodi: 'Ilmu Komputer', total_tugas: 10, dikonfirmasi: 8, ditolak: 2 },
      { nim: '20010102', nama_lengkap: 'Siti Nurhaliza', prodi: 'Manajemen', total_tugas: 5, dikonfirmasi: 5, ditolak: 0 },
    ]
  }),
};

// ──────────────── REGULASI ────────────────
export const regulasiMockData = [
  {
    id: 'reg-1',
    judul: 'Penerimaan Tamu Pribadi & Dinas',
    subtitle: 'SOP Penyambutan Tamu VVIP',
    kategori: 'SOP',
    tanggal_berlaku: '2025-01-01',
    deskripsi: 'Panduan resmi UNP untuk penerimaan tamu pribadi dan dinas. Pastikan proses penyambutan berjalan efektif dan profesional.',
    link_dokumen: '#',
    accentGradient: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #0f172a 100%)',
  },
  {
    id: 'reg-2',
    judul: 'Keprotokolan Pimpinan',
    subtitle: 'SOP Kegiatan Resmi Pimpinan',
    kategori: 'SOP',
    tanggal_berlaku: '2025-06-01',
    deskripsi: 'Panduan resmi keprotokolan UNP untuk setiap acara. Pastikan kegiatan berjalan sesuai standar dan mencerminkan citra positif.',
    link_dokumen: '#',
    accentGradient: 'linear-gradient(135deg, #6b0000 0%, #1e293b 50%, #0f172a 100%)',
  },
  {
    id: 'reg-3',
    judul: 'Penerimaan Tamu Pejabat',
    subtitle: 'SOP Protokol Tamu Negara',
    kategori: 'SOP',
    tanggal_berlaku: '2026-06-10',
    deskripsi: 'Panduan khusus penerimaan tamu pejabat di UNP. Pastikan proses penyambutan sesuai dengan protokol yang berlaku.',
    link_dokumen: '#',
    accentGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #450a0a 100%)',
  },
];

export const regulasiApi = {
  list: async () => regulasiMockData,
  create: async (data: any) => ({ success: true }),
};

// ──────────────── POSTINGAN / DOKUMENTASI ────────────────
const defaultPostingan = [
  { id: 'post-1', judul: 'Persiapan Acara VIP Tingkat Menteri', kategori: 'Seremonial', gambar: '/gallery_1.png', tanggal: '2026-06-15T08:00:00Z', ringkasan: 'Persiapan matang tim protokoler untuk acara VIP tingkat nasional berjalan dengan lancar tanpa hambatan.' },
  { id: 'post-2', judul: 'Pengarahan Tamu Resmi Universitas', kategori: 'Protokol VIP', gambar: '/gallery_2.png', tanggal: '2026-06-14T08:00:00Z', ringkasan: 'Briefing dan pengarahan khusus diberikan kepada tim yang akan bertugas menyambut tamu VVIP dari kementerian.' },
  { id: 'post-3', judul: 'Puncak Upacara Wisuda Ke-123', kategori: 'Wisuda', gambar: '/gallery_3.png', tanggal: '2026-06-10T08:00:00Z', ringkasan: 'Momen puncak upacara wisuda periode ke-123. Tim protokoler mengawal jalannya acara dari awal hingga akhir.' },
  { id: 'post-4', judul: 'Rapat Koordinasi Tim Nasional', kategori: 'Internal', gambar: '/gallery_1.png', tanggal: '2026-06-05T08:00:00Z', ringkasan: 'Koordinasi lintas divisi untuk mempersiapkan serangkaian agenda besar universitas di bulan depan.' },
  { id: 'post-5', judul: 'Pelatihan Service Excellence', kategori: 'Pelatihan', gambar: '/gallery_2.png', tanggal: '2026-06-01T08:00:00Z', ringkasan: 'Peningkatan kapasitas anggota protokoler dalam memberikan pelayanan prima kepada tamu-tamu kehormatan.' },
];

export const postinganApi = {
  list: async () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('demo_postingan');
      if (stored) return JSON.parse(stored);
      localStorage.setItem('demo_postingan', JSON.stringify(defaultPostingan));
    }
    return defaultPostingan;
  },
  create: async (data: any) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('demo_postingan');
      const posts = stored ? JSON.parse(stored) : defaultPostingan;
      const newPost = { ...data, id: `post-${Date.now()}` };
      const updated = [newPost, ...posts];
      localStorage.setItem('demo_postingan', JSON.stringify(updated));
      return newPost;
    }
    return null;
  },
  delete: async (id: string) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('demo_postingan');
      const posts = stored ? JSON.parse(stored) : defaultPostingan;
      const updated = posts.filter((p: any) => p.id !== id);
      localStorage.setItem('demo_postingan', JSON.stringify(updated));
      return true;
    }
    return false;
  }
};
