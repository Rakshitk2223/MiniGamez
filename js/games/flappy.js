(function(){
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
  window.GameFlappy = root => Flappy(root);
})();
