import { Controller, Get, Patch, Delete, Body, Param, Query, UseGuards, Req, ForbiddenException, UseInterceptors, UploadedFiles, HttpCode, HttpStatus } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ProtokolerService } from './protokoler.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@prisma/client';

@Controller('protokoler')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProtokolerController {
  constructor(private protokolerService: ProtokolerService) {}

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.protokoler, RoleEnum.dokumentasi, RoleEnum.tamu)
  async findAll(
    @Query('status_akun') status_akun?: string,
    @Query('search') search?: string,
    @Query('prodi') prodi?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.protokolerService.findAll({ status_akun, search, prodi, page, limit });
  }

  @Get('me')
  async findMe(@Req() req: any) {
    let protokolerId = req.user.protokolerId;
    if (!protokolerId) {
      // Create a profile for this user on the fly (for admin/dokumentasi/etc.)
      const profile = await this.protokolerService.createProfileForUser(req.user.id, req.user.role);
      protokolerId = profile.id;
    }
    return this.protokolerService.findOne(protokolerId);
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.protokoler)
  async findOne(@Param('id') id: string, @Req() req: any) {
    // If user is a protokoler, verify they are only fetching their own profile
    if (req.user.role === RoleEnum.protokoler && req.user.protokolerId !== id) {
      throw new ForbiddenException('Anda tidak memiliki akses ke resource ini');
    }
    return this.protokolerService.findOne(id);
  }

  @Patch(':id/verifikasi')
  @Roles(RoleEnum.admin)
  async verifyAccount(
    @Param('id') id: string,
    @Body() body: { aksi: 'setujui' | 'tolak'; catatan_penolakan?: string },
  ) {
    return this.protokolerService.verifyAccount(id, body);
  }

  @Patch(':id')
  @Roles(RoleEnum.protokoler, RoleEnum.admin, RoleEnum.dokumentasi)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'foto_setengah_badan', maxCount: 1 },
      { name: 'foto_full_body', maxCount: 1 },
    ]),
  )
  async updateProfile(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: { nama_lengkap?: string; prodi?: string; departemen?: string; fakultas?: string },
    @UploadedFiles() files: { foto_setengah_badan?: any[]; foto_full_body?: any[] },
  ) {
    // Enforce owner-only profile updates: check either protokolerId or user_id
    const targetProfile = await this.protokolerService.findOne(id);
    if (req.user.protokolerId !== id && req.user.id !== targetProfile.user_id) {
      throw new ForbiddenException('Anda hanya dapat memperbarui profil Anda sendiri');
    }
    return this.protokolerService.updateProfile(id, body, files);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.protokolerService.remove(id);
  }
}
