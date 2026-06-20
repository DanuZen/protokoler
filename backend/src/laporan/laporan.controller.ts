import { Controller, Get, Param, Req, Res, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { Response } from 'express';
import { LaporanService } from './laporan.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@prisma/client';

@Controller('laporan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LaporanController {
  constructor(private readonly laporanService: LaporanService) {}

  @Get('kegiatan')
  @Roles(RoleEnum.admin)
  async getKegiatanReport(
    @Res() res: any,
    @Query('dari_tanggal') dari?: string,
    @Query('sampai_tanggal') sampai?: string,
    @Query('bentuk_kegiatan') bentuk?: string,
    @Query('format') format?: 'json' | 'pdf' | 'excel',
  ) {
    const data = await this.laporanService.getKegiatanList({ dari, sampai, bentuk });

    if (format === 'pdf') {
      const pdfBuffer = this.laporanService.generateReportPdf(data);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=laporan_kegiatan.pdf');
      return res.send(pdfBuffer);
    }

    if (format === 'excel') {
      const csvString = this.laporanService.generateReportCsv(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=laporan_kegiatan.csv');
      return res.send(csvString);
    }

    return res.json({ data });
  }

  @Get('protokoler/:id/rekap')
  async getProtokolerRekap(
    @Param('id') protokolerId: string,
    @Req() req: any,
    @Query('sampai_tanggal') sampai_tanggal?: string,
  ) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(protokolerId)) {
      // If it is not a UUID, it represents start date for all mahasiswa report
      if (req.user.role !== RoleEnum.admin) {
        throw new ForbiddenException('Hanya admin yang dapat mengakses rekap mahasiswa');
      }
      return this.laporanService.getMahasiswaRekap({ dari: protokolerId, sampai: sampai_tanggal });
    }

    if (req.user.role !== RoleEnum.admin && req.user.protokolerId !== protokolerId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke rekap ini');
    }
    return this.laporanService.getProtokolerRekap(protokolerId);
  }

  @Get('dashboard')
  @Roles(RoleEnum.admin)
  async getDashboardStats() {
    return this.laporanService.getDashboardStats();
  }
}
