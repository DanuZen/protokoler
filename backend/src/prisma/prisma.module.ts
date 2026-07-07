import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

@Global()
@Module({
  providers: [
    {
      provide: PrismaService,
      useFactory: () => {
        return new PrismaClient().$extends(withAccelerate());
      },
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}

