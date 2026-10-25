import '@lichess-org/chessground/assets/chessground.base.css';
import '@lichess-org/chessground/assets/chessground.brown.css';
import '@lichess-org/chessground/assets/chessground.cburnett.css';
import './style.css';

import { applyBoardTheme } from './board.js';
import { closeDialogs } from './dom.js';
import { renderHome } from './views/home.js';
import { renderEditor } from './views/editor.js';
import { renderTrain } from './views/train.js';
import { renderStats } from './views/stats.js';
import { renderSettings } from './views/settings.js';
import { renderGames } from './views/games.js';
import { renderLibrary } from './views/library.js';

const app = document.getElementById('app');
let cleanup = null;

const routes = [
  [/^#\/editar\/([^/?]+)/, (el, match, query) => renderEditor(el, { id: match[1], ruta: query.get('ruta') ?? '' })],
  [/^#\/entrenar\/([^/?]+)/, (el, match, query) =>
    renderTrain(el, {
      id: match[1],
      modo: query.get('modo') ?? 'repaso',
      desde: query.get('desde') ?? '',
      todo: query.get('todo') === '1',
    })],
  [/^#\/estadisticas/, (el) => renderStats(el)],
  [/^#\/partidas/, (el) => renderGames(el)],
  [/^#\/biblioteca/, (el) => renderLibrary(el)],
  [/^#\/ajustes/, (el) => renderSettings(el)],
  [/^/, (el) => renderHome(el)],
];

function route() {
  cleanup?.();
  cleanup = null;
  closeDialogs();
  app.replaceChildren();
  const hash = location.hash || '#/';
  const [path, search = ''] = hash.split('?');
  const query = new URLSearchParams(search);
  for (const [pattern, view] of routes) {
    const match = path.match(pattern);
    if (match) {
      cleanup = view(app, match, query) ?? null;
      break;
    }
  }
  // Marca la sección activa en la barra superior.
  const section = ['biblioteca', 'estadisticas', 'partidas', 'ajustes'].find((s) => path.startsWith(`#/${s}`)) ?? 'home';
  document.querySelectorAll('.nav a').forEach((a) => a.classList.toggle('on', a.dataset.section === section));
  window.scrollTo(0, 0);
}

// Cierra los menús desplegables al hacer clic fuera de ellos.
document.addEventListener('click', (e) => {
  for (const menu of document.querySelectorAll('details.menu[open]')) {
    if (!menu.contains(e.target)) menu.open = false;
  }
});

applyBoardTheme();
window.addEventListener('hashchange', route);
route();

// En la versión publicada, la app se puede instalar y usar sin conexión.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
