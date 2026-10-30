// Miniatura estática de un tablero (sin chessground): usa las mismas piezas y colores que el tablero grande.
import { Chess } from 'chess.js';
import { ROOT_KEY } from './repertoire.js';

const PIECES = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };

export function miniBoard(fen, orientation = 'white') {
  const wrap = document.createElement('div');
  wrap.className = 'mini-board cg-wrap';
  wrap.setAttribute('aria-hidden', 'true');
  const board = document.createElement('cg-board');
  const rows = fen.split(' ')[0].split('/');
  rows.forEach((row, r) => {
    let f = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) {
        f += Number(ch);
        continue;
      }
      const piece = document.createElement('piece');
      piece.className = `${PIECES[ch.toLowerCase()]} ${ch === ch.toUpperCase() ? 'white' : 'black'}`;
      const x = orientation === 'white' ? f : 7 - f;
      const y = orientation === 'white' ? r : 7 - r;
      piece.style.transform = `translate(${x * 100}%, ${y * 100}%)`;
      board.append(piece);
      f++;
    }
  });
  wrap.append(board);
  return wrap;
}

// Posición tras las primeras jugadas de la línea principal de un curso (PGN del nivel Esencial).
const COURSE_PLY = {
  italiana: 5, londres: 9, alapin: 3, 'francesa-avance': 5, 'caro-avance': 5, 'escandinava-contra': 5,
  'pirc-alekhine': 7, 'caro-kann': 4, 'dragon-acelerado': 8, eslava: 4, 'india-de-rey': 8, espanola: 5,
  'gambito-dama': 3, petrov: 4, escandinava: 2, gda: 4, 'contra-inglesa-reti': 2, vienesa: 3, escocesa: 5,
  francesa: 6, gdr: 4, kan: 8, inglesa: 7, najdorf: 10, nimzoindia: 6, holandesa: 8,
  'dos-caballos': 6, pirc: 6, grunfeld: 6, catalana: 7, 'ataque-indio-rey': 11,
};

const fenCache = new Map();

export function courseFen(course) {
  if (!fenCache.has(course.id)) {
    const chess = new Chess();
    const firstLine = course.levels[0].split('\n\n')[0].replace(/\{[^}]*\}/g, ' ');
    const plies = COURSE_PLY[course.id] ?? 6;
    let played = 0;
    for (const tok of firstLine.split(/\s+/)) {
      const san = tok.replace(/^\d+\.+/, '');
      if (!san || san === '*') continue;
      if (played >= plies) break;
      try {
        chess.move(san);
        played++;
      } catch {
        break;
      }
    }
    fenCache.set(course.id, chess.fen());
  }
  return fenCache.get(course.id);
}

// Para un repertorio propio: las primeras jugadas de su línea principal.
export function repFen(rep, plies = 6) {
  let key = ROOT_KEY;
  for (let i = 0; i < plies; i++) {
    const next = rep.positions[key]?.moves[0];
    if (!next) break;
    key = next.to;
  }
  return rep.positions[key]?.fen ?? rep.positions[ROOT_KEY].fen;
}
