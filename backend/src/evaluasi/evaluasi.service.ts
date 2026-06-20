import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { StatusKegiatanEnum, StatusHadirEnum, KategoriSertifikatEnum, RoleEnum } from '@prisma/client';

@Injectable()
export class EvaluasiService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  private generatePdfBuffer(title: string, contentLines: string[]): Buffer {
    const escapedLines = contentLines.map(line => 
      line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
    );

    let streamContent = `BT\n/F1 16 Tf\n70 750 Td\n(${title}) Tj\nET\n`;
    streamContent += `BT\n/F1 10 Tf\n`;
    let currentY = 700;
    for (const line of escapedLines) {
      streamContent += `70 ${currentY} Td (${line}) Tj\n`;
      currentY = -25;
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

  async createEvaluasi(
    kegiatanId: string,
    protokolerId: string,
    body: { evaluasi_kegiatan: string; refleksi_diri: string; rating_kegiatan: number },
  ) {
    // 1. Fetch kegiatan
    const kegiatan = await this.prisma.kegiatan.findUnique({
      where: { id: kegiatanId }
    });
    if (!kegiatan) {
      throw new NotFoundException('Kegiatan tidak ditemukan');
    }

    // 2. Presence check: must have checked in and status = hadir
    const absensi = await this.prisma.absensi.findUnique({
      where: {
        kegiatan_id_protokoler_id: {
          kegiatan_id: kegiatanId,
          protokoler_id: protokolerId
        }
      }
    });
    if (!absensi || absensi.status !== StatusHadirEnum.hadir) {
      throw new ForbiddenException('Anda tidak melakukan absensi pada kegiatan ini');
    }

    // 3. Time validation: 24h limit after event ends
    const now = new Date();
    const kegiatanDate = new Date(kegiatan.tanggal);
    const endTime = new Date(kegiatan.jam_selesai);
    
    const actualEnd = new Date(
      kegiatanDate.getFullYear(),
      kegiatanDate.getMonth(),
      kegiatanDate.getDate(),
      endTime.getHours(),
      endTime.getMinutes(),
      endTime.getSeconds()
    );
    const deadline = new Date(actualEnd.getTime() + 24 * 60 * 60 * 1000);

    if (now > deadline) {
      throw new ForbiddenException('Batas waktu pengisian telah habis');
    }

    // 4. Duplicate check
    const existingEval = await this.prisma.evaluasiKegiatan.findUnique({
      where: {
        kegiatan_id_protokoler_id: {
          kegiatan_id: kegiatanId,
          protokoler_id: protokolerId
        }
      }
    });
    if (existingEval) {
      throw new ConflictException('Anda sudah mengisi evaluasi untuk kegiatan ini');
    }

    // 5. Save Evaluasi
    const evaluasi = await this.prisma.evaluasiKegiatan.create({
      data: {
        kegiatan_id: kegiatanId,
        protokoler_id: protokolerId,
        evaluasi_kegiatan: body.evaluasi_kegiatan,
        refleksi_diri: body.refleksi_diri,
        rating_kegiatan: body.rating_kegiatan,
        waktu_pengisian: now,
        dalam_batas_waktu: true
      }
    });

    // 6. Generate Certificate number & PDF
    const certCount = await this.prisma.sertifikat.count();
    const numStr = String(certCount + 1).padStart(6, '0');
    const nomorSertifikat = `SERT-${now.getFullYear()}-${numStr}`;

    const protokoler = await this.prisma.protokoler.findUnique({
      where: { id: protokolerId }
    });

    // Count new total kegiatan = current certificates + 1
    const totalKegiatan = certCount + 1;
    let newKategori: KategoriSertifikatEnum = KategoriSertifikatEnum.perak;
    if (totalKegiatan > 15) {
      newKategori = KategoriSertifikatEnum.gold;
    } else if (totalKegiatan >= 6) {
      newKategori = KategoriSertifikatEnum.silver;
    }

    const title = 'SERTIFIKAT PENGHARGAAN KEPADA PROTOKOLER';
    const content = [
      `Nomor Sertifikat: ${nomorSertifikat}`,
      `Diberikan kepada:`,
      `Nama           : ${protokoler?.nama_lengkap}`,
      `NIM            : ${protokoler?.nim}`,
      `Prodi          : ${protokoler?.prodi}`,
      `Fakultas       : ${protokoler?.fakultas}`,
      `Atas peran aktifnya dalam keprotokolan kegiatan:`,
      `Nama Kegiatan  : ${kegiatan.nama_kegiatan}`,
      `Tanggal        : ${new Date(kegiatan.tanggal).toLocaleDateString('id-ID')}`,
      `Kategori Level : ${newKategori.toUpperCase()}`,
      `Demikian sertifikat ini diterbitkan secara resmi.`
    ];

    const pdfBuffer = this.generatePdfBuffer(title, content);
    let publicUrl = '';
    try {
      publicUrl = await this.supabase.uploadFile(
        'sertifikat',
        `sertifikat_${nomorSertifikat}.pdf`,
        pdfBuffer,
        'application/pdf'
      );
    } catch (err) {
      publicUrl = `https://storage.siproto.ac.id/sertifikat/sertifikat_${nomorSertifikat}.pdf`;
    }

    await this.prisma.sertifikat.create({
      data: {
        protokoler_id: protokolerId,
        kegiatan_id: kegiatanId,
        kategori: newKategori,
        nomor_sertifikat: nomorSertifikat,
        file_url: publicUrl
      }
    });

    // Update Protokoler Stats
    await this.prisma.protokoler.update({
      where: { id: protokolerId },
      data: {
        total_kegiatan: totalKegiatan,
        kategori_sertifikat: newKategori
      }
    });

    return {
      message: 'Evaluasi berhasil disimpan. Sertifikat sedang diproses.',
      data: {
        id: evaluasi.id,
        dalam_batas_waktu: true,
        sertifikat_diterbitkan: true,
        nomor_sertifikat: nomorSertifikat
      }
    };
  }

  async getDashboard(params: { status?: string; search?: string; page?: number; limit?: number }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) {
      where.status = params.status as StatusKegiatanEnum;
    }
    if (params.search) {
      where.nama_kegiatan = { contains: params.search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.kegiatan.findMany({
        where,
        include: {
          evaluasi: true,
          testimoni: true
        },
        skip,
        take: limit,
        orderBy: { tanggal: 'desc' }
      }),
      this.prisma.kegiatan.count({ where })
    ]);

    const mapped = data.map(k => {
      const totalEval = k.evaluasi.length;
      const avgRating = totalEval > 0 
        ? k.evaluasi.reduce((acc, curr) => acc + (curr.rating_kegiatan || 0), 0) / totalEval 
        : 0;

      const totalTesti = k.testimoni.length;
      const avgTestiRating = totalTesti > 0
        ? k.testimoni.reduce((acc, curr) => acc + (curr.rating || 0), 0) / totalTesti
        : 0;

      let sentimen = 'netral';
      if (totalTesti > 0) {
        if (avgTestiRating >= 4) sentimen = 'positif';
        else if (avgTestiRating < 3) sentimen = 'negatif';
      }

      return {
        kegiatan_id: k.id,
        nama_kegiatan: k.nama_kegiatan,
        tanggal: k.tanggal,
        status: k.status,
        ringkasan_evaluasi: {
          jumlah_evaluasi_protokoler: totalEval,
          rata_rating_kegiatan: parseFloat(avgRating.toFixed(1)),
          jumlah_testimoni_tamu: totalTesti,
          sentimen_testimoni: sentimen
        }
      };
    });

    return {
      data: mapped,
      total,
      page,
      limit
    };
  }

