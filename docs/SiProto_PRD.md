# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## SiProto – Sistem Informasi Protokoler Universitas
**Versi 1.0 | Juni 2025**

---

| Info | Detail |
|------|--------|
| **Nama Produk** | SiProto |
| **Versi** | 1.0 – MVP |
| **Status** | Draft |
| **Platform** | Web App + Mobile App |
| **Target Pengguna** | Admin Protokol, Mahasiswa, Pimpinan |

---

## 1. Ringkasan Produk

SiProto adalah sistem informasi berbasis web dan mobile yang dirancang untuk membantu unit protokoler universitas dalam mengelola seluruh siklus kegiatan protokoler, mulai dari pendataan mahasiswa anggota, perencanaan kegiatan, penugasan staf, hingga pelaporan. Sistem ini menggantikan proses manual yang selama ini mengandalkan spreadsheet dan komunikasi verbal/chat, sehingga meningkatkan efisiensi, transparansi, dan akuntabilitas tim protokoler.

---

## 2. Masalah yang Dipecahkan

| Masalah Saat Ini | Solusi di SiProto |
|------------------|-------------------|
| Tidak ada rekam jejak mahasiswa bertugas | Modul riwayat tugas per mahasiswa dengan filter kegiatan & periode |
| Penugasan dilakukan manual / via chat | Fitur penugasan digital dengan konfirmasi otomatis & notifikasi |
| Tidak ada jadwal terpusat | Kalender kegiatan terintegrasi yang dapat diakses semua pihak |
| Laporan dibuat manual | Laporan dan rekap otomatis yang dapat diekspor (PDF/Excel) |

---

## 3. User Persona

### 3.1 Admin / Staf Protokol
- **Kebutuhan:** Mengelola data mahasiswa, membuat kegiatan, menentukan penugasan
- **Pain point:** Proses manual memakan waktu, rawan kesalahan, tidak terpusat
- **Goal:** Dapat mengelola semua protokoler dari satu dashboard yang efisien

### 3.2 Mahasiswa Anggota Protokoler
- **Kebutuhan:** Mengetahui jadwal tugas, detail kegiatan, dan perannya (LO/protokoler)
- **Pain point:** Sering lupa jadwal, informasi tugas tidak konsisten
- **Goal:** Mendapat notifikasi tepat waktu dan akses mudah ke detail penugasan

### 3.3 Pimpinan / Manajemen
- **Kebutuhan:** Melihat ringkasan kegiatan dan performa mahasiswa
- **Pain point:** Tidak ada data agregat yang mudah dibaca
- **Goal:** Dashboard monitoring yang informatif tanpa perlu operasional harian

---

## 4. Fitur & Persyaratan Fungsional

### 4.1 Modul Database Mahasiswa Protokoler

Modul ini adalah pusat data seluruh anggota tim protokoler universitas.

| No | Fitur | Deskripsi | Prioritas |
|----|-------|-----------|-----------|
| 1 | Tambah / Edit / Hapus Mahasiswa | Form input: NIM, nama, prodi, angkatan, nomor HP, email, foto | HIGH |
| 2 | Filter & Pencarian | Cari berdasarkan nama, NIM, prodi, atau angkatan | HIGH |
| 3 | Status Keaktifan | Tandai mahasiswa aktif / tidak aktif / cuti dari tim | MEDIUM |
| 4 | Riwayat Tugas | Lihat daftar kegiatan yang pernah diikuti beserta perannya | HIGH |
| 5 | Ekspor Data | Ekspor daftar mahasiswa ke format Excel/PDF | MEDIUM |

---

### 4.2 Modul Manajemen Kegiatan

Modul pencatatan dan pengelolaan seluruh kegiatan protokoler universitas.

| No | Fitur | Deskripsi | Prioritas |
|----|-------|-----------|-----------|
| 1 | Buat Kegiatan Baru | Form: nama kegiatan, bentuk/jenis kegiatan, tanggal, jam mulai & selesai, lokasi, deskripsi | HIGH |
| 2 | Data Tamu / Peserta | Input informasi tamu VIP: nama, jabatan, instansi, jumlah rombongan | HIGH |
| 3 | Kategori / Bentuk Kegiatan | Dropdown: Wisuda, Kunjungan Tamu, Seminar, Pelantikan, Rapat Resmi, Lainnya | HIGH |
| 4 | Kalender Kegiatan | Tampilan kalender bulanan yang menampilkan semua kegiatan terjadwal | HIGH |
| 5 | Status Kegiatan | Tandai kegiatan: Draft, Terkonfirmasi, Selesai, Dibatalkan | MEDIUM |
| 6 | Lampiran Rundown | Upload file susunan acara / rundown kegiatan (PDF/Word) | LOW |

