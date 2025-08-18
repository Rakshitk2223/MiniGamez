(function(){
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
  window.GameWordle = root => Wordle(root);
})();
