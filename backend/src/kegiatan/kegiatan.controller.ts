import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { KegiatanService } from './kegiatan.service';
import type { CreateKegiatanDto, UpdateKegiatanDto } from './kegiatan.service';

@Controller('kegiatan')
export class KegiatanController {
  constructor(private readonly kegiatanService: KegiatanService) {}

  @Get()
  findAll(@Query('status') status?: string, @Query('bentuk') bentuk?: string) {
    return this.kegiatanService.findAll(status, bentuk);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kegiatanService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateKegiatanDto) {
    return this.kegiatanService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateKegiatanDto) {
    return this.kegiatanService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kegiatanService.remove(id);
  }
}
