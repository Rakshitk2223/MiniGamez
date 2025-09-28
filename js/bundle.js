// Auto-generated bundle (do not edit directly)
// Built: 2025-09-28T11:33:37.325Z
/* ==== js/effects.js ==== */
// Simple sound & particle effects utility
(function(){
  const AudioCtx = window.AudioContext || window.webkitAudioContext; let ctx; function ensure(){ if(!ctx){ try{ ctx=new AudioCtx(); }catch(e){} } }
  const lastPlay = {}; const cooldown=40; // ms minimal between identical sounds
  const presets = {
    eat:[440,0.09], hit:[220,0.06], score:[660,0.12], success:[520,0.18], fail:[120,0.25], over:[80,0.4], win:[740,0.4], jump:[360,0.1], shoot:[800,0.08], beep:[600,0.08], drop:[300,0.07], reveal:[260,0.04], error:[200,0.05]
  };
  function playSound(name){ const p=presets[name]; if(!p) return; const now=performance.now(); if(lastPlay[name] && now-lastPlay[name]<cooldown) return; lastPlay[name]=now; ensure(); if(!ctx) return; const [freq,dur]=p; const o=ctx.createOscillator(); const g=ctx.createGain(); o.frequency.value=freq; o.type='sine'; o.connect(g); g.connect(ctx.destination); const t=ctx.currentTime; g.gain.setValueAtTime(0.001,t); g.gain.exponentialRampToValueAtTime(0.4,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.start(t); o.stop(t+dur); }

  function spawnParticles(root, opts={}){ const host = root; if(!host) return; host.classList.add('effects-host'); const count= opts.count|| 18; const colors=opts.colors||['#6ccfff','#8aff80','#ffbe0b','#ff6b6b']; const rect= host.getBoundingClientRect(); const cx= rect.width/2, cy= rect.height/2; for(let i=0;i<count;i++){ const el=document.createElement('div'); el.className='particle'; const ang=Math.random()*Math.PI*2; const dist= 40+Math.random()*140; const x = cx + Math.cos(ang)*dist; const y = cy + Math.sin(ang)*dist; const size=4+Math.random()*6; el.style.background= colors[i%colors.length]; el.style.width=el.style.height=size+'px'; el.style.left=cx+'px'; el.style.top=cy+'px'; host.appendChild(el); requestAnimationFrame(()=>{ el.style.transform=`translate(${x-cx}px,${y-cy}px) scale(0)`; el.style.opacity='0'; }); setTimeout(()=> el.remove(), 900+Math.random()*400); }
  }

  window.playSound = playSound; window.spawnParticles = spawnParticles;
})();


/* ==== js/engine.js ==== */
// Simple mini game engine to reduce repetition across games
// Provides: WebArcade.createGame(gameId, setupFn)
// setupFn receives ({ root, canvas, ctx, keys, loop, onDestroy, start, stop, width, height })
// and returns optional API merged into the game object.
(function(){
  window.WebArcade = window.WebArcade || {};

  const RAF = window.requestAnimationFrame.bind(window);

  function createGame(gameId, setupFn, opts={}){
    const root = typeof opts.root === 'object' ? opts.root : document.createElement('div');
    const width = opts.width || 400;
    const height = opts.height || 400;
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height; canvas.className = 'canvas';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const keys = new Set();
    function keydown(e){ keys.add(e.key); if(onKey) onKey(e,true); }
    function keyup(e){ keys.delete(e.key); if(onKey) onKey(e,false); }
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);

    let destroyed = false;
    let running = true;
    let lastTime = performance.now();
    let accumulator = 0;
    const timestep = opts.timestep || 1000/60; // fixed logic step

    let onUpdate = null, onRender = null, onKey = null;
    const cleanupFns = [];

    function onDestroy(fn){ if(typeof fn==='function') cleanupFns.push(fn); }

    function loop(now){
      if(destroyed) return;
      if(running){
        const dt = now - lastTime; lastTime = now; accumulator += dt;
        while(accumulator >= timestep){ if(onUpdate) onUpdate(timestep/1000); accumulator -= timestep; }
        if(onRender) onRender();
      }
      RAF(loop);
    }
    RAF(loop);

    function start(){ running = true; }
    function stop(){ running = false; }

    const api = setupFn({ root, canvas, ctx, keys, onDestroy, start, stop, width, height, setHandlers });

    function setHandlers(h){ if(!h) return; onUpdate = h.update || onUpdate; onRender = h.render || onRender; onKey = h.key || onKey; }

    if(api && api.handlers) setHandlers(api.handlers);

    function destroy(){
      if(destroyed) return;
      destroyed = true; running=false;
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
      cleanupFns.forEach(fn=>{ try{ fn(); }catch(e){} });
      if(root && root.parentNode && opts.autoRemove !== false){ root.parentNode.removeChild(root); }
    }

    return Object.assign({ destroy, root, canvas, ctx, keys, start, stop }, api || {});
  }

  WebArcade.createGame = createGame;
})();


