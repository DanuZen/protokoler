# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Protokoler – Sistem Informasi Protokoler Universitas

**Versi 1.2 | Juni 2025**

---

| Info                | Detail                                                            |
| ------------------- | ----------------------------------------------------------------- |
| **Nama Produk**     | Protokoler                                                           |
| **Versi**           | 1.2 – MVP                                                         |
| **Status**          | Draft                                                             |
| **Platform**        | Web App + Mobile App                                              |
| **Target Pengguna** | Admin / Pembina, Protokoler (Mahasiswa), Tamu, Dokumentasi        |
| **Referensi**       | Indikator Lomba Anugerah Protokol 2026 + Dokumen Alur Sistem v1.0 |

---

## 1. Ringkasan Produk

Protokoler adalah sistem informasi berbasis web dan mobile yang dirancang untuk membantu unit protokoler universitas dalam mengelola seluruh siklus kegiatan protokoler: dari pendaftaran akun anggota, pembuatan kegiatan, seleksi & penugasan, absensi, evaluasi pasca kegiatan, hingga penerbitan sertifikat dan rekap pencapaian anggota.

Sistem dirancang selaras dengan **4 indikator Laporan Manajemen Keprotokolan** pada Lomba Anugerah Protokol 2026 (Pendahuluan, Pelaksanaan, Evaluasi, Inovasi) dan mengacu pada **Dokumen Alur Sistem Aplikasi Protokol v1.0**.

---

## 2. Role Pengguna

| Role                | Deskripsi & Tanggung Jawab                                                                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Admin / Pembina** | Membuat & mengelola kegiatan, memverifikasi akun protokoler, menyeleksi pendaftar, memberikan feedback evaluasi, memantau seluruh aktivitas sistem, akses dashboard evaluasi          |
| **Protokoler**      | Mendaftarkan akun, mendaftar ke kegiatan, absensi selfie saat kegiatan, mengisi angket evaluasi pasca kegiatan, mengumpulkan sertifikat sebagai rekam jejak, akses dashboard evaluasi |
| **Tamu**            | Peserta/tamu undangan kegiatan yang dapat mengisi form testimoni setelah kegiatan berlangsung                                                                                         |
| **Dokumentasi**     | Mengupload foto dan video dokumentasi acara setelah kegiatan selesai, mengelola dan mengakses file dokumentasi via dashboard dokumentasi untuk arsip dan review                       |

---

## 3. Masalah yang Dipecahkan

| Masalah Saat Ini                                 | Solusi di Protokoler                                            |
| ------------------------------------------------ | ------------------------------------------------------------ |
| Pendaftaran anggota manual & tidak terverifikasi | Modul pendaftaran akun dengan verifikasi admin & upload foto |
| Tidak ada rekam jejak mahasiswa bertugas         | Riwayat tugas, sertifikat, dan rekap pencapaian per anggota  |
| Penugasan dilakukan manual / via chat            | Penugasan digital + seleksi (diterima/ditolak/dialihkan)     |
| Tidak ada bukti kehadiran saat kegiatan          | Absensi selfie saat pelaksanaan kegiatan                     |
| Tidak ada mekanisme evaluasi terstruktur         | Angket evaluasi 1×24 jam + feedback admin + testimoni tamu   |
| Tidak ada dokumentasi & laporan terpusat         | Laporan otomatis, sertifikat digital, dan ekspor PDF/Excel   |

---

## 4. User Persona

### 4.1 Admin / Pembina

- **Kebutuhan:** Mengelola data anggota, membuat kegiatan, menyeleksi peserta, monitoring evaluasi
- **Pain point:** Proses manual memakan waktu, tidak ada rekap terpusat, sulit memantau anggota
- **Goal:** Satu dashboard untuk semua kebutuhan manajemen protokoler

### 4.2 Protokoler (Mahasiswa)

- **Kebutuhan:** Daftar akun, lihat & daftar kegiatan, absensi, evaluasi, kumpulkan sertifikat
- **Pain point:** Informasi kegiatan tidak konsisten, tidak ada bukti partisipasi resmi
- **Goal:** Akses mudah ke semua kegiatan dan rekam jejak pencapaian yang terdokumentasi

