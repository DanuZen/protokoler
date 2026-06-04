const fs = require('fs');

function replaceSupabase(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  // Replace supabase import with api import
  content = content.replace(
    /import \{ supabase \} from "@\/lib\/supabase";\n/g,
    ''
  );
  fs.writeFileSync(file, content, 'utf8');
}

replaceSupabase('app/(authenticated)/dashboard/page.tsx');
replaceSupabase('app/(authenticated)/kegiatan/page.tsx');
replaceSupabase('app/(authenticated)/mahasiswa/page.tsx');
replaceSupabase('app/(authenticated)/jadwal-saya/page.tsx');
replaceSupabase('app/(authenticated)/laporan/page.tsx');
replaceSupabase('app/(authenticated)/kegiatan/[id]/page.tsx');
console.log('Done');
