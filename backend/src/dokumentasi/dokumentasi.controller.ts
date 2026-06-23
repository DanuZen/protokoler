import { Controller, Post, Patch, Get, Delete, Body, Param, Req, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DokumentasiService } from './dokumentasi.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { RoleEnum } from '@prisma/client';

@Controller('dokumentasi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DokumentasiController {
  constructor(private readonly dokumentasiService: DokumentasiService) {}

  @Get()
  @Public()
  async getAllDokumentasi(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.dokumentasiService.getKegiatanList({ status, search, page, limit });
  }

  @Get('list')
  @Roles(RoleEnum.admin, RoleEnum.dokumentasi)
  async getDocumentationList(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.dokumentasiService.getKegiatanList({ status, search, page, limit });
  }

  @Post('upload')
  @Roles(RoleEnum.admin, RoleEnum.dokumentasi)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocumentation(
    @Req() req: any,
    @UploadedFile() file: any,
    @Body() body: { kegiatan_id: string; media_type: 'foto' | 'video' | 'dokumen'; keterangan?: string; kategori?: string },
  ) {
    if (!file && body.media_type !== 'video') {
      throw new BadRequestException('File dokumentasi wajib diunggah');
    }
    if (!body.kegiatan_id) {
      throw new BadRequestException('kegiatan_id wajib diisi');
    }
    if (!body.media_type || !['foto', 'video', 'dokumen'].includes(body.media_type)) {
      throw new BadRequestException('media_type harus foto, video, atau dokumen');
    }

    return this.dokumentasiService.upload(req.user.id, file, body);
  }

  @Get('kegiatan/:id')
  @Public()
  async getDocumentationByKegiatan(@Param('id') kegiatanId: string) {
    return this.dokumentasiService.getByKegiatan(kegiatanId);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin, RoleEnum.dokumentasi)
  async deleteDocumentation(@Param('id') id: string) {
    return this.dokumentasiService.delete(id);
  }

  @Patch('kegiatan/:kegiatan_id')
  @Roles(RoleEnum.admin, RoleEnum.dokumentasi)
  async updateDocumentationPost(
    @Param('kegiatan_id') kegiatanId: string,
    @Body() body: { keterangan?: string; kategori?: string },
  ) {
    return this.dokumentasiService.updatePost(kegiatanId, body);
  }
}

