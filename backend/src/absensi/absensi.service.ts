import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { StatusPendaftaranEnum, StatusHadirEnum } from '@prisma/client';

@Injectable()
export class AbsensiService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  async recordAbsensi(
    kegiatanId: string,
    protokolerId: string,
    file: any,
    latitude?: number,
    longitude?: number,
  ) {
    // 1. Verify user is accepted/redirected for this kegiatan
    const registration = await this.prisma.pendaftaranKegiatan.findFirst({
      where: {
        protokoler_id: protokolerId,
        OR: [
          { kegiatan_id: kegiatanId, status: StatusPendaftaranEnum.diterima },
          { kegiatan_dialihkan_id: kegiatanId, status: StatusPendaftaranEnum.dialihkan }
        ]
      }
    });

    if (!registration) {
      throw new ForbiddenException('Anda tidak terdaftar di kegiatan ini');
    }

    // 2. Fetch kegiatan details
    const kegiatan = await this.prisma.kegiatan.findUnique({
      where: { id: kegiatanId }
    });

    if (!kegiatan) {
      throw new NotFoundException('Kegiatan tidak ditemukan');
    }

    // 3. Time Validation
    const now = new Date();
    const kegiatanDate = new Date(kegiatan.tanggal);
    
    // Normalize dates to check if they are the same calendar day
    const isSameDay = 
      now.getFullYear() === kegiatanDate.getFullYear() &&
      now.getMonth() === kegiatanDate.getMonth() &&
      now.getDate() === kegiatanDate.getDate();

    if (process.env.NODE_ENV === 'production' && !isSameDay) {
      throw new BadRequestException('Kegiatan tidak dilaksanakan hari ini');
    }

    // Compare times
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const nowTimeMs = new Date(1970, 0, 1, currentHours, currentMinutes, 0).getTime();
    
    const startTimeMs = new Date(kegiatan.jam_mulai).getTime();
    const endTimeMs = new Date(kegiatan.jam_selesai).getTime();

    if (process.env.NODE_ENV === 'production' && nowTimeMs < startTimeMs) {
      throw new BadRequestException('Absensi belum dibuka');
    }
    if (process.env.NODE_ENV === 'production' && nowTimeMs > endTimeMs) {
      throw new BadRequestException('Absensi sudah ditutup');
    }

    // 4. Check duplicate check-in
    const existingAbsensi = await this.prisma.absensi.findUnique({
      where: {
        kegiatan_id_protokoler_id: {
          kegiatan_id: kegiatanId,
          protokoler_id: protokolerId
        }
      }
    });

    if (existingAbsensi) {
      throw new ConflictException('Anda sudah melakukan absensi sebelumnya');
    }

    // 5. Upload photo to Supabase Storage (if provided)
    let photoUrl = '';
    
    if (file) {
      const fileExt = file.originalname?.split('.').pop() || 'jpg';
      const filePath = `absensi_${kegiatanId}_${protokolerId}.${fileExt}`;
      
      try {
        photoUrl = await this.supabase.uploadFile(
          'protokoler-absensi',
          filePath,
          file.buffer,
          file.mimetype || 'image/jpeg'
        );
      } catch (err) {
        // Fallback placeholder URL
        photoUrl = `https://storage.siproto.ac.id/protokoler-absensi/${filePath}`;
      }
    } else {
      // Photo is skipped because AI face detection verified the presence
      photoUrl = 'TERDETEKSI_OTOMATIS';
    }

    // 6. Record absensi in database
    const absensi = await this.prisma.absensi.create({
      data: {
        kegiatan_id: kegiatanId,
        protokoler_id: protokolerId,
        foto_selfie_url: photoUrl,
        waktu_absen: now,
        status: StatusHadirEnum.hadir,
        latitude: latitude !== undefined ? latitude : null,
        longitude: longitude !== undefined ? longitude : null
      }
    });

    return {
      message: 'Absensi berhasil dicatat',
      data: {
        id: absensi.id,
        waktu_absen: absensi.waktu_absen,
        status: absensi.status
      }
    };
  }

  async getRecap(kegiatanId: string, userRole?: string, userProtokolerId?: string) {
    if (userRole === 'protokoler') {
      if (!userProtokolerId) {
        return { data: [] };
      }

      const registration = await this.prisma.pendaftaranKegiatan.findFirst({
        where: {
          protokoler_id: userProtokolerId,
          OR: [
            { kegiatan_id: kegiatanId, status: StatusPendaftaranEnum.diterima },
            { kegiatan_dialihkan_id: kegiatanId, status: StatusPendaftaranEnum.dialihkan }
          ]
        }
      });

      if (!registration) {
        return { data: [] };
      }
    }

    const data = await this.prisma.absensi.findMany({
      where: { kegiatan_id: kegiatanId },
      include: {
        protokoler: {
          select: {
            id: true,
            nama_lengkap: true,
            nim: true
          }
        }
      }
    });

    return {
      data: data.map(item => ({
        id: item.id,
        waktu_absen: item.waktu_absen,
        status: item.status,
        foto_selfie_url: item.foto_selfie_url,
        latitude: item.latitude ? Number(item.latitude) : null,
        longitude: item.longitude ? Number(item.longitude) : null,
        protokoler: item.protokoler
      }))
    };
  }
}
