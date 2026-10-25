// Modelo del repertorio: un grafo de posiciones (las transposiciones se unen solas).
//
// rep = {
//   id, name, color: 'white' | 'black', createdAt,
//   positions: { [clave]: { fen, moves: [{ san, uci, to, comment? }] } },
//   cards: { [clave]: tarjeta de repaso }   // solo posiciones donde te toca mover
// }
import { Chess } from 'chess.js';

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// La clave ignora los contadores de jugadas para que las transposiciones coincidan.
export function posKey(fen) {
  return fen.split(' ').slice(0, 4).join(' ');
}

export const ROOT_KEY = posKey(START_FEN);

export function turnOf(key) {
  return key.split(' ')[1] === 'w' ? 'white' : 'black';
}

export function newRepertoire(name, color) {
  return {
    id: crypto.randomUUID(),
    name,
    color,
    createdAt: Date.now(),
    positions: { [ROOT_KEY]: { fen: START_FEN, moves: [] } },
    cards: {},
  };
}

export function isUserTurn(rep, key) {
  return turnOf(key) === rep.color;
}

// Añade una jugada (ya validada por chess.js) desde la posición `fromFen`.
// Devuelve la arista, nueva o existente. Con `own`, marca las jugadas nuevas como tuyas
// (en un curso de la biblioteca, así se conservan al actualizarlo).
export function addMove(rep, move, { own = false } = {}) {
  const fromKey = posKey(move.before);
  const toKey = posKey(move.after);
  if (!rep.positions[fromKey]) rep.positions[fromKey] = { fen: move.before, moves: [] };
  if (!rep.positions[toKey]) rep.positions[toKey] = { fen: move.after, moves: [] };
  const uci = move.from + move.to + (move.promotion || '');
  const list = rep.positions[fromKey].moves;
  let edge = list.find((m) => m.uci === uci);
  if (!edge) {
    edge = { san: move.san, uci, to: toKey };
    if (own) edge.own = true;
    list.push(edge);
  }
  return edge;
}

export function deleteMove(rep, fromKey, uci) {
  const pos = rep.positions[fromKey];
  if (!pos) return;
  pos.moves = pos.moves.filter((m) => m.uci !== uci);
  garbageCollect(rep);
}

// Borra posiciones (y sus tarjetas) que ya no se alcanzan desde la inicial.
function garbageCollect(rep) {
  const seen = new Set([ROOT_KEY]);
  const stack = [ROOT_KEY];
  while (stack.length) {
    const key = stack.pop();
    for (const m of rep.positions[key]?.moves ?? []) {
      if (!seen.has(m.to)) {
        seen.add(m.to);
        stack.push(m.to);
      }
    }
  }
  for (const key of Object.keys(rep.positions)) if (!seen.has(key)) delete rep.positions[key];
  for (const key of Object.keys(rep.cards)) {
    const hasUserMove = rep.positions[key]?.moves.length;
    if (!seen.has(key) || !hasUserMove) delete rep.cards[key];
  }
}

// Posiciones que se entrenan: te toca mover y tienes al menos una jugada preparada.
export function trainableKeys(rep) {
  return Object.keys(rep.positions).filter(
    (key) => isUserTurn(rep, key) && rep.positions[key].moves.length > 0,
  );
}

// Posiciones donde te toca mover pero no tienes respuesta (huecos del repertorio).
export function gapKeys(rep) {
  return Object.keys(rep.positions).filter(
    (key) => key !== ROOT_KEY && isUserTurn(rep, key) && rep.positions[key].moves.length === 0,
  );
}

// Camino más corto desde la posición inicial hasta `target`: [{ from, move }].
export function pathTo(rep, target) {
  if (target === ROOT_KEY) return [];
  const parent = new Map([[ROOT_KEY, null]]);
  const queue = [ROOT_KEY];
  while (queue.length) {
    const key = queue.shift();
    for (const move of rep.positions[key]?.moves ?? []) {
      if (parent.has(move.to)) continue;
      parent.set(move.to, { from: key, move });
      if (move.to === target) {
        const path = [];
        for (let step = parent.get(target); step; step = parent.get(step.from)) path.unshift(step);
        return path;
      }
      queue.push(move.to);
    }
  }
  return null;
}

