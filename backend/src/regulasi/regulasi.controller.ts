import { Controller, Post, Get, Delete, Patch, Param, Body, Req, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RegulasiService } from './regulasi.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@prisma/client';

@Controller('regulasi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegulasiController {
  constructor(private readonly regulasiService: RegulasiService) {}

  @Get()
  async getRegulasiList() {
    return this.regulasiService.findAll();
  }

  @Post()
  @Roles(RoleEnum.admin)
  @UseInterceptors(FileInterceptor('file'))
  async createRegulasi(
    @Req() req: any,
    @UploadedFile() file: any,
    @Body() body: { judul: string; deskripsi?: string; kategori?: string; tahun_terbit?: string; file_url?: string },
  ) {
    if (!file && !body.file_url) {
      throw new BadRequestException('File regulasi wajib diunggah atau berikan URL file (file_url)');
    }
    const tahunTerbitNum = body.tahun_terbit ? Number(body.tahun_terbit) : undefined;
    return this.regulasiService.create(req.user.id, file, {
      judul: body.judul,
      deskripsi: body.deskripsi,
      kategori: body.kategori,
      tahun_terbit: tahunTerbitNum,
      file_url: body.file_url,
    });
  }

  @Patch(':id')
  @Roles(RoleEnum.admin)
  async updateRegulasi(
    @Param('id') id: string,
    @Body() body: { judul?: string; deskripsi?: string; file_url?: string },
  ) {
    return this.regulasiService.update(id, body);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  async deleteRegulasi(@Param('id') id: string) {
    return this.regulasiService.remove(id);
  }
}