---

### 4.3 Modul Penugasan Mahasiswa

Modul inti untuk menentukan dan mengelola penugasan mahasiswa per kegiatan.

| No | Fitur | Deskripsi | Prioritas |
|----|-------|-----------|-----------|
| 1 | Assign Mahasiswa ke Kegiatan | Admin memilih mahasiswa dari database lalu menentukan perannya: LO atau Protokoler | HIGH |
| 2 | Multi-peran per Kegiatan | Satu kegiatan dapat memiliki banyak mahasiswa dengan peran berbeda | HIGH |
| 3 | Cek Konflik Jadwal | Sistem memperingatkan jika mahasiswa sudah ditugaskan di kegiatan lain di waktu bersamaan | HIGH |
| 4 | Notifikasi Penugasan | Mahasiswa mendapat push notification & email saat ditugaskan pada kegiatan | HIGH |
| 5 | Reminder Kegiatan | Notifikasi otomatis H-1 dan H-0 (pagi hari) sebelum kegiatan berlangsung | HIGH |
| 6 | Konfirmasi Kehadiran | Mahasiswa mengkonfirmasi kesediaan bertugas via aplikasi mobile | MEDIUM |

---

### 4.4 Modul Laporan & Rekap

Modul pelaporan untuk kebutuhan monitoring dan evaluasi.

| No | Fitur | Deskripsi | Prioritas |
|----|-------|-----------|-----------|
| 1 | Laporan Kegiatan per Periode | Daftar semua kegiatan dalam rentang waktu tertentu beserta detailnya | HIGH |
| 2 | Rekap Jam Tugas Mahasiswa | Total jam dan jumlah kegiatan yang diikuti tiap mahasiswa dalam periode tertentu | HIGH |
| 3 | Jadwal Tugas Per Mahasiswa | Tampilan jadwal individu mahasiswa yang bisa difilter per bulan | HIGH |
| 4 | Ekspor Laporan | Unduh laporan dalam format PDF dan Excel | HIGH |
| 5 | Dashboard Statistik | Grafik ringkasan: total kegiatan, mahasiswa teraktif, distribusi peran | MEDIUM |

---

## 5. Persyaratan Non-Fungsional

| Aspek | Persyaratan |
|-------|-------------|
| **Performa** | Halaman utama & dashboard load dalam < 3 detik pada koneksi 4G |
| **Keamanan** | Autentikasi berbasis JWT, role-based access control (Admin, Mahasiswa, Pimpinan) |
| **Ketersediaan** | Sistem tersedia 99% uptime pada jam kerja (07.00 – 22.00 WIB) |
| **Skalabilitas** | Mendukung minimal 500 mahasiswa aktif dan 100 kegiatan per tahun |
| **Kemudahan Pakai** | Pengguna baru dapat menyelesaikan tugas utama tanpa pelatihan khusus > 1 jam |
| **Kompatibilitas** | Web: Chrome, Firefox, Edge terbaru. Mobile: Android 8+ dan iOS 13+ |

---

## 6. Alur Sistem Utama

### Alur 1: Admin Membuat Kegiatan dan Menugaskan Mahasiswa
1. Admin login ke dashboard web
2. Admin membuat kegiatan baru: mengisi nama, bentuk, tanggal, jam, lokasi, dan data tamu
3. Admin membuka tab Penugasan pada kegiatan tersebut
4. Admin memilih mahasiswa dari database dan menentukan peran (LO / Protokoler)
5. Sistem mengecek konflik jadwal – jika ada, admin mendapat peringatan
6. Admin menyimpan penugasan → sistem mengirim notifikasi otomatis ke mahasiswa yang ditugaskan

### Alur 2: Mahasiswa Menerima dan Mengkonfirmasi Penugasan
1. Mahasiswa menerima push notification di aplikasi mobile
2. Mahasiswa membuka detail kegiatan: nama acara, waktu, lokasi, tamu, dan perannya
3. Mahasiswa mengkonfirmasi kesediaan bertugas (Konfirmasi / Minta Pengganti)
4. Mahasiswa mendapat reminder otomatis H-1 dan H-0 sebelum kegiatan