  async getHasil(kegiatanId: string, userRole: RoleEnum) {
    const kegiatan = await this.prisma.kegiatan.findUnique({
      where: { id: kegiatanId }
    });

    if (!kegiatan) {
      throw new NotFoundException('Kegiatan tidak ditemukan');
    }

    const evaluasiList = await this.prisma.evaluasiKegiatan.findMany({
      where: { kegiatan_id: kegiatanId },
      include: {
        protokoler: true
      }
    });

    return evaluasiList.map(e => ({
      ...e,
      saran: e.evaluasi_kegiatan
    }));
  }

  async updateFeedback(kegiatanId: string, catatan: string) {
    const kegiatan = await this.prisma.kegiatan.findUnique({
      where: { id: kegiatanId }
    });
    if (!kegiatan) {
      throw new NotFoundException('Kegiatan tidak ditemukan');
    }

    const updated = await this.prisma.kegiatan.update({
      where: { id: kegiatanId },
      data: {
        feedback_admin: catatan,
        feedback_admin_updated_at: new Date()
      }
    });

    return {
      message: 'Feedback admin berhasil disimpan',
      data: {
        kegiatan_id: updated.id,
        feedback_admin: updated.feedback_admin,
        feedback_admin_updated_at: updated.feedback_admin_updated_at
      }
    };
  }
}
