# PROJECT PLAN

## Protokoler – Sistem Informasi Protokoler Universitas

**Versi 1.2 | Juni 2025**

---

| Info                | Detail                                                            |
| ------------------- | ----------------------------------------------------------------- |
| **Nama Proyek**     | Protokoler – Sistem Informasi Protokoler Universitas                 |
| **Institusi**       | Universitas (Lingkup Internal Kampus)                             |
| **Versi Dokumen**   | 1.2                                                               |
| **Tanggal Dibuat**  | Juni 2025                                                         |
| **Platform Target** | Web App & Mobile App (Android/iOS)                                |
| **Target Durasi**   | 1 – 2 Bulan                                                       |
| **Tim Pengembang**  | Tim Internal Kampus                                               |
| **Referensi**       | Indikator Lomba Anugerah Protokol 2026 + Dokumen Alur Sistem v1.0 |

---

## 1. Latar Belakang

Unit Protokoler di lingkungan universitas berperan penting dalam mendukung kelancaran berbagai kegiatan resmi kampus. Saat ini seluruh proses — dari pendaftaran anggota, penugasan, absensi, hingga evaluasi — masih dilakukan secara manual, menimbulkan berbagai permasalahan:

- Tidak ada verifikasi formal keanggotaan tim protokoler
- Penugasan dilakukan ad-hoc tanpa sistem yang terstruktur
- Tidak ada bukti kehadiran digital saat pelaksanaan kegiatan
- Tidak ada mekanisme evaluasi kegiatan yang terdokumentasi
- Tidak ada rekam jejak pencapaian dan sertifikat bagi anggota

Protokoler dibangun sebagai solusi transformasi digital yang menjawab seluruh tantangan tersebut, sekaligus selaras dengan **4 indikator Lomba Anugerah Protokol 2026** dan mengacu pada **Dokumen Alur Sistem Aplikasi Protokol v1.0**.

---

## 2. Tujuan Proyek

- Membangun sistem pendaftaran akun anggota protokoler dengan verifikasi admin
- Menyediakan manajemen kegiatan lengkap (persiapan, pendaftaran, pelaksanaan, pasca kegiatan)
- Mengimplementasikan absensi selfie digital saat pelaksanaan kegiatan
- Mengotomatisasi penerbitan surat tugas dan sertifikat digital
- Menyediakan angket evaluasi, form testimoni tamu, dan feedback admin
- Membangun sistem rekap pencapaian anggota dengan gamifikasi tingkatan sertifikat
- Mengimplementasikan checklist 3 Tata Protokol per kegiatan
- Menyediakan laporan dan dashboard monitoring bagi admin dan pimpinan

---

## 3. Ruang Lingkup

### 3.1 Dalam Lingkup (In Scope)

**Indikator 1 – Pendahuluan:**

- Pendaftaran & verifikasi akun anggota protokoler (dengan upload foto)
- Repositori regulasi dan dasar hukum keprotokolan
- Manajemen kategori dan jenis kegiatan protokoler

**Indikator 2 – Pelaksanaan:**

- Pembuatan kegiatan (Draf/Publik) dengan detail VVIP, keynote, rundown
- Pendaftaran mandiri protokoler + seleksi (Diterima/Ditolak/Dialihkan)
- Penerbitan surat tugas/izin kuliah otomatis
- Absensi selfie digital saat pelaksanaan kegiatan
- Checklist 3 Tata Protokol per kegiatan
- Upload dokumentasi kegiatan (foto, video, dokumen) oleh role Dokumentasi
- Dashboard Dokumentasi untuk role Dokumentasi (list kegiatan selesai, upload, galeri)

**Indikator 3 – Evaluasi:**

- Angket evaluasi protokoler (wajib 1×24 jam pasca kegiatan)
- Form testimoni tamu (tanpa batas waktu)
- Feedback evaluasi admin/pembina
- Dashboard Evaluasi untuk Admin & Protokoler (ringkasan hasil evaluasi, detail, export)
- Penerbitan sertifikat digital berbasis penyelesaian angket
- Laporan evaluasi dan rekap kegiatan per periode

**Indikator 4 – Inovasi:**

- Gamifikasi pencapaian: Perak / Silver / Gold berdasarkan akumulasi kegiatan
- Dashboard inovasi & rekap dampak transformasi digital
- Protokoler sebagai produk inovasi layanan keprotokolan kampus

