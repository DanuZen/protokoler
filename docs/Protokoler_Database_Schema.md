# DATABASE SCHEMA

## Protokoler – Sistem Informasi Protokoler Universitas

**Versi 1.2 | Juni 2025**

---

| Info              | Detail                                            |
| ----------------- | ------------------------------------------------- |
| **Database**      | PostgreSQL                                        |
| **ORM**           | Prisma / TypeORM (rekomendasi)                    |
| **Versi Dokumen** | 1.2                                               |
| **Referensi**     | Protokoler_PRD.md v1.2 + Protokoler_Alur_Sistem.md v1.2 |

---

## Entity Relationship Diagram (ERD)

```
┌──────────────┐         ┌──────────────────┐         ┌──────────────┐
│   USERS      │         │    KEGIATAN      │         │  REGULASI    │
│  (Auth)      │         │                  │         │              │
└──────┬───────┘         └────────┬─────────┘         └──────────────┘
       │                          │
       │ 1:1                      │ 1:N
       ▼                          ├──────────────────────────────────┐
┌──────────────┐                  │                                  │
│  PROTOKOLER  │◄────── N:1 ──────┤ PENDAFTARAN_KEGIATAN            │
│              │                  │                                  │
│              │◄────── N:1 ──────┤ ABSENSI                         │
│              │                  │                                  │
│              │◄────── N:1 ──────┤ EVALUASI_KEGIATAN               │
│              │                  │                                  │
│              │◄────── N:1 ──────┤ SERTIFIKAT                      │
└──────────────┘                  │                                  │
                                  ├──────────────────────────────────┤
                                  │ TAMU_VVIP (1:N per kegiatan)     │
                                  ├──────────────────────────────────┤
                                  │ TESTIMONI_TAMU (1:N per keg.)    │
                                  ├──────────────────────────────────┤
                                  │ DOKUMENTASI_KEGIATAN (1:N)       │
                                  └──────────────────────────────────┘
```

---

## Enum Definitions

```sql
-- Status akun anggota protokoler
CREATE TYPE status_akun_enum AS ENUM (
  'pending',       -- baru mendaftar, belum diverifikasi
  'aktif',         -- disetujui admin, bisa daftar kegiatan
  'ditolak',       -- ditolak admin, perlu revisi
  'tidak_aktif'    -- dinonaktifkan (cuti/keluar)
);

-- Tingkatan sertifikat (gamifikasi)
CREATE TYPE kategori_sertifikat_enum AS ENUM (
  'perak',   -- 1–10 kegiatan
  'silver',  -- 11–29 kegiatan
  'gold'     -- 30+ kegiatan
);

-- Status kegiatan
CREATE TYPE status_kegiatan_enum AS ENUM (
  'draf',       -- dibuat admin, belum dipublikasikan
  'publik',     -- open pendaftaran untuk protokoler
  'berlangsung',-- sedang dilaksanakan
  'selesai',    -- kegiatan telah selesai
  'batal'       -- kegiatan dibatalkan
);

-- Jenis/bentuk kegiatan
CREATE TYPE bentuk_kegiatan_enum AS ENUM (
  'wisuda',
  'kunjungan_tamu',
  'seminar',
  'pelantikan',
  'rapat_resmi',
  'upacara',
  'lainnya'
);

-- Status pendaftaran kegiatan
CREATE TYPE status_pendaftaran_enum AS ENUM (
  'pending',    -- menunggu review admin
  'diterima',   -- diterima masuk tim
  'ditolak',    -- ditolak admin
  'dialihkan'   -- dialihkan ke kegiatan lain
);

-- Peran dalam kegiatan
CREATE TYPE peran_kegiatan_enum AS ENUM (
  'protokoler',
  'lo'          -- Liaison Officer
);

-- Tipe tamu VVIP
CREATE TYPE tipe_tamu_enum AS ENUM (
  'internal',   -- dari dalam universitas
  'eksternal'   -- dari luar universitas
);

-- Status kehadiran
CREATE TYPE status_hadir_enum AS ENUM (
  'hadir',
  'tidak_hadir',
  'izin'
);

-- Role pengguna sistem
CREATE TYPE role_enum AS ENUM (
  'admin',
  'protokoler',
  'tamu',
  'dokumentasi'
);
```

