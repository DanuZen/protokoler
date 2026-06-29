# API SPECIFICATION

## Protokoler – Sistem Informasi Protokoler Universitas

**Versi 1.2 | Juni 2025**

---

| Info                | Detail                         |
| ------------------- | ------------------------------ |
| **Base URL (dev)**  | `http://localhost:3001/api/v1` |
| **Base URL (prod)** | `https://api.Protokoler.ac.id/v1` |
| **Format**          | JSON                           |
| **Auth**            | Bearer Token (JWT)             |
| **Versi Dokumen**   | 1.2                            |

---

## Autentikasi

Semua endpoint yang memerlukan autentikasi menggunakan header:

```
Authorization: Bearer <access_token>
```

### Response Error Standar

```json
// 401 Unauthorized
{ "error": "Unauthorized", "message": "Token tidak valid atau sudah kedaluwarsa" }

// 403 Forbidden
{ "error": "Forbidden", "message": "Anda tidak memiliki akses ke resource ini" }

// 404 Not Found
{ "error": "Not Found", "message": "Data tidak ditemukan" }

// 422 Unprocessable Entity
{ "error": "Validation Error", "fields": { "nim": "NIM sudah terdaftar" } }

// 500 Internal Server Error
{ "error": "Internal Server Error", "message": "Terjadi kesalahan pada server" }
```

---

## 🔐 Auth Module

### `POST /auth/register`

Registrasi akun protokoler baru.

**Auth:** Tidak diperlukan

**Request Body (multipart/form-data):**

```
nim               : string (required)
nama_lengkap      : string (required)
prodi             : string (required)
departemen        : string (required)
fakultas          : string (required)
email             : string (required)
password          : string (required, min 8 karakter)
foto_setengah_badan : file (required, jpg/png, max 2MB)
foto_full_body    : file (required, jpg/png, max 2MB)
```

**Response `201 Created`:**

```json
{
  "message": "Pendaftaran berhasil. Akun menunggu verifikasi admin.",
  "data": {
    "id": "uuid",
    "nim": "2110001",
    "nama_lengkap": "Budi Santoso",
    "status_akun": "pending"
  }
}
```

---

### `POST /auth/login`

Login ke sistem.

**Auth:** Tidak diperlukan

**Request Body:**

```json
{
  "email": "budi@unp.ac.id",
  "password": "password123"
}
```

