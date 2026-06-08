import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ProtokolerModule } from './protokoler/protokoler.module';
import { KegiatanModule } from './kegiatan/kegiatan.module';
import { PendaftaranModule } from './pendaftaran/pendaftaran.module';
import { AbsensiModule } from './absensi/absensi.module';
import { EvaluasiModule } from './evaluasi/evaluasi.module';
import { TestimoniModule } from './testimoni/testimoni.module';
import { SertifikatModule } from './sertifikat/sertifikat.module';
import { LaporanModule } from './laporan/laporan.module';
import { RegulasiModule } from './regulasi/regulasi.module';
import { DokumentasiModule } from './dokumentasi/dokumentasi.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SupabaseModule,
    ProtokolerModule,
    KegiatanModule,
    PendaftaranModule,
    AbsensiModule,
    EvaluasiModule,
    TestimoniModule,
    SertifikatModule,
    LaporanModule,
    RegulasiModule,
    DokumentasiModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

