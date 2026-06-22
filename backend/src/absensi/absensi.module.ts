import { Module } from '@nestjs/common';
import { AbsensiController } from './absensi.controller';
import { AbsensiService } from './absensi.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [AbsensiController],
  providers: [AbsensiService]
})
export class AbsensiModule {}
