// Lo que tus partidas y tus repertorios dicen de ti: resumen para el inicio, huecos,
// cursos recomendados, posiciones que de verdad te salen y trampas para practicar.
import { Chess } from 'chess.js';
import { posKey, ROOT_KEY, isUserTurn, allLines } from './repertoire.js';
import { moveFromUci } from './chess-utils.js';
import { COURSES } from './library.js';
import { levelKeys } from './courses.js';
import { lineId } from './session.js';

// Respuestas habituales a cada primera jugada, para buscar huecos y montar el plan.
export const REPLIES = {
  e4: [['e5', '1...e5'], ['c5', '1...c5 (Siciliana)'], ['e6', '1...e6 (Francesa)'], ['c6', '1...c6 (Caro-Kann)'],
    ['d5', '1...d5 (Escandinava)'], ['d6', '1...d6 (Pirc)'], ['g6', '1...g6 (Moderna)'], ['Nf6', '1...Cf6 (Alekhine)']],
  d4: [['d5', '1...d5'], ['Nf6', '1...Cf6 (Indias)'], ['f5', '1...f5 (Holandesa)'], ['e6', '1...e6'], ['g6', '1...g6'], ['c5', '1...c5 (Benoni)']],
  c4: [['e5', '1...e5'], ['c5', '1...c5'], ['Nf6', '1...Cf6'], ['e6', '1...e6'], ['c6', '1...c6']],
  Nf3: [['d5', '1...d5'], ['Nf6', '1...Cf6'], ['c5', '1...c5']],
};
export const FIRST_MOVES = [['e4', '1.e4'], ['d4', '1.d4'], ['c4', '1.c4'], ['Nf3', '1.Cf3']];

// Cursos más agresivos (para el estilo «al ataque» del plan).
const AGGRESSIVE = new Set(['fried-liver', 'danes', 'vienesa', 'smith-morra', 'alien-gambit', 'blackmar-diemer', 'escocesa',
  'stafford', 'englund', 'dragon-acelerado', 'najdorf', 'india-de-rey', 'grunfeld', 'holandesa', 'escandinava', 'pirc']);

export function keyAfter(sans) {
  const chess = new Chess();
  for (const s of sans) chess.move(s);
  return posKey(chess.fen());
}

// ¿Tienes jugada propia en esta posición en algún repertorio de ese color?
export function covers(reps, color, key) {
  return reps.some((r) => r.color === color && r.positions[key]?.moves.length);
}

// Huecos: salidas del rival (o respuestas a tu primera jugada) para las que no tienes nada.
export function coverageGaps(reps) {
  const gaps = [];
  const white = reps.filter((r) => r.color === 'white');
  if (white.length) {
    const firsts = new Set(white.flatMap((r) => (r.positions[ROOT_KEY]?.moves ?? []).map((m) => m.san)));
    for (const first of firsts) {
      for (const [reply, label] of REPLIES[first] ?? []) {
        const key = keyAfter([first, reply]);
        if (!covers(reps, 'white', key)) gaps.push({ color: 'white', key, sans: [first, reply], label: `1.${sanEs(first)} ${label.replace('1...', '')}` });
      }
    }
  }
  if (reps.some((r) => r.color === 'black')) {
    for (const [first, label] of FIRST_MOVES) {
      const key = keyAfter([first]);
      if (!covers(reps, 'black', key)) gaps.push({ color: 'black', key, sans: [first], label });
    }
  }
  return gaps;
}

const sanEs = (s) => s.replace(/^N/, 'C');

// Cursos de la biblioteca que responden a una posición (tienen jugada tuya ahí), los del nivel Esencial primero.
export function coursesFor(key, color) {
  return COURSES.filter((c) => c.color === color && levelKeys(c, c.levels.length - 1).has(key))
    .sort((a, b) => Number(levelKeys(b, 0).has(key)) - Number(levelKeys(a, 0).has(key)));
}

// Plan de repertorio: el menor número de cursos que cubre las salidas más habituales.
// `owned`: cursos que ya tienes (cuentan primero). `weights`: frecuencia de cada posición en tus partidas.
export function buildPlan({ first = 'e4', style = 'solido', owned = new Set(), weights = {} } = {}) {
  const slots = [
    ...(REPLIES[first] ?? []).slice(0, first === 'e4' ? 6 : 4)
      .map(([reply, label]) => ({ color: 'white', key: keyAfter([first, reply]), label: `1.${sanEs(first)} ${label.replace('1...', '')}` })),
    ...FIRST_MOVES.map(([move, label]) => ({ color: 'black', key: keyAfter([move]), label: `Contra ${label}` })),
  ];
  const picks = [];
  for (const color of ['white', 'black']) {
    let open = slots.filter((s) => s.color === color);
    const candidates = COURSES.filter((c) => c.color === color);
    while (open.length) {
      let best = null;
      let bestScore = 0;
      for (const course of candidates) {
        if (picks.some((p) => p.course === course)) continue;
        const keys = levelKeys(course, course.levels.length - 1);
        const hits = open.filter((s) => keys.has(s.key));
        if (!hits.length) continue;
        const styleFit = (style === 'agresivo') === AGGRESSIVE.has(course.id);
        const score = hits.reduce((n, s) => n + 1 + (weights[s.key] ?? 0), 0) + (owned.has(course.id) ? 2 : 0) + (styleFit ? 0.6 : style === 'solido' ? -1.5 : 0)
          - (course.gambit && style !== 'agresivo' ? 1 : 0);
        if (score > bestScore) {
          best = { course, hits };
          bestScore = score;
        }
      }
      if (!best) break;
      picks.push({ course: best.course, slots: best.hits, alternatives: [] });
      open = open.filter((s) => !best.hits.includes(s));
    }
    for (const slot of open) picks.push({ course: null, slots: [slot], alternatives: [] });
  }
  for (const pick of picks) {
    pick.alternatives = pick.slots.length === 1
      ? coursesFor(pick.slots[0].key, pick.slots[0].color).filter((c) => c !== pick.course).slice(0, 3)
      : [];
  }
  return picks;
}

