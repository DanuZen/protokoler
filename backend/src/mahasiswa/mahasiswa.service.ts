import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface CreateMahasiswaDto {
  nama_lengkap: string;
  nim: string;
  prodi: string;
  angkatan: number;
  email?: string;
  no_hp?: string;
  status?: 'aktif' | 'tidak_aktif' | 'cuti';
  user_id?: string;
}

export interface UpdateMahasiswaDto extends Partial<CreateMahasiswaDto> {}

@Injectable()
export class MahasiswaService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(search?: string) {
    const sb = this.supabaseService.getClient();
    let query = sb.from('mahasiswa').select('*').order('nama_lengkap');
    if (search) {
      query = query.or(`nama_lengkap.ilike.%${search}%,nim.ilike.%${search}%,prodi.ilike.%${search}%`);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('mahasiswa')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) throw new NotFoundException('Mahasiswa tidak ditemukan');
    return data;
  }

  async create(dto: CreateMahasiswaDto) {
    const { data, error } = await this.supabaseService.getClient()
      .from('mahasiswa')
      .insert(dto)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, dto: UpdateMahasiswaDto) {
    const { data, error } = await this.supabaseService.getClient()
      .from('mahasiswa')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService.getClient()
      .from('mahasiswa')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  }
}
