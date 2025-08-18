(function(){
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
  window.GameDoodle = root => Doodle(root);
})();
