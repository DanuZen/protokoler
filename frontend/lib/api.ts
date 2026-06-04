/**
 * API client untuk memanggil NestJS backend.
 * Semua request diarahkan ke /api/* yang di-proxy ke NestJS (port 4000).
 */

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ──────────────── MAHASISWA ────────────────
export const mahasiswaApi = {
  list: (search?: string) =>
    request<any[]>(`/mahasiswa${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  get: (id: string) => request<any>(`/mahasiswa/${id}`),
  create: (data: any) => request<any>('/mahasiswa', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request<any>(`/mahasiswa/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) => request<any>(`/mahasiswa/${id}`, { method: 'DELETE' }),
};

// ──────────────── KEGIATAN ────────────────
export const kegiatanApi = {
  list: (params?: { status?: string; bentuk?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.bentuk) q.set('bentuk', params.bentuk);
    const qs = q.toString();
    return request<any[]>(`/kegiatan${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => request<any>(`/kegiatan/${id}`),
  create: (data: any) => request<any>('/kegiatan', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request<any>(`/kegiatan/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) => request<any>(`/kegiatan/${id}`, { method: 'DELETE' }),
};

// ──────────────── PENUGASAN ────────────────
export const penugasanApi = {
  byKegiatan: (kegiatan_id: string) =>
    request<any[]>(`/penugasan?kegiatan_id=${kegiatan_id}`),
  byMahasiswa: (mahasiswa_id: string) =>
    request<any[]>(`/penugasan?mahasiswa_id=${mahasiswa_id}`),
  create: (data: any) =>
    request<any>('/penugasan', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request<any>(`/penugasan/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) => request<any>(`/penugasan/${id}`, { method: 'DELETE' }),
};

// ──────────────── DASHBOARD ────────────────
export const dashboardApi = {
  stats: () => request<any>('/dashboard/stats'),
  upcoming: (limit = 5) => request<any[]>(`/dashboard/upcoming?limit=${limit}`),
  recent: (limit = 5) => request<any[]>(`/dashboard/recent?limit=${limit}`),
};

// ──────────────── LAPORAN ────────────────
export const laporanApi = {
  kegiatan: (start: string, end: string, status?: string) => {
    const q = new URLSearchParams({ start, end });
    if (status) q.set('status', status);
    return request<any[]>(`/laporan/kegiatan?${q}`);
  },
  rekap: (start: string, end: string) =>
    request<any>(`/laporan/rekap?start=${start}&end=${end}`),
};