// Todas las líneas desde `from` (por defecto la posición inicial) hasta cada hoja.
// Con `trim`, se recortan las jugadas finales del rival: así una línea de
// entrenamiento termina siempre con una jugada tuya.
export function allLines(rep, { from = ROOT_KEY, trim = true, maxLines = 5000 } = {}) {
  const lines = [];
  const seen = new Set();
  const onPath = new Set();
  const path = [];

  const emit = () => {
    const line = path.slice();
    while (trim && line.length && !isUserTurn(rep, line[line.length - 1].from)) line.pop();
    if (!line.length) return;
    const id = line.map((s) => s.move.uci).join(' ');
    if (seen.has(id)) return;
    seen.add(id);
    lines.push(line);
  };

  const walk = (key) => {
    if (lines.length >= maxLines) return;
    const moves = rep.positions[key]?.moves ?? [];
    if (!moves.length || path.length >= 120) return emit();
    onPath.add(key);
    for (const move of moves) {
      path.push({ from: key, move });
      if (onPath.has(move.to)) emit();
      else walk(move.to);
      path.pop();
    }
    onPath.delete(key);
  };

  walk(from);
  return lines;
}

// Cuántas jugadas del repertorio llegan a esta posición (>1 = transposición).
export function parentCount(rep, key) {
  let count = 0;
  for (const pos of Object.values(rep.positions)) {
    for (const move of pos.moves) if (move.to === key) count++;
  }
  return count;
}

// Reconstruye un camino a partir de jugadas UCI ("e2e4,e7e5"); null si no existe.
export function pathFromUcis(rep, ucis) {
  const path = [];
  let key = ROOT_KEY;
  for (const uci of ucis) {
    const move = rep.positions[key]?.moves.find((m) => m.uci === uci);
    if (!move) return null;
    path.push({ from: key, move });
    key = move.to;
  }
  return path;
}

// Posiciones que más te cuesta recordar (con fallos y aún sin consolidar), de peor a mejor.
export function weakKeys(rep, limit = 30) {
  return Object.entries(rep.cards)
    .filter(([key, card]) => card.lapses > 0 && card.interval < 21 && rep.positions[key]?.moves.length)
    .sort(([, a], [, b]) => b.lapses - a.lapses || b.last - a.last)
    .slice(0, limit)
    .map(([key]) => key);
}

export function repStats(rep, now = Date.now()) {
  const keys = trainableKeys(rep);
  let due = 0;
  let fresh = 0;
  for (const key of keys) {
    const card = rep.cards[key];
    if (!card) fresh++;
    else if (card.due <= now) due++;
  }
  const learned = keys.length - due - fresh;
  return { total: keys.length, due, fresh, learned, gaps: gapKeys(rep).length };
}

// ---------- PGN ----------

export const RESULT = /^(1-0|0-1|1\/2-1\/2|\*)$/;

// Limpia una palabra del PGN: quita números de jugada, NAG y signos !?; null si no es una jugada.
export function cleanMoveToken(word) {
  if (/^\$\d+$/.test(word)) return null; // NAG
  word = word.replace(/^\d+\.+/, ''); // "1." "12..." pegado a la jugada
  if (!word || /^\d+$/.test(word)) return null;
  word = word.replace(/[!?]+$/, '').replace(/^0-0-0/, 'O-O-O').replace(/^0-0/, 'O-O');
  if (!word || word === '--' || word === 'Z0') return null;
  return word;
}

