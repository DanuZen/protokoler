/**
 * Seed script: Membuat akun demo untuk testing
 * Jalankan: npx ts-node prisma/seed-demo.ts
 */
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

function hashPassword(password: string): string {
  if (!password) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

const supabase = createClient(
  'https://fayiskomrdikxpmjhyct.supabase.co',
  'sb_secret_6ka_8wQPUBQ3nlPP0lEpEA_INfhwmvf',
  { auth: { persistSession: false } }
);

const prisma = new PrismaClient();

async function createDemoUser(email: string, password: string, role: 'admin' | 'dokumentasi' | 'protokoler', name: string) {
  console.log(`\n📝 Membuat user: ${email} (${role})`);

  // Cek apakah sudah ada di database
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`  ✅ User ${email} sudah ada di database (id: ${existing.id})`);
    if (!existing.password) {
      await prisma.user.update({
        where: { email },
        data: { password: hashPassword(password) }
      });
      console.log(`  ✅ Password di-update di Prisma.`);
    }
    return existing;
  }

  // Cek apakah sudah ada di Supabase Auth
  const { data: listData } = await supabase.auth.admin.listUsers();
  const existingAuth = listData?.users?.find(u => u.email === email);
  
  let userId: string;

  if (existingAuth) {
    console.log(`  ✅ User ${email} sudah ada di Supabase Auth (id: ${existingAuth.id})`);
    userId = existingAuth.id;
  } else {
    // Buat di Supabase Auth
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nama_lengkap: name },
    });

    if (authErr || !authData.user) {
      console.error(`  ❌ Gagal buat di Supabase Auth:`, authErr?.message);
      return null;
    }
    userId = authData.user.id;
    console.log(`  ✅ Dibuat di Supabase Auth (id: ${userId})`);
  }

  // Buat di database
  const user = await prisma.user.create({
    data: {
      id: userId,
      email,
      password: hashPassword(password),
      role,
    },
  });

  console.log(`  ✅ Dibuat di database (role: ${role})`);
  return user;
}

async function main() {
  console.log('🚀 Memulai seed demo accounts...\n');

  // 1. Admin
  await createDemoUser('admin@siproto.com', 'admin123', 'admin', 'Administrator SiProto');

  // 2. Mahasiswa Demo (protokoler)
  const mhsUser = await createDemoUser('mhs@siproto.com', 'mhs123', 'protokoler', 'Mahasiswa Demo');
  
  // Buat data protokoler jika belum ada
  if (mhsUser) {
    const existingProtokoler = await prisma.protokoler.findUnique({
      where: { user_id: mhsUser.id }
    });
    
    if (!existingProtokoler) {
      await prisma.protokoler.create({
        data: {
          user_id: mhsUser.id,
          nim: '20010101999',
          nama_lengkap: 'Mahasiswa Demo',
          prodi: 'Sistem Informasi',
          departemen: 'Teknik Informatika',
          fakultas: 'Fakultas Teknik',
          no_hp: '081234567890',
          status_akun: 'aktif',
        }
      });
      console.log('  ✅ Data protokoler demo dibuat');
    } else {
      console.log('  ✅ Data protokoler demo sudah ada');
    }
  }

  // 3. Dokumentasi Demo
  await createDemoUser('dok@siproto.com', 'dok123', 'dokumentasi', 'Tim Dokumentasi');

  console.log('\n✅ Seed selesai!\n');
  console.log('Akun demo:');
  console.log('  Admin     : admin@siproto.com / admin123');
  console.log('  Protokoler: mhs@siproto.com   / mhs123');
  console.log('  Dokumentasi: dok@siproto.com  / dok123');
}

main()
  .catch(e => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