/* ==== js/games/2048.js ==== */
(function(){
  window.WebArcade = window.WebArcade || {};
  function G2048(root){
    const size=4; let grid=[...Array(size)].map(()=>Array(size).fill(0)); const wrap=document.createElement('div'); const gEl=document.createElement('div'); gEl.className='tw-grid'; const info=document.createElement('div'); info.className='controls'; wrap.appendChild(info); wrap.appendChild(gEl); root.appendChild(wrap);
    function add(){ const empt=[]; for(let r=0;r<size;r++) for(let c=0;c<size;c++) if(grid[r][c]===0) empt.push([r,c]); if(empt.length){ const [r,c]=empt[(Math.random()*empt.length)|0]; grid[r][c]= Math.random()<0.9?2:4; }}
    function render(){ gEl.innerHTML=''; for(let r=0;r<size;r++) for(let c=0;c<size;c++){ const v=grid[r][c]; const cell=document.createElement('div'); cell.className='tw-cell'; cell.textContent=v||''; cell.style.background = v? `hsl(${(Math.log2(v)*30)%360},60%,30%)` : ''; gEl.appendChild(cell);} info.textContent='Use arrows to move'; }
    function move(dir){ let moved=false; const range=[0,1,2,3]; const rev=[3,2,1,0]; const rows = (dir==='left'||dir==='right'); for(let i=0;i<4;i++){ const idxs = dir==='left'||dir==='up'?range:rev; const line=[]; for(let j=0;j<4;j++){ const r= rows? i : idxs[j]; const c= rows? idxs[j] : i; const v=grid[r][c]; if(v) line.push(v); grid[r][c]=0; }
  for(let j=0;j<line.length-1;j++){ if(line[j]===line[j+1]){ line[j]*=2; line.splice(j+1,1); if(typeof playSound==='function') playSound('score'); }}
      for(let j=0;j<line.length;j++){ const r= rows? i : (dir==='up'? j : 3-j); const c= rows? (dir==='left'? j : 3-j) : i; if(grid[r][c]!==line[j]) moved=true; grid[r][c]=line[j]; }
    }
    if(moved){ add(); render(); if(checkOver()) info.textContent='Game Over'; }
    }
    function checkOver(){ for(let r=0;r<4;r++) for(let c=0;c<4;c++){ if(grid[r][c]===0) return false; const v=grid[r][c]; if(grid[r+1]&&grid[r+1][c]===v) return false; if(grid[r][c+1]===v) return false; } return true; }
    function key(e){ const k=e.key; if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(k)){ e.preventDefault(); move(k.replace('Arrow','').toLowerCase()); } }
    window.addEventListener('keydown',key);
    add(); add(); render();
    return { destroy(){ window.removeEventListener('keydown',key); root.innerHTML=''; } };
  }
  WebArcade['2048'] = root => G2048(root);
})();


/* ==== js/games/breakout.js ==== */
(function(){
  window.WebArcade = window.WebArcade || {};
  function Breakout(root){
    const c=document.createElement('canvas'); c.width=520; c.height=360; c.className='canvas'; root.appendChild(c);
    const x=c.getContext('2d');
    let paddle={x:220,w:80,h:12}, ball={x:260,y:300,vx:3,vy:-3,r:6}, bricks=[], cols=10, rows=5, bw=48, bh=16, gap=6, left=false,right=false, loop, score=0;
    for(let r=0;r<rows;r++) for(let c0=0;c0<cols;c0++) bricks.push({x:10+c0*(bw+gap), y:40+r*(bh+gap), alive:true});
    function tick(){
      if(left) paddle.x=Math.max(6,paddle.x-6); if(right) paddle.x=Math.min(c.width-paddle.w-6,paddle.x+6);
      ball.x+=ball.vx; ball.y+=ball.vy;
      if(ball.x<6||ball.x>c.width-6) ball.vx*=-1; if(ball.y<6) ball.vy*=-1;
  if(ball.y>c.height){ x.fillStyle='#ff6b6b'; x.fillText('Game Over - R to restart',160,180); if(typeof playSound==='function') playSound('over'); return; }
      // paddle
  if(ball.y>c.height-40 && ball.x>paddle.x && ball.x<paddle.x+paddle.w && ball.vy>0){ ball.vy*=-1; ball.vx += (ball.x-(paddle.x+paddle.w/2))*0.05; if(typeof playSound==='function') playSound('hit'); }
      // bricks
  bricks.forEach(b=>{ if(!b.alive) return; if(ball.x>b.x && ball.x<b.x+bw && ball.y>b.y && ball.y<b.y+bh){ b.alive=false; ball.vy*=-1; score++; if(typeof playSound==='function') playSound('score'); if(typeof spawnParticles==='function') spawnParticles(c,{count:10,colors:['#2a9d8f','#6cf']}); }});
      // draw
      x.fillStyle='#000'; x.fillRect(0,0,c.width,c.height);
      x.fillStyle='#6cf'; x.fillRect(paddle.x,c.height-24,paddle.w,paddle.h);
      x.fillStyle='#fff'; x.beginPath(); x.arc(ball.x,ball.y,ball.r,0,Math.PI*2); x.fill();
      bricks.forEach(b=>{ if(b.alive){ x.fillStyle='#2a9d8f'; x.fillRect(b.x,b.y,bw,bh); }});
      x.fillStyle='#fff'; x.font='14px monospace'; x.fillText('Score: '+score,10,18);
  if(bricks.every(b=>!b.alive)){ x.fillText('You Win!', 220, 180); if(typeof playSound==='function') playSound('win'); }
    }
    function key(e){ if(e.type==='keydown'){ if(e.key==='ArrowLeft'||e.key==='a') left=true; if(e.key==='ArrowRight'||e.key==='d') right=true; if(e.key==='r') location.reload(); } else { if(e.key==='ArrowLeft'||e.key==='a') left=false; if(e.key==='ArrowRight'||e.key==='d') right=false; } }
    window.addEventListener('keydown',key); window.addEventListener('keyup',key);
    loop=setInterval(tick,16);
    return { destroy(){ clearInterval(loop); window.removeEventListener('keydown',key); window.removeEventListener('keyup',key); root.innerHTML=''; } };
  }
  WebArcade.breakout = root => Breakout(root);
})();