### 4.3 Tamu

- **Kebutuhan:** Memberikan umpan balik terhadap kegiatan yang dihadiri
- **Pain point:** Tidak ada saluran resmi untuk menyampaikan testimoni
- **Goal:** Form testimoni yang mudah diakses kapan saja

### 4.4 Dokumentasi

- **Kebutuhan:** Mengumpulkan dan menyimpan dokumentasi visual (foto/video) acara, mengelola arsip acara
- **Pain point:** Dokumentasi tersebar, tidak ada sistem penyimpanan terpusat
- **Goal:** Dashboard khusus untuk upload dan manage dokumentasi acara dengan metadata otomatis

---

## 5. Fitur & Persyaratan Fungsional

> Fitur dikelompokkan berdasarkan **6 Fase Alur Sistem** + **4 Indikator Lomba Anugerah Protokol 2026**

---

### FASE ⓪ — Pendaftaran Akun Protokoler

_(Indikator 1: Pengelolaan SDM)_

| No  | Fitur                  | Deskripsi                                                            | Prioritas |
| --- | ---------------------- | -------------------------------------------------------------------- | --------- |
| 1   | Form Pendaftaran Akun  | Input data: nama lengkap, NIM, prodi, departemen, fakultas           | HIGH      |
| 2   | Upload Foto Profil     | Upload foto setengah badan dan foto full body                        | HIGH      |
| 3   | Verifikasi Admin       | Admin menyetujui atau menolak pendaftaran akun                       | HIGH      |
| 4   | Notifikasi Status Akun | Protokoler mendapat notifikasi jika akun disetujui atau ditolak      | HIGH      |
| 5   | Revisi & Daftar Ulang  | Jika ditolak, protokoler dapat memperbaiki data dan mengajukan ulang | MEDIUM    |
| 6   | Kelola Profil Anggota  | Edit data diri, ganti foto, perbarui status keanggotaan              | MEDIUM    |

---

### FASE ① — Persiapan Kegiatan

_(Indikator 1: Jenis Acara + Indikator 2: Alur Persiapan)_

| No  | Fitur                      | Deskripsi                                                              | Prioritas |
| --- | -------------------------- | ---------------------------------------------------------------------- | --------- |
| 1   | Buat Kegiatan Baru         | Form: nama kegiatan, tanggal, tempat, jam mulai & selesai              | HIGH      |
| 2   | Detail Kegiatan            | Audience, tamu VVIP internal/eksternal, keynote, rundown acara         | HIGH      |
| 3   | Kategori / Bentuk Kegiatan | Dropdown: Wisuda, Kunjungan, Seminar, Pelantikan, Rapat Resmi, Lainnya | HIGH      |
| 4   | Penentuan Kebutuhan SDM    | Dropdown jumlah protokoler & LO + fitur search nama protokoler         | HIGH      |
| 5   | Status Kegiatan            | Simpan sebagai Draf (tidak publik) atau Publik (open pendaftaran)      | HIGH      |
| 6   | Kalender Kegiatan          | Tampilan kalender bulanan seluruh kegiatan terjadwal                   | HIGH      |
| 7   | Checklist 3 Tata Protokol  | Daftar periksa: Tata Tempat, Tata Upacara, Tata Penghormatan           | HIGH      |
| 8   | Upload Rundown & Dokumen   | Upload file susunan acara, surat undangan, dan dokumen pendukung       | MEDIUM    |

---

### FASE ② — Pendaftaran Kegiatan

_(Indikator 2: Alur Pelaksanaan)_