---

## Tabel: `users`

_Tabel autentikasi utama (dikelola Supabase Auth / NextAuth)_

| Kolom        | Tipe         | Constraint                     | Keterangan            |
| ------------ | ------------ | ------------------------------ | --------------------- |
| `id`         | UUID         | PK, DEFAULT gen_random_uuid()  | Primary key           |
| `email`      | VARCHAR(255) | UNIQUE, NOT NULL               | Email login           |
| `role`       | role_enum    | NOT NULL, DEFAULT 'protokoler' | Role akses sistem     |
| `created_at` | TIMESTAMPTZ  | DEFAULT NOW()                  | Waktu registrasi      |
| `updated_at` | TIMESTAMPTZ  | DEFAULT NOW()                  | Waktu update terakhir |

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role role_enum NOT NULL DEFAULT 'protokoler',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Tabel: `protokoler`

_Data lengkap anggota tim protokoler_

| Kolom                     | Tipe                     | Constraint                  | Keterangan                    |
| ------------------------- | ------------------------ | --------------------------- | ----------------------------- |
| `id`                      | UUID                     | PK                          | Primary key                   |
| `user_id`                 | UUID                     | FK → users.id, UNIQUE       | Relasi ke auth user           |
| `nim`                     | VARCHAR(20)              | UNIQUE, NOT NULL            | Nomor Induk Mahasiswa         |
| `nama_lengkap`            | VARCHAR(255)             | NOT NULL                    | Nama lengkap                  |
| `prodi`                   | VARCHAR(100)             | NOT NULL                    | Program studi                 |
| `departemen`              | VARCHAR(100)             | NOT NULL                    | Departemen/jurusan            |
| `fakultas`                | VARCHAR(100)             | NOT NULL                    | Fakultas                      |
| `foto_setengah_badan_url` | TEXT                     |                             | URL foto setengah badan       |
| `foto_full_body_url`      | TEXT                     |                             | URL foto full body            |
| `status_akun`             | status_akun_enum         | NOT NULL, DEFAULT 'pending' | Status verifikasi             |
| `catatan_penolakan`       | TEXT                     |                             | Alasan penolakan oleh admin   |
| `total_kegiatan`          | INTEGER                  | NOT NULL, DEFAULT 0         | Akumulasi jumlah kegiatan     |
| `kategori_sertifikat`     | kategori_sertifikat_enum |                             | Tingkatan sertifikat saat ini |
| `created_at`              | TIMESTAMPTZ              | DEFAULT NOW()               |                               |
| `updated_at`              | TIMESTAMPTZ              | DEFAULT NOW()               |                               |

```sql
CREATE TABLE protokoler (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  nim VARCHAR(20) UNIQUE NOT NULL,
  nama_lengkap VARCHAR(255) NOT NULL,
  prodi VARCHAR(100) NOT NULL,
  departemen VARCHAR(100) NOT NULL,
  fakultas VARCHAR(100) NOT NULL,
  foto_setengah_badan_url TEXT,
  foto_full_body_url TEXT,
  status_akun status_akun_enum NOT NULL DEFAULT 'pending',
  catatan_penolakan TEXT,
  total_kegiatan INTEGER NOT NULL DEFAULT 0,
  kategori_sertifikat kategori_sertifikat_enum,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_protokoler_nim ON protokoler(nim);
CREATE INDEX idx_protokoler_status_akun ON protokoler(status_akun);
```

---

## Tabel: `kegiatan`

_Data kegiatan protokoler_