/* ==== js/games/connect4.js ==== */
(function(){
  window.WebArcade = window.WebArcade || {};
  function Connect4(root){
    const W=7,H=6; const board=[...Array(H)].map(()=>Array(W).fill(0)); let turn=1; const el=document.createElement('div'); const info=document.createElement('div'); info.className='controls'; info.textContent='Red starts'; const grid=document.createElement('div'); grid.className='c4-board'; el.appendChild(grid); root.appendChild(info); root.appendChild(el);
    function render(){ grid.innerHTML=''; for(let r=0;r<H;r++) for(let c=0;c<W;c++){ const cell=document.createElement('div'); cell.className='c4-cell'; const chip=document.createElement('div'); const v=board[r][c]; if(v){ chip.className='c4-chip '+(v===1?'red':'yellow'); cell.appendChild(chip);} cell.addEventListener('click',()=>drop(c)); grid.appendChild(cell);} }
  function drop(c){ for(let r=H-1;r>=0;r--){ if(board[r][c]===0){ board[r][c]=turn; if(typeof playSound==='function') playSound('drop'); if(check(r,c,turn)){ info.textContent=(turn===1?'Red':'Yellow')+' wins!'; grid.style.pointerEvents='none'; if(typeof playSound==='function') playSound('win'); if(typeof spawnParticles==='function') spawnParticles(grid,{count:32}); } else { turn = 3-turn; info.textContent=(turn===1?'Red':'Yellow')+"'s turn"; } render(); return; } } }
    function check(r,c,v){ const dirs=[[1,0],[0,1],[1,1],[1,-1]]; return dirs.some(([dr,dc])=>{ let cnt=1; for(let s=1;s<4;s++){ const rr=r+dr*s, cc=c+dc*s; if(board[rr]&&board[rr][cc]===v) cnt++; else break; } for(let s=1;s<4;s++){ const rr=r-dr*s, cc=c-dc*s; if(board[rr]&&board[rr][cc]===v) cnt++; else break; } return cnt>=4; }); }
    render();
    return { destroy(){ root.innerHTML=''; } };
  }
  WebArcade.connect4 = root => Connect4(root);
})();


/* ==== js/games/doodle.js ==== */
(function(){
  window.WebArcade = window.WebArcade || {};
  function Doodle(root){
    const c=document.createElement('canvas'); c.width=320; c.height=480; c.className='canvas'; root.appendChild(c); const x=c.getContext('2d');
    let player={x:150,y:400,vy:0}, plat=[], left=false,right=false, score=0, loop;
    for(let i=0;i<8;i++) plat.push({x:Math.random()*260,y: i*60, w:60});
    function tick(){ player.vy+=0.3; player.y+=player.vy; if(left) player.x-=4; if(right) player.x+=4; player.x=Math.max(0,Math.min(300,player.x));
      if(player.y<240){ const dy=240-player.y; player.y=240; plat.forEach(p=> p.y+=dy); score+=Math.floor(dy); }
  plat.forEach(p=>{ if(player.vy>0 && player.x+20>p.x && player.x<p.x+p.w && player.y+20>p.y && player.y+20<p.y+10){ player.vy=-8; if(typeof playSound==='function') playSound('jump'); }});
      plat.forEach(p=>{ if(p.y>480){ p.y=-20; p.x=Math.random()*260; }});
  if(player.y>500){ x.fillStyle='#ff6b6b'; x.fillText('Game Over - R', 110, 220); if(typeof playSound==='function') playSound('over'); return; }
      x.fillStyle='#000'; x.fillRect(0,0,c.width,c.height); x.fillStyle='#6cf'; x.fillRect(player.x,player.y,20,20); x.fillStyle='#8aff80'; plat.forEach(p=> x.fillRect(p.x,p.y,p.w,8)); x.fillStyle='#fff'; x.fillText('Score: '+score,10,20);
    }
    function key(e){ if(e.type==='keydown'){ if(e.key==='ArrowLeft'||e.key==='a') left=true; if(e.key==='ArrowRight'||e.key==='d') right=true; if(e.key==='r') location.reload(); } else { if(e.key==='ArrowLeft'||e.key==='a') left=false; if(e.key==='ArrowRight'||e.key==='d') right=false; } }
    window.addEventListener('keydown',key); window.addEventListener('keyup',key);
    loop=setInterval(tick,16);
    return { destroy(){ clearInterval(loop); window.removeEventListener('keydown',key); window.removeEventListener('keyup',key); root.innerHTML=''; } };
  }
  WebArcade.doodle = root => Doodle(root);
})();


/* ==== js/games/flappy.js ==== */
(function(){
  window.WebArcade = window.WebArcade || {};
  function Flappy(root){
    const c=document.createElement('canvas'); c.width=400; c.height=500; c.className='canvas'; root.appendChild(c);
    const x=c.getContext('2d');
    let y=200, vy=0, g=0.5, pipes=[], t=0, score=0, alive=true, loop;
  function flap(){ if(alive){ vy=-8; if(typeof playSound==='function') playSound('jump'); } }
    function addPipe(){ const gap=120; const top=50+Math.random()*250; pipes.push({x:c.width, top:top- gap/2, bottom: top+gap/2}); }
    function tick(){
      if(!alive){ x.fillStyle='#ff6b6b'; x.font='16px monospace'; x.fillText('Game Over - Press R', 120, 240); return; }
      t++; if(t%90===0) addPipe();
      vy+=g; y+=vy; if(y<0) y=0; if(y>c.height) alive=false;
      pipes.forEach(p=>{ p.x-=3; }); pipes = pipes.filter(p=>p.x>-60);
  pipes.forEach(p=>{ if(p.x<60 && p.x>20){ if(y<p.top || y>p.bottom){ alive=false; if(typeof playSound==='function') playSound('over'); } } if(p.x===60){ score++; if(typeof playSound==='function') playSound('score'); }});
      x.fillStyle='#001'; x.fillRect(0,0,c.width,c.height);
      x.fillStyle='#8aff80'; pipes.forEach(p=>{ x.fillRect(p.x,0,50,p.top); x.fillRect(p.x,p.bottom,50,c.height-p.bottom); });
      x.fillStyle='#6cf'; x.beginPath(); x.arc(50,y,10,0,Math.PI*2); x.fill();
      x.fillStyle='#fff'; x.fillText('Score: '+score, 10, 20);
    }
    function key(e){ if(e.type==='keydown'){ if(e.key===' '||e.key==='ArrowUp') flap(); if(e.key==='r') { location.reload(); } } }
    window.addEventListener('keydown',key);
    loop=setInterval(tick,16);
    return { destroy(){ clearInterval(loop); window.removeEventListener('keydown',key); root.innerHTML=''; } };
  }
  WebArcade.flappy = root => Flappy(root);
})();