| No  | Fitur                          | Deskripsi                                                                                   | Prioritas |
| --- | ------------------------------ | ------------------------------------------------------------------------------------------- | --------- |
| 1   | Pendaftaran Mandiri Protokoler | Protokoler mendaftarkan diri pada kegiatan yang dipublikasikan                              | HIGH      |
| 2   | Seleksi Pendaftaran            | Admin meninjau dan memutuskan: Diterima / Ditolak / Dialihkan ke kegiatan lain              | HIGH      |
| 3   | Cek Konflik Jadwal             | Sistem memperingatkan jika protokoler sudah terdaftar di kegiatan lain waktu bersamaan      | HIGH      |
| 4   | Penerbitan Surat Tugas         | Sistem otomatis menerbitkan surat izin kuliah / surat tugas untuk seluruh tim yang diterima | HIGH      |
| 5   | Notifikasi Hasil Seleksi       | Protokoler mendapat notifikasi hasil seleksi (diterima/ditolak/dialihkan)                   | HIGH      |
| 6   | Penugasan Langsung oleh Admin  | Admin dapat langsung menugaskan protokoler tertentu tanpa menunggu pendaftaran mandiri      | MEDIUM    |

---

### FASE ③ — Pelaksanaan Kegiatan

_(Indikator 2: Penerapan 3 Tata + Dokumentasi)_

| No  | Fitur                   | Deskripsi                                                                     | Prioritas |
| --- | ----------------------- | ----------------------------------------------------------------------------- | --------- |
| 1   | Absensi Selfie          | Protokoler melakukan absensi dengan selfie saat kegiatan berlangsung          | HIGH      |
| 2   | Verifikasi Kehadiran    | Sistem menyimpan dan memvalidasi foto absensi sebagai bukti kehadiran fisik   | HIGH      |
| 3   | Status Checklist 3 Tata | Admin/protokoler menandai penyelesaian item checklist 3 Tata saat pelaksanaan | HIGH      |
| 4   | Upload Dokumentasi      | Upload foto dokumentasi kegiatan selama atau setelah kegiatan berlangsung     | HIGH      |
| 5   | Galeri Kegiatan         | Tampilan galeri foto per kegiatan yang dapat diakses admin dan pimpinan       | MEDIUM    |

---

### FASE ④ — Pasca Kegiatan

_(Indikator 3: Evaluasi)_

| No  | Fitur                          | Deskripsi                                                                        | Prioritas |
| --- | ------------------------------ | -------------------------------------------------------------------------------- | --------- |
| 1   | Angket Evaluasi Protokoler     | Form evaluasi kegiatan + refleksi diri, wajib diisi dalam 1×24 jam               | HIGH      |
| 2   | Form Testimoni Tamu            | Tamu mengisi form testimoni kapan saja tanpa batas waktu                         | HIGH      |
| 3   | Feedback Admin / Pembina       | Admin memberikan feedback terhadap kegiatan dan kinerja tim protokoler           | HIGH      |
| 4   | Penerbitan Sertifikat Otomatis | Sertifikat diterbitkan sistem jika angket evaluasi telah diisi dalam batas waktu | HIGH      |
| 5   | Mekanisme Tindak Lanjut        | Admin mencatat tindak lanjut hasil evaluasi dan memantau status penyelesaiannya  | HIGH      |
| 6   | Riwayat Evaluasi               | Rekap seluruh hasil evaluasi kegiatan yang dapat difilter per periode            | MEDIUM    |

---

### FASE ④.A — Dokumentasi Acara

_(Indikator 3: Dokumentasi Acara & Arsip Digital)_

| No  | Fitur                      | Deskripsi                                                                           | Prioritas |
| --- | -------------------------- | ----------------------------------------------------------------------------------- | --------- |
| 1   | Dashboard Dokumentasi      | Role dokumentasi dapat melihat list acara selesai untuk diupload dokumentasinya     | HIGH      |
| 2   | Upload Foto & Video        | Form upload dokumentasi visual (foto, video) dengan metadata acara otomatis         | HIGH      |
| 3   | Penyimpanan File Media     | Sistem menyimpan media dengan metadata: nama acara, tanggal, tempat, tanggal upload | HIGH      |
| 4   | Akses & Review Dokumentasi | Role dokumentasi dapat mengakses kembali file dokumentasi untuk arsip dan review    | HIGH      |
| 5   | Integrasi Laporan Acara    | Admin dapat mengakses dokumentasi saat membuat laporan atau publikasi acara         | MEDIUM    |

