import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SertifikatService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const list = await this.prisma.sertifikat.findMany({
      include: {
        kegiatan: {
          select: {
            nama_kegiatan: true,
            tanggal: true
          }
        }
      },
      orderBy: { tanggal_terbit: 'desc' }
    });

    return {
      data: list.map(c => ({
        id: c.id,
        nomor_sertifikat: c.nomor_sertifikat,
        kegiatan: c.kegiatan,
        kategori: c.kategori,
        tanggal_terbit: c.tanggal_terbit,
        file_url: c.file_url
      }))
    };
  }

  async findByProtokoler(protokolerId: string) {
    const list = await this.prisma.sertifikat.findMany({
      where: { protokoler_id: protokolerId },
      include: {
        kegiatan: {
          select: {
            nama_kegiatan: true,
            tanggal: true
          }
        }
      },
      orderBy: { tanggal_terbit: 'desc' }
    });

    return {
      data: list.map(c => ({
        id: c.id,
        nomor_sertifikat: c.nomor_sertifikat,
        kegiatan: c.kegiatan,
        kategori: c.kategori,
        tanggal_terbit: c.tanggal_terbit,
        file_url: c.file_url
      }))
    };
  }

  async findOne(id: string) {
    const cert = await this.prisma.sertifikat.findUnique({
      where: { id }
    });
    if (!cert) {
      throw new NotFoundException('Sertifikat tidak ditemukan');
    }
    return cert;
  }
}
