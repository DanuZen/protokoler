# UAT CHECKLIST — USER ACCEPTANCE TESTING

## Protokoler – Sistem Informasi Protokoler Universitas

**Versi 1.2 | Juni 2025**

---

| Info              | Detail                                            |
| ----------------- | ------------------------------------------------- |
| **Versi Dokumen** | 1.2                                               |
| **Referensi**     | Protokoler_PRD.md v1.2 + Protokoler_Alur_Sistem.md v1.2 |
| **Tester**        | Tim Internal + Sample User                        |
| **Metode**        | Pengujian manual per fase alur sistem             |

---

## Cara Menggunakan Dokumen Ini

- ✅ = Lulus (pass)
- ❌ = Gagal (fail) — catat catatan di kolom Keterangan
- ⏳ = Belum diuji

Setiap skenario diuji oleh role yang relevan menggunakan akun uji.

---

## FASE ⓪ — Pendaftaran Akun Protokoler

### TC-001: Pendaftaran akun baru berhasil

| #   | Langkah                                                        | Yang Diharapkan                                  | Status | Keterangan |
| --- | -------------------------------------------------------------- | ------------------------------------------------ | ------ | ---------- |
| 1   | Buka form pendaftaran                                          | Form multi-step tampil                           | ⏳     |            |
| 2   | Isi data: NIM, Nama, Prodi, Departemen, Fakultas, No HP, Email | Validasi berjalan, field kosong ditolak          | ⏳     |            |
| 3   | Upload foto setengah badan (JPG, 1MB)                          | Preview foto tampil                              | ⏳     |            |
| 4   | Upload foto full body (JPG, 1.5MB)                             | Preview foto tampil                              | ⏳     |            |
| 5   | Buat password (min 8 karakter)                                 | Tidak ada error                                  | ⏳     |            |
| 6   | Klik tombol Daftar                                             | Status akun = "pending", pesan konfirmasi tampil | ⏳     |            |
| 7   | Admin membuka daftar anggota → Tab Pending                     | Data pendaftar baru muncul                       | ⏳     |            |

---

### TC-002: Validasi form pendaftaran

| #   | Langkah                                | Yang Diharapkan                      | Status | Keterangan |
| --- | -------------------------------------- | ------------------------------------ | ------ | ---------- |
| 1   | Submit form dengan NIM kosong          | Error: "NIM wajib diisi"             | ⏳     |            |
| 2   | Submit dengan NIM yang sudah terdaftar | Error: "NIM sudah terdaftar"         | ⏳     |            |
| 3   | Upload foto > 2MB                      | Error: "Ukuran foto maksimal 2MB"    | ⏳     |            |
| 4   | Upload file bukan gambar (PDF)         | Error: "Format file tidak didukung"  | ⏳     |            |
| 5   | Password < 8 karakter                  | Error: "Password minimal 8 karakter" | ⏳     |            |

---

### TC-003: Admin verifikasi akun — Setujui

| #   | Langkah                           | Yang Diharapkan                                 | Status | Keterangan |
| --- | --------------------------------- | ----------------------------------------------- | ------ | ---------- |
| 1   | Admin buka detail anggota pending | Foto dan data diri tampil lengkap               | ⏳     |            |
| 2   | Klik tombol [Setujui]             | Status berubah menjadi "aktif"                  | ⏳     |            |
| 3   | Cek notifikasi protokoler         | Protokoler menerima notifikasi "Akun disetujui" | ⏳     |            |
| 4   | Protokoler login                  | Berhasil masuk, bisa lihat kegiatan publik      | ⏳     |            |

---

### TC-004: Admin verifikasi akun — Tolak & Revisi

| #   | Langkah                                  | Yang Diharapkan                            | Status | Keterangan |
| --- | ---------------------------------------- | ------------------------------------------ | ------ | ---------- |
| 1   | Admin klik [Tolak], isi alasan penolakan | Kolom catatan muncul                       | ⏳     |            |
| 2   | Konfirmasi penolakan                     | Status berubah "ditolak", alasan tersimpan | ⏳     |            |
| 3   | Protokoler cek notifikasi                | Menerima pesan penolakan + alasan          | ⏳     |            |
| 4   | Protokoler perbaiki data → daftar ulang  | Bisa mendaftar dengan data baru            | ⏳     |            |

---

## FASE ① — Persiapan Kegiatan

### TC-101: Buat kegiatan baru — Publikasikan