---

### FASE ⑤ — Rekap & Pencapaian Anggota

_(Indikator 1: Pengelolaan SDM + Indikator 4: Inovasi)_

| No  | Fitur                      | Deskripsi                                                                               | Prioritas |
| --- | -------------------------- | --------------------------------------------------------------------------------------- | --------- |
| 1   | Rekap Otomatis Per Anggota | Sistem memperbarui jumlah kegiatan, status aktif, dan koleksi sertifikat setiap anggota | HIGH      |
| 2   | Kategorisasi Sertifikat    | Otomatis: Perak (1–10 kegiatan), Silver (11–29 kegiatan), Gold (30+ kegiatan)           | HIGH      |
| 3   | Profil Pencapaian Anggota  | Halaman profil anggota menampilkan rekap kegiatan, sertifikat, dan tingkatan            | HIGH      |
| 4   | Download Sertifikat        | Anggota dapat mengunduh sertifikat digital masing-masing                                | HIGH      |
| 5   | Rekap Jam Tugas            | Total jam dan frekuensi tugas tiap protokoler dalam periode tertentu                    | HIGH      |

---

### Fitur Lintas Fase

_(Indikator 1: Peraturan + Indikator 3: Laporan + Indikator 4: Inovasi)_

| No  | Fitur                        | Deskripsi                                                                                                | Prioritas |
| --- | ---------------------------- | -------------------------------------------------------------------------------------------------------- | --------- |
| 1   | Repositori Regulasi          | Upload & akses dokumen peraturan keprotokolan (UU, Perpres, SOP, Pedoman)                                | HIGH      |
| 2   | Laporan Kegiatan Per Periode | Daftar semua kegiatan, detail, evaluasi, dan rekap dalam rentang waktu tertentu                          | HIGH      |
| 3   | Ekspor Laporan               | Unduh laporan dalam format PDF dan Excel                                                                 | HIGH      |
| 4   | Dashboard Statistik          | Grafik: total kegiatan, protokoler teraktif, distribusi peran, tren evaluasi                             | MEDIUM    |
| 5   | Dashboard Inovasi            | Ringkasan transformasi digital: perbandingan sebelum/sesudah Protokoler                                     | MEDIUM    |
| 6   | Dashboard Dokumentasi        | Halaman khusus untuk role dokumentasi: list acara selesai & upload media                                 | MEDIUM    |
| 7   | Dashboard Evaluasi           | Tampilkan hasil evaluasi dari admin, protokoler, dan tamu dalam satu halaman (akses: Admin & Protokoler) | HIGH      |
| 8   | Notifikasi & Reminder        | Push notification untuk penugasan, reminder H-1 & H-0 kegiatan, batas waktu angket                       | HIGH      |

---

## 6. Persyaratan Non-Fungsional

| Aspek               | Persyaratan                                                           |
| ------------------- | --------------------------------------------------------------------- |
| **Performa**        | Halaman utama & dashboard load dalam < 3 detik pada koneksi 4G        |
| **Keamanan**        | Autentikasi JWT, role-based access control (Admin, Protokoler, Tamu)  |
| **Ketersediaan**    | 99% uptime pada jam kerja (07.00 – 22.00 WIB)                         |
| **Skalabilitas**    | Minimal 500 anggota aktif dan 100 kegiatan per tahun                  |
| **Kemudahan Pakai** | Pengguna baru dapat menyelesaikan tugas utama tanpa pelatihan > 1 jam |
| **Kompatibilitas**  | Web: Chrome, Firefox, Edge terbaru. Mobile: Android 8+ dan iOS 13+    |

---

## 7. Model Data Utama

### 7.1 Entitas Mahasiswa (Protokoler)

