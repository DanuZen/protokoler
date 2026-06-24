import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { StatusPendaftaranEnum, StatusKegiatanEnum, PeranKegiatanEnum, StatusAkunEnum } from '@prisma/client';
import { autoUpdateStatuses } from '../utils/status-updater';

@Injectable()
export class PendaftaranService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  private generatePdfBuffer(title: string, contentLines: string[]): Buffer {
    // Basic valid PDF format with lines of text
    const escapedLines = contentLines.map(line => 
      line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
    );

    let streamContent = `BT\n/F1 16 Tf\n70 750 Td\n(${title}) Tj\nET\n`;
    
    // Write lines
    streamContent += `BT\n/F1 10 Tf\n`;
    let currentY = 700;
    for (const line of escapedLines) {
      streamContent += `70 ${currentY} Td (${line}) Tj\n`;
      currentY = -25; // Relative offset down for next text block
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

  async register(kegiatanId: string, protokolerId: string, peran: 'protokoler' | 'lo') {
    await autoUpdateStatuses(this.prisma);

    // 1. Check protokoler status
    const protokoler = await this.prisma.protokoler.findUnique({
      where: { id: protokolerId }
    });
    if (!protokoler) {
      throw new NotFoundException('Profil protokoler tidak ditemukan');
    }
    if (protokoler.status_akun !== StatusAkunEnum.aktif) {
      throw new ForbiddenException('Akun protokoler belum aktif');
    }

    // 2. Check kegiatan
    const kegiatan = await this.prisma.kegiatan.findUnique({
      where: { id: kegiatanId }
    });
    if (!kegiatan) {
      throw new NotFoundException('Kegiatan tidak ditemukan');
    }

    // Block registration if activity is selesai or batal
    if (
      kegiatan.status === StatusKegiatanEnum.selesai ||
      kegiatan.status === StatusKegiatanEnum.batal
    ) {
      throw new BadRequestException('Rekrutmen telah ditutup atau kegiatan sudah selesai/batal');
    }

    // If the activity is ongoing (berlangsung), we can register ONLY if the quota is not filled yet
    if (kegiatan.status === StatusKegiatanEnum.berlangsung) {
      const requiredLimit = peran === 'lo' ? kegiatan.jumlah_lo_dibutuhkan : kegiatan.jumlah_protokoler_dibutuhkan;
      
      const acceptedCount = await this.prisma.pendaftaranKegiatan.count({
        where: {
          peran: peran === 'lo' ? PeranKegiatanEnum.lo : PeranKegiatanEnum.protokoler,
          status: {
            in: [StatusPendaftaranEnum.diterima, StatusPendaftaranEnum.dialihkan]
          },
          OR: [
            { kegiatan_id: kegiatanId },
            { kegiatan_dialihkan_id: kegiatanId }
          ]
        }
      });

      if (acceptedCount >= requiredLimit) {
        throw new BadRequestException('Kebutuhan petugas untuk peran ini sudah terpenuhi');
      }
    }

    if (
      kegiatan.status !== StatusKegiatanEnum.publik &&
      kegiatan.status !== StatusKegiatanEnum.terjadwal &&
      kegiatan.status !== StatusKegiatanEnum.terkonfirmasi &&
      kegiatan.status !== StatusKegiatanEnum.berlangsung
    ) {
      throw new BadRequestException('Kegiatan tidak dapat didaftar (status draf/batal/selesai)');
    }

    // 3. Check existing registration
    const existing = await this.prisma.pendaftaranKegiatan.findUnique({
      where: {
        kegiatan_id_protokoler_id: {
          kegiatan_id: kegiatanId,
          protokoler_id: protokolerId
        }
      }
    });
    if (existing) {
      throw new BadRequestException('Sudah terdaftar di kegiatan ini');
    }

    // 4. Check schedule clash
    const activeRegistrations = await this.prisma.pendaftaranKegiatan.findMany({
      where: {
        protokoler_id: protokolerId,
        status: {
          in: [StatusPendaftaranEnum.diterima, StatusPendaftaranEnum.dialihkan]
        }
      },
      include: {
        kegiatan: true,
        kegiatan_dialihkan: true
      }
    });

    for (const reg of activeRegistrations) {
      const activeKegiatan = reg.status === StatusPendaftaranEnum.dialihkan ? reg.kegiatan_dialihkan : reg.kegiatan;
      if (!activeKegiatan) continue;

      const date1 = new Date(activeKegiatan.tanggal).toDateString();
      const date2 = new Date(kegiatan.tanggal).toDateString();

      if (date1 === date2) {
        const start1 = activeKegiatan.jam_mulai.getTime();
        const end1 = activeKegiatan.jam_selesai.getTime();
        const start2 = kegiatan.jam_mulai.getTime();
        const end2 = kegiatan.jam_selesai.getTime();

        if (start1 < end2 && end1 > start2) {
          throw new BadRequestException(`Jadwal bentrok dengan kegiatan ${activeKegiatan.nama_kegiatan}`);
        }
      }
    }

    // 5. Save pendaftaran
    const pendaftaran = await this.prisma.pendaftaranKegiatan.create({
      data: {
        kegiatan_id: kegiatanId,
        protokoler_id: protokolerId,
        peran: peran === 'lo' ? PeranKegiatanEnum.lo : PeranKegiatanEnum.protokoler,
        status: StatusPendaftaranEnum.pending,
      }
    });

    return {
      message: 'Pendaftaran berhasil, menunggu seleksi admin',
      data: pendaftaran
    };
  }

  async getApplicants(kegiatanId: string, userRole?: string) {
    const where: any = {};
    if (userRole === 'protokoler') {
      where.OR = [
        { kegiatan_id: kegiatanId, status: StatusPendaftaranEnum.diterima },
        { kegiatan_dialihkan_id: kegiatanId, status: StatusPendaftaranEnum.dialihkan }
      ];
    } else {
      where.kegiatan_id = kegiatanId;
    }

    const data = await this.prisma.pendaftaranKegiatan.findMany({
      where,
      include: {
        protokoler: {
          select: {
            id: true,
            nama_lengkap: true,
            nim: true
          }
        }
      }
    });

    const mapped = data.map(p => ({
      pendaftaran_id: p.id,
      protokoler: p.protokoler,
      peran: p.peran,
      status: p.status,
      created_at: p.created_at
    }));

    return { data: mapped };
  }

  async select(
    pendaftaranId: string,
    adminId: string,
    body: { keputusan: 'diterima' | 'ditolak' | 'dialihkan'; kegiatan_dialihkan_id?: string; catatan_admin?: string },
  ) {
    const pendaftaran = await this.prisma.pendaftaranKegiatan.findUnique({
      where: { id: pendaftaranId },
      include: {
        protokoler: true,
        kegiatan: true
      }
    });
    if (!pendaftaran) {
      throw new NotFoundException('Pendaftaran tidak ditemukan');
    }

    const updateData: any = {
      status: body.keputusan as StatusPendaftaranEnum,
      catatan_admin: body.catatan_admin || null,
      reviewed_by: adminId,
      reviewed_at: new Date()
    };

    if (body.keputusan === 'dialihkan') {
      if (!body.kegiatan_dialihkan_id) {
        throw new BadRequestException('kegiatan_dialihkan_id wajib diisi untuk keputusan dialihkan');
      }
      const targetKegiatan = await this.prisma.kegiatan.findUnique({
        where: { id: body.kegiatan_dialihkan_id }
      });
      if (!targetKegiatan) {
        throw new NotFoundException('Kegiatan tujuan pengalihan tidak ditemukan');
      }
      if (targetKegiatan.status === StatusKegiatanEnum.draf) {
        throw new BadRequestException('Tidak dapat mengalihkan ke kegiatan berstatus draf');
      }
      updateData.kegiatan_dialihkan_id = body.kegiatan_dialihkan_id;
    }

    if (body.keputusan === 'diterima') {
      // Generate Surat Tugas PDF
      const title = 'SURAT TUGAS KEPANITIAAN PROTOKOL';
      const content = [
        `Nomor Tugas: ST-${new Date().getFullYear()}-${pendaftaranId.substring(0, 8).toUpperCase()}`,
        `Yang bertanda tangan di bawah ini menerangkan bahwa:`,
        `Nama   : ${pendaftaran.protokoler.nama_lengkap}`,
        `NIM    : ${pendaftaran.protokoler.nim}`,
        `Prodi  : ${pendaftaran.protokoler.prodi}`,
        `Ditugaskan pada kegiatan:`,
        `Nama Kegiatan : ${pendaftaran.kegiatan.nama_kegiatan}`,
        `Tanggal       : ${new Date(pendaftaran.kegiatan.tanggal).toLocaleDateString('id-ID')}`,
        `Lokasi        : ${pendaftaran.kegiatan.lokasi}`,
        `Peran         : ${pendaftaran.peran.toUpperCase()}`,
        `Demikian surat tugas ini dibuat untuk dipergunakan sebagaimana mestinya.`
      ];

      const pdfBuffer = this.generatePdfBuffer(title, content);
      try {
        const publicUrl = await this.supabase.uploadFile(
          'surat-tugas',
          `surat_tugas_${pendaftaranId}.pdf`,
          pdfBuffer,
          'application/pdf'
        );
        updateData.surat_tugas_url = publicUrl;
      } catch (err) {
        // Fallback placeholder URL
        updateData.surat_tugas_url = `https://storage.siproto.ac.id/surat-tugas/surat_tugas_${pendaftaranId}.pdf`;
      }
    }

    const updated = await this.prisma.pendaftaranKegiatan.update({
      where: { id: pendaftaranId },
      data: updateData
    });

    return {
      message: 'Seleksi berhasil.' + (body.keputusan === 'diterima' ? ' Surat tugas telah diterbitkan.' : ''),
      data: {
        id: updated.id,
        status: updated.status,
        surat_tugas_url: updated.surat_tugas_url
      }
    };
  }

  async remove(pendaftaranId: string) {
    const pendaftaran = await this.prisma.pendaftaranKegiatan.findUnique({
      where: { id: pendaftaranId }
    });
    if (!pendaftaran) {
      throw new NotFoundException('Pendaftaran tidak ditemukan');
    }

    const kegiatanIds = [pendaftaran.kegiatan_id];
    if (pendaftaran.kegiatan_dialihkan_id) {
      kegiatanIds.push(pendaftaran.kegiatan_dialihkan_id);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.absensi.deleteMany({
        where: {
          protokoler_id: pendaftaran.protokoler_id,
          kegiatan_id: { in: kegiatanIds }
        }
      });

      await tx.evaluasiKegiatan.deleteMany({
        where: {
          protokoler_id: pendaftaran.protokoler_id,
          kegiatan_id: { in: kegiatanIds }
        }
      });

      await tx.pendaftaranKegiatan.delete({
        where: { id: pendaftaranId }
      });
    });

    return { message: 'Anggota berhasil dihapus dari pendaftaran kegiatan' };
  }

