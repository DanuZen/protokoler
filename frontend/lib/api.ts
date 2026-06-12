/**
 * API client MOCK untuk keperluan Frontend Demo SiProto v1.2.
 * Semua request mengembalikan data dummy langsung tanpa memanggil backend.
 */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockKegiatan = [
  {
    id: 'keg-1',
    nama_kegiatan: 'Wisuda Periode 130 UNP',
    bentuk_kegiatan: 'wisuda',
    bentuk: 'wisuda',
    tanggal: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    jam_mulai: '07:00:00',
    jam_selesai: '12:00:00',
    lokasi: 'Auditorium UNP',
    status: 'terjadwal',
    deskripsi: '',
    rundown: [],
    checklist_tata_tempat: [],
    checklist_tata_upacara: [],
    checklist_tata_penghormatan: [],
    tamu_vvip: [],
    audience: '',
    keynote: '',
    rundown_url: '',
    jumlah_protokoler_dibutuhkan: 0,
    jumlah_lo_dibutuhkan: 0,
  },
  {
    id: 'keg-2',
    nama_kegiatan: 'Kunjungan Menteri Pendidikan',
    bentuk_kegiatan: 'kunjungan',
    bentuk: 'kunjungan',
    tanggal: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
    jam_mulai: '09:00:00',
    jam_selesai: '11:30:00',
    lokasi: 'Ruang Rektor',
    status: 'terjadwal',
    deskripsi: '',
    rundown: [],
    checklist_tata_tempat: [],
    checklist_tata_upacara: [],
    checklist_tata_penghormatan: [],
    tamu_vvip: [],
    audience: '',
    keynote: '',
    rundown_url: '',
    jumlah_protokoler_dibutuhkan: 0,
    jumlah_lo_dibutuhkan: 0,
  },
  {
    id: 'keg-3',
    nama_kegiatan: 'Rapat Senat Terbuka Dies Natalis',
    bentuk_kegiatan: 'rapat_resmi',
    bentuk: 'rapat_resmi',
    tanggal: new Date(Date.now() - 86400000).toISOString(), // yesterday
    jam_mulai: '08:00:00',
    jam_selesai: '13:00:00',
    lokasi: 'Auditorium UNP',
    status: 'selesai',
    deskripsi: '',
    rundown: [],
    checklist_tata_tempat: [],
    checklist_tata_upacara: [],
    checklist_tata_penghormatan: [],
    tamu_vvip: [],
    audience: '',
    keynote: '',
    rundown_url: '',
    jumlah_protokoler_dibutuhkan: 0,
    jumlah_lo_dibutuhkan: 0,
  },
  {
    id: 'keg-4',
    nama_kegiatan: 'Seminar Internasional Pendidikan',
    bentuk_kegiatan: 'seminar',
    bentuk: 'seminar',
    tanggal: new Date().toISOString(), // today
    jam_mulai: '08:00:00',
    jam_selesai: '16:00:00',
    lokasi: 'Aula FMIPA',
    status: 'berlangsung',
    deskripsi: '',
    rundown: [],
    checklist_tata_tempat: [],
    checklist_tata_upacara: [],
    checklist_tata_penghormatan: [],
    tamu_vvip: [],
    audience: '',
    keynote: '',
    rundown_url: '',
    jumlah_protokoler_dibutuhkan: 0,
    jumlah_lo_dibutuhkan: 0,
  },
];

// ──────────────── PROTOKOLER ────────────────
export const protokolerApi = {
  list: async (search?: string) => {
    await delay(30);
    return [
      { id: 'p1', nim: '20010101', nama_lengkap: 'Budi Santoso', prodi: 'Ilmu Komputer', departemen: 'Elektronika', fakultas: 'Teknik', no_hp: '081234567890', status_akun: 'aktif', total_kegiatan: 12, kategori_sertifikat: 'gold' },
      { id: 'p2', nim: '20010102', nama_lengkap: 'Siti Nurhaliza', prodi: 'Manajemen', departemen: 'Ekonomi', fakultas: 'Ekonomi dan Bisnis', no_hp: '081298765432', status_akun: 'aktif', total_kegiatan: 8, kategori_sertifikat: 'silver' },
    ];
  },
  get: async (id: string) => {
    await delay(20);
    return { id, nama_lengkap: 'Dummy User' };
  },
  create: async (data: any) => {
    await delay(30);
    return { success: true, id: 'new-p' };
  },
  update: async (id: string, data: any) => {
    await delay(30);
    return { success: true };
  },
  remove: async (id: string) => {
    await delay(30);
    return { success: true };
  },
};

