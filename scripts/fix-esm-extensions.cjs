const fs = require('fs');
const path = require('path');

const root = path.join(process.cwd(), 'dist');

/**
 * Add .js extension to relative ESM imports/exports without extension
 */
function fixFile(filePath) {
  let src = fs.readFileSync(filePath, 'utf8');
  const before = src;
  // import ... from './foo'
  src = src.replace(/(from\s+['"])(\.{1,2}\/[^'"\n]+?)(['"])/g, (m, p1, spec, p3) => {
    if (/\.(js|json|mjs|cjs)$/.test(spec)) return m;
    return `${p1}${spec}.js${p3}`;
  });
  // export * from './bar'
  src = src.replace(/(export\s+\*\s+from\s+['"])(\.{1,2}\/[^'"\n]+?)(['"])/g, (m, p1, spec, p3) => {
    if (/\.(js|json|mjs|cjs)$/.test(spec)) return m;
    return `${p1}${spec}.js${p3}`;
  });
  // dynamic import('./baz')
  src = src.replace(/(import\(\s*['"])(\.{1,2}\/[^'"\n]+?)(['"]\s*\))/g, (m, p1, spec, p3) => {
    if (/\.(js|json|mjs|cjs)$/.test(spec)) return m;
    return `${p1}${spec}.js${p3}`;
  });
  if (src !== before) {
    fs.writeFileSync(filePath, src, 'utf8');
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.isFile() && p.endsWith('.js')) fixFile(p);
  }
}

if (fs.existsSync(root)) walk(root);
console.log('fix-esm-extensions: done');


