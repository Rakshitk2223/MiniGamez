(function(){
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
  window.GameMinesweeper = root => Minesweeper(root);
})();