/* ==== js/games/invaders.js ==== */
(function(){
  window.WebArcade = window.WebArcade || {};
  function Invaders(root){
    const c=document.createElement('canvas'); c.width=520; c.height=360; c.className='canvas'; root.appendChild(c); const x=c.getContext('2d');
    let ship={x:240}, left=false,right=false, bullets=[], enemies=[], dir=1, step=0, loop;
    for(let r=0;r<4;r++) for(let col=0;col<10;col++) enemies.push({x:40+col*40, y:40+r*30, alive:true});
    function shoot(){ bullets.push({x:ship.x+20,y:300}); }
    function tick(){ step++; if(left) ship.x-=4; if(right) ship.x+=4; ship.x=Math.max(10,Math.min(490,ship.x));
      if(step%30===0){ let edge=false; enemies.forEach(e=>{ if(e.alive){ e.x+=10*dir; if(e.x<10||e.x>500) edge=true; }}); if(edge){ dir*=-1; enemies.forEach(e=>{ if(e.alive) e.y+=16; }); } }
      bullets=bullets.map(b=>({x:b.x,y:b.y-6})).filter(b=>b.y>0);
  enemies.forEach(e=>{ if(!e.alive) return; bullets.forEach(b=>{ if(Math.abs(b.x-(e.x+10))<12 && Math.abs(b.y-(e.y+6))<12){ e.alive=false; b.y=-999; if(typeof playSound==='function') playSound('hit'); if(typeof spawnParticles==='function') spawnParticles(c,{count:12,colors:['#8aff80','#6cf']}); } }); });
      x.fillStyle='#000'; x.fillRect(0,0,c.width,c.height); x.fillStyle='#6cf'; x.fillRect(ship.x,320,40,8);
      x.fillStyle='#fff'; bullets.forEach(b=> x.fillRect(b.x, b.y, 2, 6));
      x.fillStyle='#8aff80'; enemies.forEach(e=>{ if(e.alive) x.fillRect(e.x,e.y,20,12); });
  if(enemies.every(e=>!e.alive)) { x.fillStyle='#fff'; x.fillText('You Win!', 220, 180); if(typeof playSound==='function') playSound('win'); }
    }
    function key(e){ if(e.type==='keydown'){ if(e.key==='ArrowLeft'||e.key==='a') left=true; if(e.key==='ArrowRight'||e.key==='d') right=true; if(e.key===' ' ) shoot(); } else { if(e.key==='ArrowLeft'||e.key==='a') left=false; if(e.key==='ArrowRight'||e.key==='d') right=false; } }
    window.addEventListener('keydown',key); window.addEventListener('keyup',key);
    loop=setInterval(tick,16);
    return { destroy(){ clearInterval(loop); window.removeEventListener('keydown',key); window.removeEventListener('keyup',key); root.innerHTML=''; } };
  }
  WebArcade.invaders = root => Invaders(root);
})();


/* ==== js/games/memory.js ==== */
(function(){
  window.WebArcade = window.WebArcade || {};
  function Memory(root){
    const icons=['🍎','🍌','🍇','🍓','🥝','🍑','🍍','🥥'];
    const deck=[...icons,...icons].sort(()=>Math.random()-0.5);
    const grid=document.createElement('div'); grid.className='memory-grid';
    const info=document.createElement('div'); info.className='controls'; info.textContent='Find all pairs!';
    root.appendChild(info); root.appendChild(grid);
    let first=null, lock=false, matched=0;
    deck.forEach((v,i)=>{
      const card=document.createElement('div'); card.className='memory-card'; card.dataset.value=v; card.textContent='?';
      card.addEventListener('click',()=>{
        if(lock||card.classList.contains('matched')||card.classList.contains('revealed')) return;
        card.classList.add('revealed'); card.textContent=v;
        if(!first){ first=card; }
        else {
          if(first.dataset.value===v){ first.classList.add('matched'); card.classList.add('matched'); matched+=2; if(typeof playSound==='function') playSound('success'); if(typeof spawnParticles==='function') spawnParticles(grid,{count:16}); if(matched===deck.length){ info.textContent='You win!'; if(typeof playSound==='function') playSound('win'); } first=null; }
          else { lock=true; setTimeout(()=>{ first.classList.remove('revealed'); card.classList.remove('revealed'); first.textContent='?'; card.textContent='?'; first=null; lock=false; },700); }
        }
      });
      grid.appendChild(card);
    });
    return { destroy(){ root.innerHTML=''; } };
  }
  WebArcade.memory = root => Memory(root);
})();


