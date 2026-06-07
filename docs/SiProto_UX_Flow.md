# UX FLOW & HALAMAN APLIKASI
## SiProto – Sistem Informasi Protokoler Universitas
**Versi 1.2 | Juni 2025**

---

| Info | Detail |
|------|--------|
| **Platform** | Web App (Admin/Pimpinan) + Mobile App (Protokoler/Tamu) |
| **Versi Dokumen** | 1.2 |
| **Referensi** | SiProto_PRD.md v1.2 + SiProto_Alur_Sistem.md v1.2 |

---

## Peta Navigasi Umum

```
┌─────────────────────────────────────────────────────────────────┐
│                     SIPROTO PLATFORM                            │
├─────────────────┬───────────────────┬───────────────────────────┤
│   WEB APP       │   MOBILE APP      │   PUBLIK / TAMU           │
│   (Admin)       │   (Protokoler)    │   (Tanpa Login)           │
├─────────────────┼───────────────────┼───────────────────────────┤
│ Dashboard       │ Beranda           │ Form Testimoni (via link)  │
│ Kegiatan        │ Kegiatan Saya     │                           │
│ Anggota         │ Jadwal            │                           │
│ Evaluasi        │ Profil Saya       │                           │
│ Laporan         │ Sertifikat        │                           │
│ Regulasi        │ Regulasi          │                           │
│ Pengaturan      │                   │                           │
└─────────────────┴───────────────────┴───────────────────────────┘
```

---

## WEB APP — Alur Admin

### A. Autentikasi

```
[Halaman Login]
  ├── Input: Email + Password
  ├── Tombol: Masuk
  └── → [Dashboard Admin]
```

---

### B. Dashboard Admin

**URL:** `/dashboard`

**Konten:**
- 📊 Statistik ringkasan: total kegiatan bulan ini, protokoler aktif, kegiatan mendatang
- 🔔 Notifikasi: pendaftaran baru, angket belum terisi, evaluasi selesai
- 📅 Kalender mini: kegiatan 7 hari ke depan
- 📈 Grafik: tren kegiatan per bulan, distribusi tingkatan sertifikat
- ⚡ Quick action: Buat Kegiatan Baru, Verifikasi Akun Pending

---

### C. Manajemen Anggota

```
[/anggota]
  ├── Tabel: daftar semua protokoler
  ├── Filter: Status Akun (pending/aktif/ditolak), Prodi, Cari Nama/NIM
  ├── Baris klik → [/anggota/:id] Detail Profil
  └── Tab: PENDING (badge jumlah)
       ├── Tombol [Setujui] → status: aktif, kirim notifikasi
       └── Tombol [Tolak]   → modal: input alasan penolakan

[/anggota/:id]
  ├── Foto setengah badan + foto full body
  ├── Data diri lengkap (NIM, prodi, departemen, fakultas, no HP)
  ├── Status akun + badge kategori sertifikat
  ├── Total kegiatan yang diikuti
  └── Tab: Riwayat Kegiatan | Sertifikat
```

---

### D. Manajemen Kegiatan

```
[/kegiatan]
  ├── Tampilan: Tabel + Kalender (toggle)
  ├── Filter: Status, Bentuk Kegiatan, Rentang Tanggal
  ├── Tombol: [+ Buat Kegiatan]
  └── Klik baris → [/kegiatan/:id]

[/kegiatan/buat] — Form Buat Kegiatan
  ├── Step 1: Info Dasar
  │    ├── Nama Kegiatan (text)
  │    ├── Bentuk Kegiatan (dropdown)
  │    ├── Tanggal (date picker)
  │    ├── Jam Mulai – Jam Selesai (time picker)
  │    └── Lokasi (text)
  ├── Step 2: Detail Kegiatan
  │    ├── Audience / Peserta (textarea)
  │    ├── Keynote / Narasumber Utama (text)
  │    ├── Rundown Acara (upload PDF)
  │    └── Tamu VVIP: [+ Tambah Tamu]
  │         ├── Nama, Jabatan, Instansi
  │         ├── Tipe: Internal / Eksternal
  │         └── Jumlah Rombongan
  ├── Step 3: Kebutuhan SDM
  │    ├── Jumlah Protokoler (number input)
  │    ├── Jumlah LO (number input)
  │    └── (opsional) Penugasan langsung: search nama protokoler
  └── Simpan sebagai: [Draf] atau [Publikasikan]

[/kegiatan/:id] — Detail Kegiatan
  ├── Header: nama, bentuk, tanggal, lokasi, status badge
  ├── Tab: INFO | PENDAFTAR | ABSENSI | EVALUASI | DOKUMENTASI
  │
  ├── [Tab INFO]
  │    ├── Detail kegiatan lengkap
  │    ├── Checklist 3 Tata Protokol (checkbox masing-masing)
  │    ├── Daftar Tamu VVIP
  │    └── Tombol: Edit | Ubah Status | Hapus (jika masih Draf)
  │
  ├── [Tab PENDAFTAR]
  │    ├── Tabel: Nama, Peran, Waktu Daftar, Status
  │    ├── Filter: Semua | Pending | Diterima | Ditolak | Dialihkan
  │    └── Per baris: [Terima] [Tolak] [Alihkan ke kegiatan lain]
  │         └── Jika Terima → sistem auto-generate surat tugas
  │
  ├── [Tab ABSENSI]
  │    ├── Tabel: Nama, Waktu Selfie, Foto, Status Hadir
  │    └── Rekap: X hadir / Y tidak hadir
  │
  ├── [Tab EVALUASI]
  │    ├── Tabel: Nama, Waktu Isi, Dalam Batas Waktu, Sertifikat
  │    └── Tombol: Lihat Detail Evaluasi (per protokoler)
  │
  └── [Tab DOKUMENTASI]
       ├── Galeri foto kegiatan
       └── Tombol: [+ Upload Foto/Dokumen]
```

