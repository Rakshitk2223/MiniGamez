// Main menu & game loader
// All game init functions are stored on global WebArcade object instead of polluting window.
window.WebArcade = window.WebArcade || {};
const games = [
  { id: 'snake', name: 'Snake', desc: 'Classic snake grows with food' },
  { id: 'pong', name: 'Pong', desc: 'One-player paddle vs wall' },
  { id: 'whack', name: 'Whack-a-Mole', desc: 'Click moles fast' },
  { id: 'memory', name: 'Memory', desc: 'Match the pairs' },
  { id: 'simon', name: 'Simon', desc: 'Repeat the pattern' },
  { id: 'breakout', name: 'Breakout', desc: 'Break all bricks' },
  { id: 'flappy', name: 'Flappy', desc: 'Navigate the gaps' },
  { id: 'minesweeper', name: 'Minesweeper', desc: 'Clear without mines' },
  { id: 'connect4', name: 'Connect 4', desc: '4 in a row' },
  { id: '2048', name: '2048', desc: 'Combine to 2048' },
  { id: 'tetris', name: 'Tetris', desc: 'Stack the tetrominoes' },
  { id: 'doodle', name: 'Doodle Jump', desc: 'Ascend endlessly' },
  { id: 'invaders', name: 'Space Invaders', desc: 'Shoot aliens' },
  { id: 'pacman', name: 'Pac-Man', desc: 'Eat dots, avoid ghosts' },
  { id: 'wordle', name: 'Wordle', desc: 'Guess the word' }
];

const menuEl = document.getElementById('menu');
const gameArea = document.getElementById('game-area');
const gameRoot = document.getElementById('game-root');
const gameTitle = document.getElementById('game-title');
const backBtn = document.getElementById('back-btn');

function buildMenu() {
  menuEl.innerHTML = games.map(g => `
    <div class="card" data-game="${g.id}">
      <div class="card-hero">
        <img src="assets/${g.id}.svg" alt="${g.name} icon" onerror="this.src='assets/placeholder.svg'" />
      </div>
      <h3>${g.name}</h3>
      <div class="badge">${g.desc}</div>
    </div>`).join('');
  menuEl.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => launch(card.dataset.game));
  });
}

let currentGame = null; // holds object with optional destroy()
function resolveInit(id){
  const fn = WebArcade[id];
  return typeof fn === 'function' ? fn : null;
}
function launch(id){
  const g = games.find(x=>x.id===id); if(!g) return;
  if(currentGame && typeof currentGame.destroy === 'function'){ try { currentGame.destroy(); } catch(_){} }
  menuEl.classList.add('hidden');
  gameArea.classList.remove('hidden');
  gameTitle.textContent = g.name;
  gameRoot.innerHTML = '';
  const init = resolveInit(id);
  try { currentGame = init ? init(gameRoot) || {} : null; if(!init){ gameRoot.innerHTML = `<div style="padding:2rem;text-align:center">Game script not found.</div>`; } }
  catch(e){ gameRoot.innerHTML = `<pre style="color:tomato">Error loading ${g.name}: ${e.message}</pre>`; console.error(e); }
}

function backToMenu(){
  if(currentGame && typeof currentGame.destroy === 'function'){ try { currentGame.destroy(); } catch(_){} }
  currentGame=null;
  gameArea.classList.add('hidden');
  menuEl.classList.remove('hidden');
  gameRoot.innerHTML='';
  gameTitle.textContent='';
}
backBtn.addEventListener('click', backToMenu);
window.addEventListener('keydown', e=>{ if(e.key==='Escape') backToMenu(); });

buildMenu();