**Response `200 OK`:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "user": {
    "id": "uuid",
    "email": "budi@unp.ac.id",
    "role": "protokoler",
    "nama_lengkap": "Budi Santoso"
  }
}
```

---

### `POST /auth/logout`

Logout (invalidate token).

**Auth:** Required

**Response `200 OK`:**

```json
{ "message": "Logout berhasil" }
```

---

## 👤 Protokoler Module

### `GET /protokoler`

Daftar seluruh anggota protokoler.

**Auth:** Admin only

**Query Params:**
| Param | Tipe | Default | Keterangan |
|-------|------|---------|------------|
| `status_akun` | string | — | Filter: pending, aktif, ditolak |
| `search` | string | — | Cari nama / NIM |
| `prodi` | string | — | Filter prodi |
| `page` | int | 1 | Halaman |
| `limit` | int | 20 | Jumlah per halaman |

**Response `200 OK`:**

```json
{
  "data": [
    {
      "id": "uuid",
      "nim": "2110001",
      "nama_lengkap": "Budi Santoso",
      "prodi": "Teknik Informatika",
      "status_akun": "aktif",
      "total_kegiatan": 12,
      "kategori_sertifikat": "silver"
    }
  ],
  "meta": { "total": 150, "page": 1, "limit": 20, "total_pages": 8 }
}
```

---

### `GET /protokoler/:id`

Detail profil anggota protokoler.

**Auth:** Admin | Protokoler (milik sendiri)

**Response `200 OK`:**

```json
{
  "id": "uuid",
  "nim": "2110001",
  "nama_lengkap": "Budi Santoso",
  "prodi": "Teknik Informatika",
  "departemen": "Teknik",
  "fakultas": "FT",
  "foto_setengah_badan_url": "https://storage.../foto1.jpg",
  "foto_full_body_url": "https://storage.../foto2.jpg",
  "status_akun": "aktif",
  "total_kegiatan": 12,
  "kategori_sertifikat": "silver",
  "created_at": "2025-01-10T08:00:00Z"
}
```

---

### `PATCH /protokoler/:id/verifikasi`

Admin memverifikasi / menolak akun protokoler.

**Auth:** Admin only

**Request Body:**

```json
{
  "aksi": "setujui",
  "catatan_penolakan": null
}
```

> `aksi`: `"setujui"` | `"tolak"`

**Response `200 OK`:**

```json
{
  "message": "Akun berhasil diverifikasi",
  "data": { "id": "uuid", "status_akun": "aktif" }
}
```

---

### `PATCH /protokoler/:id`

Update profil sendiri (oleh protokoler).

**Auth:** Protokoler (milik sendiri)

**Request Body (multipart/form-data, semua opsional):**

```
foto_setengah_badan   : file
foto_full_body        : file
```

---

## 🏛️ Kegiatan Module

### `GET /kegiatan`

Daftar kegiatan.

**Auth:** Required (Admin lihat semua, Protokoler hanya yang `publik`)

**Query Params:**
| Param | Tipe | Keterangan |
|-------|------|------------|
| `status` | string | Filter status kegiatan |
| `bentuk` | string | Filter jenis kegiatan |
| `dari_tanggal` | date | Filter tanggal mulai (YYYY-MM-DD) |
| `sampai_tanggal` | date | Filter tanggal akhir |
| `page` | int | Halaman |
| `limit` | int | Per halaman |

**Response `200 OK`:**

```json
{
  "data": [
    {
      "id": "uuid",
      "nama_kegiatan": "Wisuda Periode III 2025",
      "bentuk_kegiatan": "wisuda",
      "tanggal": "2025-08-15",
      "jam_mulai": "08:00",
      "jam_selesai": "12:00",
      "lokasi": "Gedung Serba Guna UNP",
      "status": "publik",
      "jumlah_protokoler_dibutuhkan": 10,
      "jumlah_lo_dibutuhkan": 5,
      "jumlah_pendaftar": 8
    }
  ],
  "meta": { "total": 24, "page": 1, "limit": 10 }
}
```

---

### `POST /kegiatan`

Buat kegiatan baru.

**Auth:** Admin only

**Request Body:**

```json
{
  "nama_kegiatan": "Wisuda Periode III 2025",
  "bentuk_kegiatan": "wisuda",
  "tanggal": "2025-08-15",
  "jam_mulai": "08:00",
  "jam_selesai": "12:00",
  "lokasi": "Gedung Serba Guna UNP",
  "audience": "Mahasiswa wisudawan dan keluarga",
  "keynote": "Prof. Dr. Rektor UNP",
  "status": "draf",
  "jumlah_protokoler_dibutuhkan": 10,
  "jumlah_lo_dibutuhkan": 5,
  "tamu_vvip": [
    {
      "nama_tamu": "Gubernur Sumbar",
      "jabatan": "Gubernur",
      "instansi": "Pemprov Sumatera Barat",
      "tipe": "eksternal",
      "jumlah_rombongan": 5
    }
  ]
}
```

**Response `201 Created`:**

```json
{ "message": "Kegiatan berhasil dibuat", "data": { "id": "uuid", ... } }
```

---

### `GET /kegiatan/:id`

Detail kegiatan beserta tamu VVIP.

**Auth:** Required

---

### `PATCH /kegiatan/:id`

Update data kegiatan (termasuk ubah status draf → publik).

**Auth:** Admin only

---

### `PATCH /kegiatan/:id/checklist`

Update checklist 3 Tata Protokol.

**Auth:** Admin only

**Request Body:**

```json
{
  "checklist_tata_tempat": true,
  "checklist_tata_upacara": true,
  "checklist_tata_penghormatan": false
}
```

---

### `DELETE /kegiatan/:id`

Hapus kegiatan (hanya jika masih Draf).

**Auth:** Admin only

---

## 📋 Pendaftaran Kegiatan Module

### `POST /kegiatan/:id/daftar`

Protokoler mendaftar ke kegiatan.

**Auth:** Protokoler (status akun harus `aktif`)

**Request Body:**

```json
{ "peran": "protokoler" }
```

**Response `201 Created`:**

```json
{
  "message": "Pendaftaran berhasil, menunggu seleksi admin",
  "data": { "id": "uuid", "status": "pending" }
}
```

**Error Cases:**

- `400` — Sudah terdaftar di kegiatan ini
- `400` — Jadwal bentrok dengan kegiatan lain
- `403` — Akun protokoler belum aktif

---

### `GET /kegiatan/:id/pendaftar`

Daftar semua yang mendaftar ke kegiatan (untuk admin).

**Auth:** Admin only

**Response `200 OK`:**

```json
{
  "data": [
    {
      "pendaftaran_id": "uuid",
      "protokoler": { "id": "uuid", "nama_lengkap": "Budi", "nim": "2110001" },
      "peran": "protokoler",
      "status": "pending",
      "created_at": "2025-07-01T10:00:00Z"
    }
  ]
}
```

---

### `PATCH /pendaftaran/:id/seleksi`

Admin melakukan seleksi: terima, tolak, atau alihkan.

**Auth:** Admin only

**Request Body:**

```json
{
  "keputusan": "diterima",
  "kegiatan_dialihkan_id": null,
  "catatan_admin": "Diterima sebagai koordinator protokol"
}
```

> `keputusan`: `"diterima"` | `"ditolak"` | `"dialihkan"`

**Response `200 OK`:**

```json
{
  "message": "Seleksi berhasil. Surat tugas sedang diterbitkan.",
  "data": {
    "id": "uuid",
    "status": "diterima",
    "surat_tugas_url": "https://storage.../surat-tugas-uuid.pdf"
  }
}
```

---

## 📸 Absensi Module

### `POST /kegiatan/:id/absensi`

Upload foto selfie sebagai bukti kehadiran.

**Auth:** Protokoler (harus terdaftar & diterima di kegiatan)

**Request Body (multipart/form-data):**

```
foto_selfie  : file (required, jpg/png, max 5MB)
latitude     : number (opsional)
longitude    : number (opsional)
```

**Response `201 Created`:**

```json
{
  "message": "Absensi berhasil dicatat",
  "data": {
    "id": "uuid",
    "waktu_absen": "2025-08-15T08:32:15Z",
    "status": "hadir"
  }
}
```

**Error Cases:**

- `400` — Kegiatan belum/sudah selesai berlangsung
- `409` — Sudah melakukan absensi sebelumnya

---

### `GET /kegiatan/:id/absensi`

Rekap kehadiran satu kegiatan.

**Auth:** Admin only

---

## 📝 Evaluasi Module

### `POST /kegiatan/:id/evaluasi`

Protokoler mengisi angket evaluasi pasca kegiatan.

**Auth:** Protokoler (harus hadir di kegiatan, batas 1×24 jam)

**Request Body:**

```json
{
  "evaluasi_kegiatan": "Kegiatan berjalan dengan baik dan terstruktur...",
  "refleksi_diri": "Saya perlu meningkatkan ketepatan waktu dalam mempersiapkan tempat...",
  "rating_kegiatan": 4
}
```

**Response `201 Created`:**

```json
{
  "message": "Evaluasi berhasil disimpan. Sertifikat sedang diproses.",
  "data": {
    "id": "uuid",
    "dalam_batas_waktu": true,
    "sertifikat_diterbitkan": true,
    "nomor_sertifikat": "SERT-2025-000012"
  }
}
```

**Error Cases:**

- `403` — Melebihi batas waktu 1×24 jam
- `409` — Sudah mengisi evaluasi untuk kegiatan ini

---

## 💬 Testimoni Tamu Module

### `POST /kegiatan/:id/testimoni`

Tamu mengisi form testimoni (akses publik dengan link unik).

**Auth:** Tidak diperlukan (akses via link token unik per kegiatan)

**Request Body:**

```json
{
  "nama_tamu": "Bapak Ahmad Fauzi",
  "jabatan_tamu": "Direktur PT. Maju Jaya",
  "isi_testimoni": "Pelayanan protokol sangat profesional dan ramah...",
  "rating": 5
}
```

**Response `201 Created`:**

```json
{ "message": "Terima kasih atas testimoni Anda!" }
```

---

### `GET /kegiatan/:id/testimoni`

Daftar testimoni tamu satu kegiatan.

**Auth:** Admin only

---

## 🏆 Sertifikat Module

### `GET /sertifikat`

Daftar sertifikat milik sendiri.

**Auth:** Protokoler (milik sendiri) | Admin (semua)

**Response `200 OK`:**

```json
{
  "data": [
    {
      "id": "uuid",
      "nomor_sertifikat": "SERT-2025-000012",
      "kegiatan": { "nama_kegiatan": "Wisuda Periode III", "tanggal": "2025-08-15" },
      "kategori": "silver",
      "tanggal_terbit": "2025-08-16",
      "file_url": "https://storage.../sertifikat.pdf"
    }
  ]
}
```

---

### `GET /sertifikat/:id/download`

Download file sertifikat PDF.

**Auth:** Protokoler (milik sendiri) | Admin

**Response:** File PDF (application/pdf)

---

## 📊 Laporan Module

### `GET /laporan/kegiatan`

Laporan semua kegiatan per periode.

**Auth:** Admin only

**Query Params:**
| Param | Tipe | Keterangan |
|-------|------|------------|
| `dari_tanggal` | date | Tanggal awal periode |
| `sampai_tanggal` | date | Tanggal akhir periode |
| `bentuk_kegiatan` | string | Filter jenis |
| `format` | string | `json` (default) \| `pdf` \| `excel` |

---

### `GET /laporan/protokoler/:id/rekap`

Rekap jam & kegiatan satu protokoler.

**Auth:** Admin | Protokoler (milik sendiri)

**Response `200 OK`:**

```json
{
  "protokoler": { "nama_lengkap": "Budi Santoso", "nim": "2110001" },
  "rekap": {
    "total_kegiatan": 12,
    "total_jam_estimasi": 48,
    "kategori_sertifikat": "silver",
    "sebagai_protokoler": 9,
    "sebagai_lo": 3
  },
  "riwayat": [ ... ]
}
```

---

### `GET /laporan/dashboard`

Statistik ringkasan untuk dashboard admin.

**Auth:** Admin only

**Response `200 OK`:**

```json
{
  "total_kegiatan_bulan_ini": 5,
  "total_protokoler_aktif": 87,
  "kegiatan_mendatang": 3,
  "evaluasi_terisi_persen": 91.5,
  "distribusi_kategori": {
    "perak": 45,
    "silver": 38,
    "gold": 4
  }
}
```

---

## 📚 Regulasi Module

### `GET /regulasi`

Daftar dokumen regulasi.

**Auth:** Required (Admin + Protokoler)

---

### `POST /regulasi`

Upload dokumen regulasi baru.

**Auth:** Admin only

**Request Body (multipart/form-data):**

```
judul       : string (required)
deskripsi   : string
kategori    : string  (UU, Perpres, SOP, Pedoman)
tahun_terbit: integer
file        : file (required, PDF, max 10MB)
```

---

## � Dokumentasi Module

_Module untuk upload dan mengelola dokumentasi kegiatan (foto/video) oleh role Dokumentasi_

### `GET /dokumentasi/list`

Daftar kegiatan yang sudah selesai dan siap untuk upload dokumentasi.

**Auth:** Dokumentasi role only

**Query Params:**
| Param | Tipe | Default | Keterangan |
|-------|------|---------|------------|
| `status` | string | `selesai` | Filter status kegiatan |
| `search` | string | — | Cari nama kegiatan |
| `page` | int | 1 | Halaman |
| `limit` | int | 20 | Jumlah per halaman |

**Response `200 OK`:**

```json
{
  "data": [
    {
      "kegiatan_id": "uuid",
      "nama_kegiatan": "Pelantikan Ketua Senat",
      "tanggal": "2025-01-15",
      "tempat": "Aula Utama",
      "status": "selesai",
      "dokumentasi_count": 3,
      "dokumentasi_uploaded": true
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20
}
```

---

### `POST /dokumentasi/upload`

Upload file dokumentasi kegiatan (foto/video).

**Auth:** Dokumentasi role only

**Request Body (multipart/form-data):**

```
kegiatan_id : UUID (required)
file        : file (required, jpg/png/mp4/mov, max 100MB)
media_type  : string (required, "foto" | "video")
keterangan  : string (optional, max 500 karakter)
```

**Response `201 Created`:**

```json
{
  "message": "Dokumentasi berhasil diupload",
  "data": {
    "id": "uuid",
    "kegiatan_id": "uuid",
    "file_url": "https://storage.Protokoler.ac.id/dokumentasi/uuid.jpg",
    "media_type": "foto",
    "ukuran_file": 2048576,
    "uploaded_at": "2025-01-16T10:30:00Z"
  }
}
```

---

### `GET /dokumentasi/kegiatan/:id`

Lihat semua dokumentasi untuk satu kegiatan.

**Auth:** Required (Admin, Protokoler, Dokumentasi)

**Response `200 OK`:**

```json
{
  "kegiatan_id": "uuid",
  "nama_kegiatan": "Pelantikan Ketua Senat",
  "total_dokumentasi": 5,
  "dokumentasi": [
    {
      "id": "uuid",
      "file_url": "https://storage.Protokoler.ac.id/dokumentasi/uuid.jpg",
      "media_type": "foto",
      "ukuran_file": 2048576,
      "keterangan": "Sambutan dari rektor",
      "uploaded_by": "Siti Nurhaliza",
      "uploaded_at": "2025-01-16T10:30:00Z"
    }
  ]
}
```

---

## 📊 Dashboard Evaluasi Module

_Module untuk melihat hasil evaluasi kegiatan dari Admin, Protokoler, dan Tamu_

### `GET /evaluasi/dashboard`

Daftar kegiatan dengan ringkasan hasil evaluasi (untuk Admin & Protokoler).

**Auth:** Admin + Protokoler only

**Query Params:**
| Param | Tipe | Default | Keterangan |
|-------|------|---------|------------|
| `filter_status` | string | `selesai` | Filter status kegiatan |
| `search` | string | — | Cari nama kegiatan |
| `page` | int | 1 | Halaman |
| `limit` | int | 20 | Jumlah per halaman |

**Response `200 OK`:**

```json
{
  "data": [
    {
      "kegiatan_id": "uuid",
      "nama_kegiatan": "Pelantikan Ketua Senat",
      "tanggal": "2025-01-15",
      "status": "selesai",
      "ringkasan_evaluasi": {
        "jumlah_evaluasi_protokoler": 12,
        "rata_rating_kegiatan": 4.2,
        "jumlah_testimoni_tamu": 8,
        "sentimen_testimoni": "positif"
      }
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20
}
```

---

### `GET /evaluasi/kegiatan/:id/hasil`

Lihat detail hasil evaluasi satu kegiatan (Admin melihat semua, Protokoler melihat partial).

**Auth:** Admin + Protokoler only

**Response `200 OK`:**

```json
{
  "kegiatan_id": "uuid",
  "nama_kegiatan": "Pelantikan Ketua Senat",
  "evaluasi_protokoler": {
    "total": 12,
    "rata_rating": 4.2,
    "rating_breakdown": { "5": 6, "4": 4, "3": 2 },
    "evaluasi_text_sample": ["Acara berjalan dengan lancar", "Koordinasi kurang optimal"]
  },
  "testimoni_tamu": {
    "total": 8,
    "sentimen_positif": 7,
    "sentimen_netral": 1,
    "testimoni_text_sample": ["Acara sangat berkesan", "Venue nyaman"]
  },
  "feedback_admin": {
    "catatan": "Acara sukses, minor delay on catering",
    "tanggal_update": "2025-01-20T15:45:00Z"
  }
}
```

---

## �📤 Upload File Module

### `POST /upload/foto`

Upload foto profil (setengah badan / full body).

**Auth:** Required

**Request Body (multipart/form-data):**

```
file  : image (jpg/png/webp, max 2MB)
tipe  : string ("setengah_badan" | "full_body")
```

**Response `200 OK`:**

```json
{ "url": "https://storage.Protokoler.ac.id/foto/uuid.jpg" }
```

---

## Ringkasan Endpoint

| Method | Endpoint                       | Deskripsi                               | Auth                           | Role                           |
| ------ | ------------------------------ | --------------------------------------- | ------------------------------ | ------------------------------ |
| POST   | `/auth/register`               | Daftar akun baru                        | Publik                         | —                              |
| POST   | `/auth/login`                  | Login                                   | Publik                         | —                              |
| GET    | `/protokoler`                  | List protokoler                         | Admin                          | Admin                          |
| PATCH  | `/protokoler/:id/verifikasi`   | Verifikasi akun                         | Admin                          | Admin                          |
| GET    | `/kegiatan`                    | List kegiatan                           | All                            | All                            |
| POST   | `/kegiatan`                    | Buat kegiatan                           | Admin                          | Admin                          |
| POST   | `/kegiatan/:id/daftar`         | Daftar ke kegiatan                      | Protokoler                     | Protokoler                     |
| PATCH  | `/pendaftaran/:id/seleksi`     | Seleksi pendaftar                       | Admin                          | Admin                          |
| POST   | `/kegiatan/:id/absensi`        | Upload selfie absensi                   | Protokoler                     | Protokoler                     |
| POST   | `/kegiatan/:id/evaluasi`       | Isi angket evaluasi                     | Protokoler                     | Protokoler                     |
| POST   | `/kegiatan/:id/testimoni`      | Isi testimoni tamu                      | Publik                         | Tamu                           |
| GET    | `/sertifikat`                  | List sertifikat                         | All                            | All                            |
| GET    | `/sertifikat/:id/download`     | Download PDF                            | All                            | All                            |
| GET    | `/dokumentasi/list`            | List kegiatan untuk upload docs         | Dokumentasi                    | Dokumentasi                    |
| POST   | `/dokumentasi/upload`          | Upload dokumentasi kegiatan             | Dokumentasi                    | Dokumentasi                    |
| GET    | `/dokumentasi/kegiatan/:id`    | Lihat dokumentasi kegiatan              | Admin, Protokoler, Dokumentasi | Admin, Protokoler, Dokumentasi |
| GET    | `/evaluasi/dashboard`          | List kegiatan dengan ringkasan evaluasi | Admin, Protokoler              | Admin, Protokoler              |
| GET    | `/evaluasi/kegiatan/:id/hasil` | Detail hasil evaluasi satu kegiatan     | Admin, Protokoler              | Admin, Protokoler              |
| GET    | `/laporan/dashboard`           | Statistik dashboard                     | Admin                          | Admin                          |
| GET    | `/laporan/kegiatan`            | Laporan kegiatan                        | Admin                          | Admin                          |
| GET    | `/regulasi`                    | List regulasi                           | All                            | All                            |
