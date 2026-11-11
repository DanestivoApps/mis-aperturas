// Añadir cursos de la biblioteca a tu colección, ampliarlos y actualizarlos.
import { getData, addRepertoire, save } from './store.js';
import { Chess } from 'chess.js';
import { newRepertoire, importPgn, allLines, trainableKeys, deleteMove, resetKeys, addMove } from './repertoire.js';
import { getCourse, coursePgn, levelPgn, COURSES } from './library.js';
import { moveFromUci } from './chess-utils.js';

// Huella del contenido del curso: si cambia (correcciones, líneas nuevas), hay actualización.
export function courseVersion(course) {
  const text = course.levels.join('\n#\n');
  let hash = 5381;
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash + text.charCodeAt(i)) >>> 0;
  return hash.toString(36);
}

// El repertorio de tu colección que viene de este curso (si lo tienes).
export function ownedFrom(courseId) {
  return getData().repertoires.find((r) => r.source?.course === courseId);
}

export function addCourse(course, level) {
  const rep = newRepertoire(course.name, course.color);
  importPgn(rep, coursePgn(course, level));
  rep.source = { course: course.id, level, version: courseVersion(course) };
  addRepertoire(rep);
  return rep;
}

// Para probar un curso sin añadirlo: el repertorio en memoria (no se guarda).
export function previewRepertoire(course, level = 0) {
  const rep = newRepertoire(course.name, course.color);
  importPgn(rep, coursePgn(course, level));
  return rep;
}

// ¿Hay una versión mejorada del curso del que viene este repertorio?
export function isOutdated(rep) {
  const course = getCourse(rep.source?.course);
  return Boolean(course) && rep.source.version !== courseVersion(course);
}

export function outdatedReps() {
  return getData().repertoires.filter(isOutdated);
}

const edgeIds = (rep) =>
  new Set(Object.entries(rep.positions).flatMap(([key, pos]) => pos.moves.map((m) => `${key}|${m.uci}`)));

// Rehace el repertorio con la versión actual del curso (al nivel `level`) conservando:
// tu progreso de repaso, las jugadas que añadiste tú, los comentarios que editaste
// y las jugadas del curso que borraste a propósito.
export function rebuildCourse(rep, level = rep.source.level) {
  const course = getCourse(rep.source?.course);
  if (!course) return { added: 0, removed: 0 };
  const fresh = newRepertoire(rep.name, rep.color);
  importPgn(fresh, coursePgn(course, level));

  for (const [key, pos] of Object.entries(rep.positions)) {
    for (const move of pos.moves) {
      if (move.own) {
        fresh.positions[key] ??= { fen: pos.fen, moves: [] };
        fresh.positions[move.to] ??= { fen: rep.positions[move.to].fen, moves: [] };
        if (!fresh.positions[key].moves.some((m) => m.uci === move.uci)) fresh.positions[key].moves.push({ ...move });
      } else if (move.commentEdited) {
        const edge = fresh.positions[key]?.moves.find((m) => m.uci === move.uci);
        if (edge) Object.assign(edge, { comment: move.comment, commentEdited: true });
      }
    }
  }
  for (const id of rep.source.removed ?? []) {
    const [key, uci] = id.split('|');
    if (fresh.positions[key]?.moves.some((m) => m.uci === uci)) deleteMove(fresh, key, uci);
  }

  const before = edgeIds(rep);
  const after = edgeIds(fresh);
  const keep = new Set(trainableKeys(fresh));
  rep.cards = Object.fromEntries(Object.entries(rep.cards).filter(([key]) => keep.has(key)));
  rep.positions = fresh.positions;
  rep.source = { ...rep.source, level, version: courseVersion(course) };
  save(rep);
  return {
    added: [...after].filter((e) => !before.has(e)).length,
    removed: [...before].filter((e) => !after.has(e)).length,
  };
}

// Ampliar es rehacer el curso a un nivel mayor (así también se aplica cualquier mejora).
export function expandCourse(rep, level) {
  return rebuildCourse(rep, level).added;
}

// Vuelve al curso tal cual es en la biblioteca: quita las jugadas y comentarios que añadiste
// y recupera las jugadas del curso que borraste. Tu progreso de repaso se conserva.
export function restoreCourse(rep) {
  for (const pos of Object.values(rep.positions)) {
    pos.moves = pos.moves.filter((m) => !m.own);
    for (const m of pos.moves) delete m.commentEdited;
  }
  rep.source.removed = [];
  return rebuildCourse(rep);
}

// Copia de lo que cambia al rehacer o reiniciar, para poder deshacerlo.
export function repSnapshot(rep) {
  const { positions, cards, source, progressResetAt, resets } = rep;
  return JSON.stringify({ positions, cards, source, progressResetAt, resets });
}

export function restoreSnapshot(rep, snap) {
  const data = JSON.parse(snap);
  for (const key of ['source', 'progressResetAt', 'resets']) if (data[key] === undefined) delete rep[key];
  Object.assign(rep, data);
  save(rep);
}