---

### E. Laporan

```
[/laporan]
  ├── Sub-menu: Kegiatan | Rekap Anggota | Evaluasi | Inovasi
  │
  ├── [Laporan Kegiatan]
  │    ├── Filter: Rentang tanggal, Bentuk kegiatan
  │    ├── Tabel: Nama kegiatan, Tanggal, Jumlah tim, Status evaluasi
  │    └── Tombol: [Ekspor PDF] [Ekspor Excel]
  │
  ├── [Rekap Anggota]
  │    ├── Cari nama / NIM protokoler
  │    ├── Tampilkan: Total kegiatan, Total jam, Kategori sertifikat
  │    └── Tombol: [Ekspor PDF] [Ekspor Excel]
  │
  ├── [Evaluasi & Testimoni]
  │    ├── Filter per kegiatan
  │    ├── Rekap angket evaluasi (rata-rata rating, persentase terisi)
  │    └── Daftar testimoni tamu
  │
  └── [Dashboard Inovasi]
       ├── Perbandingan sebelum vs sesudah SiProto
       ├── Total sertifikat diterbitkan
       └── Grafik perkembangan keanggotaan
```

---

### F. Regulasi

```
[/regulasi]
  ├── Daftar dokumen: Judul, Kategori, Tahun
  ├── Filter: UU | Perpres | SOP | Pedoman
  ├── Klik → Preview / Download PDF
  └── Tombol: [+ Upload Regulasi Baru] (Admin only)
```

---

## MOBILE APP — Alur Protokoler

### M-A. Onboarding & Autentikasi

```
[Splash Screen]
  └── → [Login]
       ├── Input: Email + Password
       ├── Link: Belum punya akun? [Daftar]
       └── → [Beranda]

[Daftar Akun] — Multi-step
  ├── Step 1: Data Diri
  │    ├── NIM, Nama Lengkap
  │    ├── Prodi, Departemen, Fakultas
  │    └── No. HP, Email
  ├── Step 2: Upload Foto
  │    ├── Foto Setengah Badan (kamera/galeri)
  │    └── Foto Full Body (kamera/galeri)
  ├── Step 3: Buat Password
  └── Kirim → [Halaman Menunggu Verifikasi]
       └── Notifikasi saat admin verifikasi
```

---

### M-B. Beranda (Home)

**Konten:**
- Greeting: "Halo, [Nama]! 👋"
- Status akun + badge kategori (Perak/Silver/Gold)
- Progress bar: menuju tingkatan berikutnya
- Quick card: Kegiatan aktif yang bisa didaftar (maks 3)
- Riwayat kegiatan terbaru
- Notifikasi belum dibaca

---

### M-C. Kegiatan

```
[Kegiatan]
  ├── Tab: TERSEDIA | SAYA IKUTI | RIWAYAT
  │
  ├── [Tab TERSEDIA]
  │    ├── List kegiatan publik (yang belum pernah didaftar)
  │    ├── Card: Nama, Tanggal, Lokasi, Sisa kuota
  │    └── Klik → [Detail Kegiatan]
  │         ├── Info lengkap kegiatan
  │         ├── Daftar Tamu VVIP
  │         └── Tombol: [Daftar Sekarang]
  │              └── Pilih Peran: Protokoler | LO
  │
  ├── [Tab SAYA IKUTI]
  │    ├── Kegiatan yang sudah didaftar
  │    ├── Badge status: Pending | Diterima | Ditolak | Dialihkan
  │    └── Jika Diterima & hari kegiatan: Tombol [Absen Sekarang]
  │
  └── [Tab RIWAYAT]
       ├── Semua kegiatan yang pernah diikuti
       └── Indikator: sudah absen ✓ | sudah isi evaluasi ✓
```

---

