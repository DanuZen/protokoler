import { Module } from '@nestjs/common';
import { TestimoniController } from './testimoni.controller';
import { TestimoniService } from './testimoni.service';

@Module({
  controllers: [TestimoniController],
  providers: [TestimoniService]
})
export class TestimoniModule {}