/* ==== js/games/minesweeper.js ==== */
(function(){
  window.WebArcade = window.WebArcade || {};
  function Minesweeper(root){
    const size=8, mines=10; const grid=document.createElement('div'); grid.className='grid'; grid.style.gridTemplateColumns=`repeat(${size}, 28px)`; const info=document.createElement('div'); info.className='controls'; root.appendChild(info); root.appendChild(grid);
    const cells=[]; let revealed=0, ended=false; 
    const board=[...Array(size)].map(()=>Array(size).fill(0));
    // place mines
    let placed=0; while(placed<mines){ const r=(Math.random()*size)|0,c=(Math.random()*size)|0; if(board[r][c]!==-1){ board[r][c]=-1; placed++; for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){ if(board[r+dr]&&board[r+dr][c+dc]!=null && board[r+dr][c+dc]!==-1) board[r+dr][c+dc]++; } } }
  function reveal(r,c){ const cell=cells[r*size+c]; if(!cell||cell.classList.contains('revealed')||ended) return; cell.classList.add('revealed'); revealed++; if(typeof playSound==='function') playSound('reveal'); if(board[r][c]===-1){ cell.classList.add('mine'); cell.textContent='💣'; end(false); return; } cell.textContent= board[r][c]||''; if(board[r][c]===0){ for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) if(dr||dc) reveal(r+dr,c+dc); }
      if(revealed===size*size-mines) end(true);
    }
  function end(win){ ended=true; info.textContent= win? 'You win!' : 'Boom!'; if(typeof playSound==='function') playSound(win?'win':'fail'); if(win && typeof spawnParticles==='function') spawnParticles(grid,{count:40}); }
    for(let r=0;r<size;r++) for(let c0=0;c0<size;c0++){ const b=document.createElement('div'); b.className='cell'; b.addEventListener('click',()=>reveal(r,c0)); grid.appendChild(b); cells.push(b);} 
    info.textContent='Reveal all safe cells';
    return { destroy(){ root.innerHTML=''; } };
  }
  WebArcade.minesweeper = root => Minesweeper(root);
})();


/* ==== js/games/pacman.js ==== */
(function(){
  window.WebArcade = window.WebArcade || {};
  function Pacman(root){
    const map=[
      '###################',
      '#........#........#',
      '#.###.##.#.##.###.#',
      '#*# #........# #*#',
      '#.###.#.###.#.###.#',
      '#.....#.....#.....#',
      '#####.#.###.#.#####',
      '#####.#.....#.#####',
      '#.....### ###.....#',
      '#.###........#.###.#',
      '#........P........#',
      '###################'
    ];
    const rows=map.length, cols=map[0].length; const grid=document.createElement('div'); grid.className='pac-grid'; const info=document.createElement('div'); info.className='controls'; let px=0,py=0, dots=0;
    for(let r=0;r<rows;r++) for(let c0=0;c0<cols;c0++){ const ch=map[r][c0]; const div=document.createElement('div'); div.className='pac-cell'; if(ch==='#') div.classList.add('wall'); if(ch==='.'||ch==='*'){ div.classList.add('dot'); dots++; } if(ch==='P'){ px=c0; py=r; }
      grid.appendChild(div);
    }
    root.appendChild(info); root.appendChild(grid);
    function idx(r,c){ return r*cols+c; }
    function draw(){ [...grid.children].forEach((cell,i)=>{ cell.style.outline='none'; }); const pCell=grid.children[idx(py,px)]; pCell.style.outline='2px solid #ff0'; info.textContent=`Dots left: ${dots}. Use arrows.`; }
  function move(dx,dy){ const nx=px+dx, ny=py+dy; const cell=grid.children[idx(ny,nx)]; if(!cell||cell.classList.contains('wall')) return; px=nx; py=ny; if(cell.classList.contains('dot')){ cell.classList.remove('dot'); dots--; if(typeof playSound==='function') playSound('eat'); if(dots===0){ info.textContent='You cleared all dots!'; if(typeof playSound==='function') playSound('win'); if(typeof spawnParticles==='function') spawnParticles(grid,{count:60}); } } draw(); }
    function key(e){ if(e.key==='ArrowLeft') move(-1,0); if(e.key==='ArrowRight') move(1,0); if(e.key==='ArrowUp') move(0,-1); if(e.key==='ArrowDown') move(0,1); }
    window.addEventListener('keydown',key);
    draw();
    return { destroy(){ window.removeEventListener('keydown',key); root.innerHTML=''; } };
  }
  WebArcade.pacman = root => Pacman(root);
})();


/* ==== js/games/pong.js ==== */
(function(){
  window.WebArcade = window.WebArcade || {};
  function Pong(root){
    const c=document.createElement('canvas'); c.width=520; c.height=320; c.className='canvas'; root.appendChild(c);
    const x=c.getContext('2d');
    let p1={y:120,h:80,score:0}, p2={y:120,h:80,score:0}, ball={x:260,y:160,vx:3,vy:2,r:6};
    let up=false,down=false,loop;
    function reset(){ ball.x=260; ball.y=160; ball.vx=3*(Math.random()>0.5?1:-1); ball.vy=2*(Math.random()>0.5?1:-1); }
    function tick(){
      // move
      if(up) p1.y=Math.max(0,p1.y-5); if(down) p1.y=Math.min(c.height-p1.h,p1.y+5);
      // simple AI
      const target=ball.y-40; p2.y += Math.sign(target-p2.y)*3; p2.y=Math.max(0,Math.min(c.height-p2.h,p2.y));
      ball.x+=ball.vx; ball.y+=ball.vy;
      if(ball.y<0||ball.y>c.height) { ball.vy*=-1; ball.y=Math.max(0,Math.min(c.height,ball.y)); }
      // collision
  if(ball.x<20 && ball.y>p1.y && ball.y<p1.y+p1.h){ ball.vx*=-1.05; ball.x=20; ball.vy += (ball.y-(p1.y+p1.h/2))*0.03; if(typeof playSound==='function') playSound('hit'); }
  if(ball.x>c.width-20 && ball.y>p2.y && ball.y<p2.y+p2.h){ ball.vx*=-1.05; ball.x=c.width-20; ball.vy += (ball.y-(p2.y+p2.h/2))*0.03; if(typeof playSound==='function') playSound('hit'); }
      // score
  if(ball.x<-10){ p2.score++; if(typeof playSound==='function') playSound('score'); reset(); }
  if(ball.x>c.width+10){ p1.score++; if(typeof playSound==='function') playSound('score'); reset(); }
      // draw
      x.fillStyle='#000'; x.fillRect(0,0,c.width,c.height);
      x.fillStyle='#fff'; x.fillRect(10,p1.y,8,p1.h); x.fillRect(c.width-18,p2.y,8,p2.h);
      x.beginPath(); x.arc(ball.x,ball.y,ball.r,0,Math.PI*2); x.fill();
      x.font='16px monospace'; x.fillText(p1.score, c.width/2-30, 20); x.fillText(p2.score, c.width/2+20, 20);
    }
    function key(e){ if(e.type==='keydown'){ if(e.key==='ArrowUp' || e.key==='w') up=true; if(e.key==='ArrowDown'|| e.key==='s') down=true; } else { if(e.key==='ArrowUp'||e.key==='w') up=false; if(e.key==='ArrowDown'||e.key==='s') down=false; } }
    window.addEventListener('keydown',key); window.addEventListener('keyup',key);
    loop=setInterval(tick, 16);
    return { destroy(){ clearInterval(loop); window.removeEventListener('keydown',key); window.removeEventListener('keyup',key); root.innerHTML=''; } };
  }
  WebArcade.pong = root => Pong(root);
})();


