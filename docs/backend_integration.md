# Dokumen Integrasi & Arsitektur Backend - Sistem Informasi Protokoler UNP

Dokumen ini berisi dokumentasi teknis mendalam mengenai semua modul, integrasi sistem, dan fitur yang telah diimplementasikan pada backend **Sistem Informasi Protokoler Universitas Negeri Padang**. Dokumen ini dirancang sebagai panduan utama bagi pengembang untuk memulai pengembangan atau pemeliharaan sistem di masa mendatang.

---

## 1. Integrasi Database (Prisma ORM & PostgreSQL)

Sistem menggunakan **Prisma ORM** untuk berinteraksi dengan database relasional **PostgreSQL** yang di-host di layanan Supabase.

### A. Skema Skema Relasional (`prisma/schema.prisma`)
Tabel-tabel database dipetakan ke dalam model Prisma dengan relasi kunci sebagai berikut:
- **`User` (Tabel `users`)**: Menyimpan ID autentikasi UUID (terintegrasi dengan Supabase Auth) dan `role` pengguna. Memiliki relasi 1-ke-1 dengan tabel `Protokoler`.
- **`Protokoler` (Tabel `protokoler`)**: Menyimpan profil lengkap mahasiswa protokol, termasuk NIM, fakultas, prodi, no HP, serta URL foto.
- **`Kegiatan` (Tabel `kegiatan`)**: Menyimpan detail kegiatan, rundown, lokasi, status kegiatan (`StatusKegiatanEnum`), dan ceklis tata upacara. Memiliki relasi 1-ke-banyak dengan `TamuVVIP`, `PendaftaranKegiatan`, `Absensi`, `EvaluasiKegiatan`, `Sertifikat`, dan `DokumentasiKegiatan`.
- **`TamuVVIP` (Tabel `tamu_vvip`)**: Daftar tamu penting untuk setiap kegiatan, memiliki relasi Cascade Delete dengan tabel `Kegiatan`.
- **`PendaftaranKegiatan` (Tabel `pendaftaran_kegiatan`)**: Tabel persimpangan (junction table) unik untuk mencatat penugasan protokoler pada suatu kegiatan.
- **`Absensi` (Tabel `absensi`)**: Mencatat selfie dan koordinat GPS (`latitude` dan `longitude` presisi decimal) mahasiswa saat absen.
- **`EvaluasiKegiatan` (Tabel `evaluasi_kegiatan`)**: Form refleksi diri dan rating kegiatan dari protokoler pasca kegiatan selesai.
- **`TestimoniTamu` (Tabel `testimoni_tamu`)**: Feedback langsung dari tamu VVIP.
- **`Sertifikat` (Tabel `sertifikat`)**: Sertifikat digital yang terbit otomatis dengan nomor sertifikat unik.
- **`DokumentasiKegiatan` & `Regulasi`**: Galeri kegiatan dan berkas PDF regulasi keprotokolan.

### B. Proteksi Cascading & Integrasi Unik
- Relasi disetel dengan aturan `onDelete: Cascade` pada tabel anak (seperti `tamu_vvip`, `pendaftaran_kegiatan`, `absensi`, `evaluasi_kegiatan`) sehingga apabila data kegiatan dihapus oleh admin, semua data rekam jejak terkait otomatis terhapus bersih dari database tanpa menyisakan data yatim (orphan data).
- `@unique` key diterapkan pada kombinasi `[kegiatan_id, protokoler_id]` pada tabel `pendaftaran_kegiatan`, `absensi`, dan `evaluasi_kegiatan` untuk menjamin tidak ada duplikasi data pendaftaran atau absensi ganda oleh mahasiswa yang sama pada satu kegiatan.

---

## 2. Sistem Autentikasi & Otorisasi Pengguna

Backend menggunakan **Supabase Auth** untuk mengelola data user kredensial (email & password) dan sesi login.

