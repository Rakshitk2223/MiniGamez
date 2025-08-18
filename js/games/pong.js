(function(){
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
  window.GamePong = root => Pong(root);
})();
