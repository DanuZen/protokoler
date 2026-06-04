import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MahasiswaService } from './mahasiswa.service';
import type { CreateMahasiswaDto, UpdateMahasiswaDto } from './mahasiswa.service';

@Controller('mahasiswa')
export class MahasiswaController {
  constructor(private readonly mahasiswaService: MahasiswaService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.mahasiswaService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mahasiswaService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateMahasiswaDto) {
    return this.mahasiswaService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMahasiswaDto) {
    return this.mahasiswaService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mahasiswaService.remove(id);
  }
}
