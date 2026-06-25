# Panduan Migrasi Aplikasi ke VPS (Virtual Private Server)

Dokumen ini adalah panduan langkah demi langkah untuk memindahkan Sistem Informasi Protokoler Anda (Frontend Next.js & Backend NestJS) dari layanan *cloud* terpisah (Vercel & Hugging Face) menjadi satu kesatuan di dalam server VPS Anda sendiri. 

Mengingat tim Anda sepertinya sudah mulai menyentuh konfigurasi Docker (berdasarkan riwayat *pull request*), panduan ini akan mencakup standar industri terbaik menggunakan VPS.

> [!TIP]
> **Kapan waktu yang tepat untuk pindah ke VPS?**
> Pindahlah saat aplikasi sudah digunakan secara aktif oleh pengguna nyata setiap hari, saat kecepatan (latency) menjadi prioritas utama, atau saat Anda butuh kontrol penuh atas server tanpa batasan *sleep mode* (Cold Start).

---

## 1. Persiapan Awal

Sebelum menyentuh *codingan*, Anda perlu menyiapkan infrastruktur:

1. **Sewa VPS:** Pilih penyedia VPS lokal (seperti Niagahoster, Biznet, IDCloudHost) atau global (DigitalOcean, Linode, AWS) yang servernya berlokasi di **Indonesia** atau **Singapura** agar ping/kecepatan maksimal.
   * *Spesifikasi minimal rekomendasi:* 2GB RAM, 1-2 vCPU, OS Ubuntu 22.04 LTS.
2. **Domain:** Pastikan Anda punya akses ke kontrol panel domain Anda (misal: `unp.ac.id` atau domain khusus lainnya) untuk mengatur DNS (A Record) yang mengarah ke IP VPS baru Anda.
3. **Database (Opsional):** Anda bisa tetap membiarkan database berada di Supabase (direkomendasikan agar tidak pusing mengatur *backup* database sendiri), atau nantinya Anda *install* PostgreSQL sendiri di VPS.

---

## 2. Pengaturan Server Dasar (Server Setup)

Setelah membeli VPS, Anda akan mendapat Alamat IP, Username (biasanya `root`), dan Password. Buka terminal/CMD di komputer Anda dan masuk ke server:

```bash
ssh root@<IP_VPS_ANDA>
```

Update server dan install aplikasi wajib:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nano nginx certbot python3-certbot-nginx
```

**Pilih salah satu metode untuk menjalankan aplikasi:**
*   **Opsi A (PM2 / Node.js langsung):** Lebih mudah untuk pemula.
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    sudo npm install -g pm2
    ```
*   **Opsi B (Docker):** Lebih profesional, rapi, dan terisolasi (Disarankan jika tim backend sudah membuat `Dockerfile`).
    ```bash
    sudo apt install -y docker.io docker-compose
    ```

---

## 3. Deployment Backend (NestJS)

Mari kita jalankan mesin backend di VPS Anda.

1. **Clone Repository:**
   ```bash
   git clone https://github.com/akun-anda/protokoler-backend.git
   cd protokoler-backend
   ```
2. **Siapkan Environment Variables:**
   Buat file `.env` di server dan masukkan URL Supabase atau database lainnya.
   ```bash
   nano .env
   # Masukkan variabel seperti di local Anda, lalu save (Ctrl+X, Y, Enter)
   ```
3. **Jalankan Aplikasi:**
   * **Jika pakai PM2:**
     ```bash
     npm install
     npm run build
     pm2 start dist/main.js --name "backend-protokoler"
     ```
   * **Jika pakai Docker:**
     ```bash
     docker-compose up -d --build
     ```

> [!NOTE]
> Pastikan backend berjalan mulus (biasanya di port `4000` atau `3000`). Anda bisa mengeceknya dengan mengetik `curl http://localhost:4000/api` di terminal VPS.

---

## 4. Deployment Frontend (Next.js)

Sekarang giliran tampilan antarmuka (website).

1. **Clone Repository:**
   ```bash
   cd ~
   git clone https://github.com/akun-anda/protokoler-frontend.git
   cd protokoler-frontend
   ```
2. **Siapkan Environment Variables:**
   PENTING! Kali ini, arahkan API URL ke diri sendiri, bukan ke Hugging Face lagi.
   ```bash
   nano .env
   ```
   Isi file `.env` dengan:
   ```env
   # Karena frontend dan backend sekarang dalam 1 server VPS
   # Nanti kita akan atur agar backend bisa diakses via namadomain.com/api
   NEXT_PUBLIC_API_URL="https://api.domainanda.com" 
   NEXT_PUBLIC_SUPABASE_URL="https://fayiskomrdikxpmjhyct.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="kunci_anon_anda"
   ```
3. **Jalankan Frontend:**
   * **Jika pakai PM2:**
     ```bash
     npm install
     npm run build
     pm2 start npm --name "frontend-protokoler" -- start
     ```
   * **Jika pakai Docker:**
     ```bash
     docker-compose up -d --build
     ```

---

## 5. Nginx Reverse Proxy (Menghubungkan Domain)

Saat ini, Frontend berjalan di Port `3000` dan Backend di Port `4000`. Agar orang luar bisa mengakses tanpa perlu mengetik port (cukup mengetik `www.domain.com`), kita butuh "Satpam Pintu Depan" yang bernama **Nginx**.

1. Buat konfigurasi baru di Nginx:
   ```bash
   sudo nano /etc/nginx/sites-available/protokoler
   ```
2. Masukkan konfigurasi standar ini (ganti `domainanda.com` dengan domain asli):
   ```nginx
   server {
       listen 80;
       server_name domainanda.com www.domainanda.com;

       # Mengarahkan traffic utama ke Frontend Next.js (Port 3000)
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }

   server {
       listen 80;
       server_name api.domainanda.com;

       # Mengarahkan traffic API ke Backend NestJS (Port 4000)
       location / {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
3. Aktifkan konfigurasi dan restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/protokoler /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## 6. Mengamankan dengan HTTPS (Gembok Hijau)

Langkah terakhir agar website Anda aman dan kredibel.

```bash
sudo certbot --nginx -d domainanda.com -d www.domainanda.com -d api.domainanda.com
```
Ikuti instruksi di layar, dan Certbot akan otomatis mengubah konfigurasi Nginx Anda untuk menggunakan HTTPS.

> [!IMPORTANT]
> **Penyimpanan (Auto Restart)**
> Jangan lupa untuk menyimpan konfigurasi PM2 agar aplikasi otomatis menyala ulang jika server mati/restart (Reboot):
> ```bash
> pm2 save
> pm2 startup
> ```

---

## Ringkasan Alur Kerja Setelah Migrasi

Jika di masa depan Anda melakukan pembaruan kode (coding di laptop -> push ke GitHub), proses pembaruannya di VPS akan menjadi seperti ini:

1. Masuk ke VPS (`ssh root@ip`)
2. Masuk ke folder aplikasi (`cd protokoler-frontend` atau `backend`)
3. Tarik kode terbaru (`git pull origin main`)
4. Build ulang (`npm run build` atau `docker-compose build`)
5. Restart mesinnya (`pm2 restart frontend-protokoler` atau `docker-compose up -d`)

Selamat! Anda sudah memiliki infrastruktur kelas *Enterprise* yang berjalan 24 jam penuh dengan kecepatan kilat.
