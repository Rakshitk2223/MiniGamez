(function(){
  function Memory(root){
    const icons=['🍎','🍌','🍇','🍓','🥝','🍑','🍍','🥥'];
    const deck=[...icons,...icons].sort(()=>Math.random()-0.5);
    const grid=document.createElement('div'); grid.className='memory-grid';
    const info=document.createElement('div'); info.className='controls'; info.textContent='Find all pairs!';
    root.appendChild(info); root.appendChild(grid);
    let first=null, lock=false, matched=0;
    deck.forEach((v,i)=>{
      const card=document.createElement('div'); card.className='memory-card'; card.dataset.value=v; card.textContent='?';
      card.addEventListener('click',()=>{
        if(lock||card.classList.contains('matched')||card.classList.contains('revealed')) return;
        card.classList.add('revealed'); card.textContent=v;
        if(!first){ first=card; }
        else {
          if(first.dataset.value===v){ first.classList.add('matched'); card.classList.add('matched'); matched+=2; if(typeof playSound==='function') playSound('success'); if(typeof spawnParticles==='function') spawnParticles(grid,{count:16}); if(matched===deck.length){ info.textContent='You win!'; if(typeof playSound==='function') playSound('win'); } first=null; }
          else { lock=true; setTimeout(()=>{ first.classList.remove('revealed'); card.classList.remove('revealed'); first.textContent='?'; card.textContent='?'; first=null; lock=false; },700); }
        }
      });
      grid.appendChild(card);
    });
    return { destroy(){ root.innerHTML=''; } };
  }
  window.GameMemory = root => Memory(root);
})();
