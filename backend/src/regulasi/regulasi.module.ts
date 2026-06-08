import { Module } from '@nestjs/common';
import { RegulasiController } from './regulasi.controller';
import { RegulasiService } from './regulasi.service';

@Module({
  controllers: [RegulasiController],
  providers: [RegulasiService]
})
export class RegulasiModule {}
