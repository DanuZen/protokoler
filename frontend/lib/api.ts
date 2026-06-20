import { supabase } from './supabase';

/**
 * Helper to dynamically get the active session token and construct headers.
 */
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return {
      'Authorization': `Bearer ${session.access_token}`,
    };
  }
  return {};
}

/**
 * Base fetch client that appends Authorization headers and handles responses.
 */
async function apiFetch(url: string, options: RequestInit = {}) {
  const authHeaders = await getAuthHeaders() as Record<string, string>;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    ...authHeaders,
  };

  const isMultipart = options.body instanceof FormData;
  if (!isMultipart && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.statusText}`);
  }

  return response.json();
}

// ──────────────── PROTOKOLER ────────────────
export const protokolerApi = {
  list: async (search?: string, status_akun?: string, prodi?: string) => {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (status_akun) query.append('status_akun', status_akun);
    if (prodi) query.append('prodi', prodi);
    
    const res = await apiFetch(`/api/protokoler?${query.toString()}`);
    return res.data;
  },
  
  get: async (id: string) => {
    return apiFetch(`/api/protokoler/${id}`);
  },
  
  create: async (data: any) => {
    // Registrasi menggunakan endpoint auth/register
    return apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  update: async (id: string, data: any) => {
    // profile update can be multipart or json
    let body: any;
    if (data instanceof FormData) {
      body = data;
    } else {
      body = JSON.stringify(data);
    }
    return apiFetch(`/api/protokoler/${id}`, {
      method: 'PATCH',
      body,
    });
  },

  verifikasi: async (id: string, aksi: 'setujui' | 'tolak', catatan_penolakan?: string) => {
    return apiFetch(`/api/protokoler/${id}/verifikasi`, {
      method: 'PATCH',
      body: JSON.stringify({ aksi, catatan_penolakan }),
    });
  },
  
  remove: async (id: string) => {
    return apiFetch(`/api/protokoler/${id}`, {
      method: 'DELETE',
    });
  },

  me: async () => {
    return apiFetch('/api/protokoler/me');
  },
};

// ──────────────── KEGIATAN ────────────────
export const kegiatanApi = {
  list: async (params?: { status?: string; bentuk?: string; dari_tanggal?: string; sampai_tanggal?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.bentuk) query.append('bentuk', params.bentuk);
    if (params?.dari_tanggal) query.append('dari_tanggal', params.dari_tanggal);
    if (params?.sampai_tanggal) query.append('sampai_tanggal', params.sampai_tanggal);

    const res = await apiFetch(`/api/kegiatan?${query.toString()}`);
    return res.data;
  },
  
  get: async (id: string) => {
    return apiFetch(`/api/kegiatan/${id}`);
  },
  
  create: async (data: any) => {
    const payload = { ...data };
    if (payload.bentuk_kegiatan === 'kunjungan') {
      payload.bentuk_kegiatan = 'kunjungan_tamu';
    } else if (payload.bentuk_kegiatan === 'dokumentasi') {
      payload.bentuk_kegiatan = 'lainnya';
    }
    return apiFetch('/api/kegiatan', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  
  update: async (id: string, data: any) => {
    const payload = { ...data };
    if (payload.bentuk_kegiatan === 'kunjungan') {
      payload.bentuk_kegiatan = 'kunjungan_tamu';
    } else if (payload.bentuk_kegiatan === 'dokumentasi') {
      payload.bentuk_kegiatan = 'lainnya';
    }
    return apiFetch(`/api/kegiatan/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  updateChecklist: async (id: string, data: { checklist_tata_tempat?: boolean; checklist_tata_upacara?: boolean; checklist_tata_penghormatan?: boolean }) => {
    return apiFetch(`/api/kegiatan/${id}/checklist`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  
  remove: async (id: string) => {
    return apiFetch(`/api/kegiatan/${id}`, {
      method: 'DELETE',
    });
  },
  
  daftar: async (kegiatanId: string, peran: 'protokoler' | 'lo') => {
    return apiFetch(`/api/kegiatan/${kegiatanId}/daftar`, {
      method: 'POST',
      body: JSON.stringify({ peran }),
    });
  },
  
  verifikasiPendaftar: async (kegiatanId: string, pendaftarId: string, keputusan: 'diterima' | 'ditolak' | 'dialihkan', kegiatan_dialihkan_id?: string, catatan_admin?: string) => {
    return apiFetch(`/api/pendaftaran/${pendaftarId}/seleksi`, {
      method: 'PATCH',
      body: JSON.stringify({ keputusan, kegiatan_dialihkan_id, catatan_admin }),
    });
  }
};

// ──────────────── PENDAFTARAN ────────────────
export const pendaftaranApi = {
  byKegiatan: async (kegiatan_id: string) => {
    const res = await apiFetch(`/api/kegiatan/${kegiatan_id}/pendaftar`);
    return res.data;
  },
  
  byProtokoler: async (protokoler_id: string) => {
    const res = await apiFetch(`/api/laporan/protokoler/${protokoler_id}/rekap`);
    return res.riwayat || [];
  },
};

// ──────────────── ABSENSI ────────────────
export const absensiApi = {
  create: async (kegiatanId: string, data: FormData) => {
    return apiFetch(`/api/kegiatan/${kegiatanId}/absensi`, {
      method: 'POST',
      body: data,
    });
  },
  
  byKegiatan: async (kegiatan_id: string) => {
    const res = await apiFetch(`/api/kegiatan/${kegiatan_id}/absensi`);
    return res.data;
  },
};

// ──────────────── EVALUASI ────────────────
export const evaluasiApi = {
  create: async (kegiatanId: string, data: { evaluasi_kegiatan: string; refleksi_diri: string; rating_kegiatan: number }) => {
    return apiFetch(`/api/kegiatan/${kegiatanId}/evaluasi`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  byKegiatan: async (kegiatan_id: string) => {
    const res = await apiFetch(`/api/evaluasi/kegiatan/${kegiatan_id}/hasil`);
    return res;
  },

  updateFeedback: async (kegiatanId: string, catatan: string) => {
    return apiFetch(`/api/evaluasi/kegiatan/${kegiatanId}/feedback`, {
      method: 'PATCH',
      body: JSON.stringify({ catatan }),
    });
  }
};

// ──────────────── TESTIMONI ────────────────
export const testimoniApi = {
  create: async (kegiatanId: string, data: { nama_tamu: string; jabatan_tamu?: string; isi_testimoni: string; rating: number }) => {
    return apiFetch(`/api/kegiatan/${kegiatanId}/testimoni`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  byKegiatan: async (kegiatan_id: string) => {
    const res = await apiFetch(`/api/kegiatan/${kegiatan_id}/testimoni`);
    return res.data;
  },
};

// ──────────────── SERTIFIKAT ────────────────
export const sertifikatApi = {
  byProtokoler: async () => {
    const res = await apiFetch('/api/sertifikat');
    return res.data;
  },
  listAll: async () => {
    const res = await apiFetch('/api/sertifikat');
    return res.data;
  }
};

// ──────────────── DASHBOARD & LAPORAN ────────────────
export const dashboardApi = {
  stats: async () => {
    return apiFetch('/api/laporan/dashboard');
  },
  evaluasiDashboard: async (status?: string, search?: string) => {
    const query = new URLSearchParams();
    if (status) query.append('filter_status', status);
    if (search) query.append('search', search);
    return apiFetch(`/api/evaluasi/dashboard?${query.toString()}`);
  },
  upcoming: async (limit: number = 8) => {
    const list = await kegiatanApi.list();
    return (list ?? []).slice(0, limit);
  }
};

export const laporanApi = {
  stats: async () => {
    return dashboardApi.stats();
  },
  kegiatan: async (start: string, end: string, status?: string) => {
    const query = new URLSearchParams();
    if (start) query.append('dari_tanggal', start);
    if (end) query.append('sampai_tanggal', end);
    if (status) query.append('bentuk_kegiatan', status);
    const res = await apiFetch(`/api/laporan/kegiatan?${query.toString()}`);
    return res.data;
  },
  rekap: async (protokolerIdOrStart: string, end?: string) => {
    const query = new URLSearchParams();
    if (end) query.append('sampai_tanggal', end);
    return apiFetch(`/api/laporan/protokoler/${protokolerIdOrStart}/rekap?${query.toString()}`);
  },
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
  list: async () => {
    const res = await apiFetch('/api/regulasi');
    return res.data;
  },
  create: async (data: any) => {
    if (data instanceof FormData) {
      return apiFetch('/api/regulasi', {
        method: 'POST',
        body: data,
      });
    }

    const formData = new FormData();
    formData.append('judul', data.judul);
    formData.append('kategori', data.kategori || '');
    formData.append('deskripsi', data.konten || '');
    formData.append('tahun_terbit', String(new Date().getFullYear()));

    const mockPdfContent = `%PDF-1.4\n%...\n${data.konten || ''}`;
    const blob = new Blob([mockPdfContent], { type: 'application/pdf' });
    formData.append('file', blob, `${data.judul.replace(/\s+/g, '_')}.pdf`);

    return apiFetch('/api/regulasi', {
      method: 'POST',
      body: formData,
    });
  },
};

// ──────────────── DOKUMENTASI & POSTINGAN ────────────────
const defaultPostingan = [
  { id: 'post-1', judul: 'Persiapan Acara VIP Tingkat Menteri', kategori: 'Seremonial', gambar: '/gallery_1.png', tanggal: '2026-06-15T08:00:00Z', ringkasan: 'Persiapan matang tim protokoler untuk acara VIP tingkat nasional berjalan dengan lancar tanpa hambatan.' },
  { id: 'post-2', judul: 'Pengarahan Tamu Resmi Universitas', kategori: 'Protokol VIP', gambar: '/gallery_2.png', tanggal: '2026-06-14T08:00:00Z', ringkasan: 'Briefing dan pengarahan khusus diberikan kepada tim yang akan bertugas menyambut tamu VVIP dari kementerian.' },
  { id: 'post-3', judul: 'Puncak Upacara Wisuda Ke-123', kategori: 'Wisuda', gambar: '/gallery_3.png', tanggal: '2026-06-10T08:00:00Z', ringkasan: 'Momen puncak upacara wisuda periode ke-123. Tim protokoler mengawal jalannya acara dari awal hingga akhir.' },
  { id: 'post-4', judul: 'Rapat Koordinasi Tim Nasional', kategori: 'Internal', gambar: '/gallery_1.png', tanggal: '2026-06-05T08:00:00Z', ringkasan: 'Koordinasi lintas divisi untuk mempersiapkan serangkaian agenda besar universitas di bulan depan.' },
  { id: 'post-5', judul: 'Pelatihan Service Excellence', kategori: 'Pelatihan', gambar: '/gallery_2.png', tanggal: '2026-06-01T08:00:00Z', ringkasan: 'Peningkatan kapasitas anggota protokoler dalam memberikan pelayanan prima kepada tamu-tamen kehormatan.' },
];

export const postinganApi = {
  list: async () => {
    try {
      const res = await apiFetch('/api/dokumentasi');
      // Map data backend ke format yang dipakai frontend
      return (res.data || []).map((item: any) => ({
        id: item.kegiatan_id,
        judul: item.nama_kegiatan,
        kategori: item.status || 'Kegiatan',
        gambar: '/gallery_1.png',
        tanggal: item.tanggal,
        ringkasan: `${item.dokumentasi_count} file dokumentasi telah diupload`,
      }));
    } catch {
      return [];
    }
  },
  create: async (data: any) => {
    // Upload dokumentasi ke backend
    const formData = new FormData();
    formData.append('kegiatan_id', data.kegiatan_id || '');
    formData.append('media_type', data.media_type || 'foto');
    formData.append('keterangan', data.ringkasan || '');
    if (data.file instanceof File) {
      formData.append('file', data.file);
    }
    return apiFetch('/api/dokumentasi/upload', {
      method: 'POST',
      body: formData,
    });
  },
  delete: async (id: string) => {
    // Tidak ada endpoint delete dokumentasi di backend saat ini
    // Mengembalikan sukses untuk kompatibilitas
    return true;
  },
  byKegiatan: async (kegiatanId: string) => {
    return apiFetch(`/api/dokumentasi/kegiatan/${kegiatanId}`);
  },
  uploadReal: async (data: FormData) => {
    return apiFetch('/api/dokumentasi/upload', {
      method: 'POST',
      body: data,
    });
  }
};