| #   | Langkah                                           | Yang Diharapkan                        | Status | Keterangan |
| --- | ------------------------------------------------- | -------------------------------------- | ------ | ---------- |
| 1   | Admin buka form buat kegiatan                     | Form 3-step tampil                     | ⏳     |            |
| 2   | Isi Step 1: nama, bentuk, tanggal, jam, lokasi    | Tidak ada error, lanjut ke Step 2      | ⏳     |            |
| 3   | Isi Step 2: audience, keynote, tambah 2 tamu VVIP | Data tersimpan sementara               | ⏳     |            |
| 4   | Isi Step 3: jumlah protokoler = 5, LO = 3         | Tidak ada error                        | ⏳     |            |
| 5   | Klik [Publikasikan]                               | Status kegiatan = "publik"             | ⏳     |            |
| 6   | Buka halaman kalender                             | Kegiatan tampil di tanggal yang sesuai | ⏳     |            |
| 7   | Login sebagai protokoler, buka daftar kegiatan    | Kegiatan baru tampil di Tab Tersedia   | ⏳     |            |

---

### TC-102: Buat kegiatan — Simpan sebagai Draf

| #   | Langkah                         | Yang Diharapkan                  | Status | Keterangan |
| --- | ------------------------------- | -------------------------------- | ------ | ---------- |
| 1   | Isi form, klik [Simpan Draf]    | Status kegiatan = "draf"         | ⏳     |            |
| 2   | Login sebagai protokoler        | Kegiatan draf TIDAK tampil       | ⏳     |            |
| 3   | Admin ubah status draf → publik | Kegiatan tampil untuk protokoler | ⏳     |            |

---

### TC-103: Checklist 3 Tata Protokol

| #   | Langkah                               | Yang Diharapkan                                     | Status | Keterangan |
| --- | ------------------------------------- | --------------------------------------------------- | ------ | ---------- |
| 1   | Admin buka detail kegiatan → Tab INFO | Checklist 3 Tata tampil (semua unchecked)           | ⏳     |            |
| 2   | Centang Tata Tempat + Tata Upacara    | Status tersimpan                                    | ⏳     |            |
| 3   | Refresh halaman                       | Centang Tata Tempat + Tata Upacara masih tersimpan  | ⏳     |            |
| 4   | Centang Tata Penghormatan             | Semua 3 tata tercentang, indikator "Lengkap" tampil | ⏳     |            |

---

## FASE ② — Pendaftaran Kegiatan

### TC-201: Protokoler mendaftar ke kegiatan

| #   | Langkah                                       | Yang Diharapkan                              | Status | Keterangan |
| --- | --------------------------------------------- | -------------------------------------------- | ------ | ---------- |
| 1   | Protokoler buka detail kegiatan publik        | Tombol [Daftar Sekarang] aktif               | ⏳     |            |
| 2   | Pilih peran: Protokoler → Konfirmasi          | Pendaftaran tersimpan, status = "pending"    | ⏳     |            |
| 3   | Admin buka Tab Pendaftar di kegiatan tersebut | Nama protokoler muncul dengan status pending | ⏳     |            |

---

### TC-202: Cek konflik jadwal

| #   | Langkah                                                                               | Yang Diharapkan                                      | Status | Keterangan |
| --- | ------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------ | ---------- |
| 1   | Protokoler yang sudah diterima di Kegiatan A (tanggal sama) coba daftar ke Kegiatan B | Peringatan: "Jadwal bertabrakan dengan [Kegiatan A]" | ⏳     |            |
| 2   | Sistem memblokir pendaftaran                                                          | Protokoler tidak bisa mendaftar                      | ⏳     |            |

---

### TC-203: Seleksi pendaftar — Terima

| #   | Langkah                            | Yang Diharapkan                              | Status | Keterangan |
| --- | ---------------------------------- | -------------------------------------------- | ------ | ---------- |
| 1   | Admin klik [Terima] pada pendaftar | Status berubah "diterima"                    | ⏳     |            |
| 2   | Sistem generate surat tugas        | File surat tugas (.pdf) tampil di kolom      | ⏳     |            |
| 3   | Protokoler cek notifikasi          | Menerima notif "Diterima di [Nama Kegiatan]" | ⏳     |            |
| 4   | Surat tugas bisa didownload        | PDF berhasil diunduh, konten valid           | ⏳     |            |

---

### TC-204: Seleksi pendaftar — Alihkan