/* ==== js/games/simon.js ==== */
(function(){
  window.WebArcade = window.WebArcade || {};
  function Simon(root){
    const colors=['red','green','blue','yellow'];
    const grid=document.createElement('div'); grid.className='simon-grid';
    const info=document.createElement('div'); info.className='controls';
    const btns=colors.map(c=>{ const b=document.createElement('button'); b.className='simon-btn '+c; grid.appendChild(b); return b; });
    root.appendChild(info); root.appendChild(grid);
    let seq=[], step=0, playing=false;
    function playSeq(){ playing=true; step=0; let i=0; info.textContent=`Level ${seq.length}`; const iv=setInterval(()=>{ if(i>=seq.length){ clearInterval(iv); playing=false; return; } flash(seq[i++]); },600); }
    function flash(idx){ const b=btns[idx]; b.classList.add('active'); setTimeout(()=>b.classList.remove('active'),300); }
  function next(){ seq.push(Math.floor(Math.random()*4)); if(typeof playSound==='function') playSound('beep'); playSeq(); }
    btns.forEach((b,i)=> b.addEventListener('click',()=>{
      if(playing) return; flash(i);
  if(i===seq[step]){ if(typeof playSound==='function') playSound('success'); step++; if(step===seq.length){ info.textContent='Good!'; setTimeout(next,500);} }
  else { if(typeof playSound==='function') playSound('fail'); info.textContent='Wrong! Restarting...'; seq=[]; setTimeout(next,800); }
    }));
    info.textContent='Repeat the sequence'; next();
    return { destroy(){ root.innerHTML=''; } };
  }
  WebArcade.simon = root => Simon(root);
})();


/* ==== js/games/snake.js ==== */
(function(){
  window.WebArcade = window.WebArcade || {};
  WebArcade.snake = function(root){
    return WebArcade.createGame('snake', ({root: r, canvas, ctx, keys, onDestroy, setHandlers}) => {
      // adjust canvas size
      canvas.width = 420; canvas.height = 420;
      const grid=20, cols=canvas.width/grid|0, rows=canvas.height/grid|0;
      let snake=[[5,5]], dir=[1,0], food=[10,10], alive=true, score=0;
      function rand(){ return [Math.floor(Math.random()*cols), Math.floor(Math.random()*rows)]; }
      function placeFood(){ do { food = rand(); } while (snake.some(s=>s[0]===food[0]&&s[1]===food[1])); }
      function drawCell(x,y,color){ ctx.fillStyle=color; ctx.fillRect(x*grid+1,y*grid+1,grid-2,grid-2);}    
      function update(){ if(!alive) return; const head=[(snake[0][0]+dir[0]+cols)%cols,(snake[0][1]+dir[1]+rows)%rows]; if (snake.some(s=>s[0]===head[0] && s[1]===head[1])) { alive=false; } snake.unshift(head); if (head[0]===food[0]&&head[1]===food[1]){ score++; if(typeof playSound==='function') playSound('eat'); if(typeof spawnParticles==='function') spawnParticles(canvas,{count:14,colors:['#6cf','#8aff80']}); placeFood(); } else { snake.pop(); } }
      function render(){ ctx.fillStyle='#000'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.strokeStyle='rgba(255,255,255,0.05)'; for(let x=0;x<cols;x++){ for(let y=0;y<rows;y++){ ctx.strokeRect(x*grid,y*grid,grid,grid);} } snake.forEach((s,i)=> drawCell(s[0],s[1], i===0?'#6cf':'#3fa9f5')); drawCell(food[0],food[1],'#8aff80'); ctx.fillStyle='#fff'; ctx.font='14px monospace'; ctx.fillText('Score: '+score, 8, 18); if(!alive){ ctx.fillStyle='#ff6b6b'; ctx.fillText('Game Over - Press R', 140, 210); }}
      function key(e,down){ if(!down) return; const k=e.key.toLowerCase(); if(k==='arrowup'||k==='w'){ if(dir[1]!==1) dir=[0,-1]; } if(k==='arrowdown'||k==='s'){ if(dir[1]!==-1) dir=[0,1]; } if(k==='arrowleft'||k==='a'){ if(dir[0]!==1) dir=[-1,0]; } if(k==='arrowright'||k==='d'){ if(dir[0]!==-1) dir=[1,0]; } if(k==='r'&&!alive){ snake=[[5,5]]; dir=[1,0]; alive=true; score=0; placeFood(); if(typeof playSound==='function') playSound('success'); }}
      placeFood();
      setHandlers({ update: ()=>{ update(); }, render, key });
      onDestroy(()=>{ r.innerHTML=''; });
      return { restart(){ snake=[[5,5]]; dir=[1,0]; alive=true; score=0; placeFood(); } };
    }, { root });
  };
})();


