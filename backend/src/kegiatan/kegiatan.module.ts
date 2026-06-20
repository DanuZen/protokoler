import { Module } from '@nestjs/common';
import { KegiatanController } from './kegiatan.controller';
import { KegiatanService } from './kegiatan.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [PrismaModule, SupabaseModule],
  controllers: [KegiatanController],
  providers: [KegiatanService],
  exports: [KegiatanService],
})
export class KegiatanModule {}
