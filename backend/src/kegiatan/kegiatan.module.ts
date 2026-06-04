import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { KegiatanService } from './kegiatan.service';
import { KegiatanController } from './kegiatan.controller';

@Module({
  imports: [SupabaseModule],
  controllers: [KegiatanController],
  providers: [KegiatanService],
})
export class KegiatanModule {}
