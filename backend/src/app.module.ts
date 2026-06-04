import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SupabaseModule } from './supabase/supabase.module';
import { MahasiswaModule } from './mahasiswa/mahasiswa.module';
import { KegiatanModule } from './kegiatan/kegiatan.module';
import { PenugasanModule } from './penugasan/penugasan.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { LaporanModule } from './laporan/laporan.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SupabaseModule,
    MahasiswaModule,
    KegiatanModule,
    PenugasanModule,
    DashboardModule,
    LaporanModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

