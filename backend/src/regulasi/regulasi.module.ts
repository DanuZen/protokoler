import { Module } from '@nestjs/common';
import { RegulasiController } from './regulasi.controller';
import { RegulasiService } from './regulasi.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [RegulasiController],
  providers: [RegulasiService]
})
export class RegulasiModule {}
