# Dokumentasi API Backend - Sistem Informasi Protokoler UNP

Dokumentasi ini merangkum seluruh endpoint API yang tersedia di backend aplikasi Protokoler UNP. Semua endpoint menggunakan prefix dasar `/api` dan menggunakan format respons JSON.

---

## 🔐 Autentikasi (`/api/auth`)

Semua endpoint autentikasi kecuali registrasi awal dan login tidak memerlukan otorisasi.

### 1. Register Akun Protokoler
- **Endpoint**: `POST /api/auth/register`
- **Deskripsi**: Mendaftarkan akun protokoler baru dengan *multipart/form-data* (foto setengah badan & full body).
- **Akses**: Public
- **Payload** (`FormData`):
  - `email` (String)
  - `password` (String)
  - `nim` (String)
  - `nama_lengkap` (String)
  - `prodi` (String)
  - `departemen` (String)
  - `fakultas` (String)
  - `no_hp` (String)
  - `foto_setengah_badan` (File Image - Opsional/Wajib)
  - `foto_full_body` (File Image - Opsional/Wajib)

### 2. Login
- **Endpoint**: `POST /api/auth/login`
- **Deskripsi**: Melakukan verifikasi kredensial untuk mendapatkan JWT Bearer Token.
- **Akses**: Public
- **Payload** (JSON):
  ```json
  {
    "email": "user@email.com",
    "password": "password123"
  }
  ```
- **Respons**: Token JWT untuk otorisasi endpoint lain.

### 3. Profil Pengguna Aktif
- **Endpoint**: `GET /api/auth/me`
- **Deskripsi**: Mengembalikan detail *user* yang sedang login.
- **Akses**: Semua User Login (`Bearer Token`)

---

## 👥 Manajemen Protokoler (`/api/protokoler`)

### 1. Dapatkan Seluruh Protokoler
- **Endpoint**: `GET /api/protokoler`
- **Deskripsi**: Menampilkan semua data protokoler mahasiswa beserta relasinya.
- **Akses**: `admin`

### 2. Detail Profil Sendiri
- **Endpoint**: `GET /api/protokoler/me`
- **Deskripsi**: Mengambil profil detail khusus pengguna yang sedang login.
- **Akses**: `protokoler`

### 3. Update Profil Protokoler
- **Endpoint**: `PATCH /api/protokoler/:id`
- **Deskripsi**: Memperbarui no HP atau foto profil. Menggunakan *multipart/form-data*.
- **Akses**: `protokoler`, `admin`

### 4. Verifikasi Akun (Admin)
- **Endpoint**: `PATCH /api/protokoler/:id/verifikasi`
- **Deskripsi**: Verifikasi akun pendaftar (Setujui atau Tolak).
- **Akses**: `admin`
- **Payload** (JSON):
  ```json
  {
    "status_akun": "aktif", // 'aktif' | 'ditolak' | 'tidak_aktif'
    "catatan_penolakan": "Foto kurang jelas" // Opsional
  }
  ```

---

## 📅 Manajemen Kegiatan (`/api/kegiatan`)

### 1. List Semua Kegiatan
- **Endpoint**: `GET /api/kegiatan`
- **Akses**: Public / Semua User

### 2. Detail Kegiatan
- **Endpoint**: `GET /api/kegiatan/:id`
- **Deskripsi**: Mengembalikan data rinci kegiatan termasuk tamu VVIP, rundown, dan partisipan (protokoler/lo).
- **Akses**: Semua User Login

### 3. Buat Kegiatan Baru
- **Endpoint**: `POST /api/kegiatan`
- **Akses**: `admin`
- **Payload** (JSON):
  ```json
  {
    "nama_kegiatan": "Wisuda UNP Periode 1",
    "bentuk_kegiatan": "wisuda",
    "tanggal": "2026-06-25T00:00:00Z",
    "jam_mulai": "2026-06-25T08:00:00Z",
    "jam_selesai": "2026-06-25T12:00:00Z",
    "lokasi": "Auditorium UNP",
    "audience": "Wisudawan & Orang Tua",
    "keynote": "Rektor UNP",
    "jumlah_protokoler_dibutuhkan": 10,
    "jumlah_lo_dibutuhkan": 2,
    "checklist_tata_tempat": true
  }
  ```

### 4. Edit Kegiatan
- **Endpoint**: `PATCH /api/kegiatan/:id`
- **Akses**: `admin`

### 5. Hapus Kegiatan
- **Endpoint**: `DELETE /api/kegiatan/:id`
- **Akses**: `admin`

---

