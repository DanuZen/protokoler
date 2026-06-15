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
  get: async (id: string) => ({ id, nama_lengkap: 'Dummy User' }),
  create: async (data: any) => ({ success: true, id: 'new-p' }),
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
  daftar: async (kegiatanId: string, protokolerId: string, namaLengkap: string) => {
    const kegiatan = mockKegiatan.find((k) => k.id === kegiatanId);
    if (kegiatan) {
      if (!kegiatan.pendaftar) kegiatan.pendaftar = [];
      kegiatan.pendaftar.push({
        id: `pend-${Date.now()}`,
        kegiatan_id: kegiatanId,
        protokoler_id: protokolerId,
        nama_lengkap: namaLengkap,
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
  byKegiatan: async (kegiatan_id: string) => [],
  byProtokoler: async (protokoler_id: string) => [],
  create: async (data: any) => ({ success: true }),
  update: async (id: string, data: any) => ({ success: true }),
  remove: async (id: string) => ({ success: true }),
};

// ──────────────── ABSENSI & EVALUASI & TESTIMONI ────────────────
export const absensiApi = {
  create: async (data: any) => ({ success: true }),
  byKegiatan: async (kegiatan_id: string) => [],
};

export const evaluasiApi = {
  create: async (data: any) => ({ success: true }),
  byKegiatan: async (kegiatan_id: string) => [],
};

export const testimoniApi = {
  create: async (data: any) => ({ success: true }),
  byKegiatan: async (kegiatan_id: string) => [],
};

export const sertifikatApi = {
  byProtokoler: async (protokoler_id: string) => [],
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
export const regulasiApi = {
  list: async () => [],
  create: async (data: any) => ({ success: true }),
};


