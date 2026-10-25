import { Chess } from 'chess.js';
import { addMove, newRepertoire, importPgn, posKey, START_FEN } from '../src/repertoire.js';

// Juega jugadas SAN desde una posición añadiéndolas al repertorio. Devuelve el camino.
export function play(rep, sans, fen = START_FEN) {
  const chess = new Chess(fen);
  const path = [];
  for (const san of sans) {
    const from = posKey(chess.fen());
    const move = chess.move(san);
    path.push({ from, move: addMove(rep, move) });
  }
  return path;
}

export function repFromPgn(pgn, color = 'white') {
  const rep = newRepertoire('test', color);
  const result = importPgn(rep, pgn);
  if (result.errors.length) throw new Error(result.errors.join('; '));
  return rep;
}

// Clave de la posición tras unas jugadas desde el inicio.
export function keyAfter(sans) {
  const chess = new Chess();
  for (const san of sans) chess.move(san);
  return posKey(chess.fen());
}

export function fenAfter(sans) {
  const chess = new Chess();
  for (const san of sans) chess.move(san);
  return chess.fen();
}

// SAN de las jugadas preparadas tras una secuencia.
export function movesAfter(rep, sans) {
  return (rep.positions[keyAfter(sans)]?.moves ?? []).map((m) => m.san);
}