| Kolom                          | Tipe                 | Constraint               | Keterangan                         |
| ------------------------------ | -------------------- | ------------------------ | ---------------------------------- |
| `id`                           | UUID                 | PK                       | Primary key                        |
| `nama_kegiatan`                | VARCHAR(255)         | NOT NULL                 | Judul/nama acara                   |
| `bentuk_kegiatan`              | bentuk_kegiatan_enum | NOT NULL                 | Jenis acara                        |
| `tanggal`                      | DATE                 | NOT NULL                 | Tanggal pelaksanaan                |
| `jam_mulai`                    | TIME                 | NOT NULL                 | Jam mulai                          |
| `jam_selesai`                  | TIME                 | NOT NULL                 | Jam selesai                        |
| `lokasi`                       | VARCHAR(255)         | NOT NULL                 | Tempat kegiatan                    |
| `audience`                     | TEXT                 |                          | Deskripsi peserta/hadirin          |
| `keynote`                      | VARCHAR(255)         |                          | Narasumber/pembicara utama         |
| `mc`                           | VARCHAR(255)         |                          | MC/Pembawa acara                   |
| `operator_acara`               | VARCHAR(255)         |                          | Operator acara                     |
| `rundown_url`                  | TEXT                 |                          | URL file rundown acara             |
| `materi_url`                   | TEXT                 |                          | URL file materi narasumber         |
| `status`                       | status_kegiatan_enum | NOT NULL, DEFAULT 'draf' | Status kegiatan                    |
| `jumlah_protokoler_dibutuhkan` | INTEGER              | NOT NULL, DEFAULT 0      | Kuota protokoler                   |
| `jumlah_lo_dibutuhkan`         | INTEGER              | NOT NULL, DEFAULT 0      | Kuota LO                           |
| `checklist_tata_tempat`        | BOOLEAN              | DEFAULT FALSE            | Status checklist tata tempat       |
| `checklist_tata_upacara`       | BOOLEAN              | DEFAULT FALSE            | Status checklist tata upacara      |
| `checklist_tata_penghormatan`  | BOOLEAN              | DEFAULT FALSE            | Status checklist tata penghormatan |
| `dibuat_oleh`                  | UUID                 | FK → users.id            | Admin yang membuat                 |
| `created_at`                   | TIMESTAMPTZ          | DEFAULT NOW()            |                                    |
| `updated_at`                   | TIMESTAMPTZ          | DEFAULT NOW()            |                                    |

```sql
CREATE TABLE kegiatan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_kegiatan VARCHAR(255) NOT NULL,
  bentuk_kegiatan bentuk_kegiatan_enum NOT NULL,
  tanggal DATE NOT NULL,
  jam_mulai TIME NOT NULL,
  jam_selesai TIME NOT NULL,
  lokasi VARCHAR(255) NOT NULL,
  audience TEXT,
  keynote VARCHAR(255),
  mc VARCHAR(255),
  operator_acara VARCHAR(255),
  rundown_url TEXT,
  materi_url TEXT,
  status status_kegiatan_enum NOT NULL DEFAULT 'draf',
  jumlah_protokoler_dibutuhkan INTEGER NOT NULL DEFAULT 0,
  jumlah_lo_dibutuhkan INTEGER NOT NULL DEFAULT 0,
  checklist_tata_tempat BOOLEAN DEFAULT FALSE,
  checklist_tata_upacara BOOLEAN DEFAULT FALSE,
  checklist_tata_penghormatan BOOLEAN DEFAULT FALSE,
  dibuat_oleh UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kegiatan_status ON kegiatan(status);
CREATE INDEX idx_kegiatan_tanggal ON kegiatan(tanggal);
```

---

## Tabel: `tamu_vvip`

_Daftar tamu penting per kegiatan_

| Kolom              | Tipe           | Constraint                 | Keterangan               |
| ------------------ | -------------- | -------------------------- | ------------------------ |
| `id`               | UUID           | PK                         | Primary key              |
| `kegiatan_id`      | UUID           | FK → kegiatan.id, NOT NULL | Relasi kegiatan          |
| `nama_tamu`        | VARCHAR(255)   | NOT NULL                   | Nama lengkap tamu        |
| `jabatan`          | VARCHAR(255)   | NOT NULL                   | Jabatan/posisi           |
| `instansi`         | VARCHAR(255)   | NOT NULL                   | Asal instansi            |
| `tipe`             | tipe_tamu_enum | NOT NULL                   | Internal/Eksternal       |
| `jumlah_rombongan` | INTEGER        | DEFAULT 1                  | Jumlah anggota rombongan |
| `created_at`       | TIMESTAMPTZ    | DEFAULT NOW()              |                          |

