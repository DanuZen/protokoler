import { Controller, Post, Get, Body, Param, Req, UseGuards, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TestimoniService } from './testimoni.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@prisma/client';

@Controller('kegiatan')
export class TestimoniController {
  constructor(private readonly testimoniService: TestimoniService) {}

  @Post(':id/testimoni')
  async fillTestimoni(
    @Param('id') kegiatanId: string,
    @Body() body: { nama_tamu: string; jabatan_tamu?: string; isi_testimoni: string; rating: number },
  ) {
    return this.testimoniService.createTestimoni(kegiatanId, body);
  }

  @Get(':id/testimoni')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.protokoler)
  async getTestimoniList(@Param('id') kegiatanId: string) {
    return this.testimoniService.getList(kegiatanId);
  }
}
