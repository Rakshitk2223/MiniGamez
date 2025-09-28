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