// Texto para avisar de lo que ha cambiado al actualizar.
export function updateMessage({ added, removed }) {
  if (!added && !removed) return 'Curso actualizado: explicaciones mejoradas';
  const parts = [];
  if (added) parts.push(`${added} jugadas nuevas`);
  if (removed) parts.push(`${removed} corregidas o quitadas`);
  return `Curso actualizado: ${parts.join(', ')}`;
}

export function updateCourse(rep) {
  return rebuildCourse(rep, rep.source.level);
}

// Datos de cada nivel (acumulado: Avanzado incluye Esencial), calculados una vez:
// cada nivel se construye sobre el anterior.
const levelCache = new Map();
const graphCache = new Map();
function levelData(course, level) {
  if (!levelCache.has(course.id)) {
    const rep = newRepertoire(course.name, course.color);
    graphCache.set(course.id, rep);
    levelCache.set(course.id, course.levels.map((_, i) => {
      importPgn(rep, levelPgn(course, i));
      const keys = new Set(trainableKeys(rep));
      return { edges: edgeIds(rep), keys, lines: allLines(rep).length, positions: keys.size };
    }));
  }
  return levelCache.get(course.id)[Math.min(Math.max(level, 0), course.levels.length - 1)];
}

// El curso entero (todos los niveles) como repertorio en memoria.
export function courseGraph(course) {
  levelData(course, 0);
  return graphCache.get(course.id);
}

// Primer nivel del curso que incluye esta jugada.
function edgeLevel(course, key, uci) {
  const id = `${key}|${uci}`;
  for (let i = 0; i < course.levels.length; i++) if (levelEdges(course, i).has(id)) return i;
  return course.levels.length - 1;
}

// Qué juegan los cursos de la biblioteca en esta posición (para el color dado):
// [{ uci, san, comment, courses: [{ course, level, comment }] }], las más repetidas primero.
export function courseSuggestions(key, color) {
  const out = new Map();
  for (const course of COURSES) {
    if (course.color !== color) continue;
    const pos = courseGraph(course).positions[key];
    for (const m of pos?.moves ?? []) {
      const entry = out.get(m.uci) ?? { uci: m.uci, san: m.san, comment: '', courses: [] };
      entry.courses.push({ course, level: edgeLevel(course, key, m.uci), comment: m.comment ?? '' });
      entry.comment ||= m.comment ?? '';
      out.set(m.uci, entry);
    }
  }
  for (const e of out.values()) e.courses.sort((a, b) => a.level - b.level);
  return [...out.values()].sort((a, b) => b.courses.length - a.courses.length || a.courses[0].level - b.courses[0].level);
}

// Copia en tu repertorio la preparación de un curso a partir de una jugada suya:
// esa jugada y todo lo que cuelga de ella en el nivel más básico que la contiene.
// Devuelve cuántas jugadas nuevas se añadieron.
export function graftFromCourse(rep, course, key, uci) {
  const graph = courseGraph(course);
  const edges = levelEdges(course, edgeLevel(course, key, uci));
  const own = Boolean(rep.source);
  let added = 0;
  const copy = (from, edge) => {
    const before = rep.positions[from]?.moves.some((m) => m.uci === edge.uci);
    const move = moveFromUci(new Chess(graph.positions[from].fen), edge.uci);
    if (!move) return null;
    const mine = addMove(rep, move, { own });
    if (!before) {
      added++;
      if (edge.comment && !mine.comment) mine.comment = edge.comment;
    }
    return mine;
  };
  const first = graph.positions[key]?.moves.find((m) => m.uci === uci);
  if (!first || !copy(key, first)) return 0;
  const seen = new Set();
  const queue = [first.to];
  while (queue.length) {
    const at = queue.shift();
    if (seen.has(at)) continue;
    seen.add(at);
    for (const edge of graph.positions[at]?.moves ?? []) {
      if (!edges.has(`${at}|${edge.uci}`)) continue;
      if (copy(at, edge)) queue.push(edge.to);
    }
  }
  return added;
}

export function levelStats(course) {
  return course.levels.map((_, level) => {
    const { lines, positions } = levelData(course, level);
    return { lines, positions };
  });
}

// Posiciones con jugada tuya en un nivel (para saber qué cursos responden a algo).
export function levelKeys(course, level) {
  return levelData(course, level).keys;
}

// Jugadas ("posición|uci") que forman un nivel: sirven para entrenar solo ese nivel.
export function levelEdges(course, level) {
  return levelData(course, level).edges;
}

// Cuánto llevas aprendido de un nivel en tu repertorio.
export function levelProgress(rep, level, now = Date.now()) {
  const course = getCourse(rep.source?.course);
  if (!course) return { total: 0, learned: 0, pct: 0 };
  const mine = new Set(trainableKeys(rep));
  const keys = [...levelData(course, level).keys].filter((k) => mine.has(k));
  const learned = keys.filter((k) => rep.cards[k] && rep.cards[k].due > now).length;
  return { total: keys.length, learned, pct: keys.length ? Math.round((learned / keys.length) * 100) : 0 };
}

// Vuelve a aprender un nivel desde cero: sus jugadas vuelven a ser nuevas.
export function relearnLevel(rep, level) {
  const course = getCourse(rep.source?.course);
  if (!course) return 0;
  const count = resetKeys(rep, levelData(course, level).keys);
  save(rep);
  return count;
}
