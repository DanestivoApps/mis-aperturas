// Añadir cursos de la biblioteca a tu colección, ampliarlos y actualizarlos.
import { getData, addRepertoire, save } from './store.js';
import { newRepertoire, importPgn, allLines, trainableKeys, deleteMove } from './repertoire.js';
import { getCourse, coursePgn } from './library.js';

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

// Líneas y posiciones de cada nivel (acumulado), calculadas una vez.
const statsCache = new Map();
export function levelStats(course) {
  if (!statsCache.has(course.id)) {
    statsCache.set(
      course.id,
      course.levels.map((_, level) => {
        const rep = newRepertoire(course.name, course.color);
        importPgn(rep, coursePgn(course, level));
        return { lines: allLines(rep).length, positions: trainableKeys(rep).length };
      }),
    );
  }
  return statsCache.get(course.id);
}