// ──────────────── KEGIATAN ────────────────
export const kegiatanApi = {
  list: async (params?: { status?: string; bentuk?: string }) => {
    await delay(30);
    let result = [...mockKegiatan];
    if (params?.status === 'publik') {
      result = result.filter((k) => k.status === 'terjadwal' || k.status === 'berlangsung');
    }
    return result;
  },
  get: async (id: string) => {
    await delay(20);
    return mockKegiatan.find((k) => k.id === id) || mockKegiatan[0];
  },
  create: async (data: any) => {
    await delay(500);
    return { success: true, id: 'new-k' };
  },
  update: async (id: string, data: any) => {
    await delay(500);
    return { success: true };
  },
  remove: async (id: string) => {
    await delay(500);
    return { success: true };
  },
};

// ──────────────── PENDAFTARAN ────────────────
export const pendaftaranApi = {
  byKegiatan: async (kegiatan_id: string) => {
    await delay(400);
    return [];
  },
  byProtokoler: async (protokoler_id: string) => {
    await delay(400);
    return [];
  },
  create: async (data: any) => {
    await delay(30);
    return { success: true };
  },
  update: async (id: string, data: any) => {
    await delay(30);
    return { success: true };
  },
  remove: async (id: string) => {
    await delay(30);
    return { success: true };
  },
};

// ──────────────── ABSENSI & EVALUASI & TESTIMONI ────────────────
export const absensiApi = {
  create: async (data: any) => {
    await delay(30);
    return { success: true };
  },
  byKegiatan: async (kegiatan_id: string) => {
    await delay(20);
    return [];
  },
};

export const evaluasiApi = {
  create: async (data: any) => {
    await delay(30);
    return { success: true };
  },
  byKegiatan: async (kegiatan_id: string) => {
    await delay(20);
    return [];
  },
};

export const testimoniApi = {
  create: async (data: any) => {
    await delay(30);
    return { success: true };
  },
  byKegiatan: async (kegiatan_id: string) => {
    await delay(20);
    return [];
  },
};

export const sertifikatApi = {
  byProtokoler: async (protokoler_id: string) => {
    await delay(20);
    return [];
  },
};

// ──────────────── DASHBOARD / LAPORAN ────────────────
export const dashboardApi = {
  stats: async () => {
    await delay(30);
    return {
      total_mahasiswa: 142,
      total_kegiatan: 86,
      kegiatan_mendatang: 3,
      total_penugasan: 512,
    };
  },
  upcoming: async (limit: number = 8) => {
    await delay(30);
    return mockKegiatan.filter((k) => k.status === 'terjadwal' || k.status === 'berlangsung').slice(0, limit);
  },
};

export const laporanApi = {
  stats: async () => dashboardApi.stats(),
  kegiatan: async (start: string, end: string, status?: string) => {
    await delay(30);
    return mockKegiatan;
  },
  rekap: async (start: string, end: string) => {
    await delay(30);
    return {
      rekap_mahasiswa: [
        { nim: '20010101', nama_lengkap: 'Budi Santoso', prodi: 'Ilmu Komputer', total_tugas: 10, dikonfirmasi: 8, ditolak: 2 },
        { nim: '20010102', nama_lengkap: 'Siti Nurhaliza', prodi: 'Manajemen', total_tugas: 5, dikonfirmasi: 5, ditolak: 0 },
      ]
    };
  },
};

// ──────────────── REGULASI ────────────────
export const regulasiApi = {
  list: async () => {
    await delay(20);
    return [];
  },
  create: async (data: any) => {
    await delay(30);
    return { success: true };
  },
};
