const fs = require('fs');
const path = require('path');

const apiSrc = fs.readFileSync('d:/projects/nextacademy/evidence/api_src.txt', 'utf8');
const colSrc = fs.readFileSync('d:/projects/nextacademy/evidence/col_src.txt', 'utf8');

const parseFiles = (text) => {
  return text.split('\n--- FILE: ').filter(x => x.trim()).map(block => {
    const lines = block.split('\n');
    const filePath = lines[0].split(' ---')[0].trim();
    const content = lines.slice(1).join('\n');
    return { filePath, content };
  });
};

const customRoutes = parseFiles(apiSrc);
const collections = parseFiles(colSrc);

let md = `# API_CATALOG.md\n\n`;
md += `**Commit SHA**: 66f0b3952b7aaef0f2274648d69e3fd125aa0d9e\n`;
md += `**Generated at**: ${new Date().toISOString()} (UTC) / ${new Date(Date.now() + 2*3600*1000).toISOString().replace('Z', '+02:00')} (Cairo)\n`;
md += `**Audit scope**: API contracts, RBAC mappings, Collection hooks\n`;
md += `**Verification status**: Unverified\n\n`;

md += `## 1. Custom Next Routes\n\n`;
md += `| Endpoint | Auth Method | Required Role | Collections R/W | Side Effects | Source File |\n`;
md += `|----------|-------------|---------------|-----------------|--------------|-------------|\n`;

customRoutes.forEach(route => {
  const code = route.content;
  const p = route.filePath.replace(/\\/g, '/');
  const endpointMatch = p.match(/src\/app\/api\/(.*)\/route\.ts/);
  const endpoint = endpointMatch ? `/api/${endpointMatch[1]}` : p;
  
  let auth = 'Public';
  if (code.includes('payload.auth') || code.includes('authenticateRequestUser')) auth = 'Payload JWT/Cookie';
  
  let role = 'Any';
  if (code.includes('isAdminViewer') || code.includes('role === \'admin\'')) role = 'Admin';
  else if (code.includes('resolveB2BScope')) role = 'B2B Manager/Admin';
  else if (auth !== 'Public') role = 'Authenticated User';

  let cols = new Set();
  const colMatches = code.match(/collection:\s*'([^']+)'/g);
  if (colMatches) colMatches.forEach(m => cols.add(m.split("'")[1]));
  
  let sideFX = [];
  if (code.includes('Resend')) sideFX.push('Email (Resend)');
  if (code.includes('enqueueCrmSyncEvent')) sideFX.push('CRM Sync');
  if (code.includes('atomicIncrement')) sideFX.push('Atomic DB Inc');
  if (code.includes('processSuccessfulPayment')) sideFX.push('Payment Process');

  const cReadWrite = Array.from(cols).join(', ') || 'None';
  const cSideFx = sideFX.join(', ') || 'None';
  
  md += `| \`${endpoint}\` | ${auth} | ${role} | ${cReadWrite} | ${cSideFx} | \`${endpointMatch ? endpointMatch[1] + '/route.ts' : 'Unknown'}\` |\n`;
});

md += `\n## 2. Payload Auto Endpoints\n\n`;
md += `| Endpoint | Auth Rule Source | Collections R/W | Side Effects (Hooks) | Source File |\n`;
md += `|----------|------------------|-----------------|----------------------|-------------|\n`;

let totalEndpoints = customRoutes.length;

collections.forEach(col => {
  const code = col.content;
  const p = col.filePath.replace(/\\/g, '/');
  const slugMatch = code.match(/slug:\s*'([^']+)'/);
  if (!slugMatch) return;
  const slug = slugMatch[1];
  
  const endpoints = ['GET', 'POST', 'PATCH', 'DELETE'].map(m => `\`${m} /api/${slug}\``).join('<br>');
  totalEndpoints += 4;
  
  let authSource = 'Public (Default)';
  const accessMatch = code.match(/access:\s*{([^}]+)}/);
  if (accessMatch) {
    const rules = Array.from(new Set(accessMatch[1].match(/(isAdmin|isPublic|isAuthenticated|isAdminOrOwner|isAdminOrB2BManager|isAdminOrOwnInstructor)/g) || []));
    authSource = rules.length ? rules.join(', ') : 'Custom Inline';
  } else if (code.includes('../lib/access-control.ts')) {
    authSource = 'access-control.ts methods';
  }

  let hooksFX = [];
  if (code.includes('enqueueCrmSyncEvent')) hooksFX.push('CRM Sync');
  if (code.includes('Resend')) hooksFX.push('Email');
  if (code.includes('addAttendeeToAllEvents')) hooksFX.push('Google Calendar');

  const sideFx = hooksFX.join(', ') || 'None';
  const fileName = p.split('/').pop();
  
  md += `| /api/${slug} (CRUD) | ${authSource} | Self (\`${slug}\`) | ${sideFx} | \`${fileName}\` |\n`;
});

fs.writeFileSync('d:/projects/nextacademy/evidence/API_CATALOG.md', md);
fs.writeFileSync('d:/projects/nextacademy/evidence/Phase1_Summary.txt', `Total Endpoints Covered: ${totalEndpoints}`);
