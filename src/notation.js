// Notación de las jugadas en pantalla: española (C, A, T, D, R) o inglesa (N, B, R, Q, K).
// Internamente todo se guarda en SAN inglés, que es lo que entienden PGN, Lichess y Chess.com.
import { getSettings } from './store.js';

const SPANISH = { K: 'R', Q: 'D', R: 'T', B: 'A', N: 'C' };

export function toSpanish(san) {
  return san.replace(/[KQRBN]/g, (piece) => SPANISH[piece]);
}

// Formatea una jugada SAN según el ajuste elegido.
export function san(move) {
  return getSettings().notation === 'en' ? move : toSpanish(move);
}

// Para las pistas: "mueve el caballo marcado".
const PIECES = {
  p: 'el peón marcado',
  n: 'el caballo marcado',
  b: 'el alfil marcado',
  r: 'la torre marcada',
  q: 'la dama marcada',
  k: 'el rey marcado',
};

export function pieceHint(type) {
  return PIECES[type] ?? 'la pieza marcada';
}
