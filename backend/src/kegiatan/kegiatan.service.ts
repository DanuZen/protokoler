import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKegiatanDto } from './dto/create-kegiatan.dto';
import { StatusKegiatanEnum, RoleEnum, StatusPendaftaranEnum } from '@prisma/client';
import { autoUpdateStatuses } from '../utils/status-updater';

@Injectable()
export class KegiatanService {
  constructor(private prisma: PrismaService) {}

  private isValidUuid(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  }

  private parseTimeToDate(timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date(1970, 0, 1, Number(hours), Number(minutes), 0);
    return date;
  }

  private formatTimeField(timeField: Date | string | null): string | null {
    if (!timeField) return null;
    let d: Date;
    if (typeof timeField === 'string') {
      if (timeField.includes('T')) {
        d = new Date(timeField);
      } else {
        d = new Date(`1970-01-01T${timeField}Z`);
      }
    } else {
      d = timeField;
    }
    if (isNaN(d.getTime())) return null;
    const h = String(d.getUTCHours()).padStart(2, '0');
    const m = String(d.getUTCMinutes()).padStart(2, '0');
    const s = String(d.getUTCSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  private formatKegiatan(keg: any) {
    if (!keg) return keg;
    return {
      ...keg,
      jam_mulai: this.formatTimeField(keg.jam_mulai),
      jam_selesai: this.formatTimeField(keg.jam_selesai),
    };
  }

  async create(dto: CreateKegiatanDto, userId: string) {
    const start = this.parseTimeToDate(dto.jam_mulai);
    const end = this.parseTimeToDate(dto.jam_selesai);

    const kegiatan = await this.prisma.kegiatan.create({
      data: {
        nama_kegiatan: dto.nama_kegiatan,
        bentuk_kegiatan: dto.bentuk_kegiatan,
        tanggal: new Date(dto.tanggal),
        tanggal_selesai: dto.tanggal_selesai ? new Date(dto.tanggal_selesai) : null,
        jam_mulai: start,
        jam_selesai: end,
        lokasi: dto.lokasi,
        audience: dto.audience,
        keynote: dto.keynote,
        mc: dto.mc,
        status: dto.status || StatusKegiatanEnum.draf,
        jumlah_protokoler_dibutuhkan: dto.jumlah_protokoler_dibutuhkan || 0,
        jumlah_lo_dibutuhkan: dto.jumlah_lo_dibutuhkan || 0,
        dibuat_oleh: userId,
        tamu_vvip: dto.tamu_vvip && dto.tamu_vvip.length > 0 ? {
          create: dto.tamu_vvip.map(t => ({
            nama_tamu: t.nama_tamu,
            jabatan: t.jabatan,
            instansi: t.instansi,
            tipe: t.tipe,
            jumlah_rombongan: t.jumlah_rombongan || 1,
          })),
        } : undefined,
      },
      include: {
        tamu_vvip: true,
      },
    });

    return {
      message: 'Kegiatan berhasil dibuat',
      data: this.formatKegiatan(kegiatan),
    };
  }

  async findAll(params: {
    status?: string;
    bentuk?: string;
    dari_tanggal?: string;
    sampai_tanggal?: string;
    page?: number;
    limit?: number;
  }, userRole: string) {
    await autoUpdateStatuses(this.prisma);
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Enforce role-based restrictions
    if (userRole !== RoleEnum.admin) {
      if (params.status) {
        if (params.status === StatusKegiatanEnum.draf) {
          throw new ForbiddenException('Anda tidak memiliki akses ke kegiatan draf');
        }
        where.status = params.status as StatusKegiatanEnum;
      } else {
        where.status = { not: StatusKegiatanEnum.draf };
      }
    } else if (params.status) {
      where.status = params.status as StatusKegiatanEnum;
    }

    if (params.bentuk) {
      where.bentuk_kegiatan = params.bentuk;
    }

    if (params.dari_tanggal || params.sampai_tanggal) {
      where.tanggal = {};
      if (params.dari_tanggal) {
        where.tanggal.gte = new Date(params.dari_tanggal);
      }
      if (params.sampai_tanggal) {
        where.tanggal.lte = new Date(params.sampai_tanggal);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.kegiatan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tanggal: 'asc' },
        include: {
          tamu_vvip: true,
          _count: {
            select: { pendaftaran: true },
          },
        },
      }),
      this.prisma.kegiatan.count({ where }),
    ]);

    // Map response to match spec (pendaftaran count to pendaftar count)
    const mappedData = data.map(k => {
      const { _count, ...rest } = k;
      return this.formatKegiatan({
        ...rest,
        jumlah_pendaftar: _count.pendaftaran,
      });
    });