| #   | Langkah                                     | Yang Diharapkan                            | Status | Keterangan |
| --- | ------------------------------------------- | ------------------------------------------ | ------ | ---------- |
| 1   | Admin klik [Alihkan], pilih kegiatan tujuan | Dropdown kegiatan lain muncul              | ⏳     |            |
| 2   | Konfirmasi pengalihan                       | Pendaftaran dialihkan ke kegiatan tujuan   | ⏳     |            |
| 3   | Protokoler cek notifikasi                   | Menerima notif pengalihan ke kegiatan baru | ⏳     |            |

---

## FASE ③ — Pelaksanaan Kegiatan

### TC-301: Absensi selfie — Berhasil

| #   | Langkah                                                    | Yang Diharapkan                      | Status | Keterangan |
| --- | ---------------------------------------------------------- | ------------------------------------ | ------ | ---------- |
| 1   | Saat kegiatan berlangsung, protokoler buka halaman Absensi | Akses kamera terbuka (selfie mode)   | ⏳     |            |
| 2   | Ambil foto selfie                                          | Preview foto tampil                  | ⏳     |            |
| 3   | Klik [Konfirmasi]                                          | Absensi tersimpan, status = "hadir"  | ⏳     |            |
| 4   | Admin cek Tab Absensi di kegiatan tersebut                 | Nama protokoler + foto selfie tampil | ⏳     |            |

---

### TC-302: Absensi selfie — Error cases

| #   | Langkah                                             | Yang Diharapkan                               | Status | Keterangan |
| --- | --------------------------------------------------- | --------------------------------------------- | ------ | ---------- |
| 1   | Absensi sebelum kegiatan dimulai                    | Error: "Absensi belum dibuka"                 | ⏳     |            |
| 2   | Absensi setelah kegiatan selesai                    | Error: "Absensi sudah ditutup"                | ⏳     |            |
| 3   | Absensi dua kali                                    | Error: "Anda sudah absen sebelumnya"          | ⏳     |            |
| 4   | Protokoler yang tidak terdaftar/diterima coba absen | Error: "Anda tidak terdaftar di kegiatan ini" | ⏳     |            |

---

## FASE ④ — Pasca Kegiatan

### TC-401: Angket evaluasi — Diisi dalam batas waktu

| #   | Langkah                                                     | Yang Diharapkan                                       | Status | Keterangan |
| --- | ----------------------------------------------------------- | ----------------------------------------------------- | ------ | ---------- |
| 1   | Setelah kegiatan selesai, protokoler buka Tab Kegiatan Saya | Kegiatan muncul dengan badge "Perlu Evaluasi" + timer | ⏳     |            |
| 2   | Klik kegiatan, buka form evaluasi                           | Timer countdown 24 jam tampil                         | ⏳     |            |
| 3   | Isi evaluasi kegiatan (min 50 karakter)                     | Karakter counter berjalan                             | ⏳     |            |
| 4   | Isi refleksi diri (min 30 karakter)                         | Karakter counter berjalan                             | ⏳     |            |
| 5   | Beri rating 4 bintang                                       | Bintang ke-4 tersorot                                 | ⏳     |            |
| 6   | Klik [Kirim Evaluasi]                                       | Evaluasi tersimpan, `dalam_batas_waktu = true`        | ⏳     |            |
| 7   | Sistem otomatis terbitkan sertifikat                        | Notifikasi "Sertifikat siap diunduh" diterima         | ⏳     |            |

---

### TC-402: Angket evaluasi — Melebihi batas waktu

| #   | Langkah                                                 | Yang Diharapkan                                     | Status | Keterangan |
| --- | ------------------------------------------------------- | --------------------------------------------------- | ------ | ---------- |
| 1   | Simulasi: set waktu pengisian > 24 jam setelah kegiatan | Timer menunjukkan "Waktu Habis"                     | ⏳     |            |
| 2   | Coba kirim evaluasi                                     | Error: "Batas waktu pengisian telah habis"          | ⏳     |            |
| 3   | Cek database sertifikat                                 | Tidak ada sertifikat diterbitkan untuk kegiatan ini | ⏳     |            |
| 4   | Cek profil protokoler                                   | `total_kegiatan` tidak bertambah                    | ⏳     |            |

---

### TC-403: Form testimoni tamu