export function tokenize(text) {
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (/\s/.test(ch)) {
      i++;
    } else if (ch === '{') {
      const end = text.indexOf('}', i);
      const stop = end === -1 ? text.length : end;
      tokens.push({ type: 'comment', value: text.slice(i + 1, stop).trim() });
      i = stop + 1;
    } else if (ch === ';') {
      const end = text.indexOf('\n', i);
      const stop = end === -1 ? text.length : end;
      tokens.push({ type: 'comment', value: text.slice(i + 1, stop).trim() });
      i = stop;
    } else if (ch === '[') {
      const end = text.indexOf(']', i);
      const stop = end === -1 ? text.length : end;
      tokens.push({ type: 'header', value: text.slice(i + 1, stop) });
      i = stop + 1;
    } else if (ch === '(' || ch === ')') {
      tokens.push({ type: ch });
      i++;
    } else {
      let j = i;
      while (j < text.length && !/[\s{}()[\];]/.test(text[j])) j++;
      tokens.push({ type: 'word', value: text.slice(i, j) });
      i = j;
    }
  }
  return tokens;
}

// Importa uno o varios PGN (con variantes y comentarios) al repertorio.
// Devuelve { added, errors }.
export function importPgn(rep, text, { own = false } = {}) {
  const chess = new Chess();
  let loaded = chess.fen();
  let added = 0;
  const errors = [];
  // Estado actual: fen antes y después de la última jugada, y la última arista.
  let state = { before: null, after: START_FEN, edge: null };
  const stack = [];
  let skipping = 0; // profundidad dentro de una variante descartada tras un error
  let deadGame = false; // error en la línea principal: se ignora hasta la siguiente partida
  let inMoves = false;

  const resetGame = () => {
    state = { before: null, after: START_FEN, edge: null };
    stack.length = 0;
    skipping = 0;
    deadGame = false;
    inMoves = false;
  };

  for (const tok of tokenize(text)) {
    if (tok.type === 'header') {
      if (inMoves || deadGame) resetGame();
      const fen = tok.value.match(/^FEN\s+"([^"]+)"/i)?.[1];
      if (fen) {
        // Un capítulo puede empezar a mitad de una línea: vale si esa posición ya está en el repertorio.
        if (posKey(fen) === ROOT_KEY || rep.positions[posKey(fen)]) {
          state = { before: null, after: fen, edge: null };
        } else {
          errors.push('Se ignoró una partida que empieza en una posición que no está en tu repertorio.');
          deadGame = true;
        }
      }
      continue;
    }
    if (tok.type === 'word' && RESULT.test(tok.value)) { resetGame(); continue; }
    if (deadGame) continue;
    if (tok.type === '(') {
      if (skipping) { skipping++; continue; }
      stack.push(state);
      state = { before: null, after: state.before ?? state.after, edge: null };
      continue;
    }
    if (tok.type === ')') {
      // Al descartar una variante ya se recuperó el estado del padre.
      if (skipping) { skipping--; continue; }
      state = stack.pop() ?? state;
      continue;
    }
    if (skipping) continue;
    if (tok.type === 'comment') {
      // Quita las marcas de flechas/casillas de Lichess: [%cal Ge2e4], [%csl Rd5]...
      const text = tok.value.replace(/\[%[^\]]*\]/g, '').trim();
      // Si el comentario ya está (p. ej. al reimportar el mismo PGN), no se repite.
      if (state.edge && text && !state.edge.comment?.includes(text)) {
        state.edge.comment = state.edge.comment ? `${state.edge.comment} ${text}` : text;
      }
      continue;
    }
    const word = cleanMoveToken(tok.value);
    if (!word) continue;

    inMoves = true;
    try {
      // Cargar una FEN es lento: solo hace falta al cambiar de variante o de partida.
      if (loaded !== state.after) chess.load(state.after);
      const move = chess.move(word);
      loaded = move.after;
      const before = rep.positions[posKey(move.before)]?.moves.length ?? 0;
      const edge = addMove(rep, move, { own });
      if ((rep.positions[posKey(move.before)].moves.length) > before) added++;
      state = { before: move.before, after: move.after, edge };
    } catch {
      errors.push(`Jugada no válida: "${tok.value}"`);
      // Ignora el resto de esta variante (o de la partida si es la línea principal).
      if (stack.length) { state = stack.pop(); skipping = 1; }
      else deadGame = true;
    }
  }
  return { added, errors };
}

