import { Controller, Get, Param, Req, Res, UseGuards, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { SertifikatService } from './sertifikat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@prisma/client';

@Controller('sertifikat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SertifikatController {
  constructor(private readonly sertifikatService: SertifikatService) {}

  @Get()
  async getSertifikatList(@Req() req: any) {
    if (req.user.role === RoleEnum.admin || req.user.role === RoleEnum.dokumentasi) {
      return this.sertifikatService.findAll();
    } else {
      if (!req.user.protokolerId) {
        // User tanpa protokolerId (bukan protokoler) - kembalikan data kosong
        return { data: [] };
      }
      return this.sertifikatService.findByProtokoler(req.user.protokolerId);
    }
  }

  @Get(':id/download')
  async downloadSertifikat(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: any,
  ) {
    const cert = await this.sertifikatService.findOne(id);
    
    // Authorization check
    if (req.user.role !== RoleEnum.admin && req.user.protokolerId !== cert.protokoler_id) {
      throw new ForbiddenException('Anda tidak memiliki akses ke sertifikat ini');
    }

    if (!cert.file_url) {
      throw new NotFoundException('File sertifikat tidak ditemukan');
    }

    // Redirect to the public file URL
    return res.redirect(cert.file_url);
  }
}
