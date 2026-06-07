# UAT CHECKLIST — USER ACCEPTANCE TESTING
## SiProto – Sistem Informasi Protokoler Universitas
**Versi 1.2 | Juni 2025**

---

| Info | Detail |
|------|--------|
| **Versi Dokumen** | 1.2 |
| **Referensi** | SiProto_PRD.md v1.2 + SiProto_Alur_Sistem.md v1.2 |
| **Tester** | Tim Internal + Sample User |
| **Metode** | Pengujian manual per fase alur sistem |

---

## Cara Menggunakan Dokumen Ini

- ✅ = Lulus (pass)
- ❌ = Gagal (fail) — catat catatan di kolom Keterangan
- ⏳ = Belum diuji

Setiap skenario diuji oleh role yang relevan menggunakan akun uji.

---

## FASE ⓪ — Pendaftaran Akun Protokoler

### TC-001: Pendaftaran akun baru berhasil

| # | Langkah | Yang Diharapkan | Status | Keterangan |
|---|---------|-----------------|--------|------------|
| 1 | Buka form pendaftaran | Form multi-step tampil | ⏳ | |
| 2 | Isi data: NIM, Nama, Prodi, Departemen, Fakultas, No HP, Email | Validasi berjalan, field kosong ditolak | ⏳ | |
| 3 | Upload foto setengah badan (JPG, 1MB) | Preview foto tampil | ⏳ | |
| 4 | Upload foto full body (JPG, 1.5MB) | Preview foto tampil | ⏳ | |
| 5 | Buat password (min 8 karakter) | Tidak ada error | ⏳ | |
| 6 | Klik tombol Daftar | Status akun = "pending", pesan konfirmasi tampil | ⏳ | |
| 7 | Admin membuka daftar anggota → Tab Pending | Data pendaftar baru muncul | ⏳ | |

---

### TC-002: Validasi form pendaftaran

| # | Langkah | Yang Diharapkan | Status | Keterangan |
|---|---------|-----------------|--------|------------|
| 1 | Submit form dengan NIM kosong | Error: "NIM wajib diisi" | ⏳ | |
| 2 | Submit dengan NIM yang sudah terdaftar | Error: "NIM sudah terdaftar" | ⏳ | |
| 3 | Upload foto > 2MB | Error: "Ukuran foto maksimal 2MB" | ⏳ | |
| 4 | Upload file bukan gambar (PDF) | Error: "Format file tidak didukung" | ⏳ | |
| 5 | Password < 8 karakter | Error: "Password minimal 8 karakter" | ⏳ | |

---

### TC-003: Admin verifikasi akun — Setujui

| # | Langkah | Yang Diharapkan | Status | Keterangan |
|---|---------|-----------------|--------|------------|
| 1 | Admin buka detail anggota pending | Foto dan data diri tampil lengkap | ⏳ | |
| 2 | Klik tombol [Setujui] | Status berubah menjadi "aktif" | ⏳ | |
| 3 | Cek notifikasi protokoler | Protokoler menerima notifikasi "Akun disetujui" | ⏳ | |
| 4 | Protokoler login | Berhasil masuk, bisa lihat kegiatan publik | ⏳ | |

---

### TC-004: Admin verifikasi akun — Tolak & Revisi

| # | Langkah | Yang Diharapkan | Status | Keterangan |
|---|---------|-----------------|--------|------------|
| 1 | Admin klik [Tolak], isi alasan penolakan | Kolom catatan muncul | ⏳ | |
| 2 | Konfirmasi penolakan | Status berubah "ditolak", alasan tersimpan | ⏳ | |
| 3 | Protokoler cek notifikasi | Menerima pesan penolakan + alasan | ⏳ | |
| 4 | Protokoler perbaiki data → daftar ulang | Bisa mendaftar dengan data baru | ⏳ | |

---

## FASE ① — Persiapan Kegiatan

### TC-101: Buat kegiatan baru — Publikasikan

| # | Langkah | Yang Diharapkan | Status | Keterangan |
|---|---------|-----------------|--------|------------|
| 1 | Admin buka form buat kegiatan | Form 3-step tampil | ⏳ | |
| 2 | Isi Step 1: nama, bentuk, tanggal, jam, lokasi | Tidak ada error, lanjut ke Step 2 | ⏳ | |
| 3 | Isi Step 2: audience, keynote, tambah 2 tamu VVIP | Data tersimpan sementara | ⏳ | |
| 4 | Isi Step 3: jumlah protokoler = 5, LO = 3 | Tidak ada error | ⏳ | |
| 5 | Klik [Publikasikan] | Status kegiatan = "publik" | ⏳ | |
| 6 | Buka halaman kalender | Kegiatan tampil di tanggal yang sesuai | ⏳ | |
| 7 | Login sebagai protokoler, buka daftar kegiatan | Kegiatan baru tampil di Tab Tersedia | ⏳ | |