| #   | Langkah                                        | Yang Diharapkan            | Status | Keterangan |
| --- | ---------------------------------------------- | -------------------------- | ------ | ---------- |
| 1   | Buka link testimoni unik (tanpa login)         | Form testimoni tampil      | ⏳     |            |
| 2   | Isi nama, jabatan, rating 5 bintang, testimoni | Form terisi                | ⏳     |            |
| 3   | Klik [Kirim Testimoni]                         | Pesan sukses tampil        | ⏳     |            |
| 4   | Admin cek Tab Evaluasi → sub-tab Testimoni     | Data testimoni tamu tampil | ⏳     |            |

---

### TC-404: Notifikasi reminder evaluasi

| #   | Langkah                                 | Yang Diharapkan                                        | Status | Keterangan |
| --- | --------------------------------------- | ------------------------------------------------------ | ------ | ---------- |
| 1   | Kegiatan selesai                        | Notifikasi push dikirim ke semua protokoler yang hadir | ⏳     |            |
| 2   | H+12 jam, protokoler belum isi evaluasi | Notifikasi reminder ke-2 dikirim                       | ⏳     |            |
| 3   | Protokoler yang sudah isi evaluasi      | Tidak menerima reminder ke-2                           | ⏳     |            |

---

## FASE ⑤ — Rekap & Pencapaian

### TC-501: Update otomatis total kegiatan & kategori

| #   | Langkah                                                           | Yang Diharapkan                                        | Status | Keterangan |
| --- | ----------------------------------------------------------------- | ------------------------------------------------------ | ------ | ---------- |
| 1   | Protokoler dengan 9 sertifikat mengisi evaluasi ke-10 tepat waktu | Sertifikat ke-10 diterbitkan                           | ⏳     |            |
| 2   | Cek profil protokoler                                             | `total_kegiatan` = 10, `kategori_sertifikat` = "perak" | ⏳     |            |
| 3   | Protokoler memiliki 10 sertifikat dan terima sertifikat ke-11     | `kategori_sertifikat` naik ke "silver"                 | ⏳     |            |
| 4   | Cek notifikasi                                                    | Menerima notif kenaikan level                          | ⏳     |            |

---

### TC-502: Download sertifikat

| #   | Langkah                             | Yang Diharapkan                                                   | Status | Keterangan |
| --- | ----------------------------------- | ----------------------------------------------------------------- | ------ | ---------- |
| 1   | Protokoler buka halaman Sertifikat  | Daftar semua sertifikat tampil dengan nomor unik                  | ⏳     |            |
| 2   | Klik [Download PDF] pada sertifikat | File PDF terunduh                                                 | ⏳     |            |
| 3   | Buka file PDF                       | Konten valid: nama, kegiatan, tanggal, kategori, nomor sertifikat | ⏳     |            |

---

## FASE ④.A — Dokumentasi Kegiatan

### TC-451: Upload dokumentasi — Role Dokumentasi

| #   | Langkah                                                      | Yang Diharapkan                                              | Status | Keterangan |
| --- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------ | ---------- |
| 1   | Role Dokumentasi login, buka Dashboard Dokumentasi           | List kegiatan selesai tampil                                 | ⏳     |            |
| 2   | Cari kegiatan "Pelantikan Ketua Senat"                       | Kegiatan tampil dengan status "Belum Terdokumentasi"         | ⏳     |            |
| 3   | Klik [Upload], buka form upload                              | Form multipart dengan input: file, media_type, keterangan    | ⏳     |            |
| 4   | Pilih file foto (JPG 2MB), media_type="foto", isi keterangan | File dipilih, form terisi                                    | ⏳     |            |
| 5   | Klik [Upload]                                                | File upload berhasil, progress 100%                          | ⏳     |            |
| 6   | Cek Dashboard Dokumentasi                                    | Status berubah "Proses" (1 file uploaded), counter bertambah | ⏳     |            |
| 7   | Upload video (MP4 50MB) dengan deskripsi                     | File upload berhasil, total file sekarang 2                  | ⏳     |            |

---

### TC-452: Upload dokumentasi — Validasi file

| #   | Langkah                                             | Yang Diharapkan                                     | Status | Keterangan |
| --- | --------------------------------------------------- | --------------------------------------------------- | ------ | ---------- |
| 1   | Role Dokumentasi coba upload file .exe (executable) | Error: "Format file tidak didukung"                 | ⏳     |            |
| 2   | Upload file > 100MB                                 | Error: "Ukuran file maksimal 100MB"                 | ⏳     |            |
| 3   | Upload tanpa memilih file                           | Error: "File wajib dipilih"                         | ⏳     |            |
| 4   | Upload dengan media_type tidak valid                | Error: "Media type harus foto, video, atau dokumen" | ⏳     |            |

