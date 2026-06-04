# PROJECT PLAN
## Sistem Manajemen Staff Protokoler Universitas
**Versi 1.0 | Juni 2025**

---

| Info | Detail |
|------|--------|
| **Nama Proyek** | SiProto – Sistem Informasi Protokoler Universitas |
| **Institusi** | Universitas (Lingkup Internal Kampus) |
| **Versi Dokumen** | 1.0 |
| **Tanggal Dibuat** | Juni 2025 |
| **Platform Target** | Web App & Mobile App (Android/iOS) |
| **Target Durasi** | 1 – 2 Bulan |
| **Tim Pengembang** | Tim Internal Kampus |

---

## 1. Latar Belakang

Unit Protokoler di lingkungan universitas berperan penting dalam mendukung kelancaran berbagai kegiatan resmi kampus, seperti wisuda, kunjungan tamu penting, seminar, pelantikan pejabat, dan acara-acara institusional lainnya. Mahasiswa anggota tim protokoler bertugas sebagai Liaison Officer (LO) maupun staf protokoler pada setiap kegiatan tersebut.

Namun saat ini pengelolaan masih dilakukan secara manual, sehingga menimbulkan berbagai tantangan:

- Tidak ada rekam jejak yang jelas mengenai mahasiswa mana yang sudah bertugas dan kapan
- Penugasan LO dan staf protokoler dilakukan secara ad-hoc tanpa sistem yang terstruktur
- Tidak tersedia jadwal tugas terpusat yang dapat diakses oleh semua pihak
- Sulitnya menghasilkan laporan kegiatan dan rekapitulasi jam tugas mahasiswa
- Koordinasi antara admin protokol dan mahasiswa yang bertugas masih bersifat manual

Atas dasar tersebut, dibutuhkan sebuah sistem informasi yang mampu mengintegrasikan pengelolaan data mahasiswa protokoler, manajemen kegiatan, penugasan, dan pelaporan dalam satu platform digital yang mudah digunakan.

---

## 2. Tujuan Proyek

- Membangun sistem digital untuk manajemen mahasiswa anggota tim protokoler universitas
- Menyediakan fitur manajemen kegiatan lengkap (jadwal, jenis, tamu, tempat, dan waktu)
- Memudahkan penugasan mahasiswa sebagai LO atau staf protokoler pada setiap kegiatan
- Menghasilkan jadwal tugas, rekap jam tugas, dan laporan kegiatan secara otomatis
- Memberikan notifikasi dan reminder kepada mahasiswa yang bertugas
- Menyediakan dasbor monitoring bagi admin dan pimpinan

---

## 3. Ruang Lingkup

### 3.1 Dalam Lingkup (In Scope)

- Manajemen data mahasiswa anggota protokoler (database anggota)
- Manajemen kegiatan: nama kegiatan, bentuk, tanggal, jam, lokasi, dan data tamu
- Penugasan mahasiswa per kegiatan (sebagai LO atau protokoler)
- Notifikasi dan reminder jadwal tugas
- Laporan kegiatan per periode
- Rekap jam tugas dan frekuensi tugas tiap mahasiswa
- Dasbor untuk Admin dan Pimpinan
- Aplikasi mobile untuk mahasiswa

### 3.2 Di Luar Lingkup (Out of Scope)

- Integrasi dengan sistem akademik / SIAKAD
- Sistem penilaian dan sertifikasi mahasiswa (dapat dikembangkan pada fase berikutnya)
- Manajemen keuangan atau honor mahasiswa
- Fitur e-learning atau pelatihan protokoler online

---

## 4. Stakeholder

| Stakeholder | Peran | Kepentingan |
|-------------|-------|-------------|
| Admin / Staf Protokol | Primary User | Mengelola data, kegiatan, dan penugasan |
| Mahasiswa Protokoler | Secondary User | Melihat jadwal tugas & menerima notifikasi |
| Pimpinan / Manajemen | Viewer / Approver | Monitoring kegiatan & laporan rekapitulasi |

---

## 5. Milestone & Timeline

Target pengembangan: **1 – 2 bulan (8 minggu)**

| Fase | Milestone | Deliverable | Durasi |
|------|-----------|-------------|--------|
| Fase 1 | Perencanaan & Desain | PRD final, desain UI/UX wireframe, arsitektur sistem | Minggu 1 – 2 |
| Fase 2 | Development Backend | Database, API: manajemen anggota, kegiatan, penugasan | Minggu 2 – 4 |
| Fase 3 | Development Frontend | Web dashboard (Admin & Pimpinan), Mobile App (Mahasiswa) | Minggu 3 – 6 |
| Fase 4 | Integrasi & Testing | Integrasi frontend-backend, UAT bersama user | Minggu 6 – 7 |
| Fase 5 | Deploy & Go-Live | Server deployment, pelatihan user, go-live | Minggu 8 |

---

## 6. Arsitektur Teknologi (Rekomendasi)

| Layer | Teknologi Rekomendasi | Keterangan |
|-------|-----------------------|------------|
| Frontend Web | React.js / Next.js | Dashboard Admin & Pimpinan |
| Mobile App | Flutter / React Native | Aplikasi mahasiswa (Android & iOS) |
| Backend API | Node.js + Express / Laravel | REST API untuk semua modul |
| Database | PostgreSQL / MySQL | Penyimpanan data utama |
| Notifikasi | Firebase Cloud Messaging | Push notification ke mahasiswa |
| Hosting | Server kampus / VPS | Deployment internal kampus |

---

## 7. Risiko Proyek

| Risiko | Level | Mitigasi |
|--------|-------|----------|
| Ketersediaan tim pengembang terbatas | Tinggi | Prioritaskan fitur inti (MVP) dulu, fitur tambahan di fase 2 |
| Perubahan kebutuhan di tengah pengembangan | Sedang | Kunci scope di PRD, perubahan lewat proses formal |
| Adopsi pengguna rendah | Sedang | Libatkan user dalam UAT & adakan sesi pelatihan |
| Masalah performa di mobile | Rendah | Testing multi-device sebelum go-live |

---

## 8. Kriteria Keberhasilan

- Semua modul inti berjalan tanpa error kritis pada saat go-live
- Admin dapat mengelola kegiatan dan penugasan dalam waktu < 5 menit per entri
- Mahasiswa menerima notifikasi tugas paling lambat 24 jam sebelum kegiatan
- Laporan kegiatan dan rekap jam tugas dapat dihasilkan otomatis dalam format yang dapat diekspor
- Tingkat adopsi user minimal 80% dalam 30 hari pertama setelah go-live
