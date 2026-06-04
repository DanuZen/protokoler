import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { LaporanService } from './laporan.service';
import { LaporanController } from './laporan.controller';

@Module({
  imports: [SupabaseModule],
  controllers: [LaporanController],
  providers: [LaporanService],
})
export class LaporanModule {}
