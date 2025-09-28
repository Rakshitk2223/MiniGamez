#!/usr/bin/env node
// Simple bundler: concatenates core files in defined order into js/bundle.js
// Run: npm run build
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const outFile = path.join(root, 'js', 'bundle.js');

const header = `// Auto-generated bundle (do not edit directly)\n// Built: ${new Date().toISOString()}\n`;
const files = [
  'js/effects.js',
  'js/engine.js',
  ...fs.readdirSync(path.join(root,'js','games')).filter(f=>f.endsWith('.js')).sort().map(f=>'js/games/'+f),
  'js/main.js'
];

function build(){
  const parts = files.map(f=>`/* ==== ${f} ==== */\n` + fs.readFileSync(path.join(root,f),'utf8'));
  fs.writeFileSync(outFile, header + parts.join('\n\n'));
  console.log('Bundle written:', outFile, '('+parts.reduce((a,p)=>a+p.length,0)+' chars)');
}

if(process.argv.includes('--watch')){
  console.log('Watching for changes...');
  build();
  files.forEach(f=> fs.watch(path.join(root,f), {persistent:true}, (evt)=>{ if(evt==='change'){ try{ build(); }catch(e){ console.error(e); } } }));
} else {
  build();
}