/* ==== js/games/tetris.js ==== */
(function(){
  window.WebArcade = window.WebArcade || {};
  function Tetris(root){
    const c=document.createElement('canvas'); c.width=200; c.height=400; c.className='canvas'; root.appendChild(c); const x=c.getContext('2d');
    const W=10,H=20,S=20; const board=[...Array(H)].map(()=>Array(W).fill(0));
    const shapes=[
      [[1,1,1,1]], // I
      [[1,1],[1,1]], // O
      [[0,1,0],[1,1,1]], // T
      [[1,0,0],[1,1,1]], // J
      [[0,0,1],[1,1,1]], // L
      [[1,1,0],[0,1,1]], // S
      [[0,1,1],[1,1,0]], // Z
    ];
    let cur=newPiece(), y=0, xPos=3, t=0, speed=30, loop, over=false;
    function newPiece(){ const s=shapes[(Math.random()*shapes.length)|0]; return s.map(r=>r.slice()); }
    function rotate(m){ const n=m[0].length, res=[...Array(n)].map(()=>Array(m.length).fill(0)); for(let r=0;r<m.length;r++) for(let c0=0;c0<m[0].length;c0++) res[c0][m.length-1-r]=m[r][c0]; return res; }
    function collide(nx,ny,mat){ for(let r=0;r<mat.length;r++) for(let c0=0;c0<mat[0].length;c0++){ if(!mat[r][c0]) continue; const x2=nx+c0,y2=ny+r; if(x2<0||x2>=W||y2>=H|| (y2>=0&&board[y2][x2])) return true; } return false; }
  function merge(){ for(let r=0;r<cur.length;r++) for(let c0=0;c0<cur[0].length;c0++){ if(cur[r][c0]){ const y2=y+r,x2=xPos+c0; if(y2>=0) board[y2][x2]=cur[r][c0]; }} if(typeof playSound==='function') playSound('drop'); }
  function clearLines(){ let cleared=false; for(let r=H-1;r>=0;r--){ if(board[r].every(v=>v)){ board.splice(r,1); board.unshift(Array(W).fill(0)); r++; cleared=true; } } if(cleared){ if(typeof playSound==='function') playSound('score'); if(typeof spawnParticles==='function') spawnParticles(c,{count:26}); } }
    function draw(){ x.fillStyle='#000'; x.fillRect(0,0,c.width,c.height); // board
      for(let r=0;r<H;r++) for(let c0=0;c0<W;c0++){ if(board[r][c0]){ x.fillStyle='hsl('+(board[r][c0]*60)+',60%,50%)'; x.fillRect(c0*S,r*S,S-1,S-1);} }
      for(let r=0;r<cur.length;r++) for(let c0=0;c0<cur[0].length;c0++){ if(cur[r][c0]){ x.fillStyle='#6cf'; x.fillRect((xPos+c0)*S,(y+r)*S,S-1,S-1);} }
      if(over){ x.fillStyle='#ff6b6b'; x.font='16px monospace'; x.fillText('Game Over - R', 40, 200); }
    }
  function step(){ if(over){ return; } t++; if(t%speed===0){ if(!collide(xPos,y+1,cur)){ y++; } else { merge(); clearLines(); y=0; xPos=3; cur=newPiece(); if(collide(xPos,y,cur)){ over=true; if(typeof playSound==='function') playSound('over'); } } draw(); } else { draw(); } }
    function key(e){ if(over && e.key==='r'){ location.reload(); }
      if(e.key==='ArrowLeft' && !collide(xPos-1,y,cur)) xPos--; if(e.key==='ArrowRight'&& !collide(xPos+1,y,cur)) xPos++; if(e.key==='ArrowDown'&& !collide(xPos,y+1,cur)) y++; if(e.key==='ArrowUp'){ const r=rotate(cur); if(!collide(xPos,y,r)) cur=r; } }
    window.addEventListener('keydown',key); loop=setInterval(step,16);
    return { destroy(){ clearInterval(loop); window.removeEventListener('keydown',key); root.innerHTML=''; } };
  }
  WebArcade.tetris = root => Tetris(root);
})();


/* ==== js/games/whack.js ==== */
(function(){
  window.WebArcade = window.WebArcade || {};
  function Whack(root){
    const grid=document.createElement('div'); grid.className='grid'; grid.style.gridTemplateColumns='repeat(4, 80px)';
    const cells=[]; let score=0, time=30, loop, moleIndex=-1;
    const info=document.createElement('div'); info.className='controls'; info.textContent='Click moles! 30s';
    root.appendChild(info); root.appendChild(grid);
  for(let i=0;i<16;i++){ const c=document.createElement('button'); c.className='cell'; c.textContent=''; c.addEventListener('click',()=>{ if(i===moleIndex){ score++; if(typeof playSound==='function') playSound('hit'); if(typeof spawnParticles==='function') spawnParticles(grid,{count:12,colors:['#ff6b6b','#6cf']}); moleIndex=-1; draw(); }}); grid.appendChild(c); cells.push(c);}    
    function spawn(){ moleIndex = Math.floor(Math.random()*16); }
    function draw(){ cells.forEach((c,i)=>{ c.textContent = i===moleIndex ? '🐹' : ''; }); info.textContent=`Score: ${score} | Time: ${time}s`; }
    function tick(){ if(time<=0){ clearInterval(loop); info.textContent=`Time! Final score: ${score}`; return; } time--; spawn(); draw(); }
    spawn(); draw(); loop=setInterval(tick,1000);
    return { destroy(){ clearInterval(loop); root.innerHTML=''; } };
  }
  WebArcade.whack = root => Whack(root);
})();