---

### TC-453: Galeri dokumentasi kegiatan

| #   | Langkah                                                  | Yang Diharapkan                                          | Status | Keterangan |
| --- | -------------------------------------------------------- | -------------------------------------------------------- | ------ | ---------- |
| 1   | Protokoler/Admin buka Tab Dokumentasi di detail kegiatan | Galeri masonry grid menampilkan 2 file (1 foto, 1 video) | ⏳     |            |
| 2   | Klik thumbnail foto                                      | Lightbox full screen tampil                              | ⏳     |            |
| 3   | Klik thumbnail video                                     | Video player embedded tampil                             | ⏳     |            |
| 4   | Klik [Download] pada salah satu file                     | File terunduh                                            | ⏳     |            |
| 5   | Filter galeri: [Video Saja]                              | Hanya video tampil, foto disembunyikan                   | ⏳     |            |

---

### TC-454: Akses Role — Dokumentasi

| #   | Langkah                                             | Yang Diharapkan                                 | Status | Keterangan |
| --- | --------------------------------------------------- | ----------------------------------------------- | ------ | ---------- |
| 1   | Role Protokoler coba akses `/dokumentasi/dashboard` | Redirect 403 / Forbidden                        | ⏳     |            |
| 2   | Role Tamu coba upload dokumentasi                   | Error: "Anda tidak memiliki akses untuk upload" | ⏳     |            |
| 3   | Role Admin akses `/dokumentasi/kegiatan/:id`        | Bisa view galeri dokumentasi                    | ⏳     |            |

---

## Dashboard Evaluasi

### TC-501: Dashboard Evaluasi — Admin & Protokoler akses

| #   | Langkah                                   | Yang Diharapkan                                                      | Status | Keterangan |
| --- | ----------------------------------------- | -------------------------------------------------------------------- | ------ | ---------- |
| 1   | Admin login, buka Dashboard Evaluasi      | List kegiatan dengan ringkasan evaluasi tampil                       | ⏳     |            |
| 2   | Filter: Status = "Selesai"                | Hanya kegiatan selesai tampil                                        | ⏳     |            |
| 3   | Search: ketik "Pelantikan"                | Kegiatan dengan nama "Pelantikan" tampil                             | ⏳     |            |
| 4   | Klik baris kegiatan → [Lihat Detail]      | Halaman detail hasil evaluasi terbuka                                | ⏳     |            |
| 5   | Admin cek Tab "EVALUASI PROTOKOLER"       | Statistik rating, word cloud, daftar evaluasi tampil                 | ⏳     |            |
| 6   | Admin cek Tab "TESTIMONI TAMU"            | Breakdown sentimen (positif/netral/negatif), daftar testimoni tampil | ⏳     |            |
| 7   | Admin cek Tab "FEEDBACK ADMIN"            | Form textarea untuk input feedback, tombol [Simpan] aktif            | ⏳     |            |
| 8   | Protokoler login, buka Dashboard Evaluasi | List kegiatan tampil (sama dengan admin)                             | ⏳     |            |
| 9   | Protokoler buka detail hasil evaluasi     | Bisa lihat evaluasi protokoler + testimoni tamu                      | ⏳     |            |

---

### TC-502: Dashboard Evaluasi — Tampilan Data

| #   | Langkah                                                        | Yang Diharapkan                                          | Status | Keterangan |
| --- | -------------------------------------------------------------- | -------------------------------------------------------- | ------ | ---------- |
| 1   | Admin buka kegiatan "Pelantikan" dengan 12 evaluasi protokoler | Rata-rata rating 4.2 tampil                              | ⏳     |            |
| 2   | Breakdown rating: 5⭐=6, 4⭐=4, 3⭐=2                          | Chart distribusi tampil                                  | ⏳     |            |
| 3   | Admin cek list evaluasi protokoler                             | Nama, rating, waktu isi, status "Tepat Waktu" tampil     | ⏳     |            |
| 4   | Admin expand satu evaluasi                                     | Teks evaluasi + refleksi diri tampil                     | ⏳     |            |
| 5   | Admin cek Tab Testimoni → breakdown sentimen                   | 7 positif, 1 netral, 0 negatif (dengan visual badge)     | ⏳     |            |
| 6   | Admin cek list testimoni tamu                                  | Nama tamu, rating, teks testimoni, badge sentimen tampil | ⏳     |            |