```sql
CREATE TABLE tamu_vvip (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kegiatan_id UUID NOT NULL REFERENCES kegiatan(id) ON DELETE CASCADE,
  nama_tamu VARCHAR(255) NOT NULL,
  jabatan VARCHAR(255) NOT NULL,
  instansi VARCHAR(255) NOT NULL,
  tipe tipe_tamu_enum NOT NULL,
  jumlah_rombongan INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Tabel: `pendaftaran_kegiatan`

_Pendaftaran mandiri protokoler ke kegiatan_

| Kolom                   | Tipe                    | Constraint                  | Keterangan                       |
| ----------------------- | ----------------------- | --------------------------- | -------------------------------- |
| `id`                    | UUID                    | PK                          | Primary key                      |
| `kegiatan_id`           | UUID                    | FK → kegiatan.id            | Relasi kegiatan                  |
| `protokoler_id`         | UUID                    | FK → protokoler.id          | Relasi anggota                   |
| `peran`                 | peran_kegiatan_enum     | NOT NULL                    | LO atau Protokoler               |
| `status`                | status_pendaftaran_enum | NOT NULL, DEFAULT 'pending' | Status seleksi                   |
| `kegiatan_dialihkan_id` | UUID                    | FK → kegiatan.id, NULLABLE  | Jika dialihkan                   |
| `surat_tugas_url`       | TEXT                    |                             | URL surat tugas yang diterbitkan |
| `catatan_admin`         | TEXT                    |                             | Catatan dari admin saat seleksi  |
| `reviewed_at`           | TIMESTAMPTZ             |                             | Waktu admin melakukan review     |
| `reviewed_by`           | UUID                    | FK → users.id               | Admin yang melakukan review      |
| `created_at`            | TIMESTAMPTZ             | DEFAULT NOW()               | Waktu pendaftaran                |

```sql
CREATE TABLE pendaftaran_kegiatan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kegiatan_id UUID NOT NULL REFERENCES kegiatan(id) ON DELETE CASCADE,
  protokoler_id UUID NOT NULL REFERENCES protokoler(id) ON DELETE CASCADE,
  peran peran_kegiatan_enum NOT NULL,
  status status_pendaftaran_enum NOT NULL DEFAULT 'pending',
  kegiatan_dialihkan_id UUID REFERENCES kegiatan(id),
  surat_tugas_url TEXT,
  catatan_admin TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kegiatan_id, protokoler_id)
);

