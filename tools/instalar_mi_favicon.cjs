// Instala el favicon personal sin reemplazar el sitio ni el backend.
// Necesita Node.js y se ejecuta desde la raiz del proyecto Cloudflare.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();
const targets = ['public/index.html', 'public/plantilla.html', 'public/static/admin.html'];
const assets = ['favicon.ico', 'favicon-16.png', 'favicon-32.png', 'favicon-48.png',
  'apple-touch-icon.png', 'android-chrome-192x192.png', 'android-chrome-512x512.png'];
if (!fs.existsSync(path.join(root,'wrangler.jsonc'))) {
  console.error('ERROR: Copia los archivos a la carpeta del proyecto donde esta wrangler.jsonc.');
  process.exit(1);
}
for (const filename of targets.concat(assets.map(n => 'public/'+n))) {
  if (!fs.existsSync(path.join(root, filename))) {
    console.error('ERROR: Falta ' + filename + '. Copia todo el contenido del ZIP.');
    process.exit(1);
  }
}
const v='jm-custom-20261104';
const begin='<!-- JERATH-FAVICON:INICIO -->';
const end='<!-- JERATH-FAVICON:FIN -->';
const snippet = [
  begin,
  `<link rel="icon" type="image/x-icon" href="/favicon.ico?v=${v}">`,
  `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png?v=${v}">`,
  `<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png?v=${v}">`,
  `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=${v}">`,
  end
].join('\n');
const backups = path.join(root, '.respaldo_icono_personal');
fs.mkdirSync(backups, {recursive:true});
let changed=0;
for (const rel of targets) {
  const file=path.join(root,rel);
  let html=fs.readFileSync(file,'utf8');
  if (!/<\/title\s*>/i.test(html)) {
    console.error('ERROR: No encuentro la etiqueta title en '+rel);
    process.exit(1);
  }
  // Remove previous block and any existing favicon declarations to prevent overriding.
  const oldBlock = /<!--[ \t]*JERATH-FAVICON:INICIO[ \t]*-->[\s\S]*?<!--[ \t]*JERATH-FAVICON:FIN[ \t]*-->/gi;
  html=html.replace(oldBlock,'');
  html=html.replace(/<link\b[^>]*>/gi, tag => {
    const m=tag.match(/\brel\s*=\s*(["'])([^"']+)\1/i);
    return m && /(?:^|\s)(?:icon|shortcut\s+icon|apple-touch-icon)(?:\s|$)/i.test(m[2]) ? '' : tag;
  });
  const next=html.replace(/<\/title\s*>/i,match=>match+'\n'+snippet);
  const backup=path.join(backups,rel.replace(/[\\/]/g,'_')+'.backup.html');
  if(!fs.existsSync(backup))fs.copyFileSync(file,backup);
  fs.writeFileSync(file,next,'utf8');
  changed++;
  console.log('OK: '+rel);
}
console.log('\nIcono personal instalado en '+changed+' paginas.');
console.log('Ejecuta ACTUALIZAR_CLOUDFLARE_CORREGIDO.bat para publicar.');
