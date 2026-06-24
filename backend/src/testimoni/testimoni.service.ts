import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TestimoniService {
  constructor(private prisma: PrismaService) {}

  async createTestimoni(
    kegiatanId: string,
    body: { nama_tamu: string; jabatan_tamu?: string; tipe_tamu?: 'internal' | 'eksternal'; isi_testimoni: string; rating?: number },
  ) {
    const kegiatan = await this.prisma.kegiatan.findUnique({
      where: { id: kegiatanId }
    });
    if (!kegiatan) {
      throw new NotFoundException('Kegiatan tidak ditemukan');
    }

    await this.prisma.testimoniTamu.create({
      data: {
        kegiatan_id: kegiatanId,
        nama_tamu: body.nama_tamu,
        jabatan_tamu: body.jabatan_tamu || null,
        tipe_tamu: (body.tipe_tamu as any) || 'internal',
        isi_testimoni: body.isi_testimoni,
        rating: body.rating || 5,
        waktu_pengisian: new Date()
      }
    });

    return {
      message: 'Terima kasih atas testimoni Anda!'
    };
  }

  async getList(kegiatanId: string) {
    const kegiatan = await this.prisma.kegiatan.findUnique({
      where: { id: kegiatanId }
    });
    if (!kegiatan) {
      throw new NotFoundException('Kegiatan tidak ditemukan');
    }

    const list = await this.prisma.testimoniTamu.findMany({
      where: { kegiatan_id: kegiatanId },
      orderBy: { waktu_pengisian: 'desc' }
    });

    return {
      data: list
    };
  }
}
