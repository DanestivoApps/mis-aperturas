// Compara tus partidas reales con tu repertorio: dónde te desviaste tú,
// dónde se salió el rival y hasta dónde llegó tu preparación.
import { Chess } from 'chess.js';
import { tokenize, cleanMoveToken, RESULT, posKey } from './repertoire.js';
import { uciOf } from './chess-utils.js';

// Partidas de un texto PGN (solo la línea principal): [{ headers, sans }]
export function parseGames(text) {
  const games = [];
  let cur = null;
  let depth = 0;
  const finish = () => {
    if (cur?.sans.length) games.push(cur);
    cur = null;
    depth = 0;
  };
  for (const tok of tokenize(text)) {
    if (tok.type === 'header') {
      if (cur?.sans.length) finish();
      cur ??= { headers: {}, sans: [] };
      const match = tok.value.match(/^(\w+)\s+"([\s\S]*)"$/);
      if (match) cur.headers[match[1]] = match[2];
      continue;
    }
    if (tok.type === '(') {
      depth++;
      continue;
    }
    if (tok.type === ')') {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (tok.type === 'comment' || depth) continue;
    if (RESULT.test(tok.value)) {
      if (cur) cur.headers.Result ??= tok.value;
      finish();
      continue;
    }
    const san = cleanMoveToken(tok.value);
    if (!san) continue;
    cur ??= { headers: {}, sans: [] };
    cur.sans.push(san);
  }
  finish();
  return games;
}

export const OUTCOMES = {
  fin: 'Seguiste tu repertorio hasta el final',
  'fin-partida': 'La partida terminó dentro de tu repertorio',
  'te-desviaste': 'Te desviaste de tu repertorio',
  'rival-se-salio': 'El rival se salió de tu preparación',
  hueco: 'Llegaste a una posición sin respuesta preparada',
  'sin-repertorio': 'No tienes repertorio para ese color',
  'no-jugador': 'No jugaste esta partida (otro nombre de usuario)',
  'otra-variante': 'Partida desde otra posición o variante',
  error: 'No se pudo leer la partida',
};

// "3." para blancas, "3..." para negras.
export function moveNumber(ply) {
  return `${Math.floor(ply / 2) + 1}${ply % 2 ? '...' : '.'}`;
}

function playerColor(headers, username) {
  const name = username.trim().toLowerCase();
  if (!name) return null;
  if ((headers.White ?? '').toLowerCase() === name) return 'white';
  if ((headers.Black ?? '').toLowerCase() === name) return 'black';
  return null;
}

// Analiza una partida frente a los repertorios del color con el que jugaste.
export function analyzeGame(game, reps, username) {
  const color = playerColor(game.headers, username);
  const base = {
    game,
    color,
    opponent: color === 'white' ? game.headers.Black : game.headers.White,
    ucis: [],
    ply: 0,
  };
  if (!color) return { ...base, outcome: 'no-jugador' };
  const variant = game.headers.Variant;
  if (game.headers.FEN || (variant && !/^standard$/i.test(variant))) return { ...base, outcome: 'otra-variante' };
  const mine = reps.filter((r) => r.color === color);
  if (!mine.length) return { ...base, outcome: 'sin-repertorio' };

  const chess = new Chess();
  const ucis = [];
  for (let ply = 0; ply < game.sans.length; ply++) {
    const key = posKey(chess.fen());
    const userTurn = (ply % 2 === 0 ? 'white' : 'black') === color;
    const holder = mine.find((r) => r.positions[key]?.moves.length) ?? mine.find((r) => r.positions[key]);
    const repMoves = mine.flatMap((r) => r.positions[key]?.moves ?? []);
    let move;
    try {
      move = chess.move(game.sans[ply]);
    } catch {
      return { ...base, outcome: 'error', ply, ucis };
    }
    const uci = uciOf(move);
    const where = { ply, key, ucis: ucis.slice(), repId: holder?.id, played: move.san, playedUci: uci };
    if (!repMoves.length) return { ...base, ...where, outcome: userTurn ? 'hueco' : 'fin' };
    if (!repMoves.some((m) => m.uci === uci)) {
      return {
        ...base,
        ...where,
        outcome: userTurn ? 'te-desviaste' : 'rival-se-salio',
        expected: [...new Set(repMoves.map((m) => m.san))],
      };
    }
    ucis.push(uci);
  }
  return { ...base, outcome: 'fin-partida', ply: game.sans.length, ucis };
}

// Agrupa los resultados: tus desviaciones, sorpresas del rival y huecos, de más a menos frecuentes.
export function summarize(results) {
  const counts = {};
  for (const r of results) counts[r.outcome] = (counts[r.outcome] ?? 0) + 1;

  const group = (outcome, keyOf) => {
    const map = new Map();
    for (const r of results.filter((x) => x.outcome === outcome)) {
      const k = keyOf(r);
      const entry = map.get(k) ?? { ...r, count: 0, games: [] };
      entry.count++;
      entry.games.push(r.game);
      map.set(k, entry);
    }
    return [...map.values()].sort((a, b) => b.count - a.count || a.ply - b.ply);
  };

  const relevant = results.filter((r) => !['no-jugador', 'otra-variante', 'sin-repertorio', 'error'].includes(r.outcome));
  return {
    counts,
    analyzed: relevant.length,
    averageBook: relevant.length ? relevant.reduce((n, r) => n + r.ply, 0) / relevant.length : 0,
    deviations: group('te-desviaste', (r) => `${r.key}|${r.playedUci}`),
    surprises: group('rival-se-salio', (r) => `${r.key}|${r.playedUci}`),
    gaps: group('hueco', (r) => r.key),
  };
}
