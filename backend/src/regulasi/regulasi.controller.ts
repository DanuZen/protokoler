import { Controller, Post, Get, Delete, Param, Body, Req, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
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
    @Body() body: { judul: string; deskripsi?: string; kategori?: string; tahun_terbit?: string },
  ) {
    if (!file) {
      throw new BadRequestException('File regulasi wajib diunggah');
    }
    const tahunTerbitNum = body.tahun_terbit ? Number(body.tahun_terbit) : undefined;
    return this.regulasiService.create(req.user.id, file, {
      judul: body.judul,
      deskripsi: body.deskripsi,
      kategori: body.kategori,
      tahun_terbit: tahunTerbitNum
    });
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  async deleteRegulasi(@Param('id') id: string) {
    return this.regulasiService.remove(id);
  }
}
