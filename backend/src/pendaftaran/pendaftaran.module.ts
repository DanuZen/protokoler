import { Module } from '@nestjs/common';
import { PendaftaranController } from './pendaftaran.controller';
import { PendaftaranService } from './pendaftaran.service';

@Module({
  controllers: [PendaftaranController],
  providers: [PendaftaranService]
})
export class PendaftaranModule {}
