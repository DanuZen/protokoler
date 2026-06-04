import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class LaporanService {
  constructor(private supabaseService: SupabaseService) {}

  async getKegiatan(start: string, end: string, status?: string) {
    const sb = this.supabaseService.getClient();
    let query = sb
      .from('kegiatan')
      .select(`
        id, nama_kegiatan, bentuk, tanggal, jam_mulai, jam_selesai, lokasi, status,
        penugasan(id, peran, status_konfirmasi, mahasiswa:mahasiswa_id(nama_lengkap, nim))
      `)
      .gte('tanggal', start)
      .lte('tanggal', end)
      .order('tanggal');
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  async getRekap(start: string, end: string) {
    const sb = this.supabaseService.getClient();

    const { data: kegiatan, error: kErr } = await sb
      .from('kegiatan')
      .select('id, nama_kegiatan, bentuk, tanggal, status')
      .gte('tanggal', start)
      .lte('tanggal', end);
    if (kErr) throw new Error(kErr.message);

    const { data: penugasan, error: pErr } = await sb
      .from('penugasan')
      .select('id, kegiatan_id, mahasiswa_id, peran, status_konfirmasi')
      .in('kegiatan_id', (kegiatan ?? []).map((k: any) => k.id));
    if (pErr) throw new Error(pErr.message);

    const { data: mahasiswa, error: mErr } = await sb
      .from('mahasiswa')
      .select('id, nama_lengkap, nim, prodi');
    if (mErr) throw new Error(mErr.message);

    // Rekap per mahasiswa
    const rekapMap: Record<string, any> = {};
    for (const p of penugasan ?? []) {
      if (!rekapMap[p.mahasiswa_id]) {
        const mhs = (mahasiswa ?? []).find((m: any) => m.id === p.mahasiswa_id);
        rekapMap[p.mahasiswa_id] = {
          mahasiswa_id: p.mahasiswa_id,
          nama_lengkap: mhs?.nama_lengkap ?? '-',
          nim: mhs?.nim ?? '-',
          prodi: mhs?.prodi ?? '-',
          total_tugas: 0,
          dikonfirmasi: 0,
          ditolak: 0,
          pending: 0,
        };
      }
      rekapMap[p.mahasiswa_id].total_tugas++;
      if (p.status_konfirmasi === 'dikonfirmasi') rekapMap[p.mahasiswa_id].dikonfirmasi++;
      else if (p.status_konfirmasi === 'ditolak') rekapMap[p.mahasiswa_id].ditolak++;
      else rekapMap[p.mahasiswa_id].pending++;
    }

    return {
      kegiatan,
      rekap_mahasiswa: Object.values(rekapMap).sort((a: any, b: any) => b.total_tugas - a.total_tugas),
      summary: {
        total_kegiatan: kegiatan?.length ?? 0,
        total_penugasan: penugasan?.length ?? 0,
        dikonfirmasi: (penugasan ?? []).filter((p: any) => p.status_konfirmasi === 'dikonfirmasi').length,
      },
    };
  }
}