| Field                   | Tipe    | Keterangan                              |
| ----------------------- | ------- | --------------------------------------- |
| id                      | UUID    | Primary key                             |
| nim                     | String  | Nomor Induk Mahasiswa (unik)            |
| nama_lengkap            | String  | Nama lengkap                            |
| prodi                   | String  | Program studi                           |
| departemen              | String  | Departemen                              |
| fakultas                | String  | Fakultas                                |
| email                   | String  | Email kampus                            |
| foto_setengah_badan_url | String  | URL foto setengah badan                 |
| foto_full_body_url      | String  | URL foto full body                      |
| status_akun             | Enum    | pending / aktif / ditolak / tidak_aktif |
| total_kegiatan          | Integer | Akumulasi jumlah kegiatan yang diikuti  |
| kategori_sertifikat     | Enum    | perak / silver / gold                   |

### 7.2 Entitas Kegiatan

| Field             | Tipe    | Keterangan                                      |
| ----------------- | ------- | ----------------------------------------------- |
| id                | UUID    | Primary key                                     |
| nama_kegiatan     | String  | Judul / nama acara                              |
| bentuk_kegiatan   | Enum    | Wisuda / Kunjungan / Seminar / Pelantikan / dll |
| tanggal           | Date    | Tanggal pelaksanaan                             |
| jam_mulai         | Time    | Jam mulai                                       |
| jam_selesai       | Time    | Jam selesai                                     |
| lokasi            | String  | Tempat kegiatan                                 |
| audience          | Text    | Deskripsi peserta                               |
| keynote           | String  | Narasumber utama                                |
| status            | Enum    | draf / publik / selesai / batal                 |
| jumlah_protokoler | Integer | Kuota protokoler                                |
| jumlah_lo         | Integer | Kuota LO                                        |

### 7.3 Entitas Tamu VVIP

| Field            | Tipe          | Keterangan                   |
| ---------------- | ------------- | ---------------------------- |
| id               | UUID          | Primary key                  |
| kegiatan_id      | FK → Kegiatan | Referensi kegiatan           |
| nama_tamu        | String        | Nama lengkap tamu            |
| jabatan          | String        | Jabatan / posisi             |
| instansi         | String        | Asal instansi                |
| tipe             | Enum          | internal / eksternal         |
| jumlah_rombongan | Integer       | Jumlah orang dalam rombongan |

### 7.4 Entitas Pendaftaran (Registrasi Kegiatan)

| Field                 | Tipe            | Keterangan                                 |
| --------------------- | --------------- | ------------------------------------------ |
| id                    | UUID            | Primary key                                |
| kegiatan_id           | FK → Kegiatan   | Referensi kegiatan                         |
| protokoler_id         | FK → Protokoler | Referensi anggota                          |
| peran                 | Enum            | LO / Protokoler                            |
| status                | Enum            | pending / diterima / ditolak / dialihkan   |
| kegiatan_dialihkan_id | FK → Kegiatan   | Jika dialihkan, referensi ke kegiatan lain |
| surat_tugas_url       | String          | URL surat tugas yang diterbitkan           |

### 7.5 Entitas Absensi

| Field           | Tipe            | Keterangan              |
| --------------- | --------------- | ----------------------- |
| id              | UUID            | Primary key             |
| kegiatan_id     | FK → Kegiatan   | Referensi kegiatan      |
| protokoler_id   | FK → Protokoler | Referensi anggota       |
| foto_selfie_url | String          | URL foto selfie absensi |
| waktu_absen     | Timestamp       | Waktu absensi dilakukan |
| status          | Enum            | hadir / tidak_hadir     |

### 7.6 Entitas Evaluasi Kegiatan

| Field             | Tipe            | Keterangan                             |
| ----------------- | --------------- | -------------------------------------- |
| id                | UUID            | Primary key                            |
| kegiatan_id       | FK → Kegiatan   | Referensi kegiatan                     |
| protokoler_id     | FK → Protokoler | Referensi anggota yang mengisi         |
| evaluasi_kegiatan | Text            | Evaluasi terhadap pelaksanaan kegiatan |
| refleksi_diri     | Text            | Refleksi kinerja pribadi               |
| waktu_pengisian   | Timestamp       | Waktu angket diisi                     |
| dalam_batas_waktu | Boolean         | Apakah diisi dalam 1×24 jam            |

