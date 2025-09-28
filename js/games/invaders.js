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
