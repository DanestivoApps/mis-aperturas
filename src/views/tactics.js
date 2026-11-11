// Tácticas de tus aperturas: problemas de la base de datos de Lichess (CC0) sacados de partidas
// jugadas con la apertura del curso. La dificultad se adapta a tu nivel (una puntuación tipo Elo).
import { Chess } from 'chess.js';
import { h, fill } from '../dom.js';
import { getSettings, updateSettings } from '../store.js';
import { createBoard } from '../board.js';
import { colorToMove, destsFor, squaresOf, tryMove, moveFromUci, uciOf } from '../chess-utils.js';
import { getCourse } from '../library.js';
import { playMove, play } from '../sound.js';
import { san } from '../notation.js';
import counts from '../data/puzzle-counts.json';

const KEY = 'mis-aperturas.tacticas';

// Temas de Lichess más habituales, en español.
const THEMES = {
  fork: 'Ataque doble', pin: 'Clavada', skewer: 'Enfilada', discoveredAttack: 'Ataque descubierto',
  doubleCheck: 'Jaque doble', hangingPiece: 'Pieza colgada', trappedPiece: 'Pieza atrapada', sacrifice: 'Sacrificio',
  deflection: 'Desviación', attraction: 'Atracción', clearance: 'Despeje', interference: 'Interferencia',
  intermezzo: 'Jugada intermedia', quietMove: 'Jugada tranquila', xRayAttack: 'Rayos X', zugzwang: 'Zugzwang',
  defensiveMove: 'Defensa', capturingDefender: 'Eliminar al defensor', exposedKing: 'Rey expuesto',
  kingsideAttack: 'Ataque al flanco de rey', queensideAttack: 'Ataque al flanco de dama', promotion: 'Coronación',
  advancedPawn: 'Peón avanzado', mate: 'Mate', mateIn1: 'Mate en 1', mateIn2: 'Mate en 2', mateIn3: 'Mate en 3',
  backRankMate: 'Mate del pasillo', smotheredMate: 'Mate de la coz', arabianMate: 'Mate árabe', anastasiaMate: 'Mate de Anastasia',
  bodenMate: 'Mate de Boden', doubleBishopMate: 'Mate de los dos alfiles', hookMate: 'Mate del gancho',
  crushing: 'Ventaja decisiva', advantage: 'Ventaja', equality: 'Igualar', opening: 'Apertura', middlegame: 'Medio juego',
  endgame: 'Final', short: 'Corto', long: 'Largo', veryLong: 'Muy largo', oneMove: 'Una jugada', enPassant: 'Al paso',
  castling: 'Enroque', master: 'Partida de maestro',
};
const HIDDEN_THEMES = new Set(['short', 'long', 'veryLong', 'oneMove', 'opening', 'middlegame', 'endgame', 'master', 'masterVsMaster', 'superGM']);

export const puzzleCount = (courseId) => counts[courseId] ?? 0;

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? { done: {} };
  } catch {
    return { done: {} };
  }
}
function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // sin espacio: no pasa nada, solo se pierde el registro
  }
}

// Siguiente problema: de los que no has resuelto, uno cercano a tu nivel (los fallados vuelven más tarde).
export function pickPuzzle(puzzles, rating, done, lastId = null) {
  const pending = puzzles.filter((p) => done[p[0]] !== 1 && p[0] !== lastId);
  const pool = pending.length ? pending : puzzles.filter((p) => p[0] !== lastId);
  if (!pool.length) return puzzles[0] ?? null;
  const fresh = pool.filter((p) => done[p[0]] == null);
  const from = fresh.length >= 3 ? fresh : pool;
  const near = from.slice().sort((a, b) => Math.abs(a[3] - rating) - Math.abs(b[3] - rating)).slice(0, 5);
  return near[Math.floor(Math.random() * near.length)];
}

// Tu puntuación sube o baja según la dificultad del problema (como el Elo).
export function updateRating(rating, puzzleRating, solved) {
  const expected = 1 / (1 + 10 ** ((puzzleRating - rating) / 400));
  return Math.round(Math.max(400, Math.min(3000, rating + 32 * ((solved ? 1 : 0) - expected))));
}