### 7.7 Entitas Testimoni Tamu

| Field           | Tipe          | Keterangan             |
| --------------- | ------------- | ---------------------- |
| id              | UUID          | Primary key            |
| kegiatan_id     | FK → Kegiatan | Referensi kegiatan     |
| nama_tamu       | String        | Nama pengisi testimoni |
| isi_testimoni   | Text          | Isi feedback dari tamu |
| waktu_pengisian | Timestamp     | Waktu testimoni diisi  |

### 7.8 Entitas Sertifikat

| Field          | Tipe            | Keterangan                     |
| -------------- | --------------- | ------------------------------ |
| id             | UUID            | Primary key                    |
| protokoler_id  | FK → Protokoler | Referensi anggota              |
| kegiatan_id    | FK → Kegiatan   | Referensi kegiatan             |
| kategori       | Enum            | perak / silver / gold          |
| tanggal_terbit | Date            | Tanggal sertifikat diterbitkan |
| file_url       | String          | URL file sertifikat digital    |

---

## 8. Role & Hak Akses

| Fitur                          |    Admin    | Protokoler | Tamu | Dokumentasi |
| ------------------------------ | :---------: | :--------: | :--: | :---------: |
| Verifikasi akun protokoler     |     ✅      |     ❌     |  ❌  |     ❌      |
| Buat & edit kegiatan           |     ✅      |     ❌     |  ❌  |     ❌      |
| Publikasi kegiatan             |     ✅      |     ❌     |  ❌  |     ❌      |
| Seleksi pendaftaran kegiatan   |     ✅      |     ❌     |  ❌  |     ❌      |
| Daftar ke kegiatan             |     ❌      |     ✅     |  ❌  |     ❌      |
| Absensi selfie                 |     ❌      |     ✅     |  ❌  |     ❌      |
| Checklist 3 Tata Protokol      |     ✅      |     ✅     |  ❌  |     ❌      |
| Upload dokumentasi kegiatan    |     ✅      |     ✅     |  ❌  |     ✅      |
| Akses dashboard dokumentasi    |     ✅      |     ❌     |  ❌  |     ✅      |
| Isi angket evaluasi (1×24 jam) |     ❌      |     ✅     |  ❌  |     ❌      |
| Isi form testimoni             |     ❌      |     ❌     |  ✅  |     ❌      |
| Feedback evaluasi admin        |     ✅      |     ❌     |  ❌  |     ❌      |
| Akses dashboard evaluasi       |     ✅      |     ✅     |  ❌  |     ❌      |
| Terbitkan sertifikat           | ⬜ Otomatis |     ❌     |  ❌  |     ❌      |
| Download sertifikat            |     ✅      |     ✅     |  ❌  |     ❌      |
| Lihat semua kegiatan           |     ✅      |     ❌     |  ❌  |     ❌      |
| Lihat jadwal tugas sendiri     |     ✅      |     ✅     |  ❌  |
| Akses laporan & rekap          |     ✅      |     ❌     |  ❌  |
| Lihat laporan evaluasi         |     ✅      |     ❌     |  ❌  |
| Akses regulasi (baca)          |     ✅      |     ✅     |  ❌  |
| Kelola regulasi                |     ✅      |     ❌     |  ❌  |
| Dashboard inovasi              |     ✅      |     ❌     |  ❌  |
| Ekspor laporan                 |     ✅      |     ❌     |  ❌  |

---

## 9. Aturan Bisnis

