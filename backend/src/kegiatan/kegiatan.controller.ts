import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { KegiatanService } from './kegiatan.service';
import { CreateKegiatanDto } from './dto/create-kegiatan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '@prisma/client';

@Controller('kegiatan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KegiatanController {
  constructor(private kegiatanService: KegiatanService) {}

  @Post()
  @Roles(RoleEnum.admin)
  async create(@Body() dto: CreateKegiatanDto, @Req() req: any) {
    return this.kegiatanService.create(dto, req.user.id);
  }

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.protokoler, RoleEnum.dokumentasi)
  async findAll(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('bentuk') bentuk?: string,
    @Query('dari_tanggal') dari_tanggal?: string,
    @Query('sampai_tanggal') sampai_tanggal?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.kegiatanService.findAll(
      { status, bentuk, dari_tanggal, sampai_tanggal, page, limit },
      req.user.role,
    );
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.protokoler, RoleEnum.dokumentasi)
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.kegiatanService.findOne(id, req.user.role, req.user.id);
  }

  @Patch(':id')
  @Roles(RoleEnum.admin)
  async update(@Param('id') id: string, @Body() dto: Partial<CreateKegiatanDto>) {
    return this.kegiatanService.update(id, dto);
  }

  @Patch(':id/checklist')
  @Roles(RoleEnum.admin)
  async updateChecklist(
    @Param('id') id: string,
    @Body() body: {
      checklist_tata_tempat?: boolean;
      checklist_tata_upacara?: boolean;
      checklist_tata_penghormatan?: boolean;
    },
  ) {
    return this.kegiatanService.updateChecklist(id, body);
  }

  @Delete(':id')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.kegiatanService.remove(id);
  }
}
