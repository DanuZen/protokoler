const fs = require('fs');
let content = fs.readFileSync('../_backup/frontend/routes/index.tsx', 'utf8');
content = content.replace(/import \{ createFileRoute.*?\} from "@tanstack\/react-router";/g, 'import Link from "next/link";');
content = content.replace(/export const Route = createFileRoute\("\/"\)\(\{.*?component: Landing,\n\}\);/s, '');
content = content.replace(/function Landing\(\)/g, 'export default function Landing()');
content = content.replace(/to="\//g, 'href="/');
content = content.replace(/to="\#/g, 'href="#');
content = content.replace(/@frontend\/components/g, '@/components');
fs.writeFileSync('app/page.tsx', content, 'utf8');
