const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('app/(authenticated)');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import \{ createFileRoute.*?\} from "@tanstack\/react-router";/g, 'import Link from "next/link";');
  content = content.replace(/export const Route = createFileRoute.*?\(\{.*?component: (Page|Dashboard),\n\}\);/s, '');
  content = content.replace(/export const Route = createFileRoute.*?\(\{ component: Page \}\);/, '');
  content = content.replace(/function Dashboard\(\)/g, 'export default function Dashboard()');
  content = content.replace(/function Page\(\)/g, 'export default function Page()');
  content = content.replace(/to="\/kegiatan\/\"/g, 'href={/kegiatan/}');
  content = content.replace(/params=\{\{ id: k\.id \}\}/g, '');
  content = content.replace(/params=\{\{ id: p\.kegiatan\.id \}\}/g, '');
  content = content.replace(/to="\/kegiatan"/g, 'href="/kegiatan"');
  content = content.replace(/@frontend\/components/g, '@/components');
  content = content.replace(/@frontend\/hooks/g, '@/hooks');
  content = content.replace(/@backend\/integrations\/supabase\/client/g, '@/lib/supabase');
  
  if (file.includes('kegiatan/[id]/page.tsx')) {
    content = content.replace(/const \{ id \} = Route\.useParams\(\);/, 'const { id } = React.use(params);');
    content = content.replace(/export default function Page\(\)/, 'import React from "react";\nexport default function Page({ params }: { params: Promise<{ id: string }> })');
  }
  
  if (!content.startsWith('"use client";')) {
    content = '"use client";\n' + content;
  }
  fs.writeFileSync(file, content, 'utf8');
});
console.log("Pages fixed");