### M-D. Absensi Selfie

```
[Halaman Absensi] — Dibuka saat kegiatan berlangsung
  ├── Info: Nama kegiatan, Jam berlangsung, Lokasi
  ├── Area kamera (selfie mode)
  ├── Tombol: [Ambil Foto Selfie]
  ├── Preview foto → [Konfirmasi] atau [Ulangi]
  └── Sukses → Animasi "Absensi Tercatat ✓"
```

---

### M-E. Evaluasi Pasca Kegiatan

```
[Notifikasi Push] — Muncul setelah kegiatan selesai
  └── "Isi evaluasi kegiatan [Nama] sebelum jam XX:XX!"

[Halaman Evaluasi]
  ├── Timer countdown (sisa waktu dari 24 jam)
  ├── Form:
  │    ├── Evaluasi Kegiatan (textarea, min 50 karakter)
  │    ├── Refleksi Diri (textarea, min 30 karakter)
  │    └── Rating Kegiatan (bintang 1–5)
  ├── Tombol: [Kirim Evaluasi]
  └── Sukses → "Sertifikat sedang diproses 🏆"
       └── Redirect ke halaman Sertifikat
```

---

### M-F. Profil & Sertifikat

```
[Profil Saya]
  ├── Foto profil (setengah badan)
  ├── Data diri: NIM, Nama, Prodi, Departemen, Fakultas
  ├── Status: Aktif | Badge: Perak/Silver/Gold
  ├── Statistik: Total kegiatan, Total sertifikat
  └── Tombol: [Edit Profil] [Ganti Foto]

[Sertifikat]
  ├── List sertifikat yang dimiliki
  ├── Card: Nomor, Nama kegiatan, Tanggal, Kategori
  └── Klik → Preview sertifikat + Tombol [Download PDF]
```

---

## PUBLIK — Form Testimoni Tamu

```
[Link unik: /testimoni/<token-kegiatan>]
  ├── Header: Logo SiProto + Nama Kegiatan
  ├── Form:
  │    ├── Nama Anda (text)
  │    ├── Jabatan/Instansi (text, opsional)
  │    ├── Rating Pelayanan (bintang 1–5)
  │    └── Testimoni (textarea)
  ├── Tombol: [Kirim Testimoni]
  └── Sukses → "Terima kasih atas testimoni Anda! 🙏"
```

---

## Notifikasi & Reminder

| Trigger | Target | Pesan | Waktu |
|---------|--------|-------|-------|
| Akun diverifikasi admin | Protokoler | "Akun Anda telah disetujui! Anda bisa mulai mendaftar kegiatan." | Segera |
| Akun ditolak admin | Protokoler | "Pendaftaran akun ditolak. [Alasan]. Silakan daftar ulang." | Segera |
| Diterima di kegiatan | Protokoler | "Anda diterima untuk [Nama Kegiatan] sebagai [Peran]!" | Segera |
| Ditolak dari kegiatan | Protokoler | "Maaf, pendaftaran Anda untuk [Nama Kegiatan] ditolak." | Segera |
| Reminder H-1 kegiatan | Protokoler | "Besok ada kegiatan [Nama]! Pastikan hadir tepat waktu." | H-1 pukul 08.00 |
| Reminder H-0 kegiatan | Protokoler | "Hari ini kegiatan [Nama] berlangsung jam [Jam]. Jangan lupa absen selfie!" | Pagi hari H |
| Kegiatan selesai | Protokoler | "Isi evaluasi [Nama Kegiatan] sekarang! Batas waktu: [Jam]." | Segera selesai |
| H+12 jam belum evaluasi | Protokoler | "Reminder: Sisa 12 jam untuk mengisi evaluasi [Nama]. Jangan sampai terlewat!" | H+12 jam |
| Batas waktu evaluasi habis | Sistem | Sertifikat tidak diterbitkan, rekap diupdate | H+24 jam |
| Evaluasi terisi | Protokoler | "Sertifikat [Nama Kegiatan] sudah bisa diunduh! 🏆" | Segera |

---

## Komponen UI Bersama

| Komponen | Dipakai Di | Keterangan |
|----------|-----------|------------|
| `BadgeStatus` | Kegiatan, Pendaftaran | Warna badge per status |
| `BadgeKategori` | Profil, Sertifikat | Perak/Silver/Gold + warna |
| `KalenderKegiatan` | Dashboard, Kegiatan | Tampilan kalender bulanan |
| `TimerCountdown` | Evaluasi | Hitung mundur 24 jam |
| `KameraAbsensi` | Absensi | Akses kamera selfie mode |
| `GrafikStatistik` | Dashboard, Laporan | Chart kegiatan & distribusi |
| `CardKegiatan` | Mobile beranda | Card preview kegiatan |
| `FormStepper` | Daftar akun, Buat kegiatan | Multi-step form |
