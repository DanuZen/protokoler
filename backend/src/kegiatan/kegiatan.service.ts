import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface CreateKegiatanDto {
  nama_kegiatan: string;
  bentuk: 'wisuda' | 'kunjungan' | 'seminar' | 'pelantikan' | 'rapat_resmi' | 'lainnya';
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  lokasi: string;
  deskripsi?: string;
  status?: 'draft' | 'terkonfirmasi' | 'selesai' | 'batal';
  created_by?: string;
}

export interface UpdateKegiatanDto extends Partial<CreateKegiatanDto> {}

@Injectable()
export class KegiatanService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(status?: string, bentuk?: string) {
    const sb = this.supabaseService.getClient();
    let query = sb.from('kegiatan').select('*').order('tanggal', { ascending: false });
    if (status) query = query.eq('status', status);
    if (bentuk) query = query.eq('bentuk', bentuk);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('kegiatan')
      .select(`
        *,
        penugasan(
          id, peran, status_konfirmasi, catatan,
          mahasiswa:mahasiswa_id(id, nama_lengkap, nim, prodi)
        ),
        tamu(id, nama_tamu, jabatan, instansi, jumlah_rombongan)
      `)
      .eq('id', id)
      .single();
    if (error || !data) throw new NotFoundException('Kegiatan tidak ditemukan');
    return data;
  }

  async create(dto: CreateKegiatanDto) {
    const { data, error } = await this.supabaseService.getClient()
      .from('kegiatan')
      .insert(dto)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, dto: UpdateKegiatanDto) {
    const { data, error } = await this.supabaseService.getClient()
      .from('kegiatan')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService.getClient()
      .from('kegiatan')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  }
}
