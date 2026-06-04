const fs = require('fs');

function fix(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\"use client\";/g, '"use client";');
  fs.writeFileSync(file, content, 'utf8');
}

fix('app/(authenticated)/dashboard/page.tsx');
fix('app/(authenticated)/jadwal-saya/page.tsx');
fix('app/(authenticated)/kegiatan/page.tsx');
fix('app/(authenticated)/kegiatan/[id]/page.tsx');
fix('app/(authenticated)/laporan/page.tsx');
fix('app/(authenticated)/layout.tsx');
fix('app/(authenticated)/mahasiswa/page.tsx');
fix('app/auth/page.tsx');
fix('components/app-shell.tsx');

let css = fs.readFileSync('app/globals.css', 'utf8');
css = css.replace(/@import "tw-animate-css";/g, '');
fs.writeFileSync('app/globals.css', css, 'utf8');

console.log("Syntax fixed");