| No  | Aturan                                                    | Dampak                                           |
| --- | --------------------------------------------------------- | ------------------------------------------------ |
| 1   | Akun protokoler hanya aktif setelah diverifikasi admin    | Tidak bisa mendaftar kegiatan sebelum akun aktif |
| 2   | Kegiatan hanya bisa didaftari jika statusnya Publik       | Kegiatan Draf tidak tampil untuk protokoler      |
| 3   | Admin bisa menolak atau mengalihkan pendaftar             | Protokoler yang ditolak tidak masuk tim kegiatan |
| 4   | Absensi selfie wajib dilakukan saat kegiatan berlangsung  | Kehadiran tanpa selfie tidak tercatat di sistem  |
| 5   | Angket evaluasi wajib diisi dalam 1×24 jam pasca kegiatan | Melebihi batas waktu = tidak mendapat sertifikat |
| 6   | Sertifikat dikategorikan otomatis oleh sistem             | Kategori berdasarkan akumulasi jumlah kegiatan   |
| 7   | Testimoni tamu tidak memiliki batas waktu                 | Bisa diisi kapan saja setelah kegiatan selesai   |

---

## 10. Acceptance Criteria

| Fitur                | Kriteria Penerimaan                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Pendaftaran Akun     | Protokoler dapat mendaftar dan upload foto. Admin dapat approve/reject. Notifikasi terkirim. |
| Manajemen Kegiatan   | Kegiatan dapat dibuat, disimpan sebagai draf, dan dipublikasikan. Tampil di kalender.        |
| Pendaftaran Kegiatan | Protokoler dapat mendaftar. Admin dapat seleksi. Surat tugas diterbitkan otomatis.           |
| Absensi Selfie       | Protokoler dapat upload selfie saat kegiatan. Sistem menyimpan sebagai bukti kehadiran.      |
| Checklist 3 Tata     | Semua item 3 Tata dapat diisi dan direkap. Status tampil di detail kegiatan.                 |
| Evaluasi             | Angket dapat diisi dalam 1×24 jam. Sertifikat terbit otomatis jika angket terisi.            |
| Testimoni Tamu       | Tamu dapat mengisi form testimoni tanpa batas waktu. Data tersimpan di sistem.               |
| Sertifikat & Rekap   | Sertifikat diterbitkan dan dikategorikan otomatis. Anggota dapat unduh sertifikat.           |
| Laporan              | Laporan kegiatan dan rekap jam tugas dapat digenerate dan diunduh PDF/Excel.                 |

---

## 11. Pemetaan Fitur ke Indikator Lomba Anugerah Protokol 2026

| Indikator          | Sub-indikator                | Modul Protokoler                                       |
| ------------------ | ---------------------------- | --------------------------------------------------- |
| **1. Pendahuluan** | Peraturan                    | Repositori Regulasi & Dasar Hukum                   |
|                    | Pengelolaan SDM              | Pendaftaran Akun + Verifikasi + Rekap Anggota       |
|                    | Jenis Acara                  | Manajemen Kegiatan & Kategori                       |
| **2. Pelaksanaan** | Penerapan 3 Tata             | Checklist 3 Tata Protokol                           |
|                    | Alur Persiapan & Pelaksanaan | Persiapan Kegiatan + Pendaftaran + Absensi          |
|                    | Dokumentasi Kegiatan         | Upload Foto + Surat Tugas Otomatis                  |
| **3. Evaluasi**    | Mekanisme Evaluasi           | Angket Evaluasi + Testimoni Tamu + Feedback Admin   |
|                    | Hasil & Tindak Lanjut        | Rekap Evaluasi + Laporan Periodik + Tindak Lanjut   |
| **4. Inovasi**     | Inovasi Layanan              | Absensi Selfie + Sertifikat Digital + Gamifikasi    |
|                    | Transformasi Digital         | Protokoler sebagai produk inovasi digital keprotokolan |

---

## 12. Ketentuan Pengembangan Selanjutnya (Future Scope)

- Integrasi dengan sistem akademik (SIAKAD) untuk validasi data mahasiswa
- Sistem penilaian performa mahasiswa protokoler per kegiatan
- Modul anggaran kegiatan protokoler
- Laporan analitik lanjutan dan prediksi kebutuhan SDM
- Fitur QR Code untuk absensi selain selfie
- Notifikasi WhatsApp Gateway selain push notification
