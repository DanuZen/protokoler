import { Module } from '@nestjs/common';
import { ProtokolerController } from './protokoler.controller';
import { ProtokolerService } from './protokoler.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [PrismaModule, SupabaseModule],
  controllers: [ProtokolerController],
  providers: [ProtokolerService],
  exports: [ProtokolerService],
})
export class ProtokolerModule {}
