// Lógica del entrenamiento sin interfaz: qué línea toca, qué posiciones son débiles.
import { isUserTurn, weakKeys } from './repertoire.js';

export function lineId(line) {
  return line.map((s) => s.move.uci).join(' ');
}

// Cuenta tus jugadas pendientes (ya vencidas) y nuevas en una línea, sin contar el tramo inicial.
export function lineCounts(rep, line, { fromIndex = 0, now = Date.now() } = {}) {
  let due = 0;
  let fresh = 0;
  for (let i = fromIndex; i < line.length; i++) {
    const step = line[i];
    if (!isUserTurn(rep, step.from)) continue;
    const card = rep.cards[step.from];
    if (!card) fresh++;
    else if (card.due <= now) due++;
  }
  return { due, fresh };
}

// Para el repaso: la línea con más jugadas pendientes (las nuevas cuentan si queda cupo).
// En caso de empate gana la primera, así se aprende primero la línea principal.
export function pickSrsLine(rep, lines, { prefixLength = 0, newBudget = 0, skipped = new Set(), now = Date.now() } = {}) {
  let best = null;
  let bestScore = 0;
  for (const line of lines) {
    if (skipped.has(lineId(line))) continue;
    const { due, fresh } = lineCounts(rep, line, { fromIndex: prefixLength, now });
    const score = due + (newBudget > 0 ? fresh : 0);
    if (score > bestScore) {
      best = line;
      bestScore = score;
    }
  }
  return best;
}

// Para el modo errores: por cada posición débil, la línea más corta que pasa por ella.
export function weakLines(rep, lines) {
  const chosen = new Map();
  for (const key of weakKeys(rep)) {
    let best = null;
    for (const line of lines) {
      if (line.some((s) => s.from === key) && (!best || line.length < best.length)) best = line;
    }
    if (best) chosen.set(lineId(best), best);
  }
  return [...chosen.values()];
}
