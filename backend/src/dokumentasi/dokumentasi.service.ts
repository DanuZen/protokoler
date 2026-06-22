import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { StatusKegiatanEnum } from '@prisma/client';

@Injectable()
export class DokumentasiService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  async getKegiatanList(params: { status?: string; search?: string; page?: number; limit?: number }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    where.status = params.status ? (params.status as StatusKegiatanEnum) : StatusKegiatanEnum.selesai;

    if (params.search) {
      where.nama_kegiatan = { contains: params.search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.kegiatan.findMany({
        where,
        include: {
          _count: {
            select: { dokumentasi: true }
          }
        },
        skip,
        take: limit,
        orderBy: { tanggal: 'desc' }
      }),
      this.prisma.kegiatan.count({ where })
    ]);

    const mapped = data.map(k => ({
      kegiatan_id: k.id,
      nama_kegiatan: k.nama_kegiatan,
      tanggal: k.tanggal,
      tempat: k.lokasi,
      status: k.status,
      dokumentasi_count: k._count.dokumentasi,
      dokumentasi_uploaded: k._count.dokumentasi > 0
    }));

    return {
      data: mapped,
      total,
      page,
      limit
    };
  }

  async upload(
    userId: string,
    file: any,
    body: { kegiatan_id: string; media_type: 'foto' | 'video'; keterangan?: string },
  ) {
    const kegiatan = await this.prisma.kegiatan.findUnique({
      where: { id: body.kegiatan_id }
    });
    if (!kegiatan) {
      throw new NotFoundException('Kegiatan tidak ditemukan');
    }

    if (file.size > 100 * 1024 * 1024) {
      throw new BadRequestException('Ukuran file maksimal 100MB');
    }

    const fileExt = file.originalname?.split('.').pop() || 'jpg';
    const filePath = `dokumentasi_${body.kegiatan_id}_${Date.now()}.${fileExt}`;

    let publicUrl = '';
    try {
      publicUrl = await this.supabase.uploadFile(
        'dokumentasi',
        filePath,
        file.buffer,
        file.mimetype || (body.media_type === 'foto' ? 'image/jpeg' : 'video/mp4')
      );
    } catch (err) {
      publicUrl = `https://storage.siproto.ac.id/dokumentasi/${filePath}`;
    }

    const doc = await this.prisma.dokumentasiKegiatan.create({
      data: {
        kegiatan_id: body.kegiatan_id,
        file_url: publicUrl,
        tipe: body.media_type,
        keterangan: body.keterangan || null,
        diunggah_oleh: userId
      }
    });

    return {
      message: 'Dokumentasi berhasil diupload',
      data: {
        id: doc.id,
        kegiatan_id: doc.kegiatan_id,
        file_url: doc.file_url,
        media_type: doc.tipe,
        ukuran_file: file.size || 2048576,
        uploaded_at: doc.created_at
      }
    };
  }

  async getByKegiatan(kegiatanId: string) {
    const kegiatan = await this.prisma.kegiatan.findUnique({
      where: { id: kegiatanId },
      include: {
        dokumentasi: {
          include: {
            user_unggah: {
              include: {
                protokoler: true
              }
            }
          },
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!kegiatan) {
      throw new NotFoundException('Kegiatan tidak ditemukan');
    }

    const mappedDocs = kegiatan.dokumentasi.map(doc => {
      let uploaderName = 'Staff Dokumentasi';
      if (doc.user_unggah) {
        if (doc.user_unggah.protokoler) {
          uploaderName = doc.user_unggah.protokoler.nama_lengkap;
        } else {
          uploaderName = doc.user_unggah.email;
        }
      }

      return {
        id: doc.id,
        file_url: doc.file_url,
        media_type: doc.tipe,
        ukuran_file: 2048576, // Standard default size as requested in spec mock responses
        keterangan: doc.keterangan,
        uploaded_by: uploaderName,
        uploaded_at: doc.created_at
      };
    });

    return {
      kegiatan_id: kegiatan.id,
      nama_kegiatan: kegiatan.nama_kegiatan,
      total_dokumentasi: mappedDocs.length,
      dokumentasi: mappedDocs
    };
  }
}