export function renderTactics(root, { id }) {
  const course = getCourse(id);
  const state = loadState();
  let rating = getSettings().tacticsRating ?? 1200;
  let puzzles = [];
  let cur = null; // { id, fen, moves, rating, themes, idx, failed, over }
  let timer = null;

  const boardEl = h('div', { class: 'board' });
  const status = h('div', { class: 'feedback', 'aria-live': 'polite' });
  const info = h('div', { class: 'card tactic-info' });
  const ratingEl = h('span', { class: 'chip' });
  const progressEl = h('p', { class: 'muted small' });
  const hintBtn = h('button', { class: 'btn', onClick: hint }, '💡 Pista');
  const solutionBtn = h('button', { class: 'btn', onClick: showSolution }, 'Ver solución');
  const nextBtn = h('button', { class: 'btn primary', onClick: next }, 'Siguiente →');

  root.append(h('section', { class: 'layout with-head' },
    h('div', { class: 'panel-head' },
      h('div', { class: 'head-links' }, h('a', { href: '#', class: 'back', onClick: (e) => { e.preventDefault(); window.history.back(); } }, '← Volver')),
      h('h1', null, `Tácticas · ${course?.name ?? 'curso'}`),
      h('p', { class: 'muted small' }, 'Problemas de partidas reales jugadas con esta apertura (base de datos de Lichess). Encuentra la mejor jugada.'),
    ),
    h('div', { class: 'board-col' }, boardEl),
    h('div', { class: 'panel' },
      status,
      h('div', { class: 'actions' }, hintBtn, solutionBtn, nextBtn),
      info,
      h('div', { class: 'card' }, h('div', { class: 'card-row' }, h('h3', null, 'Tu nivel en tácticas'), ratingEl), progressEl),
    ),
  ));

  const board = createBoard(boardEl, {
    movable: { free: false, color: undefined, showDests: true, events: { after: onUserMove } },
  });
  const chess = new Chess();

  function say(text, kind = 'neutral') {
    fill(status, h('span', null, text));
    status.dataset.kind = kind;
  }

  function renderSide() {
    ratingEl.textContent = String(rating);
    const solved = puzzles.filter((p) => state.done[p[0]] === 1).length;
    progressEl.textContent = `${solved} de ${puzzles.length} problemas de este curso resueltos. Sube al acertar y baja al fallar; los problemas se eligen cerca de tu nivel.`;
    if (!cur) return fill(info);
    const themes = cur.themes.split(' ').filter((t) => !HIDDEN_THEMES.has(t) && THEMES[t]);
    fill(info,
      h('div', { class: 'card-row' },
        h('h3', null, cur.over ? 'Problema' : `Juegan las ${cur.color === 'white' ? 'blancas' : 'negras'}`),
        h('span', { class: 'chip' }, `Dificultad ${cur.rating}`)),
      cur.over && themes.length ? h('p', null, 'Temas: ', themes.map((t) => THEMES[t]).join(' · ')) : null,
      cur.over ? h('p', { class: 'muted small' }, h('a', { href: `https://lichess.org/training/${cur.id}`, target: '_blank', rel: 'noopener' }, 'Ver en Lichess ↗')) : null,
    );
  }

  function sync(lastMove) {
    const yours = cur && !cur.over && colorToMove(chess) === cur.color;
    board.set({
      fen: chess.fen(),
      turnColor: colorToMove(chess),
      lastMove,
      check: chess.inCheck(),
      movable: yours ? { color: cur.color, dests: destsFor(chess) } : { color: undefined, dests: new Map() },
    });
  }

  function load(p) {
    const [pid, fen, moves, prating, themes] = p;
    chess.load(fen);
    // En el FEN mueve el rival; su jugada es la primera de la lista.
    cur = { id: pid, moves: moves.split(' '), rating: prating, themes, idx: 0, failed: false, over: false, color: colorToMove(chess) === 'white' ? 'black' : 'white' };
    board.set({ orientation: cur.color });
    board.setAutoShapes([]);
    sync();
    renderSide();
    hintBtn.disabled = solutionBtn.disabled = false;
    say('Mira la jugada del rival…');
    timer = setTimeout(() => {
      opponentMove();
      say(`Tu turno: encuentra la mejor jugada para las ${cur.color === 'white' ? 'blancas' : 'negras'}.`);
    }, 700);
  }

  function opponentMove() {
    const uci = cur.moves[cur.idx];
    const move = moveFromUci(chess, uci);
    cur.idx++;
    if (move) playMove(move);
    sync(squaresOf(uci));
  }

  function onUserMove(orig, dest) {
    if (!cur || cur.over) return;
    const expected = cur.moves[cur.idx];
    const move = tryMove(chess, orig, dest);
    if (!move) return sync();
    // Vale la jugada del problema o cualquier otra que dé mate.
    const ok = uciOf(move) === expected || (expected.length === 5 && uciOf(move).slice(0, 4) === expected.slice(0, 4)) || chess.isCheckmate();
    if (!ok) {
      chess.undo();
      sync();
      if (!cur.failed) {
        cur.failed = true;
        finishRating(false);
      }
      play('wrong');
      say(`${san(move.san)} no es. Prueba otra vez o mira la solución.`, 'bad');
      return;
    }
    playMove(move);
    cur.idx++;
    board.setAutoShapes([]);
    sync([orig, dest]);
    if (cur.idx >= cur.moves.length || chess.isCheckmate()) return solved();
    say('¡Bien! Sigue…', 'ok');
    timer = setTimeout(() => {
      opponentMove();
      say('Sigue: ¿y ahora?');
    }, 450);
  }

  function solved() {
    cur.over = true;
    if (!cur.failed) finishRating(true);
    state.done[cur.id] = cur.failed ? 0 : 1;
    saveState(state);
    play('correct');
    say(cur.failed ? 'Resuelto, aunque no a la primera. Volverá a salir más adelante.' : '¡Correcto! Problema resuelto.', 'ok');
    hintBtn.disabled = solutionBtn.disabled = true;
    sync();
    renderSide();
  }

  function finishRating(ok) {
    const before = rating;
    rating = updateRating(rating, cur.rating, ok);
    updateSettings({ tacticsRating: rating });
    if (!ok) {
      state.done[cur.id] = 0;
      saveState(state);
    }
    ratingEl.textContent = `${rating} (${rating >= before ? '+' : ''}${rating - before})`;
  }

  function hint() {
    if (!cur || cur.over) return;
    const [from] = squaresOf(cur.moves[cur.idx]);
    board.setAutoShapes([{ orig: from, brush: 'green' }]);
    say('La pieza que tienes que mover está marcada.', 'info');
  }

  function showSolution() {
    if (!cur || cur.over) return;
    if (!cur.failed) {
      cur.failed = true;
      finishRating(false);
    }
    clearTimeout(timer);
    const step = () => {
      if (cur.idx >= cur.moves.length) {
        cur.over = true;
        state.done[cur.id] = 0;
        saveState(state);
        hintBtn.disabled = solutionBtn.disabled = true;
        say('Esta era la solución. Volverá a salir más adelante para que la repases.', 'warn');
        sync();
        renderSide();
        return;
      }
      opponentMove();
      timer = setTimeout(step, 800);
    };
    step();
  }

  function next() {
    clearTimeout(timer);
    const p = pickPuzzle(puzzles, rating, state.done, cur?.id);
    if (p) load(p);
  }

  if (!course || !puzzleCount(id)) {
    say('Este curso aún no tiene problemas de táctica.', 'warn');
    hintBtn.disabled = solutionBtn.disabled = nextBtn.disabled = true;
  } else {
    say('Cargando problemas…');
    fetch(`./puzzles/${id}.json`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((list) => {
        puzzles = list;
        next();
      })
      .catch(() => say('No se pudieron cargar los problemas. ¿Estás sin conexión?', 'bad'));
  }

  return () => {
    clearTimeout(timer);
    board.destroy();
  };
}

