(function(){
  function Snake(root){
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 420; canvas.height = 420; canvas.className='canvas';
    root.appendChild(canvas);
    const grid=20, cols=canvas.width/grid|0, rows=canvas.height/grid|0;
    let snake=[[5,5]], dir=[1,0], food=[10,10], alive=true, score=0, loop;
    function rand(){ return [Math.floor(Math.random()*cols), Math.floor(Math.random()*rows)]; }
    function placeFood(){
      do { food = rand(); } while (snake.some(s=>s[0]===food[0]&&s[1]===food[1]));
    }
    function drawCell(x,y,color){ ctx.fillStyle=color; ctx.fillRect(x*grid+1,y*grid+1,grid-2,grid-2);}    
    function tick(){
      if(!alive) return;
      const head=[(snake[0][0]+dir[0]+cols)%cols,(snake[0][1]+dir[1]+rows)%rows];
      if (snake.some(s=>s[0]===head[0] && s[1]===head[1])) { alive=false; }
      snake.unshift(head);
  if (head[0]===food[0]&&head[1]===food[1]){ score++; if(typeof playSound==='function') playSound('eat'); if(typeof spawnParticles==='function') spawnParticles(canvas,{count:14,colors:['#6cf','#8aff80']}); placeFood(); } else { snake.pop(); }
      ctx.fillStyle='#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
      // grid
      ctx.strokeStyle='rgba(255,255,255,0.05)';
      for(let x=0;x<cols;x++){ for(let y=0;y<rows;y++){ ctx.strokeRect(x*grid,y*grid,grid,grid);} }
      snake.forEach((s,i)=> drawCell(s[0],s[1], i===0?'#6cf':'#3fa9f5'));
      drawCell(food[0],food[1],'#8aff80');
      ctx.fillStyle='#fff'; ctx.font='14px monospace'; ctx.fillText('Score: '+score, 8, 18);
  if(!alive){ ctx.fillStyle='#ff6b6b'; ctx.fillText('Game Over - Press R', 140, 210); if(typeof playSound==='function') playSound('over'); }
    }
    function key(e){
      const k=e.key.toLowerCase();
      if(k==='arrowup'||k==='w'){ if(dir[1]!==1) dir=[0,-1]; }
      if(k==='arrowdown'||k==='s'){ if(dir[1]!==-1) dir=[0,1]; }
      if(k==='arrowleft'||k==='a'){ if(dir[0]!==1) dir=[-1,0]; }
      if(k==='arrowright'||k==='d'){ if(dir[0]!==-1) dir=[1,0]; }
      if(k==='r'&&!alive){ snake=[[5,5]]; dir=[1,0]; alive=true; score=0; placeFood(); }
    }
    placeFood();
    window.addEventListener('keydown', key);
    loop = setInterval(tick, 110);
    tick();
    return { destroy(){ clearInterval(loop); window.removeEventListener('keydown', key); root.innerHTML=''; } };
  }
  window.GameSnake = root => Snake(root);
})();
