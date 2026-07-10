import { BentukKegiatanEnum, StatusKegiatanEnum, TipeTamuEnum } from '@prisma/client';

export class CreateTamuVvipDto {
  nama_tamu!: string;
  jabatan!: string;
  instansi!: string;
  tipe!: TipeTamuEnum;
  jumlah_rombongan?: number;
}

export class CreateKegiatanDto {
  nama_kegiatan!: string;
  bentuk_kegiatan!: BentukKegiatanEnum;
  tanggal!: string; // YYYY-MM-DD
  jam_mulai!: string; // HH:MM
  jam_selesai!: string; // HH:MM
  lokasi!: string;
  audience?: string;
  keynote?: string;
  mc?: string;
  status?: StatusKegiatanEnum;
  jumlah_protokoler_dibutuhkan?: number;
  jumlah_lo_dibutuhkan?: number;
  tamu_vvip?: CreateTamuVvipDto[];
}
