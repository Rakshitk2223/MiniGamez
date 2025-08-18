(function(){
  function Pacman(root){
    const map=[
      '###################',
      '#........#........#',
      '#.###.##.#.##.###.#',
      '#*# #........# #*#',
      '#.###.#.###.#.###.#',
      '#.....#.....#.....#',
      '#####.#.###.#.#####',
      '#####.#.....#.#####',
      '#.....### ###.....#',
      '#.###........#.###.#',
      '#........P........#',
      '###################'
    ];
    const rows=map.length, cols=map[0].length; const grid=document.createElement('div'); grid.className='pac-grid'; const info=document.createElement('div'); info.className='controls'; let px=0,py=0, dots=0;
    for(let r=0;r<rows;r++) for(let c0=0;c0<cols;c0++){ const ch=map[r][c0]; const div=document.createElement('div'); div.className='pac-cell'; if(ch==='#') div.classList.add('wall'); if(ch==='.'||ch==='*'){ div.classList.add('dot'); dots++; } if(ch==='P'){ px=c0; py=r; }
      grid.appendChild(div);
    }
    root.appendChild(info); root.appendChild(grid);
    function idx(r,c){ return r*cols+c; }
    function draw(){ [...grid.children].forEach((cell,i)=>{ cell.style.outline='none'; }); const pCell=grid.children[idx(py,px)]; pCell.style.outline='2px solid #ff0'; info.textContent=`Dots left: ${dots}. Use arrows.`; }
  function move(dx,dy){ const nx=px+dx, ny=py+dy; const cell=grid.children[idx(ny,nx)]; if(!cell||cell.classList.contains('wall')) return; px=nx; py=ny; if(cell.classList.contains('dot')){ cell.classList.remove('dot'); dots--; if(typeof playSound==='function') playSound('eat'); if(dots===0){ info.textContent='You cleared all dots!'; if(typeof playSound==='function') playSound('win'); if(typeof spawnParticles==='function') spawnParticles(grid,{count:60}); } } draw(); }
    function key(e){ if(e.key==='ArrowLeft') move(-1,0); if(e.key==='ArrowRight') move(1,0); if(e.key==='ArrowUp') move(0,-1); if(e.key==='ArrowDown') move(0,1); }
    window.addEventListener('keydown',key);
    draw();
    return { destroy(){ window.removeEventListener('keydown',key); root.innerHTML=''; } };
  }
  window.GamePacman = root => Pacman(root);
})();
