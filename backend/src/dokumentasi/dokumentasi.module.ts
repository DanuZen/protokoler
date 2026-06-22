import { Module } from '@nestjs/common';
import { DokumentasiController } from './dokumentasi.controller';
import { DokumentasiService } from './dokumentasi.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [DokumentasiController],
  providers: [DokumentasiService]
})
export class DokumentasiModule {}
