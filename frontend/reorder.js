const fs = require('fs');
const file = 'c:/Users/wira1/protokoler/frontend/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const lines = content.split('\n');

const postinganLines = lines.slice(353, 436); // lines 354 to 436
const sopTestimoniLines = lines.slice(436, 560); // lines 437 to 560
const beforePostingan = lines.slice(0, 353);
const afterTestimoni = lines.slice(560);

const newLines = [...beforePostingan, ...sopTestimoniLines, ...postinganLines, ...afterTestimoni];

fs.writeFileSync(file, newLines.join('\n'));
console.log('Reordered using line indices!');