CREATE INDEX idx_pendaftaran_status ON pendaftaran_kegiatan(status);
CREATE INDEX idx_pendaftaran_protokoler ON pendaftaran_kegiatan(protokoler_id);
```

---

## Tabel: `absensi`

_Kehadiran selfie saat pelaksanaan_

| Kolom             | Tipe              | Constraint                | Keterangan               |
| ----------------- | ----------------- | ------------------------- | ------------------------ |
| `id`              | UUID              | PK                        | Primary key              |
| `kegiatan_id`     | UUID              | FK → kegiatan.id          | Relasi kegiatan          |
| `protokoler_id`   | UUID              | FK → protokoler.id        | Relasi anggota           |
| `foto_selfie_url` | TEXT              | NOT NULL                  | URL foto selfie          |
| `waktu_absen`     | TIMESTAMPTZ       | NOT NULL, DEFAULT NOW()   | Waktu selfie dilakukan   |
| `status`          | status_hadir_enum | NOT NULL, DEFAULT 'hadir' | Status kehadiran         |
| `latitude`        | DECIMAL(10,8)     |                           | Koordinat GPS (opsional) |
| `longitude`       | DECIMAL(11,8)     |                           | Koordinat GPS (opsional) |

```sql
CREATE TABLE absensi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kegiatan_id UUID NOT NULL REFERENCES kegiatan(id) ON DELETE CASCADE,
  protokoler_id UUID NOT NULL REFERENCES protokoler(id) ON DELETE CASCADE,
  foto_selfie_url TEXT NOT NULL,
  waktu_absen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status status_hadir_enum NOT NULL DEFAULT 'hadir',
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  UNIQUE(kegiatan_id, protokoler_id)
);
```

---

## Tabel: `evaluasi_kegiatan`

_Angket evaluasi pasca kegiatan oleh protokoler (batas 1×24 jam)_

| Kolom               | Tipe        | Constraint              | Keterangan                     |
| ------------------- | ----------- | ----------------------- | ------------------------------ |
| `id`                | UUID        | PK                      | Primary key                    |
| `kegiatan_id`       | UUID        | FK → kegiatan.id        | Relasi kegiatan                |
| `protokoler_id`     | UUID        | FK → protokoler.id      | Anggota yang mengisi           |
| `evaluasi_kegiatan` | TEXT        | NOT NULL                | Evaluasi pelaksanaan acara     |
| `refleksi_diri`     | TEXT        | NOT NULL                | Refleksi kinerja pribadi       |
| `rating_kegiatan`   | SMALLINT    | CHECK (1-5)             | Rating kegiatan (1–5 bintang)  |
| `waktu_pengisian`   | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Waktu angket diisi             |
| `dalam_batas_waktu` | BOOLEAN     | NOT NULL                | TRUE jika diisi dalam 1×24 jam |

```sql
CREATE TABLE evaluasi_kegiatan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kegiatan_id UUID NOT NULL REFERENCES kegiatan(id) ON DELETE CASCADE,
  protokoler_id UUID NOT NULL REFERENCES protokoler(id) ON DELETE CASCADE,
  evaluasi_kegiatan TEXT NOT NULL,
  refleksi_diri TEXT NOT NULL,
  rating_kegiatan SMALLINT CHECK (rating_kegiatan BETWEEN 1 AND 5),
  waktu_pengisian TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dalam_batas_waktu BOOLEAN NOT NULL,
  UNIQUE(kegiatan_id, protokoler_id)
);
```

---

## Tabel: `testimoni_tamu`

_Testimoni dari tamu undangan (tanpa batas waktu)_

| Kolom             | Tipe         | Constraint       | Keterangan               |
| ----------------- | ------------ | ---------------- | ------------------------ |
| `id`              | UUID         | PK               | Primary key              |
| `kegiatan_id`     | UUID         | FK → kegiatan.id | Relasi kegiatan          |
| `nama_tamu`       | VARCHAR(255) | NOT NULL         | Nama pengisi testimoni   |
| `jabatan_tamu`    | VARCHAR(255) |                  | Jabatan/instansi pengisi |
| `isi_testimoni`   | TEXT         | NOT NULL         | Isi feedback             |
| `rating`          | SMALLINT     | CHECK (1-5)      | Rating kepuasan (1–5)    |
| `waktu_pengisian` | TIMESTAMPTZ  | DEFAULT NOW()    | Waktu testimoni diisi    |

```sql
CREATE TABLE testimoni_tamu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kegiatan_id UUID NOT NULL REFERENCES kegiatan(id) ON DELETE CASCADE,
  nama_tamu VARCHAR(255) NOT NULL,
  jabatan_tamu VARCHAR(255),
  isi_testimoni TEXT NOT NULL,
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
  waktu_pengisian TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Tabel: `sertifikat`

_Sertifikat digital yang diterbitkan sistem_

