// Revisión del repertorio con la evaluación de la nube de Lichess:
// busca jugadas tuyas que pierden mucha ventaja respecto a la mejor.
import { Chess } from 'chess.js';
import { ROOT_KEY, isUserTurn } from './repertoire.js';
import { sanOf } from './chess-utils.js';

const MATE = 10000;

// Evaluación (centipeones, blancas) vista desde tu color. Los mates valen casi 100 peones.
export function scoreFor({ cp, mate }, color) {
  const value = mate != null ? Math.sign(mate) * (MATE - Math.abs(mate) * 10) : cp ?? 0;
  return color === 'white' ? value : -value;
}

// Cuánto empeora tu jugada respecto a la mejor (positivo = pierdes ventaja).
export function moveLoss(before, after, color) {
  return scoreFor(before, color) - scoreFor(after, color);
}

export function classify(loss) {
  if (loss >= 150) return 'error';
  if (loss >= 60) return 'dudosa';
  return 'ok';
}

// Tus posiciones (te toca mover y tienes jugada) alcanzables desde `from`, de menos a más profundas.
export function userPositionsFrom(rep, from = ROOT_KEY) {
  const seen = new Set([from]);
  const queue = [from];
  const keys = [];
  while (queue.length) {
    const key = queue.shift();
    const moves = rep.positions[key]?.moves ?? [];
    if (isUserTurn(rep, key) && moves.length) keys.push(key);
    for (const m of moves) {
      if (!seen.has(m.to)) {
        seen.add(m.to);
        queue.push(m.to);
      }
    }
  }
  return keys;
}

// evaluate(fen) → { cp?, mate?, best } | null (sin datos). Revisa como mucho `limit` posiciones.
export async function reviewRepertoire(rep, { from = ROOT_KEY, evaluate, onProgress, signal, limit = 120 }) {
  const keys = userPositionsFrom(rep, from).slice(0, limit);
  const results = [];
  let noData = 0;
  let checked = 0;
  for (const key of keys) {
    if (signal?.aborted) break;
    const pos = rep.positions[key];
    const before = await evaluate(pos.fen);
    for (const move of pos.moves) {
      if (signal?.aborted) break;
      if (!before) {
        noData++;
        continue;
      }
      const best = sanOf(new Chess(pos.fen), before.best);
      if (best === move.san) {
        results.push({ key, move, loss: 0, best, kind: 'ok' });
        continue;
      }
      const after = await evaluate(rep.positions[move.to].fen);
      if (!after) {
        noData++;
        continue;
      }
      const loss = moveLoss(before, after, rep.color);
      results.push({ key, move, loss, best, before, after, kind: classify(loss) });
    }
    checked++;
    onProgress?.(checked, keys.length);
  }
  return { results, noData, checked, total: keys.length };
}
