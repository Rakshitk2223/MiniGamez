// Simple mini game engine to reduce repetition across games
// Provides: WebArcade.createGame(gameId, setupFn)
// setupFn receives ({ root, canvas, ctx, keys, loop, onDestroy, start, stop, width, height })
// and returns optional API merged into the game object.
(function(){
  window.WebArcade = window.WebArcade || {};

  const RAF = window.requestAnimationFrame.bind(window);

  function createGame(gameId, setupFn, opts={}){
    const root = typeof opts.root === 'object' ? opts.root : document.createElement('div');
    const width = opts.width || 400;
    const height = opts.height || 400;
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height; canvas.className = 'canvas';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const keys = new Set();
    function keydown(e){ keys.add(e.key); if(onKey) onKey(e,true); }
    function keyup(e){ keys.delete(e.key); if(onKey) onKey(e,false); }
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);

    let destroyed = false;
    let running = true;
    let lastTime = performance.now();
    let accumulator = 0;
    const timestep = opts.timestep || 1000/60; // fixed logic step

    let onUpdate = null, onRender = null, onKey = null;
    const cleanupFns = [];

    function onDestroy(fn){ if(typeof fn==='function') cleanupFns.push(fn); }

    function loop(now){
      if(destroyed) return;
      if(running){
        const dt = now - lastTime; lastTime = now; accumulator += dt;
        while(accumulator >= timestep){ if(onUpdate) onUpdate(timestep/1000); accumulator -= timestep; }
        if(onRender) onRender();
      }
      RAF(loop);
    }
    RAF(loop);

    function start(){ running = true; }
    function stop(){ running = false; }

    const api = setupFn({ root, canvas, ctx, keys, onDestroy, start, stop, width, height, setHandlers });

    function setHandlers(h){ if(!h) return; onUpdate = h.update || onUpdate; onRender = h.render || onRender; onKey = h.key || onKey; }

    if(api && api.handlers) setHandlers(api.handlers);

    function destroy(){
      if(destroyed) return;
      destroyed = true; running=false;
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
      cleanupFns.forEach(fn=>{ try{ fn(); }catch(e){} });
      if(root && root.parentNode && opts.autoRemove !== false){ root.parentNode.removeChild(root); }
    }

    return Object.assign({ destroy, root, canvas, ctx, keys, start, stop }, api || {});
  }

  WebArcade.createGame = createGame;
})();
