# Dokumentasi Backend - Sistem Informasi Protokoler UNP

Selamat datang di repositori backend **Sistem Informasi Protokoler Universitas Negeri Padang**. Backend ini dibangun menggunakan framework **NestJS**, menggunakan **Prisma ORM** untuk interaksi database PostgreSQL (Supabase), dan menggunakan **Supabase Auth** untuk manajemen sesi pengguna.

---

## 🛠️ Stack Teknologi

- **Framework**: [NestJS](https://nestjs.com/) (dengan Express platform)
- **Database ORM**: [Prisma Client](https://www.prisma.io/)
- **Database Engine**: PostgreSQL (Hosted on Supabase)
- **Autentikasi**: Supabase Auth (Integrasi JWT)
- **Penyimpanan Berkas**: Base64 (Database), Lokal Server, atau Supabase Storage

---

## 📁 Struktur Proyek & Arsitektur

Backend ini mengikuti struktur modular standar NestJS untuk pemisahan fungsional yang bersih:

```text
backend/
├── prisma/
│   ├── schema.prisma       # Definisi Skema Database Relasional
│   └── seed_accounts.js    # Script Seeding Akun Awal Sistem
├── src/
│   ├── main.ts             # Entrypoint bootstrap aplikasi & static routes
│   ├── app.module.ts       # Root module yang memuat modul-modul di bawah ini
│   ├── prisma/             # Modul koneksi database PostgreSQL
│   ├── supabase/           # Modul helper upload storage & client client Supabase
│   ├── auth/               # Modul registrasi, login, & Guards (JWT, Roles)
│   ├── protokoler/         # Modul pengelolaan data keanggotaan & profil
│   ├── kegiatan/           # Modul manajemen kegiatan, rundown, & tamu VVIP
│   ├── pendaftaran/        # Modul pendaftaran tugas protokoler & verifikasi
│   ├── absensi/            # Modul absensi selfie, waktu, & validasi GPS
│   ├── evaluasi/           # Modul evaluasi kegiatan & saran pasca penugasan
│   ├── testimoni/          # Modul manajemen testimoni dari tamu VVIP
│   ├── sertifikat/         # Modul penerbitan sertifikat digital bagi protokoler
│   ├── regulasi/           # Modul manajemen berkas regulasi keprotokolan (PDF)
│   ├── dokumentasi/        # Modul manajemen foto kegiatan & galeri dokumenter
│   └── laporan/            # Modul rekapitulasi data & dashboard pimpinan
└── .env                    # Variabel Konfigurasi Lingkungan Kerja
```

---

## ⚙️ Konfigurasi Variabel Lingkungan (`.env`)

Buat berkas `.env` di direktori utama backend dengan format berikut:

```env
# URL & Kunci Proyek Supabase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1Ni..." # Diperlukan untuk modul Admin Auth

# Mode Penyimpanan File (PILIH SALAH SATU)
# 1. 'base64'  -> Mengubah file ke Data URI Base64 & menyimpannya di DB (Gratis, tanpa bucket, direkomendasikan untuk Vercel/stateless hosting).
# 2. 'local'   -> Menyimpan file ke disk lokal server backend (public/uploads/).
# 3. 'supabase'-> Mengunggah file ke Supabase Storage Bucket ('protokoler-photos').
STORAGE_TYPE="base64"

# URL Backend (Diperlukan jika menggunakan STORAGE_TYPE="local")
BACKEND_URL="http://localhost:4000"

# URL Frontend (CORS)
FRONTEND_URL="http://localhost:3000"

# Koneksi Database PostgreSQL (Prisma)
DATABASE_URL="postgresql://postgres.your-project:password@aws-pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10"
DIRECT_URL="postgresql://postgres.your-project:password@aws-pooler.supabase.com:5432/postgres"

# Port Server
PORT=4000
```

---

## 🚀 Instalasi & Jalankan Sistem

### 1. Instal Dependensi

```bash
npm install
```

### 2. Sinkronisasi Database (Prisma Schema)

Lakukan sinkronisasi skema Prisma dengan database Anda:

```bash
npx prisma db push
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Seed Akun Default (Opsional)

Jalankan script seed untuk mengisi akun demo awal (Admin, Protokoler, Dokumentasi):

```bash
node seed_accounts.js
```

### 5. Jalankan Server Pengembangan (Watch Mode)

```bash
npm run start:dev
```

Server akan berjalan di **`http://localhost:4000`** (prefix global API di `/api`).

---

## 💾 Konfigurasi File Storage (Unggah Gambar/Dokumen)

Aplikasi mendukung tiga tipe storage melalui `STORAGE_TYPE` di `.env`:

### 1. Mode Base64 (`base64`)

- **Cara Kerja**: Backend memproses buffer gambar, merubahnya menjadi base64 string dengan format `data:image/jpeg;base64,...`, dan menyimpannya langsung ke database.
- **Kelebihan**: Sangat praktis untuk hosting stateless (seperti Vercel), tidak memerlukan pembuatan API tambahan, gratis, dan otomatis termuat sempurna di tag `<img>` frontend.

### 2. Mode Lokal Server (`local`)

- **Cara Kerja**: Gambar disimpan secara fisik di folder `backend/public/uploads/` dan disajikan secara statis oleh Express Adapter NestJS pada route `/uploads`.
- **URL File**: `http://localhost:4000/uploads/[bucket_name]/[file_path]`

### 3. Mode Supabase Storage (`supabase`)

- **Cara Kerja**: Gambar diunggah ke bucket `'protokoler-photos'` menggunakan client `@supabase/supabase-js`.
- **Kelebihan**: Skalabilitas tinggi dan terpisah dari server utama. Membutuhkan Service Role Key yang valid pada konfigurasi `.env`.

---

## 🛡️ Autentikasi & Guard Akses Kontrol

Sistem menggunakan **Supabase Auth** untuk validasi akses pengguna. Backend mengamankan endpoint menggunakan dua Guard utama:

1. **`JwtAuthGuard`**: Membaca token JWT Bearer dari header `Authorization: Bearer <token>` dan melampirkan data user ke request context.
2. **`RolesGuard`**: Mengontrol akses berbasis hak milik (Role). Role diatur menggunakan decorator `@Roles(...)` yang merujuk pada enum Prisma `RoleEnum`:
   - `admin` (Pimpinan)
   - `protokoler` (Mahasiswa Protokol)
   - `dokumentasi` (Media & Galeri)
   - `tamu` (Tamu VVIP)

---

## 📝 Ringkasan Endpoint API Utama

Semua route memiliki prefiks dasar `/api`.

### Autentikasi

- `POST /api/auth/register` - Mendaftarkan akun protokoler baru dengan unggahan foto (Setengah Badan & Full Body).
- `POST /api/auth/login` - Melakukan verifikasi email & password.
- `GET /api/auth/me` - Mengambil detail profil user yang sedang aktif.

### Protokoler (Anggota)

- `GET /api/protokoler` - Mengambil list seluruh anggota protokoler (Mendukung search & filter status).
- `GET /api/protokoler/me` - Mengambil profil detail protokoler saat ini.
- `PATCH /api/protokoler/:id` - Memperbarui no HP atau mengganti foto profil.
- `PATCH /api/protokoler/:id/verifikasi` - Verifikasi pendaftaran akun mahasiswa (Disetujui/Ditolak) oleh Admin.

### Kegiatan

- `GET /api/kegiatan` - Mengambil daftar seluruh kegiatan (Filter draf, publik, selesai, dll).
- `GET /api/kegiatan/:id` - Mengambil detail satu kegiatan (Rundown, tamu VVIP, status penugasan).
- `POST /api/kegiatan` - Membuat draf kegiatan baru (Admin).
- `PATCH /api/kegiatan/:id` - Mengedit informasi kegiatan.
- `DELETE /api/kegiatan/:id` - Menghapus kegiatan.

### Pendaftaran Penugasan

- `POST /api/pendaftaran` - Mengajukan diri untuk bertugas pada suatu kegiatan (Protokoler).
- `PATCH /api/pendaftaran/:id/verifikasi` - Penerimaan / penolakan tugas protokoler oleh Admin.

### Absensi

- `POST /api/absensi` - Melakukan absensi selfie & koordinat GPS untuk kegiatan yang sedang berlangsung.
- `GET /api/absensi/:id/absensi` - Rekapitulasi absensi untuk satu kegiatan.

### Evaluasi & Testimoni

- `POST /api/evaluasi` - Mengirim evaluasi keprotokolan dan refleksi diri pasca kegiatan.
- `POST /api/testimoni/:token` - Tamu VVIP mengirim rating & kesan pesan kegiatan tanpa perlu login.

---

## 🧪 Pengujian & Build Produksi

```bash
# Lakukan typechecking TypeScript
npx tsc --noEmit

# Jalankan pengujian unit (unit tests)
npm run test

# Lakukan build aplikasi ke folder dist/
npm run build

# Jalankan server dalam mode produksi
npm run start:prod
```
