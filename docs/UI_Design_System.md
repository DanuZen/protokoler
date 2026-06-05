# Panduan Sistem Desain UI (PROTOKOLER)

Dokumen ini berisi panduan gaya (style guide) dan aturan antarmuka pengguna (UI) yang digunakan dalam platform Protokoler Universitas Negeri Padang. Panduan ini menjadi acuan utama untuk menjaga konsistensi visual di seluruh halaman.

## 1. Palet Warna (Color Palette)

Skema warna aplikasi menonjolkan kesan profesional, elegan, dan resmi (formal) khas keprotokolan universitas.

- **Primary (Navy Blue):** Warna latar belakang utama dan elemen dominan. Memberikan kesan formal dan tegas. (Tailwind: `bg-primary`, `bg-slate-900`)
- **Accent (Gold / Emas):** Digunakan untuk sorotan (highlights), elemen interaktif, bintang ulasan, dan teks sub-judul. Memberikan kesan premium dan elegan. (Tailwind: `text-gold`, `bg-gold`)
- **Text (Light/White):** Teks utama di atas latar gelap menggunakan warna putih solid atau variasi abu-abu terang (Tailwind: `text-white`, `text-slate-200`, `text-slate-300`) agar kontras dan mudah dibaca.
- **Card Background:** Menggunakan efek kaca transparan (*glassmorphism*) dengan warna dasar putih atau hitam transparan (Tailwind: `bg-white/10` dipadukan dengan `backdrop-blur-md`).

## 2. Tipografi (Typography)

Sistem menggunakan kombinasi dua jenis huruf (font) untuk membedakan judul dan konten biasa:

- **Heading / Display Font:** `Playfair Display` (atau font serif sejenis). Digunakan untuk judul utama (H1, H2, H3) guna memperkuat identitas klasik dan formal. (Tailwind: `font-display`)
- **Body Font:** `Inter` (atau font sans-serif sejenis). Digunakan untuk paragraf, deskripsi, dan tombol karena tingkat keterbacaannya yang tinggi di layar digital. (Tailwind: `font-sans`)

## 3. Bentuk dan Sudut (Shape & Radius)

Desain aplikasi mengadopsi gaya modern *sharp/flat* (tanpa sudut melengkung) pada komponen-komponen antarmuka struktural:

- **Cards & Containers:** Semua kotak konten, panel, dan kartu menggunakan sudut siku-siku yang tajam (Tailwind: `rounded-none`).
- **Buttons & Inputs:** Semua tombol tekan, kolom input form, dan tab navigasi juga menggunakan sudut siku-siku tajam (Tailwind: `rounded-none`).
- *Pengecualian:* Sudut bulat (Tailwind: `rounded-full`) hanya diizinkan untuk indikator kecil, seperti titik status online (ping dot) atau foto profil (avatar) melingkar.

## 4. Gaya Komponen UI (UI Component Styles)

### Card Testimoni & Konten Bertekstur
- **Border:** Tipis dan transparan (contoh: `border border-white/10`).
- **Background:** `bg-white/10` atau `bg-slate-800/50` dengan `backdrop-blur-md` untuk kedalaman.
- **Teks:** Konten utama berwarna putih/terang. Sub-judul atau peran menggunakan warna **Gold** dengan format huruf kapital semua (uppercase) dan jarak huruf lebar (`tracking-wider`).

### Ikonografi & Dekorasi
- **Kutipan (Quotes):** Ikon kutipan besar yang ditempatkan di sudut kanan atas kartu dengan opacity rendah (`text-white/10` atau `text-white/20`) sebagai elemen air (watermark).
- **Bintang (Stars):** Ikon bintang untuk rating menggunakan warna pengisi dan garis luar emas (`fill-gold text-gold`).

## 5. Implementasi Tailwind CSS

Untuk menjaga panduan ini tetap berlaku secara otomatis pada komponen default Shadcn UI, variabel CSS di `globals.css` telah diatur sebagai berikut:

```css
:root {
  /* ... variabel warna lainnya ... */
  --radius: 0rem; /* Mengunci radius menjadi siku-siku */
}
```

Setiap pengembangan fitur atau halaman baru **wajib** mengikuti pedoman ini untuk mempertahankan identitas visual "PROTOKOLER".