---

### TC-102: Buat kegiatan — Simpan sebagai Draf

| # | Langkah | Yang Diharapkan | Status | Keterangan |
|---|---------|-----------------|--------|------------|
| 1 | Isi form, klik [Simpan Draf] | Status kegiatan = "draf" | ⏳ | |
| 2 | Login sebagai protokoler | Kegiatan draf TIDAK tampil | ⏳ | |
| 3 | Admin ubah status draf → publik | Kegiatan tampil untuk protokoler | ⏳ | |

---

### TC-103: Checklist 3 Tata Protokol

| # | Langkah | Yang Diharapkan | Status | Keterangan |
|---|---------|-----------------|--------|------------|
| 1 | Admin buka detail kegiatan → Tab INFO | Checklist 3 Tata tampil (semua unchecked) | ⏳ | |
| 2 | Centang Tata Tempat + Tata Upacara | Status tersimpan | ⏳ | |
| 3 | Refresh halaman | Centang Tata Tempat + Tata Upacara masih tersimpan | ⏳ | |
| 4 | Centang Tata Penghormatan | Semua 3 tata tercentang, indikator "Lengkap" tampil | ⏳ | |

---

## FASE ② — Pendaftaran Kegiatan

### TC-201: Protokoler mendaftar ke kegiatan

| # | Langkah | Yang Diharapkan | Status | Keterangan |
|---|---------|-----------------|--------|------------|
| 1 | Protokoler buka detail kegiatan publik | Tombol [Daftar Sekarang] aktif | ⏳ | |
| 2 | Pilih peran: Protokoler → Konfirmasi | Pendaftaran tersimpan, status = "pending" | ⏳ | |
| 3 | Admin buka Tab Pendaftar di kegiatan tersebut | Nama protokoler muncul dengan status pending | ⏳ | |

---

### TC-202: Cek konflik jadwal

| # | Langkah | Yang Diharapkan | Status | Keterangan |
|---|---------|-----------------|--------|------------|
| 1 | Protokoler yang sudah diterima di Kegiatan A (tanggal sama) coba daftar ke Kegiatan B | Peringatan: "Jadwal bertabrakan dengan [Kegiatan A]" | ⏳ | |
| 2 | Sistem memblokir pendaftaran | Protokoler tidak bisa mendaftar | ⏳ | |

---

### TC-203: Seleksi pendaftar — Terima

| # | Langkah | Yang Diharapkan | Status | Keterangan |
|---|---------|-----------------|--------|------------|
| 1 | Admin klik [Terima] pada pendaftar | Status berubah "diterima" | ⏳ | |
| 2 | Sistem generate surat tugas | File surat tugas (.pdf) tampil di kolom | ⏳ | |
| 3 | Protokoler cek notifikasi | Menerima notif "Diterima di [Nama Kegiatan]" | ⏳ | |
| 4 | Surat tugas bisa didownload | PDF berhasil diunduh, konten valid | ⏳ | |

---

### TC-204: Seleksi pendaftar — Alihkan

| # | Langkah | Yang Diharapkan | Status | Keterangan |
|---|---------|-----------------|--------|------------|
| 1 | Admin klik [Alihkan], pilih kegiatan tujuan | Dropdown kegiatan lain muncul | ⏳ | |
| 2 | Konfirmasi pengalihan | Pendaftaran dialihkan ke kegiatan tujuan | ⏳ | |
| 3 | Protokoler cek notifikasi | Menerima notif pengalihan ke kegiatan baru | ⏳ | |

---

## FASE ③ — Pelaksanaan Kegiatan

### TC-301: Absensi selfie — Berhasil

| # | Langkah | Yang Diharapkan | Status | Keterangan |
|---|---------|-----------------|--------|------------|
| 1 | Saat kegiatan berlangsung, protokoler buka halaman Absensi | Akses kamera terbuka (selfie mode) | ⏳ | |
| 2 | Ambil foto selfie | Preview foto tampil | ⏳ | |
| 3 | Klik [Konfirmasi] | Absensi tersimpan, status = "hadir" | ⏳ | |
| 4 | Admin cek Tab Absensi di kegiatan tersebut | Nama protokoler + foto selfie tampil | ⏳ | |

---

### TC-302: Absensi selfie — Error cases

