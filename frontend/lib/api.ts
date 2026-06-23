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
    judul: 'SOP Penyambutan Tamu VVIP',
    deskripsi: 'Panduan lengkap dan standar operasional untuk penyambutan pejabat negara, menteri, dan tamu kehormatan VIP/VVIP.',
    tanggal_berlaku: '10 Jan 2026',
    link_dokumen: '#',
    accentGradient: 'linear-gradient(135deg, #6B0000, #9f0000)'
  },
  {
    id: 'reg-2',
    judul: 'SOP Tata Tempat Upacara',
    deskripsi: 'Aturan presisi untuk pengaturan letak kursi, mimbar kehormatan, dan penempatan barisan dalam upacara resmi universitas.',
    tanggal_berlaku: '15 Feb 2026',
    link_dokumen: '#',
    accentGradient: 'linear-gradient(135deg, #D2AD5C, #eecf83)'
  },
  {
    id: 'reg-3',
    judul: 'SOP Pelayanan Konsumsi',
    deskripsi: 'Standar penyajian hidangan tamu (table manner), pengujian keamanan makanan, serta etika pelayanan jamuan resmi.',
    tanggal_berlaku: '01 Mar 2026',
    link_dokumen: '#',
    accentGradient: 'linear-gradient(135deg, #1e293b, #334155)'
  }
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

// ──────────────── POSTINGAN / DOKUMENTASI ────────────────
const defaultPostingan: any[] = [
  {
    id: 'post-1',
    kategori: 'Liputan Utama',
    judul: 'Kunjungan Kerja Menteri Pendidikan ke Universitas Negeri Padang',
    ringkasan: 'Tim Protokoler UNP sukses mengawal jalannya acara kunjungan kerja Mendikbudristek dalam rangka peresmian gedung laboratorium terpadu baru.',
    tanggal: '2026-05-12T08:00:00Z',
    gambar: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80'
  },
  {
    id: 'post-2',
    kategori: 'Pelatihan',
    judul: 'Diklat Lanjutan Anggota Protokoler Angkatan 2026',
    ringkasan: 'Pelatihan intensif mengenai table manner, tata upacara, dan public speaking untuk meningkatkan kualitas dan performa anggota di lapangan.',
    tanggal: '2026-05-10T08:00:00Z',
    gambar: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&q=80'
  },
  {
    id: 'post-3',
    kategori: 'Galeri',
    judul: 'Persiapan Wisuda Ke-134 UNP Berjalan Lancar',
    ringkasan: 'Gladi bersih dan persiapan venue wisuda ke-134 yang dipimpin langsung oleh kordinator tata tempat dan tamu VIP.',
    tanggal: '2026-05-08T08:00:00Z',
    gambar: 'https://images.unsplash.com/photo-1523580494112-071d384e236c?w=1200&q=80'
  },
  {
    id: 'post-4',
    kategori: 'Agenda',
    judul: 'Penyambutan Mahasiswa Baru Internasional',
    ringkasan: 'Standar penyambutan khusus untuk mahasiswa internasional dalam program pertukaran budaya tingkat universitas.',
    tanggal: '2026-05-05T08:00:00Z',
    gambar: 'https://images.unsplash.com/photo-1511629091441-ee46146481b6?w=1200&q=80'
  }
];

export const postinganApi = {
  list: async () => {
    try {
      const res = await apiFetch('/api/dokumentasi');
      // Map data backend ke format yang dipakai frontend
      return (res.data || []).map((item: any) => {
        const photos = (item.dokumentasi || []).filter((d: any) => d.media_type === 'foto');
        const defaultImage = '/gallery_1.png';
        
        // Cari keterangan berita riil dari salah satu foto, default ke hitungan berkas jika tidak ada
        const firstPhotoWithKeterangan = (item.dokumentasi || []).find((d: any) => d.keterangan && d.keterangan.trim() !== '');
        const ringkasan = firstPhotoWithKeterangan ? firstPhotoWithKeterangan.keterangan : `${item.dokumentasi_count} file dokumentasi telah diupload`;
        
        // Cari kategori riil dari salah satu foto, default ke status kegiatan jika tidak ada
        const firstPhotoWithKategori = (item.dokumentasi || []).find((d: any) => d.kategori && d.kategori.trim() !== '');
        const kategori = firstPhotoWithKategori ? firstPhotoWithKategori.kategori : (item.status || 'Kegiatan');

        return {
          id: item.kegiatan_id,
          judul: item.nama_kegiatan,
          kategori: kategori,
          gambar: photos.length > 0 ? photos[0].file_url : defaultImage,
          images: photos.length > 0 ? photos.map((p: any) => p.file_url) : [defaultImage],
          tanggal: item.tanggal,
          ringkasan: ringkasan,
          dokumentasi: item.dokumentasi || []
        };
      });
    } catch {
      return [];
    }
  },
  create: async (data: any) => {
    const files = data.files || [];
    if (files.length > 0) {
      const uploadPromises = files.map((file: File) => {
        const formData = new FormData();
        formData.append('kegiatan_id', data.kegiatan_id || '');
        formData.append('media_type', data.media_type || 'foto');
        formData.append('keterangan', data.ringkasan || '');
        formData.append('kategori', data.kategori || '');
        formData.append('file', file);
        return apiFetch('/api/dokumentasi/upload', {
          method: 'POST',
          body: formData,
        });
      });
      return Promise.all(uploadPromises);
    }

    // Fallback single file upload
    const formData = new FormData();
    formData.append('kegiatan_id', data.kegiatan_id || '');
    formData.append('media_type', data.media_type || 'foto');
    formData.append('keterangan', data.ringkasan || '');
    formData.append('kategori', data.kategori || '');
    if (data.file instanceof File) {
      formData.append('file', data.file);
    }
    return apiFetch('/api/dokumentasi/upload', {
      method: 'POST',
      body: formData,
    });
  },
  update: async (kegiatanId: string, data: { ringkasan?: string; kategori?: string }) => {
    return apiFetch(`/api/dokumentasi/kegiatan/${kegiatanId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        keterangan: data.ringkasan,
        kategori: data.kategori,
      }),
    });
  },
  delete: async (id: string) => {
    return apiFetch(`/api/dokumentasi/${id}`, {
      method: 'DELETE',
    });
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

