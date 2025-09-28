# MiniGamez Web Arcade

A collection of classic mini games unified under a single global namespace `WebArcade` with an optional lightweight engine for reducing boilerplate.

## Structure
- `js/effects.js` shared audio + particle helpers
- `js/engine.js` small fixed-timestep engine (`WebArcade.createGame`)
- `js/games/*.js` individual game modules (registered on `WebArcade`)
- `js/main.js` menu + loader
- `js/bundle.js` generated concatenated file for production

## Adding a Game
1. Create `js/games/yourgame.js` and IIFE-register via:
```js
(function(){
  window.WebArcade = window.WebArcade || {};
  function YourGame(root){
    // setup + return { destroy() }
  }
  WebArcade.yourgame = root => YourGame(root);
})();
```
2. (Optional) Use engine:
```js
WebArcade.yourgame = root => WebArcade.createGame('yourgame', ({canvas, ctx, setHandlers}) => {
  function update(dt){}
  function render(){}
  setHandlers({update, render});
});
```
3. Add metadata entry in `games` array inside `js/main.js`.
4. Rebuild bundle.

## Build
Install Node (no external deps required).

```powershell
npm run build
```
Or auto-rebuild on change:
```powershell
npm run watch
```
The bundler sorts game files alphabetically, keeping deterministic output.

## Development vs Production
- During development you can load individual scripts instead of `bundle.js` if you revert `index.html` (not necessary now).
- Production uses the single `js/bundle.js` to reduce HTTP requests.

## Engine Overview
`WebArcade.createGame(id, setup, opts)` supplies:
- `canvas, ctx` pre-created
- `keys` Set of active keys (if using handlers)
- `setHandlers({ update, render, key })`
- `start()/stop()` and `onDestroy(cb)`

## License
MIT (add a license file as needed).
