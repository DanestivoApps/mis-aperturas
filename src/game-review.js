// Revisión de una partida: cuánto pierde cada jugada respecto a la mejor y qué había que jugar.
// Las evaluaciones llegan desde el punto de vista del bando al que le toca mover.
// Los errores se miden como Lichess: por lo que baja tu probabilidad de ganar, no en peones
// (perder 2 peones cuando vas +8 no cambia nada; perderlos con la partida igualada, sí).

const MATE = 10000;
const CAP = 1000; // más de 10 peones de diferencia ya es «partida decidida»

export const VERDICTS = {
  mejor: { label: 'La mejor', symbol: '★', kind: 'ok' },
  buena: { label: 'Buena', symbol: '✓', kind: 'ok' },
  imprecision: { label: 'Imprecisión', symbol: '?!', kind: 'warn' },
  error: { label: 'Error', symbol: '?', kind: 'bad' },
  grave: { label: 'Error grave', symbol: '??', kind: 'bad' },
};

// Valor en centipeones para el bando que mueve (los mates valen casi 100 peones).
export function scoreValue({ cp = null, mate = null } = {}) {
  if (mate != null) return Math.sign(mate || -1) * (MATE - Math.abs(mate) * 10);
  return cp ?? 0;
}

const clamp = (v) => Math.max(-CAP, Math.min(CAP, v));

// Probabilidad de ganar (0-100) del bando que mueve, con la fórmula de Lichess.
export function winPercent(score) {
  const cp = clamp(scoreValue(score));
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
}

// Pérdida en centipeones: lo que valía la posición antes (para quien mueve) menos lo que vale después.
// `before` y `after` son evaluaciones desde el bando que mueve en cada posición.
export function moveLoss(before, after) {
  return Math.max(0, clamp(scoreValue(before)) - clamp(-scoreValue(after)));
}

// Cuántos puntos de probabilidad de ganar te cuesta la jugada (0-100).
export function winDrop(before, after) {
  return Math.max(0, winPercent(before) - (100 - winPercent(after)));
}

// Umbrales de Lichess: imprecisión 5 puntos, error 10, error grave 15.
export function verdict(drop, isBest) {
  if (isBest || drop < 1) return 'mejor';
  if (drop < 5) return 'buena';
  if (drop < 10) return 'imprecision';
  if (drop < 15) return 'error';
  return 'grave';
}

// Precisión de una jugada (0-100) según lo que baja tu probabilidad de ganar (fórmula de Lichess).
export function moveAccuracy(drop) {
  return Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * drop) - 3.1669));
}

// Precisión de la partida: media entre la media normal y la armónica de cada jugada
// (la armónica castiga más los errores gordos, como hace Lichess).
export function accuracy(drops) {
  if (!drops.length) return 100;
  const accs = drops.map(moveAccuracy);
  const mean = accs.reduce((n, a) => n + a, 0) / accs.length;
  const harmonic = accs.length / accs.reduce((n, a) => n + 1 / Math.max(a, 1), 0);
  return Math.round((mean + harmonic) / 2);
}

// Evaluación para mostrar, desde las blancas: «+1,2», «−0,4», «M3», «−M2».
export function formatEval(score, whiteToMove) {
  const sign = whiteToMove ? 1 : -1;
  if (score.mate != null) {
    const m = score.mate * sign;
    return m === 0 ? '#' : `${m > 0 ? '' : '−'}M${Math.abs(m)}`;
  }
  const v = Math.round(((score.cp ?? 0) * sign) / 10) / 10;
  return `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(1).replace('.', ',')}`;
}
