// Seguir jugando contra el motor desde una posición del entrenamiento: donde acaba la teoría.
import { Chess } from 'chess.js';
import { h, fill } from '../dom.js';
import { getSettings, updateSettings } from '../store.js';
import { createBoard } from '../board.js';
import { colorToMove, destsFor, squaresOf, tryMove, moveFromUci } from '../chess-utils.js';
import { bestMove, LEVELS, stopEngine } from '../engine.js';
import { playMove } from '../sound.js';
import { san } from '../notation.js';
import { START_FEN } from '../repertoire.js';

export function renderPlay(root, { fen = START_FEN, color = 'white' }) {
  let chess;
  try {
    chess = new Chess(fen);
  } catch {
    chess = new Chess();
  }
  const startFen = chess.fen();
  let alive = true;
  let level = getSettings().engineLevel ?? 'medio';
  const history = [];

  const boardEl = h('div', { class: 'board' });
  const status = h('div', { class: 'feedback', 'aria-live': 'polite' });
  const moves = h('p', { class: 'line-text' });
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

  root.append(h('section', { class: 'layout with-head' },
    h('div', { class: 'panel-head' },
      h('div', { class: 'head-links' }, h('a', { href: '#', class: 'back', onClick: (e) => { e.preventDefault(); window.history.back(); } }, '← Volver')),
      h('h1', null, 'Juega contra el motor'),
      h('p', { class: 'muted small' }, 'Sigue la partida desde donde acaba tu línea: así practicas los planes, no solo las jugadas.'),
    ),
    h('div', { class: 'board-col' },
      boardEl,
      h('div', { class: 'board-controls' },
        h('button', { class: 'icon-btn', title: 'Deshacer tu última jugada', onClick: undo }, '↶'),
        h('button', { class: 'icon-btn', title: 'Girar el tablero', onClick: () => board.toggleOrientation() }, '⟲'),
        h('button', { class: 'icon-btn', title: 'Volver a la posición de partida', onClick: restart }, '⏮'),
      ),
    ),
    h('div', { class: 'panel' },
      status,
      h('div', { class: 'card' },
        h('h3', null, 'Nivel del motor'),
        h('div', { class: 'segmented' }, levelBtns),
      ),
      h('div', { class: 'card' }, h('h3', null, 'Jugadas'), moves),
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

  function sync(lastMove) {
    const yours = colorToMove(chess) === color && !chess.isGameOver();
    board.set({
      fen: chess.fen(),
      turnColor: colorToMove(chess),
      lastMove,
      check: chess.inCheck(),
      movable: yours ? { color, dests: destsFor(chess) } : { color: undefined, dests: new Map() },
    });
    fill(moves, history.length ? history.map((m) => san(m.san)).join(' ') : '—');
  }

  function gameOverText() {
    if (chess.isCheckmate()) return colorToMove(chess) === color ? 'Jaque mate: gana el motor.' : '¡Jaque mate! Has ganado.';
    if (chess.isStalemate()) return 'Tablas por ahogado.';
    if (chess.isDraw()) return 'Tablas.';
    return null;
  }

  async function engineTurn() {
    if (chess.isGameOver()) return say(gameOverText(), 'ok');
    say('El motor piensa…');
    let uci;
    try {
      uci = await bestMove(chess.fen(), level);
    } catch (err) {
      return say(err.message || 'No se pudo usar el motor.', 'bad');
    }
    if (!alive || colorToMove(chess) === color) return;
    const move = moveFromUci(chess, uci);
    if (!move) return say('El motor no encontró jugada.', 'warn');
    history.push(move);
    playMove(move);
    sync(squaresOf(uci));
    say(gameOverText() ?? 'Tu turno.', chess.isGameOver() ? 'ok' : 'neutral');
  }

  function onUserMove(orig, dest) {
    const move = tryMove(chess, orig, dest);
    if (!move) return sync();
    history.push(move);
    playMove(move);
    sync([orig, dest]);
    engineTurn();
  }

  function undo() {
    stopEngine();
    // Deshace hasta que vuelva a ser tu turno.
    do {
      if (!history.length) break;
      chess.undo();
      history.pop();
    } while (colorToMove(chess) !== color);
    sync();
    say('Tu turno.');
  }

  function restart() {
    stopEngine();
    chess.load(startFen);
    history.length = 0;
    sync();
    if (colorToMove(chess) !== color) engineTurn();
    else say('Tu turno.');
  }

  sync();
  if (colorToMove(chess) !== color) engineTurn();
  else say('Tu turno: sigue la partida.');

  return () => {
    alive = false;
    stopEngine();
    board.destroy();
  };
}
