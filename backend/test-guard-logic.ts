import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env
dotenv.config({ path: path.join(__dirname, '.env') });

const prisma = new PrismaClient();

async function test() {
  console.log('Testing JwtAuthGuard database logic simulation...');
  try {
    // 1. Ambil satu user secara acak dari database untuk simulasi token user yang valid
    console.log('Fetching a user from database for simulation...');
    const sampleUser = await prisma.user.findFirst({
      include: { protokoler: true }
    });

    if (!sampleUser) {
      console.log('No user found in database. Let\'s create a mock user...');
      // If empty db, create a mock user ID
      const mockId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
      const mockUser = {
        id: mockId,
        email: 'test@example.com',
        role: 'protokoler' as any,
        user_metadata: {
          nama_lengkap: 'Test User',
          nim: '12345678'
        }
      };
      await runGuardLogic(mockUser);
    } else {
      console.log('Found user:', sampleUser.email, 'ID:', sampleUser.id);
      // Simulate with the found user
      const mockUser = {
        id: sampleUser.id,
        email: sampleUser.email,
        role: sampleUser.role,
        user_metadata: {
          nama_lengkap: sampleUser.protokoler?.nama_lengkap || 'Sample User',
          nim: sampleUser.protokoler?.nim || '12345678'
        }
      };
      await runGuardLogic(mockUser);
    }
  } catch (err) {
    console.error('Simulation crashed with error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

async function runGuardLogic(user: any) {
  console.log('\n--- Running Guard Logic ---');
  
  // Line 53 in Guard: Fetch user role from database
  console.log('Querying prisma.user.findUnique...');
  let dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { protokoler: true },
  });
  console.log('prisma.user.findUnique result:', dbUser ? 'Found' : 'Not Found');

  // Line 58 in Guard: if (!dbUser)
  if (!dbUser) {
    console.log('Auto-provisioning user in database...');
    // Clean up stale user record with same email to avoid unique constraint issues
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: user.email || '' },
    });

    if (existingUserByEmail) {
      console.log('Deleting existing user by email to avoid collision...');
      await prisma.user.delete({
        where: { id: existingUserByEmail.id }
      });
    }

    let role = 'protokoler';
    const metaRole = user.user_metadata?.role || user.app_metadata?.role;
    if (metaRole && ['admin', 'protokoler', 'tamu', 'dokumentasi'].includes(metaRole)) {
      role = metaRole;
    }

    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email || '',
        role: role as any,
      },
      include: { protokoler: true },
    });
    console.log('User created:', dbUser.id);
  }

  // Line 88 in Guard: Ensure User profile exists in database
  if (dbUser && !dbUser.protokoler) {
    console.log('Protokoler profile is missing. Creating profile...');
    let name = dbUser.role === 'admin' ? 'Administrator' : 'Staf';
    if (user.user_metadata?.nama_lengkap) {
      name = user.user_metadata.nama_lengkap;
    }
    const nim = dbUser.role === 'protokoler'
      ? (user.user_metadata?.nim || `MHS-${user.id.substring(0, 8)}`)
      : `${dbUser.role.toUpperCase()}-${user.id.substring(0, 8)}`;
    
    try {
      console.log('Trying to create protokoler profile with nim:', nim);
      const newProfile = await prisma.protokoler.create({
        data: {
          user_id: dbUser.id,
          nim: nim,
          nama_lengkap: name,
          prodi: dbUser.role === 'protokoler' ? 'Teknik Informatika' : 'Sistem Informasi',
          departemen: 'Teknik',
          fakultas: 'FT',
          status_akun: 'aktif',
        },
      });
      dbUser.protokoler = newProfile;
      console.log('Profile created successfully!');
    } catch (e: any) {
      console.warn('First profile creation failed:', e.message);
      // Fallback to avoid nim collision
      const fallbackNim = `${dbUser.role.toUpperCase()}-${Date.now().toString().slice(-8)}`;
      console.log('Trying fallback profile with nim:', fallbackNim);
      const newProfile = await prisma.protokoler.create({
        data: {
          user_id: dbUser.id,
          nim: fallbackNim,
          nama_lengkap: name,
          prodi: dbUser.role === 'protokoler' ? 'Teknik Informatika' : 'Sistem Informasi',
          departemen: 'Teknik',
          fakultas: 'FT',
          status_akun: 'aktif',
        },
      });
      dbUser.protokoler = newProfile;
      console.log('Fallback profile created successfully!');
    }
  }

  // Line 131 in Guard: Attach user info
  const requestUser = {
    id: dbUser.id,
    email: dbUser.email,
    role: dbUser.role,
    nama_lengkap: dbUser.protokoler?.nama_lengkap || 'Administrator',
    protokolerId: dbUser.protokoler?.id || null,
    avatar_url: dbUser.protokoler?.foto_setengah_badan_url || null,
    foto_setengah_badan_url: dbUser.protokoler?.foto_setengah_badan_url || null,
  };
  console.log('Attached request.user:', requestUser);
  console.log('LOGIC COMPLETED SUCCESSFULLY WITH NO ERROR!');
}

test();