---

### TC-503: Admin input Feedback

| #   | Langkah                                                      | Yang Diharapkan                                                    | Status | Keterangan |
| --- | ------------------------------------------------------------ | ------------------------------------------------------------------ | ------ | ---------- |
| 1   | Admin buka Tab "FEEDBACK ADMIN"                              | Textarea kosong + placeholder text tampil                          | ⏳     |            |
| 2   | Admin ketik feedback: "Acara sukses, koordinasi sangat baik" | Text tertulis di textarea                                          | ⏳     |            |
| 3   | Klik [Simpan Feedback]                                       | Feedback tersimpan, notifikasi "Feedback berhasil disimpan" tampil | ⏳     |            |
| 4   | Refresh halaman                                              | Feedback masih tersimpan                                           | ⏳     |            |
| 5   | Admin edit feedback dengan text baru                         | Update berhasil                                                    | ⏳     |            |

---

### TC-504: Dashboard Evaluasi — Export

| #   | Langkah                                        | Yang Diharapkan                                                                      | Status | Keterangan |
| --- | ---------------------------------------------- | ------------------------------------------------------------------------------------ | ------ | ---------- |
| 1   | Admin buka detail hasil evaluasi satu kegiatan | Tombol [📥 Export ke Excel] tampil di tab evaluasi protokoler                        | ⏳     |            |
| 2   | Klik [Export ke Excel]                         | File Excel terunduh dengan nama format: "Evaluasi*[KegiatanID]*[TanggalExport].xlsx" | ⏳     |            |
| 3   | Buka file Excel                                | Data evaluasi (nama, rating, waktu isi, dalam batas waktu) terstruktur di sheet      | ⏳     |            |
| 4   | Klik [Export ke Excel] di tab Testimoni        | File Excel testimoni terunduh                                                        | ⏳     |            |

---

### TC-505: Akses Role — Dashboard Evaluasi

| #   | Langkah                                               | Yang Diharapkan                                             | Status | Keterangan |
| --- | ----------------------------------------------------- | ----------------------------------------------------------- | ------ | ---------- |
| 1   | Role Protokoler coba akses `/evaluasi/dashboard`      | Berhasil diakses (authorized)                               | ⏳     |            |
| 2   | Role Dokumentasi coba akses Dashboard Evaluasi        | Redirect 403 / Forbidden                                    | ⏳     |            |
| 3   | Role Tamu coba akses endpoint evaluasi                | Response 403                                                | ⏳     |            |
| 4   | Admin input feedback, Protokoler lihat halaman detail | Protokoler bisa baca feedback admin                         | ⏳     |            |
| 5   | Protokoler coba edit/delete feedback                  | Tombol edit/delete tidak tampil (readonly untuk protokoler) | ⏳     |            |

---

## Fitur Lintas Fase

### TC-601: Laporan & Ekspor

| #   | Langkah                                         | Yang Diharapkan                                   | Status | Keterangan |
| --- | ----------------------------------------------- | ------------------------------------------------- | ------ | ---------- |
| 1   | Admin buka Laporan Kegiatan, set filter periode | Data kegiatan dalam periode tampil                | ⏳     |            |
| 2   | Klik [Ekspor PDF]                               | File PDF terunduh dengan data yang benar          | ⏳     |            |
| 3   | Klik [Ekspor Excel]                             | File Excel terunduh, data sesuai                  | ⏳     |            |
| 4   | Admin buka Rekap Anggota, cari nama protokoler  | Data rekap (total kegiatan, jam, kategori) tampil | ⏳     |            |

---

### TC-602: Regulasi

| #   | Langkah                              | Yang Diharapkan                     | Status | Keterangan |
| --- | ------------------------------------ | ----------------------------------- | ------ | ---------- |
| 1   | Admin upload regulasi baru (PDF 3MB) | Dokumen tersimpan, tampil di daftar | ⏳     |            |
| 2   | Protokoler buka halaman Regulasi     | Daftar dokumen tampil, bisa preview | ⏳     |            |
| 3   | Download dokumen                     | File PDF terunduh                   | ⏳     |            |

---

### TC-703: Role & Akses

