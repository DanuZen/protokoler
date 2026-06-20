import { Controller, Post, Get, Patch, Body, Param, Req, UseGuards, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
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
  @Roles(RoleEnum.admin)
  async getApplicants(@Param('id') kegiatanId: string) {
    return this.pendaftaranService.getApplicants(kegiatanId);
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
}
