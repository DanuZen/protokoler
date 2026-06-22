import { Module } from '@nestjs/common';
import { EvaluasiController } from './evaluasi.controller';
import { EvaluasiService } from './evaluasi.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [EvaluasiController],
  providers: [EvaluasiService]
})
export class EvaluasiModule {}