### 3.2 Di Luar Lingkup (Out of Scope)

- Integrasi dengan sistem akademik / SIAKAD
- Manajemen keuangan atau anggaran kegiatan
- Fitur QR Code untuk absensi (dikembangkan fase berikutnya)
- Notifikasi via WhatsApp Gateway (dikembangkan fase berikutnya)

---

## 4. Stakeholder

| Stakeholder            | Peran          | Kepentingan                                                               |
| ---------------------- | -------------- | ------------------------------------------------------------------------- |
| Admin / Pembina        | Primary User   | Mengelola seluruh siklus kegiatan, anggota protokoler, dan hasil evaluasi |
| Mahasiswa / Protokoler | Secondary User | Mendaftar, bertugas, absensi, evaluasi, dan kumpulkan sertifikat          |
| Role Dokumentasi       | Secondary User | Upload dokumentasi kegiatan (foto/video) dan kelola galeri dokumentasi    |
| Tamu Undangan          | Tertiary User  | Mengisi form testimoni pasca kegiatan                                     |
| Pimpinan / Manajemen   | Viewer         | Monitoring dashboard, laporan kegiatan, hasil evaluasi, dan rekap dampak  |

---

## 5. Milestone & Timeline

Target pengembangan: **1 – 2.5 bulan (10 minggu)** _(Updated: Ditambahkan Dashboard Dokumentasi & Evaluasi)_

| Fase   | Milestone            | Deliverable                                                                                             | Durasi        |
| ------ | -------------------- | ------------------------------------------------------------------------------------------------------- | ------------- |
| Fase 1 | Perencanaan & Desain | PRD final v1.3, wireframe UI/UX (7 halaman: 6 fase + 2 dashboard), arsitektur sistem & database         | Minggu 1 – 2  |
| Fase 2 | Development Backend  | API: auth & akun, kegiatan, pendaftaran, absensi, evaluasi, dokumentasi, dashboard evaluasi, sertifikat | Minggu 2 – 4  |
| Fase 3 | Development Frontend | Web: Dashboard Admin, Dashboard Dokumentasi, Dashboard Evaluasi; Mobile: Protokoler & Tamu app          | Minggu 3 – 6  |
| Fase 4 | Integrasi & Testing  | Integrasi end-to-end, UAT 7 fase alur bersama user (termasuk Fase IV.A dokumentasi)                     | Minggu 6 – 8  |
| Fase 5 | Deploy & Go-Live     | Server deployment, pelatihan user (Admin, Protokoler, Dokumentasi, Tamu), go-live                       | Minggu 9 – 10 |

**Catatan Timeline:**

- Penambahan role Dokumentasi dan 2 dashboard (Dokumentasi & Evaluasi) menambah ~2 minggu ke timeline
- Jika tim terbatas, pertimbangkan MVP tanpa Dokumentasi dashboard di release v1.3, masukkan di v1.4

---

## 6. Arsitektur Teknologi (Rekomendasi)

| Layer                | Teknologi Rekomendasi       | Keterangan                                                |
| -------------------- | --------------------------- | --------------------------------------------------------- |
| Frontend Web         | React.js / Next.js          | Dashboard Admin & Pimpinan                                |
| Mobile App           | Flutter / React Native      | Aplikasi Protokoler & Tamu (Android & iOS)                |
| Backend API          | Node.js + Express / Laravel | REST API untuk semua modul (6 fase alur)                  |
| Database             | PostgreSQL / MySQL          | Penyimpanan data utama                                    |
| File Storage         | MinIO / S3                  | Foto profil, selfie absensi, foto kegiatan, sertifikat    |
| Notifikasi           | Firebase Cloud Messaging    | Push notification penugasan, reminder, batas waktu angket |
| Sertifikat Generator | PDF Library (PDFKit/TCPDF)  | Generate sertifikat digital otomatis                      |
| Hosting              | Server kampus / VPS         | Deployment internal kampus                                |

---

## 7. Pemetaan Modul ke Indikator Lomba Anugerah Protokol 2026

