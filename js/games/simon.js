(function(){
  function Simon(root){
    const colors=['red','green','blue','yellow'];
    const grid=document.createElement('div'); grid.className='simon-grid';
    const info=document.createElement('div'); info.className='controls';
    const btns=colors.map(c=>{ const b=document.createElement('button'); b.className='simon-btn '+c; grid.appendChild(b); return b; });
    root.appendChild(info); root.appendChild(grid);
    let seq=[], step=0, playing=false;
    function playSeq(){ playing=true; step=0; let i=0; info.textContent=`Level ${seq.length}`; const iv=setInterval(()=>{ if(i>=seq.length){ clearInterval(iv); playing=false; return; } flash(seq[i++]); },600); }
    function flash(idx){ const b=btns[idx]; b.classList.add('active'); setTimeout(()=>b.classList.remove('active'),300); }
  function next(){ seq.push(Math.floor(Math.random()*4)); if(typeof playSound==='function') playSound('beep'); playSeq(); }
    btns.forEach((b,i)=> b.addEventListener('click',()=>{
      if(playing) return; flash(i);
  if(i===seq[step]){ if(typeof playSound==='function') playSound('success'); step++; if(step===seq.length){ info.textContent='Good!'; setTimeout(next,500);} }
  else { if(typeof playSound==='function') playSound('fail'); info.textContent='Wrong! Restarting...'; seq=[]; setTimeout(next,800); }
    }));
    info.textContent='Repeat the sequence'; next();
    return { destroy(){ root.innerHTML=''; } };
  }
  window.GameSimon = root => Simon(root);
})();
