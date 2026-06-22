import { Module } from '@nestjs/common';
import { PendaftaranController } from './pendaftaran.controller';
import { PendaftaranService } from './pendaftaran.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [PendaftaranController],
  providers: [PendaftaranService]
})
export class PendaftaranModule {}
