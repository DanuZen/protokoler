import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PenugasanService } from './penugasan.service';
import type { CreatePenugasanDto, UpdatePenugasanDto } from './penugasan.service';

@Controller('penugasan')
export class PenugasanController {
  constructor(private readonly penugasanService: PenugasanService) {}

  @Get()
  findAll(@Query('kegiatan_id') kegiatan_id?: string, @Query('mahasiswa_id') mahasiswa_id?: string) {
    if (kegiatan_id) return this.penugasanService.findByKegiatan(kegiatan_id);
    if (mahasiswa_id) return this.penugasanService.findByMahasiswa(mahasiswa_id);
    return [];
  }

  @Post()
  create(@Body() dto: CreatePenugasanDto) {
    return this.penugasanService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePenugasanDto) {
    return this.penugasanService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.penugasanService.remove(id);
  }
}