| Indikator          | Sub-indikator                | Modul Protokoler                                                | Fase Alur            |
| ------------------ | ---------------------------- | ------------------------------------------------------------ | -------------------- |
| **1. Pendahuluan** | Peraturan                    | Repositori Regulasi                                          | Lintas Fase          |
|                    | Pengelolaan SDM              | Pendaftaran Akun + Rekap Anggota                             | Fase ⓪ + ⑤           |
|                    | Jenis Acara                  | Manajemen Kegiatan & Kategori                                | Fase ①               |
| **2. Pelaksanaan** | Penerapan 3 Tata             | Checklist 3 Tata Protokol                                    | Fase ① + ③           |
|                    | Alur Persiapan & Pelaksanaan | Persiapan + Pendaftaran + Absensi                            | Fase ① + ② + ③       |
|                    | Dokumentasi Kegiatan         | Upload Dokumentasi (foto/video) oleh Dokumentasi             | Fase ④.A             |
|                    | Dashboard Dokumentasi        | Kelola upload dokumentasi kegiatan per event                 | Fase ④.A             |
| **3. Evaluasi**    | Mekanisme Evaluasi           | Angket + Testimoni Tamu + Feedback Admin                     | Fase ④               |
|                    | Dashboard Evaluasi           | Ringkasan & detail hasil evaluasi untuk Admin & Protokoler   | Fase ④               |
|                    | Hasil & Tindak Lanjut        | Rekap Evaluasi + Laporan                                     | Fase ④ + ⑤           |
| **4. Inovasi**     | Inovasi Layanan              | Absensi Selfie + Sertifikat Digital + Gamifikasi + Dashboard | Fase ③ + ④ + ④.A + ⑤ |
|                    | Transformasi Digital         | Protokoler sebagai produk inovasi layanan keprotokolan          | Keseluruhan          |

---

## 8. Risiko Proyek

| Risiko                                         | Level  | Mitigasi                                                                                       |
| ---------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| Ketersediaan tim pengembang terbatas           | Tinggi | Prioritaskan fitur inti MVP dulu (Fase ⓪–③), fitur dashboard di Fase ④–④.A, evaluasi di Fase ⑤ |
| Perubahan kebutuhan di tengah pengembangan     | Sedang | Kunci scope di PRD v1.3, perubahan lewat proses formal                                         |
| Adopsi pengguna rendah                         | Sedang | Libatkan user dalam UAT & adakan sesi pelatihan per role (Admin, Protokoler, Dokumentasi)      |
| Absensi selfie tidak diisi / di-bypass         | Sedang | Sistem tidak mencatat kehadiran tanpa selfie; enforce di UI                                    |
| Angket evaluasi tidak diisi dalam 1×24 jam     | Sedang | Reminder H+0 dan H+12 jam otomatis via push notification                                       |
| Upload dokumentasi video file besar            | Sedang | Kompresi otomatis, limit 100MB per file, storage planning untuk S3/MinIO                       |
| Dashboard Dokumentasi/Evaluasi tidak responsif | Sedang | Testing performa dashboard dengan data besar (1000+ events), optimize query                    |
| Masalah upload foto (ukuran, format)           | Sedang | Batasi ukuran file, kompresi otomatis, validasi format di frontend                             |
| Masalah performa di mobile                     | Rendah | Testing multi-device sebelum go-live                                                           |
| Role Dokumentasi tidak adoptive                | Rendah | Sosialisasi peran dokumentasi, training khusus role baru                                       |

---

## 9. Kriteria Keberhasilan

- Semua 6 fase alur sistem berjalan tanpa error kritis pada saat go-live
- Akun protokoler dapat diverifikasi admin dalam < 24 jam setelah pendaftaran
- Admin dapat membuat kegiatan dan mempublikasikannya dalam < 10 menit
- Surat tugas diterbitkan otomatis dalam < 1 menit setelah seleksi pendaftaran
- Absensi selfie berhasil tersimpan dan tercatat sebagai bukti kehadiran
- Angket evaluasi terisi > 90% dalam batas waktu 1×24 jam (setelah sistem berjalan 1 bulan)
- Sertifikat diterbitkan dan dapat diunduh dalam < 5 menit setelah angket terisi
- Laporan kegiatan dan rekap jam tugas dapat dihasilkan dan diunduh PDF/Excel
- Tingkat adopsi user minimal 80% dalam 30 hari pertama setelah go-live
- Sistem siap digunakan sebagai bukti inovasi pada Lomba Anugerah Protokol 2026
