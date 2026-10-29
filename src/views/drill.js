// Contrarreloj: posiciones sueltas de tu repertorio, sin orden, contra el reloj.
// Cada acierto suma un punto y cada fallo resta segundos. No cambia tus fechas de repaso.
import { Chess } from 'chess.js';
import { h, fill } from '../dom.js';
import { getRepertoire, getSettings, updateSettings, save } from '../store.js';
import { allLines, stepLabel } from '../repertoire.js';
import { drillPositions, shuffle } from '../session.js';
import { getCourse, LEVELS } from '../library.js';
import { levelEdges } from '../courses.js';
import { createBoard, arrow } from '../board.js';
import { colorToMove, destsFor, squaresOf, tryMove, uciOf } from '../chess-utils.js';
import { play } from '../sound.js';
import { san } from '../notation.js';
import { noteAnswer, buzz } from '../feedback.js';

export const DURATIONS = [
  { value: 60, label: '1 min' },
  { value: 180, label: '3 min' },
  { value: 300, label: '5 min' },
];
export const PENALTY = 10; // segundos que resta cada fallo

export function formatClock(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export function renderDrill(root, { id, nivel = null }) {
  const rep = getRepertoire(id);
  if (!rep) {
    root.append(h('section', { class: 'page' }, h('h1', null, 'Repertorio no encontrado'), h('a', { href: '#/' }, '← Volver')));
    return;
  }
  const settings = getSettings();
  const course = nivel != null ? getCourse(rep.source?.course) : null;
  const levelName = course ? LEVELS[nivel]?.name : null;
  const edges = course ? levelEdges(course, nivel) : null;
  const lines = allLines(rep).filter((line) => !edges || line.every((s) => edges.has(`${s.from}|${s.move.uci}`)));
  const positions = drillPositions(rep, lines);
  let duration = DURATIONS.some((d) => d.value === settings.drillDuration) ? settings.drillDuration : 180;
  // Récord por duración (y por nivel si entrenas solo uno).
  const recordKey = () => (levelName ? `${duration}-${nivel}` : String(duration));
  const record = () => rep.drillBest?.[recordKey()] ?? 0;

  let playing = false;
  let endAt = 0;
  let score = 0;
  let misses = 0;
  let mistakes = [];
  let queue = [];
  let current = null;
  let chess = null;
  let locked = false;
  let ticker = null;
  const timers = new Set();
  const later = (fn, ms) => {
    const t = setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
  };

  // ---------- Interfaz ----------
  const boardEl = h('div', { class: 'board' });
  const clockEl = h('div', { class: 'drill-clock', 'aria-live': 'off' }, formatClock(duration * 1000));
  const scoreEl = h('div', { class: 'chips' });
  const feedback = h('div', { class: 'feedback', 'aria-live': 'polite' });
  const contextEl = h('p', { class: 'line-text' }, '—');
  const summary = h('div', { class: 'train-summary' });
  const durationBtns = DURATIONS.map((d) =>
    h('button', {
      type: 'button',
      class: `seg ${d.value === duration ? 'on' : ''}`,
      onClick: (e) => {
        duration = d.value;
        updateSettings({ drillDuration: duration });
        durationBtns.forEach((b) => b.classList.toggle('on', b === e.currentTarget));
        clockEl.textContent = formatClock(duration * 1000);
        renderScore();
      },
    }, d.label));
  const startBtn = h('button', { class: 'btn primary big', onClick: start, disabled: !positions.length }, 'Empezar');
  const controls = h('div', { class: 'drill-controls' },
    h('div', { class: 'segmented', role: 'group', 'aria-label': 'Duración' }, durationBtns),
    startBtn,
  );

  root.append(
    h('section', { class: 'layout with-head' },
      h('div', { class: 'panel-head' },
        h('div', { class: 'head-links' }, h('a', { href: '#/', class: 'back' }, '← Inicio')),
        h('h1', null, '⏱ Contrarreloj'),
        h('p', { class: 'muted small' },
          h('span', { class: `piece-badge ${rep.color}` }, rep.color === 'white' ? '♔' : '♚'), ' ', rep.name,
          levelName ? ` · nivel ${levelName}` : '',
          ` · ${positions.length} posiciones`),
        h('div', { class: 'drill-top' }, clockEl, scoreEl),
      ),
      h('div', { class: 'board-col' }, boardEl),
      h('div', { class: 'panel' },
        feedback,
        h('div', { class: 'card' }, h('h3', null, 'Cómo se llega aquí'), contextEl),
        controls,
        summary,
      ),
    ),
  );

  const board = createBoard(boardEl, {
    orientation: rep.color,
    movable: { free: false, color: undefined, showDests: true, events: { after: onMove } },
  });

  function say(text, kind = 'neutral') {
    feedback.textContent = text;
    feedback.dataset.kind = kind;
  }

  function flash(kind) {
    boardEl.classList.remove('flash-ok', 'shake');
    void boardEl.offsetWidth;
    boardEl.classList.add(kind);
  }

  function renderScore() {
    fill(scoreEl,
      h('span', { class: 'chip ok' }, `✓ ${score}`),
      h('span', { class: 'chip bad' }, `✗ ${misses}`),
      h('span', { class: 'chip', title: 'Tu mejor marca con esta duración' }, `🏆 ${record()}`),
    );
  }

  const label = (key, move) => stepLabel(rep, { from: key, move }, true, san);

  function showIntro() {
    say(positions.length
      ? `Te salen posiciones sueltas de tu repertorio: juega tu jugada lo antes posible. Cada acierto suma 1 punto; cada fallo resta ${PENALTY} segundos.`
      : 'Este repertorio aún no tiene jugadas tuyas. Añádelas en el editor o desde la biblioteca.',
    'info');
  }

  // ---------- Partida ----------
  function start() {
    playing = true;
    score = 0;
    misses = 0;
    mistakes = [];
    queue = shuffle(positions.slice());
    endAt = Date.now() + duration * 1000;
    controls.hidden = true;
    fill(summary);
    renderScore();
    say('¡Vamos!', 'info');
    clearInterval(ticker);
    ticker = setInterval(tick, 100);
    nextPosition();
  }

  function tick() {
    const left = endAt - Date.now();
    clockEl.textContent = formatClock(left);
    clockEl.classList.toggle('low', left < 10_000);
    if (left <= 0) over();
  }

  function nextPosition() {
    if (!playing) return;
    if (!queue.length) {
      queue = shuffle(positions.slice());
      // Que no salga dos veces seguidas la misma posición al volver a barajar.
      if (queue.length > 1 && queue[0] === current) queue.push(queue.shift());
    }
    current = queue.shift();
    chess = new Chess(rep.positions[current.key].fen);
    const last = current.path[current.path.length - 1];
    board.set({
      fen: chess.fen(),
      turnColor: colorToMove(chess),
      lastMove: last ? squaresOf(last.move.uci) : undefined,
      check: chess.inCheck(),
      movable: { color: rep.color, dests: destsFor(chess) },
      drawable: { autoShapes: [] },
    });
    const start = Math.max(0, current.path.length - 6);
    const tail = current.path.slice(start).map((s, i) => stepLabel(rep, s, i === 0, san)).join(' ');
    contextEl.textContent = current.path.length ? `${start ? '… ' : ''}${tail}` : 'Posición inicial: tu primera jugada.';
    locked = false;
  }

  function onMove(orig, dest) {
    if (!playing || locked) return;
    const move = tryMove(chess, orig, dest);
    if (!move) {
      board.set({ fen: chess.fen(), movable: { color: rep.color, dests: destsFor(chess) } });
      return;
    }
    locked = true;
    const moves = rep.positions[current.key].moves;
    if (moves.some((m) => m.uci === uciOf(move))) {
      score++;
      play('correct');
      flash('flash-ok');
      noteAnswer(true);
      say(`¡Bien! ${san(move.san)}`, 'ok');
      board.set({ movable: { color: undefined, dests: new Map() } });
      renderScore();
      later(nextPosition, 250);
      return;
    }
    chess.undo();
    misses++;
    endAt -= PENALTY * 1000;
    play('wrong');
    flash('shake');
    buzz();
    noteAnswer(false);
    mistakes.push({ ...current, played: move.san });
    board.set({
      fen: chess.fen(),
      movable: { color: undefined, dests: new Map() },
      drawable: { autoShapes: moves.map((m, i) => arrow(m.uci, i ? 'blue' : 'green')) },
    });
    say(`−${PENALTY} s. No es ${san(move.san)}: era ${moves.map((m) => label(current.key, m)).join(' o ')}.`, 'bad');
    renderScore();
    tick();
    later(nextPosition, 1200);
  }

  function over() {
    if (!playing) return;
    playing = false;
    clearInterval(ticker);
    timers.forEach(clearTimeout);
    timers.clear();
    clockEl.textContent = formatClock(0);
    board.set({ movable: { color: undefined, dests: new Map() }, drawable: { autoShapes: [] } });
    const prev = record();
    if (score > prev) {
      rep.drillBest = { ...rep.drillBest, [recordKey()]: score };
      save();
    }
    play('done');
    say(score > prev && prev
      ? `¡Tiempo! Nuevo récord: ${score} aciertos (antes ${prev}). 🏆`
      : `¡Tiempo! ${score} ${score === 1 ? 'acierto' : 'aciertos'} y ${misses} ${misses === 1 ? 'fallo' : 'fallos'}.`,
    'ok');
    renderScore();
    fill(summary, mistakesCard());
    startBtn.textContent = '↺ Otra vez';
    controls.hidden = false;
    startBtn.focus();
  }

  function mistakesCard() {
    const seen = new Set();
    const list = mistakes.filter((m) => !seen.has(m.key) && seen.add(m.key));
    if (!list.length) return null;
    return h('div', { class: 'card mistakes' },
      h('h3', null, `Para repasar (${list.length})`),
      h('ol', { class: 'mistake-list' },
        list.map((m) => {
          const start = Math.max(0, m.path.length - 4);
          const context = m.path.slice(start).map((s, i) => stepLabel(rep, s, i === 0, san)).join(' ');
          const ruta = m.path.map((s) => s.move.uci).join(',');
          return h('li', null,
            h('span', { class: 'mistake-context' }, start ? '… ' : '', context || 'Al empezar'),
            ' → ',
            h('strong', null, rep.positions[m.key].moves.map((mv) => label(m.key, mv)).join(' o ')),
            h('span', { class: 'muted small' }, ` · jugaste ${san(m.played)}`),
            ' ',
            h('a', { class: 'small', href: `#/editar/${rep.id}?ruta=${ruta}`, title: 'Ver la posición en el editor' }, 'Ver'),
          );
        }),
      ),
      h('p', { class: 'muted small' }, 'La contrarreloj no cambia tus fechas de repaso. ',
        h('a', { href: `#/entrenar/${rep.id}?modo=libre${levelName ? `&nivel=${nivel}` : ''}` }, 'Practicar las líneas'), '.'),
    );
  }

  function onKey(e) {
    if (e.target.closest?.('input, textarea, dialog, button, a')) return;
    if (!playing && !controls.hidden && (e.key === 'Enter' || e.key === ' ') && positions.length) {
      e.preventDefault();
      start();
    }
  }
  document.addEventListener('keydown', onKey);

  renderScore();
  showIntro();

  return () => {
    playing = false;
    clearInterval(ticker);
    timers.forEach(clearTimeout);
    document.removeEventListener('keydown', onKey);
    board.destroy();
  };
}
