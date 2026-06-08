import { Module } from '@nestjs/common';
import { SertifikatController } from './sertifikat.controller';
import { SertifikatService } from './sertifikat.service';

@Module({
  controllers: [SertifikatController],
  providers: [SertifikatService]
})
export class SertifikatModule {}
