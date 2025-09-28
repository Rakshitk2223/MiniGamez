(function(){
  window.WebArcade = window.WebArcade || {};
  function Connect4(root){
    const W=7,H=6; const board=[...Array(H)].map(()=>Array(W).fill(0)); let turn=1; const el=document.createElement('div'); const info=document.createElement('div'); info.className='controls'; info.textContent='Red starts'; const grid=document.createElement('div'); grid.className='c4-board'; el.appendChild(grid); root.appendChild(info); root.appendChild(el);
    function render(){ grid.innerHTML=''; for(let r=0;r<H;r++) for(let c=0;c<W;c++){ const cell=document.createElement('div'); cell.className='c4-cell'; const chip=document.createElement('div'); const v=board[r][c]; if(v){ chip.className='c4-chip '+(v===1?'red':'yellow'); cell.appendChild(chip);} cell.addEventListener('click',()=>drop(c)); grid.appendChild(cell);} }
  function drop(c){ for(let r=H-1;r>=0;r--){ if(board[r][c]===0){ board[r][c]=turn; if(typeof playSound==='function') playSound('drop'); if(check(r,c,turn)){ info.textContent=(turn===1?'Red':'Yellow')+' wins!'; grid.style.pointerEvents='none'; if(typeof playSound==='function') playSound('win'); if(typeof spawnParticles==='function') spawnParticles(grid,{count:32}); } else { turn = 3-turn; info.textContent=(turn===1?'Red':'Yellow')+"'s turn"; } render(); return; } } }
    function check(r,c,v){ const dirs=[[1,0],[0,1],[1,1],[1,-1]]; return dirs.some(([dr,dc])=>{ let cnt=1; for(let s=1;s<4;s++){ const rr=r+dr*s, cc=c+dc*s; if(board[rr]&&board[rr][cc]===v) cnt++; else break; } for(let s=1;s<4;s++){ const rr=r-dr*s, cc=c-dc*s; if(board[rr]&&board[rr][cc]===v) cnt++; else break; } return cnt>=4; }); }
    render();
    return { destroy(){ root.innerHTML=''; } };
  }
  WebArcade.connect4 = root => Connect4(root);
})();
