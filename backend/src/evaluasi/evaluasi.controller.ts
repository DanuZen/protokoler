import { Controller, Post, Get, Patch, Body, Param, Req, UseGuards, Query, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { EvaluasiService } from './evaluasi.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class EvaluasiController {
  constructor(private readonly evaluasiService: EvaluasiService) {}

  @Post('kegiatan/:id/evaluasi')
  @Roles(RoleEnum.protokoler)
  async fillEvaluasi(
    @Param('id') kegiatanId: string,
    @Req() req: any,
    @Body() body: { evaluasi_kegiatan: string; refleksi_diri: string; kendala?: string; rating_kegiatan: number },
  ) {
    if (!req.user.protokolerId) {
      throw new ForbiddenException('Hanya pengguna dengan profil protokoler yang dapat mengisi evaluasi');
    }
    return this.evaluasiService.createEvaluasi(kegiatanId, req.user.protokolerId, body);
  }

  @Get('evaluasi/dashboard')
  @Roles(RoleEnum.admin, RoleEnum.protokoler)
  async getEvaluasiDashboard(
    @Query('filter_status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.evaluasiService.getDashboard({ status, search, page, limit });
  }

  @Get('evaluasi/kegiatan/:id/hasil')
  @Roles(RoleEnum.admin, RoleEnum.protokoler)
  async getEvaluasiHasil(@Param('id') kegiatanId: string, @Req() req: any) {
    return this.evaluasiService.getHasil(kegiatanId, req.user.role, req.user.protokolerId);
  }

  @Patch('evaluasi/kegiatan/:id/feedback')
  @Roles(RoleEnum.admin)
  async updateFeedback(
    @Param('id') kegiatanId: string,
    @Body() body: { catatan: string },
  ) {
    return this.evaluasiService.updateFeedback(kegiatanId, body.catatan);
  }
}