## 📝 Pendaftaran Tugas (`/api/pendaftaran`)

### 1. Daftar Bertugas
- **Endpoint**: `POST /api/pendaftaran`
- **Deskripsi**: Protokoler mengajukan diri untuk bertugas pada kegiatan tertentu.
- **Akses**: `protokoler`
- **Payload** (JSON):
  ```json
  {
    "kegiatan_id": "uuid-kegiatan",
    "peran": "protokoler" // 'protokoler' | 'lo'
  }
  ```

### 2. Verifikasi Penugasan
- **Endpoint**: `PATCH /api/pendaftaran/:id/verifikasi`
- **Deskripsi**: Penerimaan, penolakan, atau pengalihan tugas oleh admin.
- **Akses**: `admin`
- **Payload** (JSON):
  ```json
  {
    "status": "diterima", // 'diterima' | 'ditolak' | 'dialihkan'
    "catatan_admin": "Tugas fokus VVIP 1",
    "kegiatan_dialihkan_id": "uuid-kegiatan-lain" // Opsional
  }
  ```

---

## 📍 Absensi (`/api/absensi`)

### 1. Submit Absensi (Selfie & GPS)
- **Endpoint**: `POST /api/absensi`
- **Deskripsi**: Merekam kehadiran. Harus menyertakan foto dan lokasi koordinat. Menggunakan *multipart/form-data*.
- **Akses**: `protokoler`
- **Payload**:
  - `kegiatan_id` (String)
  - `foto_selfie` (File Image)
  - `latitude` (Float/String)
  - `longitude` (Float/String)

### 2. Rekap Absensi per Kegiatan
- **Endpoint**: `GET /api/absensi/:kegiatan_id/absensi`
- **Akses**: `admin`

---

## ⭐ Evaluasi & Testimoni

### 1. Kirim Evaluasi Protokoler
- **Endpoint**: `POST /api/evaluasi`
- **Deskripsi**: Laporan evaluasi dan kendala kegiatan dari protokoler setelah acara.
- **Akses**: `protokoler`
- **Payload** (JSON):
  ```json
  {
    "kegiatan_id": "uuid-kegiatan",
    "evaluasi_kegiatan": "Acara berjalan lancar...",
    "refleksi_diri": "Saya berhasil mengelola VVIP...",
    "kendala": "Mic sempat mati di menit 20",
    "rating_kegiatan": 5
  }
  ```

### 2. Kirim Testimoni VVIP
- **Endpoint**: `POST /api/testimoni/:token_kegiatan`
- **Deskripsi**: Tamu VVIP memberikan *rating* tanpa perlu login, menggunakan token URL unik.
- **Akses**: Public (dengan Token)
- **Payload** (JSON):
  ```json
  {
    "nama_tamu": "Gubernur Sumbar",
    "jabatan_tamu": "Gubernur",
    "isi_testimoni": "Pelayanan protokoler luar biasa.",
    "rating": 5
  }
  ```

---

## 📚 Regulasi & Dokumentasi

### 1. Upload Regulasi
- **Endpoint**: `POST /api/regulasi`
- **Akses**: `admin`
- **Payload**: *multipart/form-data* berisi dokumen (PDF/Word), judul, dan tahun terbit.

### 2. Hapus Regulasi
- **Endpoint**: `DELETE /api/regulasi/:id`
- **Akses**: `admin`
- **Deskripsi**: Menghapus baris data di database sekaligus menghapus file yang ada di Supabase Storage.

### 3. Upload Dokumentasi (Foto/Galeri)
- **Endpoint**: `POST /api/dokumentasi`
- **Akses**: `dokumentasi`, `admin`
- **Payload**: *multipart/form-data* berisi file foto dan detail keterangan kegiatan.

---

## 🗄️ Manajemen File Storage (Supabase)

Backend ini diprogram untuk **otomatis melakukan pembersihan file fisik** di Supabase (Cascading Delete) dalam kondisi berikut:

1. Saat **Akun Protokoler Diperbarui**: Foto lama akan dihapus dan diganti dengan yang baru.
2. Saat **Akun Protokoler Dihapus (Admin)**: Foto profil (setengah badan & full body) otomatis terhapus dari bucket.
3. Saat **Regulasi Dihapus**: File dokumen regulasi terhapus dari bucket.
4. Saat **Pendaftaran Kegiatan Dihapus**: File Surat Tugas (PDF) yang *ter-generate* otomatis dibersihkan dari bucket.

*(Dikelola secara internal di layer `Service` backend pada metode `remove()` atau `update()` terkait).*
