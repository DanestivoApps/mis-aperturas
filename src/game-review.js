// Revisión de una partida: cuánto pierde cada jugada respecto a la mejor y qué había que jugar.
// Las evaluaciones llegan desde el punto de vista del bando al que le toca mover.

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

// Pérdida de una jugada: lo que valía la posición antes (para quien mueve) menos lo que vale después.
// `before` y `after` son evaluaciones desde el bando que mueve en cada posición.
export function moveLoss(before, after) {
  return Math.max(0, clamp(scoreValue(before)) - clamp(-scoreValue(after)));
}

export function verdict(loss, isBest) {
  if (isBest || loss < 10) return 'mejor';
  if (loss < 50) return 'buena';
  if (loss < 120) return 'imprecision';
  if (loss < 300) return 'error';
  return 'grave';
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

// Precisión aproximada (0-100) a partir de la pérdida media, al estilo de las webs de ajedrez.
export function accuracy(losses) {
  if (!losses.length) return 100;
  const avg = losses.reduce((n, l) => n + Math.min(l, 500), 0) / losses.length;
  return Math.max(0, Math.round(100 * Math.exp(-avg / 180)));
}
