// Seguir jugando contra el motor desde una posición del entrenamiento, y revisar después la partida.
import { Chess } from 'chess.js';
import { h, fill } from '../dom.js';
import { getSettings, updateSettings } from '../store.js';
import { createBoard, arrow } from '../board.js';
import { colorToMove, destsFor, squaresOf, tryMove, moveFromUci } from '../chess-utils.js';
import { bestMove, analyse, LEVELS, stopEngine } from '../engine.js';
import { playMove } from '../sound.js';
import { san } from '../notation.js';
import { START_FEN } from '../repertoire.js';
import { icon } from '../icons.js';
import { VERDICTS, moveLoss, winDrop, winPercent, verdict, formatEval, accuracy, scoreValue } from '../game-review.js';

// Con `game` ({ sans, color, title, link }) no se juega: se revisa una partida tuya ya jugada.
export function renderPlay(root, { fen = START_FEN, color = 'white', game = null }) {
  let chess;
  try {
    chess = new Chess(game ? START_FEN : fen);
  } catch {
    chess = new Chess();
  }
  const startFen = chess.fen();
  if (game) color = game.color;
  let alive = true;
  let level = getSettings().engineLevel ?? 'medio';
  const played = []; // jugadas de la partida (objetos de chess.js, con before/after)
  for (const s of game?.sans ?? []) {
    try {
      played.push(chess.move(s));
    } catch {
      break;
    }
  }
  let review = null; // { evals, moves, selected } mientras revisas
  let reviewToken = 0;

  const boardEl = h('div', { class: 'board' });
  const status = h('div', { class: 'feedback', 'aria-live': 'polite' });
  const movesEl = h('div', { class: 'line-text play-moves' });
  const reviewEl = h('div', { class: 'review' });
  const evalBar = h('div', { class: `eval-bar ${color === 'black' ? 'flipped' : ''}`, hidden: true }, h('div', { class: 'eval-fill' }), h('span', { class: 'eval-num' }));
  const reviewBtn = h('button', { class: 'btn primary', onClick: startReview }, icon('chart'), 'Revisar partida');
  const resumeBtn = h('button', { class: 'btn', hidden: true, onClick: stopReview }, icon('play'), 'Seguir jugando');
  const levelBtns = Object.entries(LEVELS).map(([id, l]) =>
    h('button', {
      type: 'button',
      class: `seg ${id === level ? 'on' : ''}`,
      onClick: (e) => {
        level = id;
        updateSettings({ engineLevel: id });
        levelBtns.forEach((b) => b.classList.toggle('on', b === e.currentTarget));
      },
    }, l.label));
  const levelCard = h('div', { class: 'card' }, h('h3', null, 'Nivel del motor'), h('div', { class: 'segmented' }, levelBtns));
  const nav = {
    back: h('button', { class: 'icon-btn', title: 'Jugada anterior (←)', onClick: () => select((review?.selected ?? 0) - 1) }, '◀'),
    forward: h('button', { class: 'icon-btn', title: 'Jugada siguiente (→)', onClick: () => select((review?.selected ?? -1) + 1) }, '▶'),
  };

  root.append(h('section', { class: 'layout with-head' },
    h('div', { class: 'panel-head' },
      h('div', { class: 'head-links' }, h('a', { href: '#', class: 'back', onClick: (e) => { e.preventDefault(); window.history.back(); } }, '← Volver')),
      h('h1', null, game ? 'Revisión de tu partida' : 'Juega contra el motor'),
      game
        ? h('p', { class: 'muted small' }, game.title ?? '', game.link ? [' · ', h('a', { href: game.link, target: '_blank', rel: 'noopener' }, 'Ver en Chess.com ↗')] : null)
        : h('p', { class: 'muted small' }, 'Sigue la partida desde donde acaba tu línea y luego revísala: verás qué jugadas fueron buenas y qué había que jugar.'),
    ),
    h('div', { class: 'board-col' },
      h('div', { class: 'board-wrap' }, evalBar, boardEl),
      h('div', { class: 'board-controls' },
        nav.back,
        nav.forward,
        game ? null : h('button', { class: 'icon-btn', title: 'Deshacer tu última jugada', onClick: undo }, '↶'),
        h('button', { class: 'icon-btn', title: 'Girar el tablero', onClick: () => { board.toggleOrientation(); evalBar.classList.toggle('flipped'); } }, '⟲'),
        game ? null : h('button', { class: 'icon-btn', title: 'Empezar de nuevo desde la posición de partida', onClick: restart }, '⏮'),
      ),
    ),
    h('div', { class: 'panel' },
      status,
      h('div', { class: 'actions' }, reviewBtn, resumeBtn),
      reviewEl,
      levelCard,
      h('div', { class: 'card' }, h('h3', null, 'Jugadas'), movesEl),
    ),
  ));

  const board = createBoard(boardEl, {
    orientation: color,
    fen: chess.fen(),
    movable: { free: false, color: undefined, showDests: true, events: { after: onUserMove } },
  });

  function say(text, kind = 'neutral') {
    fill(status, h('span', null, text));
    status.dataset.kind = kind;
  }

  // ---------- Partida ----------
  function sync(lastMove) {
    const yours = !review && colorToMove(chess) === color && !chess.isGameOver();
    board.set({
      fen: chess.fen(),
      turnColor: colorToMove(chess),
      lastMove,
      check: chess.inCheck(),
      movable: yours ? { color, dests: destsFor(chess) } : { color: undefined, dests: new Map() },
    });
    board.setAutoShapes([]);
    renderMoves();
    reviewBtn.disabled = !played.length;
  }

  // Lista numerada; durante la revisión, cada jugada tuya lleva su valoración y se puede pulsar.
  function renderMoves() {
    if (!played.length) return fill(movesEl, '—');
    const startMove = Number(startFen.split(' ')[5]) || 1;
    const blackFirst = startFen.split(' ')[1] === 'b';
    fill(movesEl, played.map((m, i) => {
      const ply = i + (blackFirst ? 1 : 0);
      const num = ply % 2 === 0 ? `${startMove + ply / 2}. ` : i === 0 ? `${startMove}... ` : '';
      const info = review?.moves[i];
      const v = info ? VERDICTS[info.verdict] : null;
      return [
        num ? h('span', { class: 'mv-num' }, num) : null,
        h('button', {
          type: 'button',
          class: `mv ${review?.selected === i ? 'on' : ''} ${v ? `v-${v.kind}` : ''}`,
          disabled: !review,
          onClick: () => select(i),
        }, san(m.san), v && (info.mine ? info.verdict !== 'buena' : ['error', 'grave'].includes(info.verdict)) ? h('sup', null, v.symbol) : null),
      ];
    }));
  }

  function gameOverText() {
    if (chess.isCheckmate()) return colorToMove(chess) === color ? 'Jaque mate: gana el motor.' : '¡Jaque mate! Has ganado.';
    if (chess.isStalemate()) return 'Tablas por ahogado.';
    if (chess.isDraw()) return 'Tablas.';
    return null;
  }

  async function engineTurn() {
    if (chess.isGameOver()) return finished();
    say('El motor piensa…');
    let uci;
    try {
      uci = await bestMove(chess.fen(), level);
    } catch (err) {
      return say(err.message || 'No se pudo usar el motor.', 'bad');
    }
    if (!alive || review || colorToMove(chess) === color) return;
    const move = moveFromUci(chess, uci);
    if (!move) return say('El motor no encontró jugada.', 'warn');
    played.push(move);
    playMove(move);
    sync(squaresOf(uci));
    if (chess.isGameOver()) finished();
    else say('Tu turno.');
  }

  function finished() {
    say(`${gameOverText()} Pulsa «Revisar partida» para ver tus aciertos y errores.`, 'ok');
  }

  function onUserMove(orig, dest) {
    const move = tryMove(chess, orig, dest);
    if (!move) return sync();
    played.push(move);
    playMove(move);
    sync([orig, dest]);
    engineTurn();
  }

  function undo() {
    if (review) stopReview();
    stopEngine();
    do {
      if (!played.length) break;
      chess.undo();
      played.pop();
    } while (colorToMove(chess) !== color);
    sync();
    say('Tu turno.');
  }

  function restart() {
    if (review) stopReview();
    stopEngine();
    chess.load(startFen);
    played.length = 0;
    sync();
    if (colorToMove(chess) !== color) engineTurn();
    else say('Tu turno.');
  }

  // ---------- Revisión ----------
  async function startReview() {
    if (!played.length) return;
    stopEngine();
    const token = ++reviewToken;
    review = { evals: [], moves: [], selected: null };
    reviewBtn.hidden = true;
    resumeBtn.hidden = Boolean(game);
    levelCard.hidden = true;
    say('Revisión: pulsa una jugada de la lista o usa ◀ ▶ (flechas del teclado).', 'info');
    sync();
    // Una evaluación por posición: la de partida y la que deja cada jugada.
    const fens = [played[0].before, ...played.map((m) => m.after)];
    for (let i = 0; i < fens.length; i++) {
      fill(reviewEl, h('div', { class: 'card' },
        h('p', null, `Analizando la partida con Stockfish… ${i}/${fens.length}`),
        h('div', { class: 'progress' }, h('span', { style: `width:${Math.round((i / fens.length) * 100)}%` }))));
      const pos = new Chess(fens[i]);
      let result;
      if (pos.isCheckmate()) result = { mate: 0, best: null };
      else if (pos.isGameOver()) result = { cp: 0, best: null };
      else {
        try {
          result = await analyse(fens[i], fens.length > 70 ? 11 : 13);
        } catch (err) {
          fill(reviewEl, h('p', { class: 'notice warn' }, err.message || 'No se pudo usar el motor.'));
          return;
        }
      }
      if (!alive || token !== reviewToken) return;
      review.evals.push(result);
    }
    review.moves = played.map((m, i) => {
      const before = review.evals[i];
      const after = review.evals[i + 1];
      const isBest = before.best === m.from + m.to + (m.promotion ?? '');
      const loss = moveLoss(before, after);
      const drop = winDrop(before, after);
      const chances = [winPercent(before), 100 - winPercent(after)].map(Math.round);
      return { loss, drop, chances, verdict: verdict(drop, isBest), mine: m.color === color[0], best: before.best, pv: before.pv ?? [] };
    });
    renderSummary();
    // Empieza por tu primer error, si lo hay.
    const firstBad = review.moves.findIndex((x) => x.mine && ['error', 'grave'].includes(x.verdict));
    select(firstBad >= 0 ? firstBad : 0);
  }

  function stopReview() {
    reviewToken++;
    review = null;
    reviewBtn.hidden = false;
    resumeBtn.hidden = true;
    levelCard.hidden = false;
    fill(reviewEl);
    evalBar.hidden = true;
    sync(played.length ? squaresOf(played[played.length - 1].from + played[played.length - 1].to) : undefined);
    if (chess.isGameOver()) finished();
    else if (colorToMove(chess) === color) say('Tu turno.');
    else engineTurn();
  }

  function renderSummary() {
    const mine = review.moves.filter((x) => x.mine);
    const count = (id) => mine.filter((x) => x.verdict === id).length;
    review.summary = h('div', { class: 'card review-summary' },
      h('div', { class: 'review-accuracy' },
        h('strong', null, `${accuracy(mine.map((x) => x.drop))}%`),
        h('span', { class: 'muted small' }, 'de precisión'),
      ),
      h('ul', { class: 'review-counts' }, Object.entries(VERDICTS).map(([id, v]) =>
        h('li', { class: `v-${v.kind}` }, h('span', null, `${v.symbol} ${v.label}`), h('strong', null, String(count(id)))))),
      h('div', { class: 'review-jumps' },
        mine.some((x) => ['error', 'grave', 'imprecision'].includes(x.verdict))
          ? h('button', { class: 'btn', onClick: () => jumpBad(1) }, 'Siguiente fallo tuyo →')
          : h('p', { class: 'muted small' }, '¡Sin errores! Buena partida.'),
      ),
    );
  }

  function jumpBad(dir) {
    const from = review.selected ?? -1;
    const n = review.moves.length;
    for (let k = 1; k <= n; k++) {
      const i = (from + dir * k + n) % n;
      const x = review.moves[i];
      if (x.mine && ['error', 'grave', 'imprecision'].includes(x.verdict)) return select(i);
    }
  }

  // Barra de evaluación a la izquierda del tablero: la parte blanca crece con la ventaja de las blancas.
  function showEval(score, whiteToMove) {
    const s = scoreValue(score) * (whiteToMove ? 1 : -1);
    const pct = Math.abs(s) >= 9000 ? (s > 0 ? 100 : 0)
      : Math.max(4, Math.min(96, 50 + 50 * (2 / (1 + Math.exp(-0.004 * s)) - 1)));
    evalBar.hidden = false;
    evalBar.querySelector('.eval-fill').style.height = `${pct}%`;
    const num = evalBar.querySelector('.eval-num');
    num.textContent = formatEval(score, whiteToMove).replace(/^[+−]/, '');
    num.className = `eval-num ${s >= 0 ? 'white' : 'black'}`;
    evalBar.title = `Evaluación: ${formatEval(score, whiteToMove)} (+ ventaja de las blancas, − de las negras)`;
  }

  function select(i) {
    if (!review?.moves.length) return;
    const idx = Math.max(0, Math.min(review.moves.length - 1, i));
    review.selected = idx;
    const m = played[idx];
    const info = review.moves[idx];
    const v = VERDICTS[info.verdict];
    const before = new Chess(m.before);
    const bestSan = info.best ? sanLine(m.before, [info.best])[0] : null;
    const line = sanLine(m.before, info.pv.slice(0, 5));
    const evalAfter = formatEval(review.evals[idx + 1], new Chess(m.after).turn() === 'w');
    const evalBest = formatEval(review.evals[idx], before.turn() === 'w');

    board.set({
      fen: m.after,
      turnColor: colorToMove(new Chess(m.after)),
      lastMove: [m.from, m.to],
      check: new Chess(m.after).inCheck(),
      movable: { color: undefined, dests: new Map() },
    });
    const shapes = [arrow(m.from + m.to, v.kind === 'ok' ? 'green' : v.kind === 'warn' ? 'yellow' : 'red')];
    if (info.best && info.verdict !== 'mejor') shapes.push(arrow(info.best, 'blue'));
    board.setAutoShapes(shapes);
    showEval(review.evals[idx + 1], new Chess(m.after).turn() === 'w');

    const who = info.mine ? 'Tu jugada' : game ? 'La jugada del rival' : 'El motor';
    fill(reviewEl,
      h('div', { class: `card review-move v-${v.kind}` },
        h('p', { class: 'review-title' }, h('strong', null, `${moveLabel(idx)} ${san(m.san)}`), ` · ${info.mine ? v.label : game ? `del rival · ${v.label.toLowerCase()}` : 'jugada del motor'}`),
        info.verdict === 'mejor'
          ? h('p', null, `${who} es la mejor de la posición. Evaluación: ${evalAfter}.`)
          : h('p', null,
              info.loss >= 20 ? `${who} pierde ${(info.loss / 100).toFixed(1).replace('.', ',')} ${info.loss >= 95 && info.loss < 105 ? 'peón' : 'peones'} de ventaja. ` : `${who} no es la más precisa. `,
              info.chances[0] !== info.chances[1] ? `Opciones de ganar: ${info.chances[0]}% → ${info.chances[1]}%. ` : '',
              'Mejor era ', h('strong', null, san(bestSan ?? '?')), ` (flecha azul, evaluación ${evalBest}).`),
        line.length > 1 && info.verdict !== 'mejor'
          ? h('p', { class: 'muted small' }, 'Idea: ', line.map(san).join(' '))
          : null,
      ),
      review.summary,
    );
    renderMoves();
    nav.back.disabled = idx === 0;
    nav.forward.disabled = idx === review.moves.length - 1;
  }

  function moveLabel(i) {
    const m = played[i];
    const full = m.before.split(' ')[5];
    return m.color === 'w' ? `${full}.` : `${full}...`;
  }

  function onKey(e) {
    if (!review || e.target.closest?.('input, textarea')) return;
    if (e.key === 'ArrowLeft') select((review.selected ?? 0) - 1);
    else if (e.key === 'ArrowRight') select((review.selected ?? -1) + 1);
  }
  document.addEventListener('keydown', onKey);

  sync();
  nav.back.disabled = nav.forward.disabled = true;
  if (game) startReview();
  else if (colorToMove(chess) !== color) engineTurn();
  else say('Tu turno: sigue la partida.');

  return () => {
    alive = false;
    reviewToken++;
    stopEngine();
    document.removeEventListener('keydown', onKey);
    board.destroy();
  };
}

// Jugadas UCI → SAN desde una posición.
function sanLine(fen, ucis) {
  const chess = new Chess(fen);
  const out = [];
  for (const uci of ucis) {
    const m = moveFromUci(chess, uci);
    if (!m) break;
    out.push(m.san);
  }
  return out;
}
