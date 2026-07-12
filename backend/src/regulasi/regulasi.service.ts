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
    body: { judul: string; deskripsi?: string; kategori?: string; tahun_terbit?: number; file_url?: string },
  ) {
    if (!body.judul) {
      throw new BadRequestException('Judul regulasi wajib diisi');
    }

    let publicUrl = body.file_url || '';

    if (file) {
      const fileExt = file.originalname?.split('.').pop() || 'pdf';
      const filePath = `regulasi_${Date.now()}.${fileExt}`;
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

  async update(id: string, body: { judul?: string; deskripsi?: string; file_url?: string }) {
    const regulasi = await this.prisma.regulasi.findUnique({ where: { id } });
    if (!regulasi) {
      throw new BadRequestException('Regulasi tidak ditemukan');
    }

    const updated = await this.prisma.regulasi.update({
      where: { id },
      data: {
        judul: body.judul !== undefined ? body.judul : regulasi.judul,
        deskripsi: body.deskripsi !== undefined ? body.deskripsi : regulasi.deskripsi,
        file_url: body.file_url !== undefined ? body.file_url : regulasi.file_url,
      }
    });

    return {
      message: 'Regulasi berhasil diperbarui',
      data: updated
    };
  }

  async remove(id: string) {
    const regulasi = await this.prisma.regulasi.findUnique({
      where: { id }
    });

    if (!regulasi) {
      throw new BadRequestException('Regulasi tidak ditemukan');
    }

    try {
      if (regulasi.file_url) {
        const bucket = 'regulasi';
        const bucketStr = `/${bucket}/`;
        const idx = regulasi.file_url.indexOf(bucketStr);
        if (idx !== -1) {
          const filePath = regulasi.file_url.substring(idx + bucketStr.length);
          await this.supabase.deleteFile(bucket, filePath);
        }
      }
    } catch (e) {
      console.error(`Gagal menghapus file regulasi dari storage: ${e.message}`);
    }

    await this.prisma.regulasi.delete({
      where: { id }
    });

    return {
      message: 'Regulasi berhasil dihapus'
    };
  }
}
