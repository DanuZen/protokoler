import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
dotenv.config();

function hashPassword(password) {
  if (!password) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const prisma = new PrismaClient();

async function seed() {
  console.log("Memulai pembuatan akun demo...");

  const users = [
    { email: 'admin@siproto.com', password: 'admin123', nama: 'Administrator SiProto', role: 'admin' },
    { email: 'mhs@siproto.com', password: 'mhs123', nama: 'Mahasiswa Demo', role: 'protokoler' },
    { email: 'pimpinan@siproto.com', password: 'pimpinan123', nama: 'Pimpinan Universitas', role: 'tamu' },
  ];

  for (const u of users) {
    let authUser;
    
    // Check if user already exists in auth
    const { data: listData, error: listErr } = await supabase.auth.admin.listUsers();
    if (listErr) {
      console.log(`[!] Gagal melist user: ${listErr.message}`);
    }
    const existing = listData?.users?.find(usr => usr.email === u.email);
    
    if (existing) {
      console.log(`[-] Akun ${u.email} sudah ada di Auth. Menggunakan user existing.`);
      authUser = existing;
    } else {
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { nama_lengkap: u.nama }
      });

      if (authErr) {
        console.log(`[!] Gagal membuat ${u.email} di Auth: ${authErr.message}`);
        continue;
      }
      console.log(`[+] Akun ${u.email} berhasil dibuat di Auth.`);
      authUser = authData.user;
    }

    // Create User in Prisma
    const existingPrismaUser = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existingPrismaUser) {
      await prisma.user.create({
        data: {
          id: authUser.id,
          email: u.email,
          role: u.role,
          password: hashPassword(u.password)
        }
      });
      console.log(`[+] User ${u.email} berhasil dibuat di Prisma.`);
    } else {
      console.log(`[-] User ${u.email} sudah ada di Prisma.`);
      if (!existingPrismaUser.password) {
        await prisma.user.update({
          where: { email: u.email },
          data: { password: hashPassword(u.password) }
        });
        console.log(`[+] Password untuk ${u.email} di-update di Prisma.`);
      }
    }

    // Create Protokoler profile for mahasiswa (role: protokoler)
    if (u.role === 'protokoler') {
      const existingProtokoler = await prisma.protokoler.findFirst({
        where: { user_id: authUser.id }
      });
      if (!existingProtokoler) {
        await prisma.protokoler.create({
          data: {
            user_id: authUser.id,
            nim: '2110001',
            nama_lengkap: u.nama,
            prodi: 'Teknik Informatika',
            departemen: 'Teknik',
            fakultas: 'FT',
            no_hp: '08123456789',
            status_akun: 'aktif',
          }
        });
        console.log(`[+] Profil Protokoler untuk ${u.email} berhasil dibuat.`);
      } else {
        console.log(`[-] Profil Protokoler untuk ${u.email} sudah ada.`);
      }
    }
  }

  console.log("Selesai!");
  await prisma.$disconnect();
}

seed();
