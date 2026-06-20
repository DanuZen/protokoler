import { Injectable, NotFoundException, UnprocessableEntityException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { StatusAkunEnum } from '@prisma/client';

@Injectable()
export class ProtokolerService {
  private readonly logger = new Logger(ProtokolerService.name);

  constructor(
    private prisma: PrismaService,
    private supabaseService: SupabaseService,
  ) {}

  async findAll(params: {
    status_akun?: string;
    search?: string;
    prodi?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.status_akun) {
      where.status_akun = params.status_akun as StatusAkunEnum;
    }

    if (params.prodi) {
      where.prodi = { contains: params.prodi, mode: 'insensitive' };
    }

    if (params.search) {
      where.OR = [
        { nama_lengkap: { contains: params.search, mode: 'insensitive' } },
        { nim: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.protokoler.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.protokoler.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        total_pages: totalPages,
      },
    };
  }

  async findOne(id: string) {
    const protokoler = await this.prisma.protokoler.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!protokoler) {
      throw new NotFoundException('Data protokoler tidak ditemukan');
    }

    return protokoler;
  }

  async findOneByUserId(userId: string) {
    const protokoler = await this.prisma.protokoler.findUnique({
      where: { user_id: userId },
      include: { user: true },
    });

    if (!protokoler) {
      throw new NotFoundException('Data protokoler tidak ditemukan');
    }

    return protokoler;
  }

  async verifyAccount(id: string, body: { aksi: 'setujui' | 'tolak'; catatan_penolakan?: string }) {
    const protokoler = await this.findOne(id);

    const status_akun = body.aksi === 'setujui' ? StatusAkunEnum.aktif : StatusAkunEnum.ditolak;
    const catatan_penolakan = body.aksi === 'tolak' ? body.catatan_penolakan || 'Pendaftaran ditolak oleh admin' : null;

    const updated = await this.prisma.protokoler.update({
      where: { id },
      data: {
        status_akun,
        catatan_penolakan,
      },
    });

    return {
      message: 'Akun berhasil diverifikasi',
      data: {
        id: updated.id,
        status_akun: updated.status_akun,
      },
    };
  }

  async remove(id: string) {
    const protokoler = await this.findOne(id);
    const userId = protokoler.user_id;

    // Hapus user dari Supabase Auth (cascade di DB akan hapus protokoler & data terkait)
    const supabase = this.supabaseService.getClient();
    await supabase.auth.admin.deleteUser(userId);

    // Hapus dari database (User → cascade ke Protokoler, dsb)
    await this.prisma.user.delete({ where: { id: userId } });

    return {
      message: 'Anggota protokoler berhasil dihapus',
    };
  }

  async updateProfile(
    id: string,
    body: { no_hp?: string; nama_lengkap?: string; prodi?: string; departemen?: string; fakultas?: string },
    files?: { foto_setengah_badan?: any[]; foto_full_body?: any[] }
  ) {
    const protokoler = await this.findOne(id);
    const userId = protokoler.user_id;

    const updateData: any = {};

    if (body.no_hp) {
      updateData.no_hp = body.no_hp;
    }
    if (body.nama_lengkap) {
      updateData.nama_lengkap = body.nama_lengkap;
      
      // Sync name metadata in Supabase Auth
      try {
        const supabase = this.supabaseService.getClient();
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: { nama_lengkap: body.nama_lengkap },
        });
      } catch (err) {
        this.logger.warn(`Failed to sync auth display name: ${err.message}`);
      }
    }
    if (body.prodi) {
      updateData.prodi = body.prodi;
    }
    if (body.departemen) {
      updateData.departemen = body.departemen;
    }
    if (body.fakultas) {
      updateData.fakultas = body.fakultas;
    }

    if (files) {
      if (files.foto_setengah_badan && files.foto_setengah_badan.length > 0) {
        const file = files.foto_setengah_badan[0];
        const ext = file.originalname.split('.').pop() || 'jpg';
        const url = await this.supabaseService.uploadFile(
          'protokoler-photos',
          `setengah_badan/${userId}_setengah_badan_${Date.now()}.${ext}`,
          file.buffer,
          file.mimetype,
        );
        updateData.foto_setengah_badan_url = url;
      }

      if (files.foto_full_body && files.foto_full_body.length > 0) {
        const file = files.foto_full_body[0];
        const ext = file.originalname.split('.').pop() || 'jpg';
        const url = await this.supabaseService.uploadFile(
          'protokoler-photos',
          `full_body/${userId}_full_body_${Date.now()}.${ext}`,
          file.buffer,
          file.mimetype,
        );
        updateData.foto_full_body_url = url;
      }
    }

    const updated = await this.prisma.protokoler.update({
      where: { id },
      data: updateData,
    });

    return {
      message: 'Profil berhasil diperbarui',
      data: updated,
    };
  }
}