function numberFor(fen, san, force) {
  const [, turn, , , , full] = fen.split(' ');
  if (turn === 'w') return `${full}. ${san}`;
  return force ? `${full}... ${san}` : san;
}

function cleanComment(text) {
  return text.replace(/[{}]/g, '');
}

// Exporta el repertorio como un PGN con variantes.
export function exportPgn(rep) {
  const visited = new Set();

  const continuation = (key, force) => {
    const pos = rep.positions[key];
    if (!pos || !pos.moves.length || visited.has(key)) return '';
    visited.add(key);
    const [main, ...alts] = pos.moves;
    const parts = [numberFor(pos.fen, main.san, force)];
    if (main.comment) parts.push(`{${cleanComment(main.comment)}}`);
    for (const alt of alts) {
      let text = numberFor(pos.fen, alt.san, true);
      if (alt.comment) text += ` {${cleanComment(alt.comment)}}`;
      const rest = continuation(alt.to, false);
      parts.push(`(${text}${rest ? ' ' + rest : ''})`);
    }
    const rest = continuation(main.to, alts.length > 0 || Boolean(main.comment));
    if (rest) parts.push(rest);
    return parts.join(' ');
  };

  const color = rep.color === 'white' ? 'Blancas' : 'Negras';
  const header = `[Event "${rep.name.replace(/"/g, "'")}"]\n[Repertorio "${color}"]\n\n`;
  return `${header}${continuation(ROOT_KEY, false)} *\n`;
}

const asIs = (san) => san;

// Etiqueta de una jugada del camino: "3. Bc4", "3... Bc5" (si `force`) o "Bc5".
// `fmt` permite mostrar la jugada en otra notación (p. ej. española).
export function stepLabel(rep, step, force = false, fmt = asIs) {
  return numberFor(rep.positions[step.from].fen, fmt(step.move.san), force);
}

// SAN con número de jugada para mostrar un camino: "1. e4 e5 2. Nf3".
export function pathToText(rep, path, fmt = asIs) {
  return path.map((step, i) => stepLabel(rep, step, i === 0, fmt)).join(' ');
}

export function fenAfterPath(rep, path) {
  if (!path.length) return START_FEN;
  return rep.positions[path[path.length - 1].move.to].fen;
}

// Todas las posiciones que cuelgan de `from` (incluida).
export function subtreeKeys(rep, from) {
  const seen = new Set([from]);
  const stack = [from];
  while (stack.length) {
    const key = stack.pop();
    for (const m of rep.positions[key]?.moves ?? []) {
      if (!seen.has(m.to)) {
        seen.add(m.to);
        stack.push(m.to);
      }
    }
  }
  return [...seen];
}

// Olvida el progreso para volver a aprender: las jugadas vuelven a ser "nuevas".
// Con `from`, solo lo que cuelga de esa posición. Deja una marca de fecha para que la
// sincronización no recupere el progreso antiguo desde otro dispositivo.
// Devuelve cuántas jugadas se han reiniciado.
export function resetProgress(rep, { from = null, now = Date.now() } = {}) {
  if (!from || from === ROOT_KEY) {
    const count = Object.keys(rep.cards).length;
    rep.cards = {};
    rep.progressResetAt = now;
    rep.resets = {};
    return count;
  }
  return resetKeys(rep, subtreeKeys(rep, from), now);
}

// Reinicia el progreso de unas posiciones concretas (solo cuentan las tuyas con jugada).
export function resetKeys(rep, keys, now = Date.now()) {
  let count = 0;
  rep.resets ??= {};
  for (const key of keys) {
    if (!isUserTurn(rep, key) || !rep.positions[key]?.moves.length) continue;
    if (rep.cards[key]) {
      delete rep.cards[key];
      count++;
    }
    rep.resets[key] = now;
  }
  return count;
}

// ¿Se reinició esta posición después de este repaso?
export function wasReset(rep, key, card) {
  const since = Math.max(rep.progressResetAt ?? 0, rep.resets?.[key] ?? 0);
  return (card.last ?? 0) <= since;
}
