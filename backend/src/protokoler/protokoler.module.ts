import { Module } from '@nestjs/common';
import { ProtokolerController } from './protokoler.controller';
import { ProtokolerService } from './protokoler.service';

@Module({
  controllers: [ProtokolerController],
  providers: [ProtokolerService]
})
export class ProtokolerModule {}