### Alur 3: Pimpinan Melihat Laporan
1. Pimpinan login ke dashboard web dengan role Viewer
2. Pimpinan memilih periode laporan yang ingin dilihat
3. Sistem menampilkan ringkasan kegiatan, mahasiswa paling aktif, dan statistik tugas
4. Pimpinan dapat mengekspor laporan dalam format PDF atau Excel

---

## 7. Model Data Utama

### 7.1 Entitas Mahasiswa

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | UUID | Primary key |
| nim | String | Nomor Induk Mahasiswa (unik) |
| nama_lengkap | String | Nama lengkap mahasiswa |
| prodi | String | Program studi |
| angkatan | Integer | Tahun angkatan masuk |
| no_hp | String | Nomor WhatsApp aktif |
| email | String | Email kampus mahasiswa |
| foto_url | String | URL foto profil |
| status | Enum | aktif / tidak_aktif / cuti |

### 7.2 Entitas Kegiatan

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | UUID | Primary key |
| nama_kegiatan | String | Judul / nama acara |
| bentuk_kegiatan | Enum | Wisuda / Kunjungan / Seminar / dll |
| tanggal | Date | Tanggal pelaksanaan |
| jam_mulai | Time | Jam mulai kegiatan |
| jam_selesai | Time | Jam selesai kegiatan |
| lokasi | String | Tempat kegiatan berlangsung |
| status | Enum | draft / terkonfirmasi / selesai / batal |

### 7.3 Entitas Penugasan (Assignment)

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | UUID | Primary key |
| kegiatan_id | FK → Kegiatan | Referensi ke kegiatan terkait |
| mahasiswa_id | FK → Mahasiswa | Referensi ke mahasiswa yang bertugas |
| peran | Enum | LO (Liaison Officer) / Protokoler |
| status_konfirmasi | Enum | pending / dikonfirmasi / ditolak |
| catatan | Text | Catatan tambahan dari admin atau mahasiswa |

### 7.4 Entitas Tamu

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | UUID | Primary key |
| kegiatan_id | FK → Kegiatan | Referensi ke kegiatan terkait |
| nama_tamu | String | Nama lengkap tamu VIP |
| jabatan | String | Jabatan / posisi tamu |
| instansi | String | Asal instansi / lembaga |
| jumlah_rombongan | Integer | Jumlah orang dalam rombongan |

---

## 8. Role & Hak Akses

| Fitur | Admin | Mahasiswa | Pimpinan |
|-------|:-----:|:---------:|:--------:|
| Kelola data mahasiswa | ✅ | ❌ | ❌ |
| Buat & edit kegiatan | ✅ | ❌ | ❌ |
| Assign penugasan | ✅ | ❌ | ❌ |
| Lihat jadwal tugas sendiri | ✅ | ✅ | ❌ |
| Konfirmasi kehadiran | ❌ | ✅ | ❌ |
| Lihat semua kegiatan | ✅ | ❌ | ✅ |
| Akses laporan & rekap | ✅ | ❌ | ✅ |
| Ekspor laporan | ✅ | ❌ | ✅ |
| Dashboard statistik | ✅ | ❌ | ✅ |
| Kelola akun pengguna | ✅ | ❌ | ❌ |

---

## 9. Acceptance Criteria

| Fitur | Kriteria Penerimaan |
|-------|---------------------|
| Database Mahasiswa | Admin dapat menambah, mengedit, menonaktifkan mahasiswa. Data tersimpan dan dapat dicari. |
| Manajemen Kegiatan | Admin dapat membuat kegiatan dengan semua field wajib terisi. Kegiatan muncul di kalender. |
| Penugasan Mahasiswa | Mahasiswa dapat ditugaskan sebagai LO atau Protokoler. Sistem mencegah konflik jadwal. |
| Notifikasi | Mahasiswa menerima notifikasi dalam < 5 menit setelah penugasan dan reminder H-1. |
| Laporan | Laporan kegiatan dan rekap jam tugas dapat digenerate dan diunduh dalam format PDF/Excel. |

---

## 10. Ketentuan Pengembangan Selanjutnya (Future Scope)

- Sistem penilaian dan feedback performa mahasiswa protokoler per kegiatan
- Manajemen tingkatan / level mahasiswa (junior, senior) berdasarkan akumulasi tugas
- Modul sertifikasi dan pelatihan protokoler terintegrasi
- Integrasi dengan sistem akademik (SIAKAD) untuk validasi data mahasiswa
- Fitur self-service mahasiswa untuk mengajukan diri sebagai relawan kegiatan
- Laporan analitik lanjutan dan prediksi kebutuhan staf berdasarkan tren kegiatan
