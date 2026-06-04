const fs = require('fs');

function fix(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  if (lines[0] && lines[0].includes('use client')) {
    lines[0] = '"use client";';
  }
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
}

fix('app/(authenticated)/dashboard/page.tsx');
fix('app/(authenticated)/jadwal-saya/page.tsx');
fix('app/(authenticated)/kegiatan/page.tsx');
fix('app/(authenticated)/kegiatan/[id]/page.tsx');
fix('app/(authenticated)/laporan/page.tsx');
fix('app/(authenticated)/layout.tsx');
fix('app/(authenticated)/mahasiswa/page.tsx');
fix('app/auth/page.tsx');
