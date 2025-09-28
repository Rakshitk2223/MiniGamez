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
