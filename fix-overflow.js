const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('page.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('frontend/app/(authenticated)');
let count = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    // Replace <main className="flex-1 min-h-0 flex flex-col... overflow-hidden">
    content = content.replace(/<main\s+className=["']([^"']*)["']/g, (match, p1) => {
        let classes = p1;
        if (!classes.includes('md:overflow-hidden') && classes.includes('overflow-hidden')) {
            classes = classes.replace(/\boverflow-hidden\b/g, 'overflow-visible md:overflow-hidden');
            changed = true;
        }
        if (!classes.includes('md:min-h-0') && classes.includes('min-h-0')) {
            classes = classes.replace(/\bmin-h-0\b/g, 'md:min-h-0');
            changed = true;
        }
        return `<main className="${classes}"`;
    });

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        count++;
        console.log('Fixed ' + file);
    }
});
console.log('Total fixed: ' + count);
