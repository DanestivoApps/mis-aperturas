import '@lichess-org/chessground/assets/chessground.base.css';
import '@lichess-org/chessground/assets/chessground.brown.css';
import '@lichess-org/chessground/assets/chessground.cburnett.css';
import './style.css';

import { applyBoardTheme } from './board.js';
import { closeDialogs } from './dom.js';
import { startAutoSync } from './sync.js';
import { renderHome } from './views/home.js';
import { renderEditor } from './views/editor.js';
import { renderTrain } from './views/train.js';
import { renderStats } from './views/stats.js';
import { renderSettings } from './views/settings.js';
import { renderGames } from './views/games.js';
import { renderLibrary } from './views/library.js';
import { renderDrill } from './views/drill.js';
import { applyTheme } from './theme.js';

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
      nivel: query.has('nivel') ? Number(query.get('nivel')) : null,
    })],
  [/^#\/probar\/([^/?]+)/, (el, match) => renderTrain(el, { curso: match[1] })],
  [/^#\/contrarreloj\/([^/?]+)/, (el, match, query) =>
    renderDrill(el, { id: match[1], nivel: query.has('nivel') ? Number(query.get('nivel')) : null })],
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
  const section = path.startsWith('#/probar')
    ? 'biblioteca'
    : ['biblioteca', 'estadisticas', 'partidas', 'ajustes'].find((s) => path.startsWith(`#/${s}`)) ?? 'home';
  document.querySelectorAll('.nav a').forEach((a) => a.classList.toggle('on', a.dataset.section === section));
  window.scrollTo(0, 0);
}

// Cierra los menús desplegables al hacer clic fuera de ellos.
document.addEventListener('click', (e) => {
  for (const menu of document.querySelectorAll('details.menu[open]')) {
    if (!menu.contains(e.target)) menu.open = false;
  }
});

applyTheme();
applyBoardTheme();
window.addEventListener('hashchange', route);
route();

// Si llegan cambios de otro dispositivo, se redibujan las pantallas de consulta
// (no el editor ni el entrenamiento, para no interrumpirte).
startAutoSync(() => {
  const hash = location.hash || '#/';
  if (/^#\/?(biblioteca|estadisticas)?$/.test(hash)) route();
});

// En la versión publicada, la app se puede instalar y usar sin conexión.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
