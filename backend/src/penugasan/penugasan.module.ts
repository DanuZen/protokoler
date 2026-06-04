import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { PenugasanService } from './penugasan.service';
import { PenugasanController } from './penugasan.controller';

@Module({
  imports: [SupabaseModule],
  controllers: [PenugasanController],
  providers: [PenugasanService],
})
export class PenugasanModule {}
