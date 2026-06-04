const fs = require('fs');

function fixUseClient(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\"use client\";\n/g, '');
  content = content.replace(/"use client";\n"use client";\n/g, '"use client";\n');
  fs.writeFileSync(file, content, 'utf8');
}

fixUseClient('app/(authenticated)/dashboard/page.tsx');
fixUseClient('app/(authenticated)/jadwal-saya/page.tsx');
fixUseClient('app/(authenticated)/kegiatan/page.tsx');
fixUseClient('app/(authenticated)/laporan/page.tsx');
fixUseClient('app/(authenticated)/layout.tsx');
fixUseClient('app/(authenticated)/mahasiswa/page.tsx');
fixUseClient('app/auth/page.tsx');
fixUseClient('components/app-shell.tsx');

let css = fs.readFileSync('app/globals.css', 'utf8');
css = css.replace('@import "tw-animate-css";\n', '');
fs.writeFileSync('app/globals.css', css, 'utf8');

console.log("Syntax fixed");