    return {
      data: mappedData,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async findOne(id: string, userRole: string, userId?: string) {
    if (!this.isValidUuid(id)) {
      throw new NotFoundException('Kegiatan tidak ditemukan');
    }
    await autoUpdateStatuses(this.prisma);
    const kegiatan = await this.prisma.kegiatan.findUnique({
      where: { id },
      include: {
        tamu_vvip: true,
        pendaftaran: {
          include: {
            protokoler: true,
          },
        },
        pendaftaran_dialihkan: {
          include: {
            protokoler: true,
          },
        },
        _count: {
          select: { pendaftaran: true },
        },
      },
    });

    if (!kegiatan) {
      throw new NotFoundException('Kegiatan tidak ditemukan');
    }

    if (userRole !== RoleEnum.admin && kegiatan.status === StatusKegiatanEnum.draf) {
      throw new ForbiddenException('Anda tidak memiliki akses ke kegiatan ini');
    }

    const { _count, pendaftaran, pendaftaran_dialihkan, ...rest } = kegiatan;
    
    // Combine original and redirected penugasan
    let allPendaftaran = [...pendaftaran];
    if (pendaftaran_dialihkan) {
      allPendaftaran = [...allPendaftaran, ...pendaftaran_dialihkan];
    }

    // Filter pendaftar for protokoler role: only show assigned ones or the user's own registration
    if (userRole === RoleEnum.protokoler) {
      allPendaftaran = allPendaftaran.filter(p => 
        (p.kegiatan_id === id && p.status === StatusPendaftaranEnum.diterima) ||
        (p.kegiatan_dialihkan_id === id && p.status === StatusPendaftaranEnum.dialihkan) ||
        (p.protokoler.user_id === userId)
      );
    }

    const pendaftar = allPendaftaran.map(p => ({
      id: p.id,
      protokoler_id: p.protokoler.user_id,
      nama_lengkap: p.protokoler.nama_lengkap,
      nim: p.protokoler.nim,
      role: p.peran,
      status: p.status,
      tanggal_daftar: p.created_at,
    }));

    return this.formatKegiatan({
      ...rest,
      pendaftar,
      jumlah_pendaftar: _count.pendaftaran,
    });
  }

  async update(id: string, dto: Partial<CreateKegiatanDto>) {
    if (!this.isValidUuid(id)) {
      throw new NotFoundException('Kegiatan tidak ditemukan');
    }
    const existing = await this.prisma.kegiatan.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Kegiatan tidak ditemukan');
    }

    const updateData: any = {};
    if (dto.nama_kegiatan !== undefined) updateData.nama_kegiatan = dto.nama_kegiatan;
    if (dto.bentuk_kegiatan !== undefined) updateData.bentuk_kegiatan = dto.bentuk_kegiatan;
    if (dto.tanggal !== undefined) updateData.tanggal = new Date(dto.tanggal);
    if (dto.tanggal_selesai !== undefined) updateData.tanggal_selesai = dto.tanggal_selesai ? new Date(dto.tanggal_selesai) : null;
    if (dto.jam_mulai !== undefined) updateData.jam_mulai = this.parseTimeToDate(dto.jam_mulai);
    if (dto.jam_selesai !== undefined) updateData.jam_selesai = this.parseTimeToDate(dto.jam_selesai);
    if (dto.lokasi !== undefined) updateData.lokasi = dto.lokasi;
    if (dto.audience !== undefined) updateData.audience = dto.audience;
    if (dto.keynote !== undefined) updateData.keynote = dto.keynote;
    if (dto.mc !== undefined) updateData.mc = dto.mc;
    if ((dto as any).rundown_url !== undefined) updateData.rundown_url = (dto as any).rundown_url;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.jumlah_protokoler_dibutuhkan !== undefined) updateData.jumlah_protokoler_dibutuhkan = dto.jumlah_protokoler_dibutuhkan;
    if (dto.jumlah_lo_dibutuhkan !== undefined) updateData.jumlah_lo_dibutuhkan = dto.jumlah_lo_dibutuhkan;

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.tamu_vvip) {
        // Clear and rewrite tamu lists
        await tx.tamuVVIP.deleteMany({ where: { kegiatan_id: id } });
        if (dto.tamu_vvip.length > 0) {
          await tx.tamuVVIP.createMany({
            data: dto.tamu_vvip.map(t => ({
              kegiatan_id: id,
              nama_tamu: t.nama_tamu,
              jabatan: t.jabatan,
              instansi: t.instansi,
              tipe: t.tipe,
              jumlah_rombongan: t.jumlah_rombongan || 1,
            })),
          });
        }
      }

      return tx.kegiatan.update({
        where: { id },
        data: updateData,
        include: { tamu_vvip: true },
      });
    });

    return {
      message: 'Kegiatan berhasil diperbarui',
      data: this.formatKegiatan(updated),
    };
  }

  async updateChecklist(id: string, body: {
    checklist_tata_tempat?: boolean;
    checklist_tata_upacara?: boolean;
    checklist_tata_penghormatan?: boolean;
    is_open_recruitment?: boolean;
  }) {
    if (!this.isValidUuid(id)) {
      throw new NotFoundException('Kegiatan tidak ditemukan');
    }
    const existing = await this.prisma.kegiatan.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Kegiatan tidak ditemukan');
    }

    const updated = await this.prisma.kegiatan.update({
      where: { id },
      data: body,
    });

    return {
      message: 'Checklist tata protokol berhasil diperbarui',
      data: this.formatKegiatan(updated),
    };
  }

  async remove(id: string) {
    if (!this.isValidUuid(id)) {
      throw new NotFoundException('Kegiatan tidak ditemukan');
    }
    const existing = await this.prisma.kegiatan.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Kegiatan tidak ditemukan');
    }

    if (existing.status !== StatusKegiatanEnum.draf) {
      throw new BadRequestException('Hanya kegiatan dengan status draf yang dapat dihapus');
    }

    await this.prisma.kegiatan.delete({ where: { id } });

    return {
      message: 'Kegiatan berhasil dihapus',
    };
  }
}