| # | Langkah | Yang Diharapkan | Status | Keterangan |
|---|---------|-----------------|--------|------------|
| 1 | Absensi sebelum kegiatan dimulai | Error: "Absensi belum dibuka" | ⏳ | |
| 2 | Absensi setelah kegiatan selesai | Error: "Absensi sudah ditutup" | ⏳ | |
| 3 | Absensi dua kali | Error: "Anda sudah absen sebelumnya" | ⏳ | |
| 4 | Protokoler yang tidak terdaftar/diterima coba absen | Error: "Anda tidak terdaftar di kegiatan ini" | ⏳ | |

---

## FASE ④ — Pasca Kegiatan

### TC-401: Angket evaluasi — Diisi dalam batas waktu

| # | Langkah | Yang Diharapkan | Status | Keterangan |
|---|---------|-----------------|--------|------------|
| 1 | Setelah kegiatan selesai, protokoler buka Tab Kegiatan Saya | Kegiatan muncul dengan badge "Perlu Evaluasi" + timer | ⏳ | |
| 2 | Klik kegiatan, buka form evaluasi | Timer countdown 24 jam tampil | ⏳ | |
| 3 | Isi evaluasi kegiatan (min 50 karakter) | Karakter counter berjalan | ⏳ | |
| 4 | Isi refleksi diri (min 30 karakter) | Karakter counter berjalan | ⏳ | |
| 5 | Beri rating 4 bintang | Bintang ke-4 tersorot | ⏳ | |
| 6 | Klik [Kirim Evaluasi] | Evaluasi tersimpan, `dalam_batas_waktu = true` | ⏳ | |
| 7 | Sistem otomatis terbitkan sertifikat | Notifikasi "Sertifikat siap diunduh" diterima | ⏳ | |

---

### TC-402: Angket evaluasi — Melebihi batas waktu

| # | Langkah | Yang Diharapkan | Status | Keterangan |
|---|---------|-----------------|--------|------------|
| 1 | Simulasi: set waktu pengisian > 24 jam setelah kegiatan | Timer menunjukkan "Waktu Habis" | ⏳ | |
| 2 | Coba kirim evaluasi | Error: "Batas waktu pengisian telah habis" | ⏳ | |
| 3 | Cek database sertifikat | Tidak ada sertifikat diterbitkan untuk kegiatan ini | ⏳ | |
| 4 | Cek profil protokoler | `total_kegiatan` tidak bertambah | ⏳ | |

---

### TC-403: Form testimoni tamu

| # | Langkah | Yang Diharapkan | Status | Keterangan |
|---|---------|-----------------|--------|------------|
| 1 | Buka link testimoni unik (tanpa login) | Form testimoni tampil | ⏳ | |
| 2 | Isi nama, jabatan, rating 5 bintang, testimoni | Form terisi | ⏳ | |
| 3 | Klik [Kirim Testimoni] | Pesan sukses tampil | ⏳ | |
| 4 | Admin cek Tab Evaluasi → sub-tab Testimoni | Data testimoni tamu tampil | ⏳ | |

---

### TC-404: Notifikasi reminder evaluasi

| # | Langkah | Yang Diharapkan | Status | Keterangan |
|---|---------|-----------------|--------|------------|
| 1 | Kegiatan selesai | Notifikasi push dikirim ke semua protokoler yang hadir | ⏳ | |
| 2 | H+12 jam, protokoler belum isi evaluasi | Notifikasi reminder ke-2 dikirim | ⏳ | |
| 3 | Protokoler yang sudah isi evaluasi | Tidak menerima reminder ke-2 | ⏳ | |

---

## FASE ⑤ — Rekap & Pencapaian

### TC-501: Update otomatis total kegiatan & kategori

| # | Langkah | Yang Diharapkan | Status | Keterangan |
|---|---------|-----------------|--------|------------|
| 1 | Protokoler dengan 9 sertifikat mengisi evaluasi ke-10 tepat waktu | Sertifikat ke-10 diterbitkan | ⏳ | |
| 2 | Cek profil protokoler | `total_kegiatan` = 10, `kategori_sertifikat` = "perak" | ⏳ | |
| 3 | Protokoler memiliki 10 sertifikat dan terima sertifikat ke-11 | `kategori_sertifikat` naik ke "silver" | ⏳ | |
| 4 | Cek notifikasi | Menerima notif kenaikan level | ⏳ | |

---

### TC-502: Download sertifikat

| # | Langkah | Yang Diharapkan | Status | Keterangan |
|---|---------|-----------------|--------|------------|
| 1 | Protokoler buka halaman Sertifikat | Daftar semua sertifikat tampil dengan nomor unik | ⏳ | |
| 2 | Klik [Download PDF] pada sertifikat | File PDF terunduh | ⏳ | |
| 3 | Buka file PDF | Konten valid: nama, kegiatan, tanggal, kategori, nomor sertifikat | ⏳ | |

---

## Fitur Lintas Fase

