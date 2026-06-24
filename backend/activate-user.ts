import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Activating protokoler account for nim: 23343067...');
  try {
    const result = await prisma.protokoler.update({
      where: { nim: '23343067' },
      data: { status_akun: 'aktif' },
    });
    console.log('Successfully activated! Current status:', result.status_akun);
  } catch (err: any) {
    console.error('Error during activation:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
