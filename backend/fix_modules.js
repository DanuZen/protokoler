const fs = require('fs');

const modules = [
  ['src/kegiatan/kegiatan.module.ts', 'KegiatanModule'],
  ['src/penugasan/penugasan.module.ts', 'PenugasanModule'],
  ['src/dashboard/dashboard.module.ts', 'DashboardModule'],
  ['src/laporan/laporan.module.ts', 'LaporanModule'],
];

for (const [file, name] of modules) {
  let c = fs.readFileSync(file, 'utf8');
  if (!c.includes('SupabaseModule')) {
    c = c.replace(
      "import { Module } from '@nestjs/common';",
      "import { Module } from '@nestjs/common';\nimport { SupabaseModule } from '../supabase/supabase.module';"
    );
    c = c.replace('imports: [],', 'imports: [SupabaseModule],');
    c = c.replace(/controllers:/, 'imports: [SupabaseModule],\n  controllers:');
    // Remove duplicate if it appeared twice
    c = c.replace('imports: [SupabaseModule],\n  imports: [SupabaseModule],', 'imports: [SupabaseModule],');
    fs.writeFileSync(file, c, 'utf8');
    console.log('Updated: ' + file);
  }
}