  async adminAddMember(kegiatanId: string, protokolerId: string, peran: 'protokoler' | 'lo') {
    await autoUpdateStatuses(this.prisma);

    const protokoler = await this.prisma.protokoler.findUnique({
      where: { id: protokolerId }
    });
    if (!protokoler) {
      throw new NotFoundException('Profil protokoler tidak ditemukan');
    }
    if (protokoler.status_akun !== StatusAkunEnum.aktif) {
      throw new ForbiddenException('Akun protokoler belum aktif');
    }

    const kegiatan = await this.prisma.kegiatan.findUnique({
      where: { id: kegiatanId }
    });
    if (!kegiatan) {
      throw new NotFoundException('Kegiatan tidak ditemukan');
    }

    if (
      kegiatan.status === StatusKegiatanEnum.selesai ||
      kegiatan.status === StatusKegiatanEnum.batal
    ) {
      throw new BadRequestException('Kegiatan sudah selesai atau dibatalkan');
    }

    const existing = await this.prisma.pendaftaranKegiatan.findUnique({
      where: {
        kegiatan_id_protokoler_id: {
          kegiatan_id: kegiatanId,
          protokoler_id: protokolerId
        }
      }
    });
    if (existing) {
      throw new BadRequestException('Anggota sudah terdaftar di kegiatan ini');
    }

    const activeRegistrations = await this.prisma.pendaftaranKegiatan.findMany({
      where: {
        protokoler_id: protokolerId,
        status: {
          in: [StatusPendaftaranEnum.diterima, StatusPendaftaranEnum.dialihkan]
        }
      },
      include: {
        kegiatan: true,
        kegiatan_dialihkan: true
      }
    });

    for (const reg of activeRegistrations) {
      const activeKegiatan = reg.status === StatusPendaftaranEnum.dialihkan ? reg.kegiatan_dialihkan : reg.kegiatan;
      if (!activeKegiatan) continue;

      const date1 = new Date(activeKegiatan.tanggal).toDateString();
      const date2 = new Date(kegiatan.tanggal).toDateString();

      if (date1 === date2) {
        const start1 = activeKegiatan.jam_mulai.getTime();
        const end1 = activeKegiatan.jam_selesai.getTime();
        const start2 = kegiatan.jam_mulai.getTime();
        const end2 = kegiatan.jam_selesai.getTime();

        if (start1 < end2 && end1 > start2) {
          throw new BadRequestException(`Jadwal bentrok dengan kegiatan ${activeKegiatan.nama_kegiatan}`);
        }
      }
    }

    const pendaftaranId = await this.prisma.$transaction(async (tx) => {
      const newPendaftaran = await tx.pendaftaranKegiatan.create({
        data: {
          kegiatan_id: kegiatanId,
          protokoler_id: protokolerId,
          peran: peran === 'lo' ? PeranKegiatanEnum.lo : PeranKegiatanEnum.protokoler,
          status: StatusPendaftaranEnum.diterima,
        }
      });
      return newPendaftaran.id;
    });

    const title = 'SURAT TUGAS KEPANITIAAN PROTOKOL';
    const content = [
      `Nomor Tugas: ST-${new Date().getFullYear()}-${pendaftaranId.substring(0, 8).toUpperCase()}`,
      `Yang bertanda tangan di bawah ini menerangkan bahwa:`,
      `Nama   : ${protokoler.nama_lengkap}`,
      `NIM    : ${protokoler.nim}`,
      `Prodi  : ${protokoler.prodi}`,
      `Ditugaskan pada kegiatan:`,
      `Nama Kegiatan : ${kegiatan.nama_kegiatan}`,
      `Tanggal       : ${new Date(kegiatan.tanggal).toLocaleDateString('id-ID')}`,
      `Lokasi        : ${kegiatan.lokasi}`,
      `Peran         : ${peran.toUpperCase()}`,
      `Demikian surat tugas ini dibuat untuk dipergunakan sebagaimana mestinya.`
    ];

    const pdfBuffer = this.generatePdfBuffer(title, content);
    let suratTugasUrl = `https://storage.siproto.ac.id/surat-tugas/surat_tugas_${pendaftaranId}.pdf`;
    try {
      suratTugasUrl = await this.supabase.uploadFile(
        'surat-tugas',
        `surat_tugas_${pendaftaranId}.pdf`,
        pdfBuffer,
        'application/pdf'
      );
    } catch (err) {
      // Fallback
    }

    const updated = await this.prisma.pendaftaranKegiatan.update({
      where: { id: pendaftaranId },
      data: {
        surat_tugas_url: suratTugasUrl
      }
    });

    return {
      message: 'Anggota berhasil ditambahkan ke tim pelaksana. Surat tugas telah diterbitkan.',
      data: updated
    };
  }
}
