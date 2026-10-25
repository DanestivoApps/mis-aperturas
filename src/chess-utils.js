// Utilidades con chess.js (sin interfaz: se pueden probar en Node).

export function colorToMove(chess) {
  return chess.turn() === 'w' ? 'white' : 'black';
}

// Casillas destino legales en el formato que espera chessground.
export function destsFor(chess) {
  const dests = new Map();
  for (const move of chess.moves({ verbose: true })) {
    if (!dests.has(move.from)) dests.set(move.from, []);
    dests.get(move.from).push(move.to);
  }
  return dests;
}

export function squaresOf(uci) {
  return [uci.slice(0, 2), uci.slice(2, 4)];
}

// Intenta jugar orig→dest (corona siempre a dama). Devuelve el movimiento o null.
export function tryMove(chess, orig, dest) {
  try {
    return chess.move({ from: orig, to: dest, promotion: 'q' });
  } catch {
    return null;
  }
}

export function uciOf(move) {
  return move.from + move.to + (move.promotion || '');
}

// Juega una jugada en UCI. Lichess escribe el enroque como "rey a la torre" (e1h1),
// así que lo traducimos a la casilla final del rey (e1g1).
export function moveFromUci(chess, uci) {
  const from = uci.slice(0, 2);
  let to = uci.slice(2, 4);
  const piece = chess.get(from);
  if (piece?.type === 'k' && from[0] === 'e' && from[1] === to[1] && (to[0] === 'h' || to[0] === 'a')) {
    to = (to[0] === 'h' ? 'g' : 'c') + to[1];
  }
  try {
    return chess.move({ from, to, promotion: uci[4] || 'q' });
  } catch {
    return null;
  }
}

// SAN de una jugada UCI sin modificar la posición.
export function sanOf(chess, uci) {
  const move = moveFromUci(chess, uci);
  if (!move) return null;
  chess.undo();
  return move.san;
}