### TC-601: Laporan & Ekspor

| # | Langkah | Yang Diharapkan | Status | Keterangan |
|---|---------|-----------------|--------|------------|
| 1 | Admin buka Laporan Kegiatan, set filter periode | Data kegiatan dalam periode tampil | ⏳ | |
| 2 | Klik [Ekspor PDF] | File PDF terunduh dengan data yang benar | ⏳ | |
| 3 | Klik [Ekspor Excel] | File Excel terunduh, data sesuai | ⏳ | |
| 4 | Admin buka Rekap Anggota, cari nama protokoler | Data rekap (total kegiatan, jam, kategori) tampil | ⏳ | |

---

### TC-602: Regulasi

| # | Langkah | Yang Diharapkan | Status | Keterangan |
|---|---------|-----------------|--------|------------|
| 1 | Admin upload regulasi baru (PDF 3MB) | Dokumen tersimpan, tampil di daftar | ⏳ | |
| 2 | Protokoler buka halaman Regulasi | Daftar dokumen tampil, bisa preview | ⏳ | |
| 3 | Download dokumen | File PDF terunduh | ⏳ | |

---

### TC-603: Role & Akses

| # | Langkah | Yang Diharapkan | Status | Keterangan |
|---|---------|-----------------|--------|------------|
| 1 | Protokoler coba akses `/anggota` (halaman admin) | Redirect ke 403 / Forbidden | ⏳ | |
| 2 | Protokoler coba akses laporan admin | Ditolak | ⏳ | |
| 3 | Admin coba mengisi form evaluasi | Ditolak (bukan role protokoler) | ⏳ | |
| 4 | Link testimoni diakses tanpa login | Berhasil diakses (publik) | ⏳ | |
| 5 | Link testimoni kadaluarsa / tidak valid | Halaman error "Link tidak valid" | ⏳ | |

---

## Non-Fungsional Testing

### TC-NF-01: Performa

| # | Skenario | Target | Status | Keterangan |
|---|----------|--------|--------|------------|
| 1 | Load dashboard admin pada koneksi 4G | < 3 detik | ⏳ | |
| 2 | Upload foto selfie (3MB) | < 10 detik | ⏳ | |
| 3 | Generate surat tugas PDF | < 5 detik | ⏳ | |
| 4 | Generate sertifikat PDF | < 5 detik | ⏳ | |
| 5 | Load laporan 100 kegiatan | < 5 detik | ⏳ | |

---

### TC-NF-02: Keamanan

| # | Skenario | Target | Status | Keterangan |
|---|----------|--------|--------|------------|
| 1 | Akses endpoint admin tanpa token | Response 401 | ⏳ | |
| 2 | Akses resource milik protokoler lain | Response 403 | ⏳ | |
| 3 | Token kadaluarsa digunakan | Response 401 | ⏳ | |
| 4 | Upload file executable (.exe) sebagai foto | Ditolak, error format | ⏳ | |

---

### TC-NF-03: Kompatibilitas

| # | Platform | Status | Keterangan |
|---|----------|--------|------------|
| 1 | Web: Chrome (terbaru) | ⏳ | |
| 2 | Web: Firefox (terbaru) | ⏳ | |
| 3 | Web: Microsoft Edge | ⏳ | |
| 4 | Mobile: Android 10+ | ⏳ | |
| 5 | Mobile: iOS 15+ | ⏳ | |

---

## Ringkasan Hasil UAT

| Fase | Total TC | Lulus | Gagal | Belum Diuji |
|------|----------|-------|-------|-------------|
| Fase ⓪ Pendaftaran Akun | TC-001 s.d. TC-004 (20 kasus) | — | — | 20 |
| Fase ① Persiapan Kegiatan | TC-101 s.d. TC-103 (17 kasus) | — | — | 17 |
| Fase ② Pendaftaran Kegiatan | TC-201 s.d. TC-204 (14 kasus) | — | — | 14 |
| Fase ③ Pelaksanaan | TC-301 s.d. TC-302 (8 kasus) | — | — | 8 |
| Fase ④ Pasca Kegiatan | TC-401 s.d. TC-404 (18 kasus) | — | — | 18 |
| Fase ⑤ Rekap & Pencapaian | TC-501 s.d. TC-502 (6 kasus) | — | — | 6 |
| Lintas Fase | TC-601 s.d. TC-603 (14 kasus) | — | — | 14 |
| Non-Fungsional | TC-NF-01 s.d. TC-NF-03 (14 kasus) | — | — | 14 |
| **Total** | **111 kasus** | **—** | **—** | **111** |

---

> **Catatan:** Dokumen ini diperbarui seiring berjalannya pengujian. Update kolom Status dan Keterangan setiap sesi testing.