| Kolom              | Tipe                     | Constraint                     | Keterangan                 |
| ------------------ | ------------------------ | ------------------------------ | -------------------------- |
| `id`               | UUID                     | PK                             | Primary key                |
| `protokoler_id`    | UUID                     | FK → protokoler.id             | Penerima sertifikat        |
| `kegiatan_id`      | UUID                     | FK → kegiatan.id               | Kegiatan yang dikerjakan   |
| `kategori`         | kategori_sertifikat_enum | NOT NULL                       | Tingkatan saat diterbitkan |
| `tanggal_terbit`   | DATE                     | NOT NULL, DEFAULT CURRENT_DATE | Tanggal sertifikat dibuat  |
| `file_url`         | TEXT                     |                                | URL file PDF sertifikat    |
| `nomor_sertifikat` | VARCHAR(50)              | UNIQUE                         | Nomor unik sertifikat      |

```sql
CREATE TABLE sertifikat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protokoler_id UUID NOT NULL REFERENCES protokoler(id) ON DELETE CASCADE,
  kegiatan_id UUID NOT NULL REFERENCES kegiatan(id) ON DELETE CASCADE,
  kategori kategori_sertifikat_enum NOT NULL,
  tanggal_terbit DATE NOT NULL DEFAULT CURRENT_DATE,
  file_url TEXT,
  nomor_sertifikat VARCHAR(50) UNIQUE,
  UNIQUE(protokoler_id, kegiatan_id)
);
```

---

## Tabel: `dokumentasi_kegiatan`

_Foto dan file dokumentasi per kegiatan (diupload oleh role Dokumentasi)_

| Kolom         | Tipe        | Constraint                         | Keterangan                                       |
| ------------- | ----------- | ---------------------------------- | ------------------------------------------------ |
| `id`          | UUID        | PK                                 | Primary key                                      |
| `kegiatan_id` | UUID        | FK → kegiatan.id                   | Relasi kegiatan                                  |
| `file_url`    | TEXT        | NOT NULL                           | URL file/foto/video                              |
| `media_type`  | VARCHAR(20) | CHECK ('foto', 'video', 'dokumen') | Jenis media                                      |
| `ukuran_file` | BIGINT      |                                    | Ukuran file dalam bytes                          |
| `keterangan`  | TEXT        |                                    | Deskripsi file/dokumentasi                       |
| `uploaded_by` | UUID        | FK → users.id, NOT NULL            | User role dokumentasi yang upload                |
| `uploaded_at` | TIMESTAMPTZ | DEFAULT NOW()                      | Tanggal upload                                   |
| `metadata`    | JSONB       |                                    | Metadata acara: nama, tanggal, tempat (opsional) |

```sql
CREATE TABLE dokumentasi_kegiatan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kegiatan_id UUID NOT NULL REFERENCES kegiatan(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  media_type VARCHAR(20) CHECK (media_type IN ('foto', 'video', 'dokumen')),
  ukuran_file BIGINT,
  keterangan TEXT,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  CONSTRAINT dokumentasi_not_duplicate UNIQUE(kegiatan_id, file_url)
);
```

---

## Tabel: `regulasi`

_Repositori dokumen peraturan keprotokolan_

| Kolom           | Tipe         | Constraint    | Keterangan                     |
| --------------- | ------------ | ------------- | ------------------------------ |
| `id`            | UUID         | PK            | Primary key                    |
| `judul`         | VARCHAR(255) | NOT NULL      | Judul dokumen regulasi         |
| `deskripsi`     | TEXT         |               | Ringkasan isi                  |
| `kategori`      | VARCHAR(100) |               | UU, Perpres, SOP, Pedoman, dll |
| `file_url`      | TEXT         | NOT NULL      | URL file PDF                   |
| `tahun_terbit`  | SMALLINT     |               | Tahun penerbitan dokumen       |
| `diunggah_oleh` | UUID         | FK → users.id | Admin yang upload              |
| `created_at`    | TIMESTAMPTZ  | DEFAULT NOW() |                                |