| #   | Langkah                                           | Yang Diharapkan                  | Status | Keterangan |
| --- | ------------------------------------------------- | -------------------------------- | ------ | ---------- |
| 1   | Protokoler coba akses `/anggota` (halaman admin)  | Redirect ke 403 / Forbidden      | ⏳     |            |
| 2   | Protokoler coba akses laporan admin               | Ditolak                          | ⏳     |            |
| 3   | Admin coba mengisi form evaluasi                  | Ditolak (bukan role protokoler)  | ⏳     |            |
| 4   | Link testimoni diakses tanpa login                | Berhasil diakses (publik)        | ⏳     |            |
| 5   | Link testimoni kadaluarsa / tidak valid           | Halaman error "Link tidak valid" | ⏳     |            |
| 6   | Role Dokumentasi akses `/dokumentasi/dashboard`   | Berhasil diakses                 | ⏳     |            |
| 7   | Role Dokumentasi coba akses `/evaluasi/dashboard` | Redirect ke 403 / Forbidden      | ⏳     |            |
| 8   | Role Protokoler coba akses `/dokumentasi/upload`  | Redirect ke 403 / Forbidden      | ⏳     |            |
| 9   | Admin akses `/dokumentasi/kegiatan/:id` (galeri)  | Berhasil diakses (readonly)      | ⏳     |            |

---

## Non-Fungsional Testing

### TC-NF-01: Performa

| #   | Skenario                             | Target     | Status | Keterangan |
| --- | ------------------------------------ | ---------- | ------ | ---------- |
| 1   | Load dashboard admin pada koneksi 4G | < 3 detik  | ⏳     |            |
| 2   | Upload foto selfie (3MB)             | < 10 detik | ⏳     |            |
| 3   | Generate surat tugas PDF             | < 5 detik  | ⏳     |            |
| 4   | Generate sertifikat PDF              | < 5 detik  | ⏳     |            |
| 5   | Load laporan 100 kegiatan            | < 5 detik  | ⏳     |            |

---

### TC-NF-02: Keamanan

| #   | Skenario                                   | Target                | Status | Keterangan |
| --- | ------------------------------------------ | --------------------- | ------ | ---------- |
| 1   | Akses endpoint admin tanpa token           | Response 401          | ⏳     |            |
| 2   | Akses resource milik protokoler lain       | Response 403          | ⏳     |            |
| 3   | Token kadaluarsa digunakan                 | Response 401          | ⏳     |            |
| 4   | Upload file executable (.exe) sebagai foto | Ditolak, error format | ⏳     |            |

---

### TC-NF-03: Kompatibilitas

| #   | Platform               | Status | Keterangan |
| --- | ---------------------- | ------ | ---------- |
| 1   | Web: Chrome (terbaru)  | ⏳     |            |
| 2   | Web: Firefox (terbaru) | ⏳     |            |
| 3   | Web: Microsoft Edge    | ⏳     |            |
| 4   | Mobile: Android 10+    | ⏳     |            |
| 5   | Mobile: iOS 15+        | ⏳     |            |

---

## Ringkasan Hasil UAT

| Fase                        | Total TC                          | Lulus | Gagal | Belum Diuji |
| --------------------------- | --------------------------------- | ----- | ----- | ----------- |
| Fase ⓪ Pendaftaran Akun     | TC-001 s.d. TC-004 (20 kasus)     | —     | —     | 20          |
| Fase ① Persiapan Kegiatan   | TC-101 s.d. TC-103 (17 kasus)     | —     | —     | 17          |
| Fase ② Pendaftaran Kegiatan | TC-201 s.d. TC-204 (14 kasus)     | —     | —     | 14          |
| Fase ③ Pelaksanaan          | TC-301 s.d. TC-302 (8 kasus)      | —     | —     | 8           |
| Fase ④ Pasca Kegiatan       | TC-401 s.d. TC-404 (18 kasus)     | —     | —     | 18          |
| Fase ⑤ Rekap & Pencapaian   | TC-501 s.d. TC-502 (6 kasus)      | —     | —     | 6           |
| Lintas Fase                 | TC-601 s.d. TC-603 (14 kasus)     | —     | —     | 14          |
| Non-Fungsional              | TC-NF-01 s.d. TC-NF-03 (14 kasus) | —     | —     | 14          |
| **Total**                   | **111 kasus**                     | **—** | **—** | **111**     |

---

> **Catatan:** Dokumen ini diperbarui seiring berjalannya pengujian. Update kolom Status dan Keterangan setiap sesi testing.
