(function(){
  function G2048(root){
    const size=4; let grid=[...Array(size)].map(()=>Array(size).fill(0)); const wrap=document.createElement('div'); const gEl=document.createElement('div'); gEl.className='tw-grid'; const info=document.createElement('div'); info.className='controls'; wrap.appendChild(info); wrap.appendChild(gEl); root.appendChild(wrap);
    function add(){ const empt=[]; for(let r=0;r<size;r++) for(let c=0;c<size;c++) if(grid[r][c]===0) empt.push([r,c]); if(empt.length){ const [r,c]=empt[(Math.random()*empt.length)|0]; grid[r][c]= Math.random()<0.9?2:4; }}
    function render(){ gEl.innerHTML=''; for(let r=0;r<size;r++) for(let c=0;c<size;c++){ const v=grid[r][c]; const cell=document.createElement('div'); cell.className='tw-cell'; cell.textContent=v||''; cell.style.background = v? `hsl(${(Math.log2(v)*30)%360},60%,30%)` : ''; gEl.appendChild(cell);} info.textContent='Use arrows to move'; }
    function move(dir){ let moved=false; const range=[0,1,2,3]; const rev=[3,2,1,0]; const rows = (dir==='left'||dir==='right'); for(let i=0;i<4;i++){ const idxs = dir==='left'||dir==='up'?range:rev; const line=[]; for(let j=0;j<4;j++){ const r= rows? i : idxs[j]; const c= rows? idxs[j] : i; const v=grid[r][c]; if(v) line.push(v); grid[r][c]=0; }
  for(let j=0;j<line.length-1;j++){ if(line[j]===line[j+1]){ line[j]*=2; line.splice(j+1,1); if(typeof playSound==='function') playSound('score'); }}
      for(let j=0;j<line.length;j++){ const r= rows? i : (dir==='up'? j : 3-j); const c= rows? (dir==='left'? j : 3-j) : i; if(grid[r][c]!==line[j]) moved=true; grid[r][c]=line[j]; }
    }
    if(moved){ add(); render(); if(checkOver()) info.textContent='Game Over'; }
    }
    function checkOver(){ for(let r=0;r<4;r++) for(let c=0;c<4;c++){ if(grid[r][c]===0) return false; const v=grid[r][c]; if(grid[r+1]&&grid[r+1][c]===v) return false; if(grid[r][c+1]===v) return false; } return true; }
    function key(e){ const k=e.key; if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(k)){ e.preventDefault(); move(k.replace('Arrow','').toLowerCase()); } }
    window.addEventListener('keydown',key);
    add(); add(); render();
    return { destroy(){ window.removeEventListener('keydown',key); root.innerHTML=''; } };
  }
  window.Game2048 = root => G2048(root);
})();
