import { Controller, Post, Get, Body, Param, Req, UseGuards, UseInterceptors, UploadedFile, ConflictException, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AbsensiService } from './absensi.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@prisma/client';

@Controller('kegiatan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AbsensiController {
  constructor(private readonly absensiService: AbsensiService) {}

  @Post(':id/absensi')
  @Roles(RoleEnum.protokoler)
  @UseInterceptors(FileInterceptor('foto_selfie'))
  async checkIn(
    @Param('id') kegiatanId: string,
    @Req() req: any,
    @UploadedFile() file: any,
    @Body() body: { latitude?: string; longitude?: string },
  ) {
    if (!req.user.protokolerId) {
      throw new ForbiddenException('Hanya pengguna dengan profil protokoler yang dapat melakukan absensi');
    }
    // File is no longer strictly required, AI detection handles empty files

    const latitudeNum = body.latitude ? Number(body.latitude) : undefined;
    const longitudeNum = body.longitude ? Number(body.longitude) : undefined;

    return this.absensiService.recordAbsensi(
      kegiatanId,
      req.user.protokolerId,
      file,
      latitudeNum,
      longitudeNum
    );
  }

  @Get(':id/absensi')
  @Roles(RoleEnum.admin, RoleEnum.protokoler, RoleEnum.dokumentasi)
  async getAbsensiRecap(@Param('id') kegiatanId: string, @Req() req: any) {
    return this.absensiService.getRecap(kegiatanId, req.user.role, req.user.protokolerId);
  }
}
