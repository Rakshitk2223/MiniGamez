#!/usr/bin/env node
// Lightweight dev server with auto-rebuild + live reload injection.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '..');
const port = process.env.PORT || 5173;

// Start initial build
function runBuild(){
  return new Promise((res,rej)=>{
    const p = spawn(process.execPath, [path.join(__dirname,'build.js')], {stdio:'inherit'});
    p.on('exit', code => code===0?res():rej(new Error('build failed')));
  });
}

const clients = new Set();

function serveFile(filePath, res){
  fs.readFile(filePath, (err,data)=>{
    if(err){ res.writeHead(404); res.end('Not found'); return; }
    let ext = path.extname(filePath);
    const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml'};
    if(ext==='.html'){
      // inject live reload script
      const injected = data.toString().replace('</body>', `<script>const es=new EventSource('/__events');es.onmessage=e=>{ if(e.data==='reload') location.reload(); };</script></body>`);
      res.writeHead(200,{ 'Content-Type': types[ext]||'text/plain' });
      return res.end(injected);
    }
    res.writeHead(200,{ 'Content-Type': types[ext]||'application/octet-stream' });
    res.end(data);
  });
}

function startServer(){
  const server = http.createServer((req,res)=>{
    if(req.url === '/__events'){
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection':'keep-alive' });
      res.write('\n');
      clients.add(res);
      req.on('close', ()=> clients.delete(res));
      return;
    }
    let rel = decodeURIComponent(req.url.split('?')[0]);
    if(rel==='/' ) rel='/index.html';
    const fp = path.join(root, rel.replace(/^\//,''));
    if(!fp.startsWith(root)){ res.writeHead(403); return res.end('Forbidden'); }
    serveFile(fp,res);
  });
  server.listen(port, ()=> console.log(`Dev server http://localhost:${port}`));
}

let rebuildTimer=null;
function triggerReload(){
  clients.forEach(c=>{ try{ c.write('data: reload\n\n'); }catch(_){} });
}

function watch(){
  const watchDirs=['js','styles.css','index.html','scripts/build.js'];
  watchDirs.forEach(p=>{
    const full = path.join(root,p);
    if(fs.existsSync(full)){
      const stat = fs.statSync(full);
      if(stat.isDirectory()){
        fs.watch(full,{recursive:true}, scheduleRebuild);
      } else {
        fs.watchFile(full, scheduleRebuild);
      }
    }
  });
}

function scheduleRebuild(){
  if(rebuildTimer) clearTimeout(rebuildTimer);
  rebuildTimer=setTimeout(()=>{
    runBuild().then(()=>{ console.log('Rebuilt.'); triggerReload(); }).catch(e=> console.error(e.message));
  },120);
}

runBuild().then(()=>{ startServer(); watch(); }).catch(e=>{ console.error(e); process.exit(1); });