// ---------- Tus partidas ----------

// Resumen compacto del análisis de tus partidas (se guarda para el inicio y el repaso).
export function buildReport(analysis, { username = '', source = 'chesscom', now = Date.now() } = {}) {
  const relevant = analysis.filter((r) => !['no-jugador', 'otra-variante', 'error'].includes(r.outcome));
  const positions = {};
  const firstMoves = { white: {}, black: {} };
  const games = { white: 0, black: 0 };
  for (const r of relevant) {
    games[r.color]++;
    // Primera jugada del rival (con blancas) o de las blancas (con negras).
    const sans = r.game.sans;
    const rival = r.color === 'white' ? sans.slice(0, 2) : sans.slice(0, 1);
    if (rival.length === (r.color === 'white' ? 2 : 1)) {
      const id = rival.join(' ');
      firstMoves[r.color][id] = (firstMoves[r.color][id] ?? 0) + 1;
    }
    // Posiciones en las que te tocó mover dentro de tu repertorio (o justo donde saliste).
    const chess = new Chess();
    const steps = [...r.ucis, ...(r.playedUci ? [r.playedUci] : [])];
    for (let ply = 0; ply < steps.length; ply++) {
      const key = posKey(chess.fen());
      if ((ply % 2 === 0) === (r.color === 'white')) positions[key] = (positions[key] ?? 0) + 1;
      if (!moveFromUci(chess, steps[ply])) break;
    }
  }
  const group = (outcome, keyOf) => {
    const map = new Map();
    for (const r of relevant.filter((x) => x.outcome === outcome)) {
      const k = keyOf(r);
      const e = map.get(k) ?? { key: r.key, color: r.color, repId: r.repId, ucis: r.ucis, played: r.played, playedUci: r.playedUci, expected: r.expected ?? [], count: 0 };
      e.count++;
      map.set(k, e);
    }
    return [...map.values()].sort((a, b) => b.count - a.count || a.ucis.length - b.ucis.length).slice(0, 8);
  };
  const counts = {};
  for (const r of relevant) counts[r.outcome] = (counts[r.outcome] ?? 0) + 1;
  const inBook = relevant.filter((r) => r.outcome !== 'sin-repertorio');
  return {
    at: now,
    username,
    source,
    analyzed: relevant.length,
    averageBook: inBook.length ? inBook.reduce((n, r) => n + r.ply, 0) / inBook.length : 0,
    counts,
    games,
    firstMoves,
    deviations: group('te-desviaste', (r) => `${r.key}|${r.playedUci}`),
    surprises: group('rival-se-salio', (r) => `${r.key}|${r.playedUci}`),
    gaps: group('hueco', (r) => r.key),
    positions: Object.fromEntries(Object.entries(positions).sort((a, b) => b[1] - a[1]).slice(0, 400)),
  };
}

// Lo que te juegan con más frecuencia y no tienes preparado, con los cursos que lo cubren.
export function recommendations(report, reps) {
  if (!report) return [];
  const out = [];
  for (const color of ['white', 'black']) {
    const total = report.games[color];
    for (const [moves, count] of Object.entries(report.firstMoves[color])) {
      const sans = moves.split(' ');
      let key;
      try {
        key = keyAfter(sans);
      } catch {
        continue;
      }
      if (covers(reps, color, key)) continue;
      const courses = coursesFor(key, color).slice(0, 3);
      out.push({ color, sans, count, total, key, courses });
    }
  }
  return out.filter((r) => r.count >= 2 || r.count / Math.max(r.total, 1) >= 0.2).sort((a, b) => b.count - a.count).slice(0, 4);
}

// ---------- Trampas ----------
const TRAP = /error|trampa|glotón|regalo/i;

// Ejercicios de castigar errores: líneas que pasan por una jugada del rival comentada como error.
// Cada ejercicio empieza justo en ese error (lo anterior se juega solo).
export function trapExercises(rep, lines = allLines(rep)) {
  const best = new Map();
  for (const line of lines) {
    line.forEach((step, i) => {
      if (isUserTurn(rep, step.from) || i + 1 >= line.length || !TRAP.test(step.move.comment ?? '')) return;
      const id = `${step.from}|${step.move.uci}`;
      const prev = best.get(id);
      if (!prev || line.length < prev.line.length) best.set(id, { line, start: i });
    });
  }
  return [...best.values()];
}

export const trapStarts = (exercises) => new Map(exercises.map((e) => [lineId(e.line), e.start]));
