import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { LaporanService } from './laporan.service';

@Controller('laporan')
export class LaporanController {
  constructor(private readonly laporanService: LaporanService) {}

  @Get('kegiatan')
  getKegiatan(
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('status') status?: string,
  ) {
    if (!start || !end) throw new BadRequestException('Parameter start dan end wajib diisi');
    return this.laporanService.getKegiatan(start, end, status);
  }

  @Get('rekap')
  getRekap(@Query('start') start: string, @Query('end') end: string) {
    if (!start || !end) throw new BadRequestException('Parameter start dan end wajib diisi');
    return this.laporanService.getRekap(start, end);
  }
}
