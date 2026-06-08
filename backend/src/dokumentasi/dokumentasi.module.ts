import { Module } from '@nestjs/common';
import { DokumentasiController } from './dokumentasi.controller';
import { DokumentasiService } from './dokumentasi.service';

@Module({
  controllers: [DokumentasiController],
  providers: [DokumentasiService]
})
export class DokumentasiModule {}
