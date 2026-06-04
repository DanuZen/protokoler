import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface CreatePenugasanDto {
  kegiatan_id: string;
  mahasiswa_id: string;
  peran: 'lo' | 'protokoler';
  catatan?: string;
  status_konfirmasi?: 'pending' | 'dikonfirmasi' | 'ditolak';
}

export interface UpdatePenugasanDto extends Partial<CreatePenugasanDto> {}

@Injectable()
export class PenugasanService {
  constructor(private supabaseService: SupabaseService) {}

  async findByKegiatan(kegiatan_id: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('penugasan')
      .select(`
        id, peran, status_konfirmasi, catatan,
        mahasiswa:mahasiswa_id(id, nama_lengkap, nim, prodi)
      `)
      .eq('kegiatan_id', kegiatan_id);
    if (error) throw new Error(error.message);
    return data;
  }

  async findByMahasiswa(mahasiswa_id: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('penugasan')
      .select(`
        id, peran, status_konfirmasi, catatan,
        kegiatan:kegiatan_id(id, nama_kegiatan, bentuk, tanggal, jam_mulai, jam_selesai, lokasi, status)
      `)
      .eq('mahasiswa_id', mahasiswa_id)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  }

  async create(dto: CreatePenugasanDto) {
    const { data, error } = await this.supabaseService.getClient()
      .from('penugasan')
      .insert(dto)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, dto: UpdatePenugasanDto) {
    const { data, error } = await this.supabaseService.getClient()
      .from('penugasan')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService.getClient()
      .from('penugasan')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  }
}
