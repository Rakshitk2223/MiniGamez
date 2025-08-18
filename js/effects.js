// Simple sound & particle effects utility
(function(){
  const AudioCtx = window.AudioContext || window.webkitAudioContext; let ctx; function ensure(){ if(!ctx){ try{ ctx=new AudioCtx(); }catch(e){} } }
  const lastPlay = {}; const cooldown=40; // ms minimal between identical sounds
  const presets = {
    eat:[440,0.09], hit:[220,0.06], score:[660,0.12], success:[520,0.18], fail:[120,0.25], over:[80,0.4], win:[740,0.4], jump:[360,0.1], shoot:[800,0.08], beep:[600,0.08], drop:[300,0.07], reveal:[260,0.04], error:[200,0.05]
  };
  function playSound(name){ const p=presets[name]; if(!p) return; const now=performance.now(); if(lastPlay[name] && now-lastPlay[name]<cooldown) return; lastPlay[name]=now; ensure(); if(!ctx) return; const [freq,dur]=p; const o=ctx.createOscillator(); const g=ctx.createGain(); o.frequency.value=freq; o.type='sine'; o.connect(g); g.connect(ctx.destination); const t=ctx.currentTime; g.gain.setValueAtTime(0.001,t); g.gain.exponentialRampToValueAtTime(0.4,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.start(t); o.stop(t+dur); }

  function spawnParticles(root, opts={}){ const host = root; if(!host) return; host.classList.add('effects-host'); const count= opts.count|| 18; const colors=opts.colors||['#6ccfff','#8aff80','#ffbe0b','#ff6b6b']; const rect= host.getBoundingClientRect(); const cx= rect.width/2, cy= rect.height/2; for(let i=0;i<count;i++){ const el=document.createElement('div'); el.className='particle'; const ang=Math.random()*Math.PI*2; const dist= 40+Math.random()*140; const x = cx + Math.cos(ang)*dist; const y = cy + Math.sin(ang)*dist; const size=4+Math.random()*6; el.style.background= colors[i%colors.length]; el.style.width=el.style.height=size+'px'; el.style.left=cx+'px'; el.style.top=cy+'px'; host.appendChild(el); requestAnimationFrame(()=>{ el.style.transform=`translate(${x-cx}px,${y-cy}px) scale(0)`; el.style.opacity='0'; }); setTimeout(()=> el.remove(), 900+Math.random()*400); }
  }

  window.playSound = playSound; window.spawnParticles = spawnParticles;
})();
