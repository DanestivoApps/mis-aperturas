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

// Pendientes y nuevas contando solo las posiciones de estas líneas (p. ej. un nivel o un tramo).
export function scopeStats(rep, lines, { fromIndex = 0, now = Date.now() } = {}) {
  const keys = new Set();
  for (const line of lines) {
    for (let i = fromIndex; i < line.length; i++) if (isUserTurn(rep, line[i].from)) keys.add(line[i].from);
  }
  let due = 0;
  let fresh = 0;
  for (const key of keys) {
    const card = rep.cards[key];
    if (!card) fresh++;
    else if (card.due <= now) due++;
  }
  return { total: keys.size, due, fresh };
}

// Quita las líneas repetidas conservando el orden (p. ej. varios fallos en la misma línea).
export function uniqueLines(lines) {
  const seen = new Set();
  return lines.filter((line) => {
    const id = lineId(line);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

// Para la contrarreloj: cada posición en la que te toca mover, con el camino más corto que lleva a ella.
export function drillPositions(rep, lines) {
  const best = new Map();
  for (const line of lines) {
    line.forEach((step, i) => {
      if (!isUserTurn(rep, step.from)) return;
      const prev = best.get(step.from);
      if (!prev || i < prev.path.length) best.set(step.from, { key: step.from, path: line.slice(0, i) });
    });
  }
  return [...best.values()];
}

// Récord de la contrarreloj por duración ({ '180': 23 }): se queda el mayor de los dos.
export function mergeBest(a = {}, b = {}) {
  const best = { ...a };
  for (const [k, v] of Object.entries(b)) best[k] = Math.max(best[k] ?? 0, v);
  return best;
}

export function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}