/* ==== js/games/wordle.js ==== */
(function(){
  window.WebArcade = window.WebArcade || {};
  function Wordle(root){
    const words=['APPLE','BRAIN','CLOUD','DRIVE','EAGER','FRAME','GRAPE','HEART','IDEAL','JELLY'];
    const answer=words[(Math.random()*words.length)|0]; let row=0, col=0; const board=[...Array(6)].map(()=>Array(5).fill(''));
    const wrap=document.createElement('div'); const info=document.createElement('div'); info.className='controls'; const grid=document.createElement('div'); wrap.appendChild(info); wrap.appendChild(grid); root.appendChild(wrap);
    function render(){ grid.innerHTML=''; for(let r=0;r<6;r++){ const rowEl=document.createElement('div'); rowEl.className='wordle-row'; for(let c0=0;c0<5;c0++){ const cell=document.createElement('div'); cell.className='wordle-cell'; const ch=board[r][c0]; cell.textContent=ch; if(r<row){ const a=answer[c0]; if(ch===a) cell.classList.add('correct'); else if(answer.includes(ch)) cell.classList.add('present'); else cell.classList.add('absent'); } rowEl.appendChild(cell);} grid.appendChild(rowEl);} info.textContent='Guess the 5-letter word'; }
  function enter(){ if(board[row].join('').length!==5) return; const guess=board[row].join(''); if(!words.includes(guess)) { info.textContent='Not in list'; if(typeof playSound==='function') playSound('error'); return; } if(guess===answer){ info.textContent='You win!'; if(typeof playSound==='function') playSound('win'); if(typeof spawnParticles==='function') spawnParticles(grid,{count:50}); window.removeEventListener('keydown',key); } row++; col=0; if(row===6) { info.textContent='Game Over: '+answer; if(typeof playSound==='function') playSound('over'); window.removeEventListener('keydown',key);} render(); }
    function key(e){ const k=e.key.toUpperCase(); if(k.length===1 && k>='A'&&k<='Z'){ if(col<5){ board[row][col++]=k; render(); } } else if(e.key==='Backspace'){ if(col>0){ board[row][--col]=''; render(); } } else if(e.key==='Enter'){ enter(); } }
    window.addEventListener('keydown',key); render();
    return { destroy(){ window.removeEventListener('keydown',key); root.innerHTML=''; } };
  }
  WebArcade.wordle = root => Wordle(root);
})();


/* ==== js/main.js ==== */
// Main menu & game loader
// All game init functions are stored on global WebArcade object instead of polluting window.
window.WebArcade = window.WebArcade || {};
const games = [
  { id: 'snake', name: 'Snake', desc: 'Classic snake grows with food' },
  { id: 'pong', name: 'Pong', desc: 'One-player paddle vs wall' },
  { id: 'whack', name: 'Whack-a-Mole', desc: 'Click moles fast' },
  { id: 'memory', name: 'Memory', desc: 'Match the pairs' },
  { id: 'simon', name: 'Simon', desc: 'Repeat the pattern' },
  { id: 'breakout', name: 'Breakout', desc: 'Break all bricks' },
  { id: 'flappy', name: 'Flappy', desc: 'Navigate the gaps' },
  { id: 'minesweeper', name: 'Minesweeper', desc: 'Clear without mines' },
  { id: 'connect4', name: 'Connect 4', desc: '4 in a row' },
  { id: '2048', name: '2048', desc: 'Combine to 2048' },
  { id: 'tetris', name: 'Tetris', desc: 'Stack the tetrominoes' },
  { id: 'doodle', name: 'Doodle Jump', desc: 'Ascend endlessly' },
  { id: 'invaders', name: 'Space Invaders', desc: 'Shoot aliens' },
  { id: 'pacman', name: 'Pac-Man', desc: 'Eat dots, avoid ghosts' },
  { id: 'wordle', name: 'Wordle', desc: 'Guess the word' }
];

const menuEl = document.getElementById('menu');
const gameArea = document.getElementById('game-area');
const gameRoot = document.getElementById('game-root');
const gameTitle = document.getElementById('game-title');
const backBtn = document.getElementById('back-btn');

function buildMenu() {
  menuEl.innerHTML = games.map(g => `
    <div class="card" data-game="${g.id}">
      <div class="card-hero">
        <img src="assets/${g.id}.svg" alt="${g.name} icon" onerror="this.src='assets/placeholder.svg'" />
      </div>
      <h3>${g.name}</h3>
      <div class="badge">${g.desc}</div>
    </div>`).join('');
  menuEl.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => launch(card.dataset.game));
  });
}

let currentGame = null; // holds object with optional destroy()
function resolveInit(id){
  const fn = WebArcade[id];
  return typeof fn === 'function' ? fn : null;
}
function launch(id){
  const g = games.find(x=>x.id===id); if(!g) return;
  if(currentGame && typeof currentGame.destroy === 'function'){ try { currentGame.destroy(); } catch(_){} }
  menuEl.classList.add('hidden');
  gameArea.classList.remove('hidden');
  gameTitle.textContent = g.name;
  gameRoot.innerHTML = '';
  const init = resolveInit(id);
  try { currentGame = init ? init(gameRoot) || {} : null; if(!init){ gameRoot.innerHTML = `<div style="padding:2rem;text-align:center">Game script not found.</div>`; } }
  catch(e){ gameRoot.innerHTML = `<pre style="color:tomato">Error loading ${g.name}: ${e.message}</pre>`; console.error(e); }
}

function backToMenu(){
  if(currentGame && typeof currentGame.destroy === 'function'){ try { currentGame.destroy(); } catch(_){} }
  currentGame=null;
  gameArea.classList.add('hidden');
  menuEl.classList.remove('hidden');
  gameRoot.innerHTML='';
  gameTitle.textContent='';
}
backBtn.addEventListener('click', backToMenu);
window.addEventListener('keydown', e=>{ if(e.key==='Escape') backToMenu(); });

buildMenu();
