import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatusKegiatanEnum, StatusPendaftaranEnum } from '@prisma/client';
import { autoUpdateStatuses } from '../utils/status-updater';

@Injectable()
export class LaporanService {
  constructor(private prisma: PrismaService) {}

  private formatTimeField(timeField: Date | string | null): string | null {
    if (!timeField) return null;
    let d: Date;
    if (typeof timeField === 'string') {
      if (timeField.includes('T')) {
        d = new Date(timeField);
      } else {
        d = new Date(`1970-01-01T${timeField}Z`);
      }
    } else {
      d = timeField;
    }
    if (isNaN(d.getTime())) return null;
    const h = String(d.getUTCHours()).padStart(2, '0');
    const m = String(d.getUTCMinutes()).padStart(2, '0');
    const s = String(d.getUTCSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  async getKegiatanList(params: { dari?: string; sampai?: string; bentuk?: string }) {
    await autoUpdateStatuses(this.prisma);
    const where: any = {};
    if (params.dari || params.sampai) {
      where.tanggal = {};
      if (params.dari) where.tanggal.gte = new Date(params.dari);
      if (params.sampai) where.tanggal.lte = new Date(params.sampai);
    }
    if (params.bentuk) {
      where.bentuk_kegiatan = params.bentuk;
    }

    const data = await this.prisma.kegiatan.findMany({
      where,
      orderBy: { tanggal: 'asc' },
      include: {
        tamu_vvip: true
      }
    });

    return data.map(k => ({
      ...k,
      jam_mulai: this.formatTimeField(k.jam_mulai),
      jam_selesai: this.formatTimeField(k.jam_selesai),
    }));
  }

  generateReportPdf(data: any[]): Buffer {
    const title = 'LAPORAN KEGIATAN PROTOKOLER';
    const lines = [
      `Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`,
      `Total Kegiatan: ${data.length}`,
      `==================================================================`
    ];

    data.forEach((k, idx) => {
      const dateStr = new Date(k.tanggal).toLocaleDateString('id-ID');
      lines.push(
        `${idx + 1}. ${k.nama_kegiatan} (${k.bentuk_kegiatan.toUpperCase()})`,
        `   Tanggal : ${dateStr} | Lokasi: ${k.lokasi}`,
        `   Status  : ${k.status.toUpperCase()}`,
        `------------------------------------------------------------------`
      );
    });

    const escapedLines = lines.map(line => 
      line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
    );

    let streamContent = `BT\n/F1 16 Tf\n70 750 Td\n(${title}) Tj\nET\n`;
    streamContent += `BT\n/F1 10 Tf\n`;
    let currentY = 710;
    for (const line of escapedLines) {
      streamContent += `70 ${currentY} Td (${line}) Tj\n`;
      currentY = -20; // Move down 20pt relatively
    }
    streamContent += `ET\n`;

    const pdfBody = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R >>
endobj
4 0 obj
<< /Length ${streamContent.length} >>
stream
${streamContent}endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000280 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
450
%%EOF`;

    return Buffer.from(pdfBody, 'utf-8');
  }

  generateReportCsv(data: any[]): string {
    let csv = 'No,Nama Kegiatan,Bentuk,Tanggal,Lokasi,Status\n';
    data.forEach((k, idx) => {
      const dateStr = new Date(k.tanggal).toLocaleDateString('id-ID');
      // Escape double quotes inside columns
      const name = k.nama_kegiatan.replace(/"/g, '""');
      const loc = k.lokasi.replace(/"/g, '""');
      csv += `"${idx + 1}","${name}","${k.bentuk_kegiatan}","${dateStr}","${loc}","${k.status}"\n`;
    });
    return csv;
  }

  async getProtokolerRekap(protokolerId: string) {
    const protokoler = await this.prisma.protokoler.findUnique({
      where: { id: protokolerId }
    });
    if (!protokoler) {
      throw new NotFoundException('Protokoler tidak ditemukan');
    }

    // Get all accepted/redirected penugasan that have finished
    const penugasanList = await this.prisma.pendaftaranKegiatan.findMany({
      where: {
        protokoler_id: protokolerId,
        status: { in: [StatusPendaftaranEnum.diterima, StatusPendaftaranEnum.dialihkan] }
      },
      include: {
        kegiatan: true,
        kegiatan_dialihkan: true
      }
    });

    let totalHours = 0;
    let countProtokoler = 0;
    let countLo = 0;

    const riwayat = penugasanList.map(p => {
      const k = p.status === StatusPendaftaranEnum.dialihkan ? p.kegiatan_dialihkan : p.kegiatan;
      if (k) {
        const start = new Date(k.jam_mulai).getTime();
        const end = new Date(k.jam_selesai).getTime();
        const diff = (end - start) / (1000 * 60 * 60);
        totalHours += isNaN(diff) ? 0 : Math.max(0, diff);

        if (p.peran === 'protokoler') {
          countProtokoler++;
        } else if (p.peran === 'lo') {
          countLo++;
        }

        return {
          kegiatan_id: k.id,
          nama_kegiatan: k.nama_kegiatan,
          tanggal: k.tanggal,
          peran: p.peran,
          status: p.status
        };
      }
      return null;
    }).filter(Boolean);

    return {
      protokoler: {
        nama_lengkap: protokoler.nama_lengkap,
        nim: protokoler.nim
      },
      rekap: {
        total_kegiatan: riwayat.length,
        total_jam_estimasi: Math.round(totalHours),
        kategori_sertifikat: protokoler.kategori_sertifikat || 'perak',
        sebagai_protokoler: countProtokoler,
        sebagai_lo: countLo
      },
      riwayat
    };
  }

  async getDashboardStats() {
    await autoUpdateStatuses(this.prisma);
    // 1. Total kegiatan bulan ini
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const totalKegiatanBulanIni = await this.prisma.kegiatan.count({
      where: {
        tanggal: { gte: startOfMonth }
      }
    });

    // 2. Total protokoler aktif
    const totalProtokolerAktif = await this.prisma.protokoler.count({
      where: { status_akun: 'aktif' }
    });

    // 3. Kegiatan mendatang (status publik / terjadwal / terkonfirmasi / draf, tanggal >= hari ini atau tanggal_selesai >= hari ini)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const kegiatanMendatang = await this.prisma.kegiatan.count({
      where: {
        OR: [
          { tanggal: { gte: today } },
          { tanggal_selesai: { gte: today } }
        ],
        status: { in: [StatusKegiatanEnum.publik, StatusKegiatanEnum.terjadwal, StatusKegiatanEnum.terkonfirmasi, StatusKegiatanEnum.draf] }
      }
    });

    // 4. Evaluasi terisi persen
    // percent = (total evaluasi / total pendaftaran diterima/dialihkan pada kegiatan selesai) * 100
    const totalPenugasanSelesai = await this.prisma.pendaftaranKegiatan.count({
      where: {
        status: { in: [StatusPendaftaranEnum.diterima, StatusPendaftaranEnum.dialihkan] },
        kegiatan: { status: StatusKegiatanEnum.selesai }
      }
    });
    const totalEvaluasi = await this.prisma.evaluasiKegiatan.count();
    const evaluasiTerisiPersen = totalPenugasanSelesai > 0
      ? (totalEvaluasi / totalPenugasanSelesai) * 100
      : 100.0;

    // 5. Distribusi kategori sertifikat
    const perak = await this.prisma.protokoler.count({ where: { kategori_sertifikat: 'perak' } });
    const silver = await this.prisma.protokoler.count({ where: { kategori_sertifikat: 'silver' } });
    const gold = await this.prisma.protokoler.count({ where: { kategori_sertifikat: 'gold' } });

    return {
      total_kegiatan_bulan_ini: totalKegiatanBulanIni,
      total_protokoler_aktif: totalProtokolerAktif,
      kegiatan_mendatang: kegiatanMendatang,
      evaluasi_terisi_persen: parseFloat(evaluasiTerisiPersen.toFixed(1)),
      distribusi_kategori: {
        perak,
        silver,
        gold
      }
    };
  }

  async getMahasiswaRekap(params: { dari?: string; sampai?: string }) {
    const whereKegiatan: any = {};
    if (params.dari || params.sampai) {
      whereKegiatan.tanggal = {};
      if (params.dari) {
        whereKegiatan.tanggal.gte = new Date(params.dari);
      }
      if (params.sampai) {
        whereKegiatan.tanggal.lte = new Date(params.sampai);
      }
    }

    const protokolers = await this.prisma.protokoler.findMany({
      include: {
        pendaftaran: {
          where: {
            kegiatan: whereKegiatan
          },
          include: {
            kegiatan: true
          }
        }
      }
    });

    const rekap_mahasiswa = protokolers.map(p => {
      const total_tugas = p.pendaftaran.length;
      const dikonfirmasi = p.pendaftaran.filter(
        reg => reg.status === StatusPendaftaranEnum.diterima || reg.status === StatusPendaftaranEnum.dialihkan
      ).length;
      const ditolak = p.pendaftaran.filter(
        reg => reg.status === StatusPendaftaranEnum.ditolak
      ).length;

      return {
        nim: p.nim,
        nama_lengkap: p.nama_lengkap,
        prodi: p.prodi,
        total_tugas,
        dikonfirmasi,
        ditolak
      };
    });

    return { rekap_mahasiswa };
  }
}
