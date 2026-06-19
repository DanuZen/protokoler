/**
 * API client MOCK untuk keperluan Frontend Demo SiProto v1.2.
 * Semua request mengembalikan data dummy langsung tanpa memanggil backend.
 * Delay = 0 agar semua halaman render instan (tidak ada buffering).
 */

let mockKegiatan: any[] = [];

// ──────────────── PROTOKOLER ────────────────
let mockProtokoler: any[] = [];

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
export const regulasiMockData = [];

export const regulasiApi = {
  list: async () => regulasiMockData,
  create: async (data: any) => ({ success: true }),
};

// ──────────────── POSTINGAN / DOKUMENTASI ────────────────
const defaultPostingan: any[] = [];

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
