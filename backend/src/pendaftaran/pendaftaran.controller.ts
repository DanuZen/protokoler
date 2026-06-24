import { Controller, Post, Get, Patch, Delete, Body, Param, Req, UseGuards, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PendaftaranService } from './pendaftaran.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class PendaftaranController {
  constructor(private readonly pendaftaranService: PendaftaranService) {}

  @Post('kegiatan/:id/daftar')
  @Roles(RoleEnum.protokoler)
  async registerToActivity(
    @Param('id') kegiatanId: string,
    @Req() req: any,
    @Body() body: { peran: 'protokoler' | 'lo' },
  ) {
    if (!req.user.protokolerId) {
      throw new ForbiddenException('Hanya pengguna dengan profil protokoler yang dapat mendaftar');
    }
    return this.pendaftaranService.register(kegiatanId, req.user.protokolerId, body.peran);
  }

  @Get('kegiatan/:id/pendaftar')
  @Roles(RoleEnum.admin, RoleEnum.protokoler, RoleEnum.dokumentasi)
  async getApplicants(@Param('id') kegiatanId: string, @Req() req: any) {
    return this.pendaftaranService.getApplicants(kegiatanId, req.user.role);
  }

  @Patch('pendaftaran/:id/seleksi')
  @Roles(RoleEnum.admin)
  async selectApplicant(
    @Param('id') pendaftaranId: string,
    @Req() req: any,
    @Body() body: { keputusan: 'diterima' | 'ditolak' | 'dialihkan'; kegiatan_dialihkan_id?: string; catatan_admin?: string },
  ) {
    return this.pendaftaranService.select(pendaftaranId, req.user.id, body);
  }

  @Delete('pendaftaran/:id')
  @Roles(RoleEnum.admin)
  async deletePendaftaran(@Param('id') pendaftaranId: string) {
    return this.pendaftaranService.remove(pendaftaranId);
  }

  @Post('kegiatan/:id/admin-tambah')
  @Roles(RoleEnum.admin)
  async adminAddMember(
    @Param('id') kegiatanId: string,
    @Body() body: { protokoler_id: string; peran: 'protokoler' | 'lo' },
  ) {
    if (!body.protokoler_id || !body.peran) {
      throw new BadRequestException('protokoler_id dan peran wajib diisi');
    }
    return this.pendaftaranService.adminAddMember(kegiatanId, body.protokoler_id, body.peran);
  }
}
