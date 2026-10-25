// Añadir cursos de la biblioteca a tu colección y ampliarlos de nivel.
import { getData, addRepertoire, save } from './store.js';
import { newRepertoire, importPgn, allLines, trainableKeys } from './repertoire.js';
import { getCourse, coursePgn, levelPgn } from './library.js';

// El repertorio de tu colección que viene de este curso (si lo tienes).
export function ownedFrom(courseId) {
  return getData().repertoires.find((r) => r.source?.course === courseId);
}

export function addCourse(course, level) {
  const rep = newRepertoire(course.name, course.color);
  importPgn(rep, coursePgn(course, level));
  rep.source = { course: course.id, level };
  addRepertoire(rep);
  return rep;
}

// Añade las líneas de los niveles siguientes, sin tocar lo que ya hayas cambiado.
export function expandCourse(rep, level) {
  const course = getCourse(rep.source?.course);
  if (!course) return 0;
  let added = 0;
  for (let l = rep.source.level + 1; l <= level; l++) added += importPgn(rep, levelPgn(course, l)).added;
  rep.source.level = level;
  save();
  return added;
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
