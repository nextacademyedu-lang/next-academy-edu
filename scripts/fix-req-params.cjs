// Node.js script to remove `req,` from payload operations in API routes
const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  const results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results.push(...walkDir(filePath));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(filePath);
    }
  }
  return results;
}

const apiDir = path.join(__dirname, '..', 'src', 'app', 'api');
const libDir = path.join(__dirname, '..', 'src', 'lib');
const files = [...walkDir(apiDir), ...walkDir(libDir)];

let totalFixed = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Pattern: remove `req,` on its own line before `})` or after `overrideAccess: true,`
  // This handles the payload operations pattern
  content = content.replace(/(\s+overrideAccess:\s*true,)\s*\n\s*req,/g, '$1');
  
  // Pattern: remove standalone `req,` lines in payload operation objects
  // Matches lines where req is the last property before })
  content = content.replace(/,\s*\n(\s+)req,\s*\n(\s*}\))/g, ',\n$2');
  
  // Pattern: `req: rollbackReq,` lines
  content = content.replace(/\s*\n\s*req:\s*rollbackReq,/g, '');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    const relative = path.relative(path.join(__dirname, '..'), filePath);
    console.log('FIXED:', relative);
    totalFixed++;
  }
}

console.log(`\nDone! Fixed ${totalFixed} files.`);
