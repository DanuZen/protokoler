import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class DashboardService {
  constructor(private supabaseService: SupabaseService) {}

  async getStats() {
    const sb = this.supabaseService.getClient();
    const [mahasiswaRes, kegiatanRes, penugasanRes, mendatangRes] = await Promise.all([
      sb.from('mahasiswa').select('id', { count: 'exact', head: true }),
      sb.from('kegiatan').select('id', { count: 'exact', head: true }),
      sb.from('penugasan').select('id', { count: 'exact', head: true }),
      sb.from('kegiatan')
        .select('id', { count: 'exact', head: true })
        .gte('tanggal', new Date().toISOString().slice(0, 10))
        .eq('status', 'terkonfirmasi'),
    ]);

    return {
      total_mahasiswa: mahasiswaRes.count ?? 0,
      total_kegiatan: kegiatanRes.count ?? 0,
      total_penugasan: penugasanRes.count ?? 0,
      kegiatan_mendatang: mendatangRes.count ?? 0,
    };
  }

  async getUpcoming(limit = 5) {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await this.supabaseService.getClient()
      .from('kegiatan')
      .select('id, nama_kegiatan, bentuk, tanggal, jam_mulai, jam_selesai, lokasi, status')
      .gte('tanggal', today)
      .neq('status', 'batal')
      .order('tanggal')
      .limit(limit);
    if (error) throw new Error(error.message);
    return data;
  }

  async getRecent(limit = 5) {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await this.supabaseService.getClient()
      .from('kegiatan')
      .select('id, nama_kegiatan, bentuk, tanggal, jam_mulai, jam_selesai, lokasi, status')
      .lt('tanggal', today)
      .order('tanggal', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return data;
  }
}
