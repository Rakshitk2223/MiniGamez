(function(){
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
  window.GameBreakout = root => Breakout(root);
})();
