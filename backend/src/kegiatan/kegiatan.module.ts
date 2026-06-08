import { Module } from '@nestjs/common';
import { KegiatanController } from './kegiatan.controller';
import { KegiatanService } from './kegiatan.service';

@Module({
  controllers: [KegiatanController],
  providers: [KegiatanService]
})
export class KegiatanModule {}