### A. Alur Registrasi Akun dengan Rollback Transaction
Selama registrasi (`POST /api/auth/register`), backend menjalankan alur transaksi terpadu:
1. **Validasi Awal**: Mengecek keunikan Email (di tabel `User`) dan NIM (di tabel `Protokoler`) via Prisma.
2. **Autentikasi Supabase**: Membuat user di Supabase Auth menggunakan API admin SDK (`supabase.auth.admin.createUser`) dengan status email terkonfirmasi langsung.
3. **Database Insertion (Prisma Transaction)**: Membuka transaksi PostgreSQL untuk memasukkan data ke tabel `users` dan `protokoler` secara simultan.
4. **Mekanisme Rollback Otomatis**: Jika proses pembuatan rekam di PostgreSQL gagal (misalnya karena gangguan koneksi DB atau format data salah), backend menangkap error di blok `catch` dan **otomatis menghapus** user Supabase Auth yang baru dibuat (`supabase.auth.admin.deleteUser(userId)`). Ini mencegah terjadinya inkonsistensi data di mana akun terbuat di auth Supabase namun gagal terdaftar di database sistem utama.

### B. Guard Keamanan & Hak Akses (Role-based Access)
- **`JwtAuthGuard`**: Menguji token JWT dari request header. Token didekode untuk memverifikasi keaslian sesi user, lalu melampirkan payload user (`userId`, `email`, `role`, `protokolerId`) ke objek request NestJS.
- **`RolesGuard`**: Membaca decorator `@Roles(...)` pada setiap route. Hanya pengguna dengan role yang sesuai (`admin`, `protokoler`, `dokumentasi`, `tamu`) yang diizinkan untuk memanggil fungsi tersebut.

---

## 3. Sistem Penyimpanan Berkas Fleksibel (File Storage Engine)

Modul penyimpanan berkas (`SupabaseService.uploadFile`) diintegrasikan dengan konfigurasi tipe penyimpanan dinamis (`STORAGE_TYPE` di `.env` backend) guna memberikan kebebasan biaya dan keandalan deployment:

### A. Mesin Base64 (`STORAGE_TYPE="base64"`) - *Default*
- **Skenario Penggunaan**: Digunakan untuk kebebasan biaya 100% dan kompatibilitas penuh dengan platform serverless stateless seperti Vercel.
- **Mekanisme**: Backend membaca buffer file upload, mengubahnya menjadi string **Base64 Data URI** (contoh: `data:image/png;base64,iVBORw0...`), dan menyimpannya langsung di kolom database bertipe `String` (Text). Browser frontend langsung me-render string ini ke tag `<img src="..." />` tanpa perlu request URL berkas eksternal.
- **Payload Limits**: Konfigurasi parser body pada Express di [main.ts](file:///d:/WEBKU/protokoler/backend/src/main.ts) ditingkatkan hingga `50mb` agar server tidak menolak payload Base64 berukuran besar.

### B. Mesin Folder Lokal (`STORAGE_TYPE="local"`)
- **Mekanisme**: Berkas yang diunggah disimpan langsung pada disk fisik server backend di dalam folder `public/uploads/[bucket_name]/[file_path]`.
- **Static Assets Serving**: Didaftarkan sebagai static path di NestJS (`expressApp.use('/uploads', express.static(...))`), sehingga gambar dapat diakses publik di URL `http://localhost:4000/uploads/...`.

### C. Mesin Supabase Storage (`STORAGE_TYPE="supabase"`)
- **Mekanisme**: Mengunggah berkas asli ke bucket Supabase Storage `'protokoler-photos'`. Service secara cerdas memanggil `listBuckets()` dan `createBucket()` terlebih dahulu untuk membuat bucket secara otomatis jika belum terdaftar.

---

## 4. Modul Manajemen Kegiatan & Tamu VVIP

Modul `Kegiatan` mencakup seluruh siklus manajemen acara keprotokolan:
- **Status Transitions**: Alur siklus kegiatan dikontrol menggunakan status enum: `draf` ➡️ `publik` ➡️ `berlangsung` ➡️ `selesai` ➡️ `batal`. Status transisi hanya dapat diubah oleh Admin (Pimpinan).
- **Checklist Tata Upacara**: Menyediakan boolean checks untuk `checklist_tata_tempat`, `checklist_tata_upacara`, dan `checklist_tata_penghormatan` sesuai aturan resmi keprotokolan negara.
- **Format Waktu Sinkron**: Menambahkan formatter waktu di `kegiatan.service.ts` untuk mengubah format kolom `@db.Time` PostgreSQL (yang secara default dibaca Prisma sebagai format ISO lengkap `1970-01-01T...`) menjadi string waktu bersih `HH:mm:ss`. Hal ini menjamin keselarasan tampilan waktu pelaksanaan kegiatan di frontend.

---

## 5. Alur Pengajuan Tugas (Rekrutmen) & Real-time Updates

- **Pengajuan Diri (Tugas)**: Mahasiswa dengan akun protokoler aktif dapat melamar peran (`peran` berupa `protokoler` atau `lo`) pada kegiatan berstatus `publik`. Data masuk ke tabel `pendaftaran_kegiatan` dengan status awal `pending`.
- **Verifikasi Tugas**: Admin meninjau data pendaftar dan dapat menyetujui (`diterima`) atau menolak (`ditolak`).
- **Real-time Event**: Supabase Realtime diaktifkan pada tingkat tabel database PostgreSQL. Perubahan status pendaftaran atau kegiatan langsung memicu broadcast ke client frontend secara instan tanpa perlu memuat ulang halaman browser (manual refresh).

---

## 6. Modul Absensi (Validasi GPS & Foto Selfie)

Modul absensi memastikan keaslian kehadiran protokoler di lokasi penugasan:
- **Unggah Selfie**: Protokoler wajib mengunggah foto selfie yang disimpan sesuai konfigurasi storage aktif.
- **Validasi Koordinat GPS**: Menerima input koordinat latitude dan longitude dari perangkat GPS frontend. Tipe data kolom disetel sebagai `Decimal(10,8)` dan `Decimal(11,8)` di database untuk menampung presisi koordinat bumi secara tepat guna mencegah manipulasi lokasi.

---

## 7. Modul Testimoni Tamu Tanpa Autentikasi (Signed Token)

Modul ini mengizinkan tamu VVIP memberikan feedback/testimoni acara secara instan dan aman tanpa perlu melakukan pendaftaran akun:
- **Token Unik**: Admin menghasilkan tautan berisi token unik (UUID) untuk kegiatan terkait.
- **Validasi Token**: Route feedback memeriksa validitas UUID token tersebut terhadap database kegiatan. Jika valid, tamu dapat menulis ulasan dan memberikan rating yang langsung terpetakan ke tabel `testimoni_tamu`.

---

## 8. Modul Rekapitulasi Laporan (Dashboard Pimpinan)

- **Agregasi Statistik**: Mengagregasikan total kegiatan, persentase konfirmasi penugasan protokoler, dan status absensi.
- **Date-Range Parsing**: Route penugasan laporan dirancang fleksibel untuk mendeteksi filter range tanggal (`dari_tanggal` dan `sampai_tanggal`). API membaca format tanggal ISO dari frontend dan melakukan query `where: { tanggal: { gte: start, lte: end } }` untuk menghasilkan rekapitulasi data penugasan mahasiswa secara akurat.

---

## 💡 Panduan Pengembangan Lanjutan (Bagi Developer)

Jika Anda ingin melanjutkan penambahan fitur baru pada proyek ini, ikuti alur berikut:

1. **Definisikan Skema Database**: Tambahkan model atau kolom baru di [schema.prisma](file:///d:/WEBKU/protokoler/backend/prisma/schema.prisma) jika membutuhkan penyimpanan data baru.
2. **Jalankan Migrasi**: Lakukan migrasi skema lokal dengan perintah `npx prisma db push` atau `npx prisma migrate dev --name nama_perubahan`.
3. **Generate Client**: Selalu jalankan `npx prisma generate` setelah mengubah skema agar Typescript Autocomplete membaca tipe baru dengan tepat.
4. **Buat NestJS Module**: Gunakan CLI NestJS jika ingin memisahkan modul baru:
   ```bash
   npx nest generate module nama_fitur
   npx nest generate controller nama_fitur
   npx nest generate service nama_fitur
   ```
5. **Sesuaikan CORS & Port**: Jika dideploy ke hosting baru, pastikan variabel `FRONTEND_URL` dan `DATABASE_URL` di konfigurasi `.env` telah disesuaikan agar backend dapat melayani request dengan aman.