```sql
CREATE TABLE regulasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  kategori VARCHAR(100),
  file_url TEXT NOT NULL,
  tahun_terbit SMALLINT,
  diunggah_oleh UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Business Logic: Trigger & Function

### Auto-update `total_kegiatan` dan `kategori_sertifikat`

```sql
-- Trigger: setiap sertifikat baru terbit → update protokoler
CREATE OR REPLACE FUNCTION update_protokoler_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Hitung total kegiatan
  UPDATE protokoler
  SET total_kegiatan = (
    SELECT COUNT(*) FROM sertifikat WHERE protokoler_id = NEW.protokoler_id
  ),
  kategori_sertifikat = CASE
    WHEN (SELECT COUNT(*) FROM sertifikat WHERE protokoler_id = NEW.protokoler_id) >= 30 THEN 'gold'
    WHEN (SELECT COUNT(*) FROM sertifikat WHERE protokoler_id = NEW.protokoler_id) >= 11 THEN 'silver'
    ELSE 'perak'
  END,
  updated_at = NOW()
  WHERE id = NEW.protokoler_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_protokoler_stats
AFTER INSERT ON sertifikat
FOR EACH ROW EXECUTE FUNCTION update_protokoler_stats();
```

### Auto-terbitkan sertifikat setelah evaluasi diisi

```sql
-- Function: cek apakah sertifikat perlu diterbitkan
CREATE OR REPLACE FUNCTION check_and_issue_certificate()
RETURNS TRIGGER AS $$
DECLARE
  v_kategori kategori_sertifikat_enum;
  v_total_keg INTEGER;
  v_nomor VARCHAR(50);
BEGIN
  -- Hanya proses jika diisi dalam batas waktu
  IF NEW.dalam_batas_waktu = TRUE THEN
    -- Hitung total kegiatan setelah ini
    SELECT total_kegiatan + 1 INTO v_total_keg
    FROM protokoler WHERE id = NEW.protokoler_id;

    -- Tentukan kategori
    v_kategori := CASE
      WHEN v_total_keg >= 30 THEN 'gold'::kategori_sertifikat_enum
      WHEN v_total_keg >= 11 THEN 'silver'::kategori_sertifikat_enum
      ELSE 'perak'::kategori_sertifikat_enum
    END;

    -- Generate nomor sertifikat
    v_nomor := 'SERT-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
               LPAD(nextval('sertifikat_nomor_seq')::TEXT, 6, '0');

    -- Insert sertifikat
    INSERT INTO sertifikat (protokoler_id, kegiatan_id, kategori, nomor_sertifikat)
    VALUES (NEW.protokoler_id, NEW.kegiatan_id, v_kategori, v_nomor)
    ON CONFLICT (protokoler_id, kegiatan_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_issue_certificate
AFTER INSERT ON evaluasi_kegiatan
FOR EACH ROW EXECUTE FUNCTION check_and_issue_certificate();
```

---

## Ringkasan Tabel & Relasi

| Tabel                  | Relasi Utama                                        | Keterangan                  |
| ---------------------- | --------------------------------------------------- | --------------------------- |
| `users`                | → protokoler (1:1)                                  | Auth base                   |
| `protokoler`           | → users (1:1), → pendaftaran (1:N), → absensi (1:N) | Anggota protokoler          |
| `kegiatan`             | → pendaftaran (1:N), → tamu_vvip (1:N)              | Master kegiatan             |
| `pendaftaran_kegiatan` | → kegiatan (N:1), → protokoler (N:1)                | Join table + status seleksi |
| `absensi`              | → kegiatan (N:1), → protokoler (N:1)                | Selfie kehadiran            |
| `evaluasi_kegiatan`    | → kegiatan (N:1), → protokoler (N:1)                | Angket pasca kegiatan       |
| `testimoni_tamu`       | → kegiatan (N:1)                                    | Feedback tamu eksternal     |
| `sertifikat`           | → protokoler (N:1), → kegiatan (N:1)                | Sertifikat digital          |
| `dokumentasi_kegiatan` | → kegiatan (N:1)                                    | Galeri foto & dokumen       |
| `tamu_vvip`            | → kegiatan (N:1)                                    | Data tamu penting           |
| `regulasi`             | —                                                   | Repository dokumen hukum    |
