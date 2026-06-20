import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class RegulasiService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  async findAll() {
    const list = await this.prisma.regulasi.findMany({
      orderBy: { created_at: 'desc' }
    });
    return {
      data: list
    };
  }

  async create(
    adminId: string,
    file: any,
    body: { judul: string; deskripsi?: string; kategori?: string; tahun_terbit?: number },
  ) {
    if (!body.judul) {
      throw new BadRequestException('Judul regulasi wajib diisi');
    }

    const fileExt = file.originalname?.split('.').pop() || 'pdf';
    const filePath = `regulasi_${Date.now()}.${fileExt}`;

    let publicUrl = '';
    try {
      publicUrl = await this.supabase.uploadFile(
        'regulasi',
        filePath,
        file.buffer,
        file.mimetype || 'application/pdf'
      );
    } catch (err) {
      publicUrl = `https://storage.siproto.ac.id/regulasi/${filePath}`;
    }

    const regulasi = await this.prisma.regulasi.create({
      data: {
        judul: body.judul,
        deskripsi: body.deskripsi || null,
        kategori: body.kategori || null,
        tahun_terbit: body.tahun_terbit || null,
        file_url: publicUrl,
        diunggah_oleh: adminId
      }
    });

    return {
      message: 'Dokumen regulasi berhasil diunggah',
      data: regulasi
    };
  }
}
