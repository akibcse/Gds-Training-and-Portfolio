const fs = require('fs');
const path = require('path');
const dir = 'd:/Others(D)/Next Js/gds-training/lib/cms';
fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.ts')) {
    const p = path.join(dir, file);
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/id:\s*key,(\s*)\.\.\.\(value\s+as\s+any\)/g, '...(value as any),$1id: key');
    fs.writeFileSync(p, content);
    console.log('Fixed', file);
  }
});
