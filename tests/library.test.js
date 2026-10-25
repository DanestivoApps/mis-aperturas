import { describe, it, expect } from 'vitest';
import { COURSES, LEVELS, coursePgn, levelPgn, getCourse } from '../src/library.js';
import {
  newRepertoire, importPgn, gapKeys, isUserTurn, allLines, pathTo, pathToText, trainableKeys,
} from '../src/repertoire.js';
import { toSpanish } from '../src/notation.js';

function build(course, level) {
  const rep = newRepertoire(course.name, course.color);
  const result = importPgn(rep, coursePgn(course, level));
  return { rep, ...result };
}

const where = (rep, key) => pathToText(rep, pathTo(rep, key) ?? []) || 'inicio';

describe('biblioteca de cursos', () => {
  it('tiene cursos con datos completos y ids únicos', () => {
    expect(COURSES.length).toBeGreaterThanOrEqual(10);
    expect(new Set(COURSES.map((c) => c.id)).size).toBe(COURSES.length);
    for (const c of COURSES) {
      expect(['white', 'black']).toContain(c.color);
      expect(c.name && c.tagline && c.intro && c.covers.length).toBeTruthy();
      expect(c.levels.length).toBeGreaterThanOrEqual(2);
      expect(c.levels.length).toBeLessThanOrEqual(LEVELS.length);
      expect(getCourse(c.id)).toBe(c);
    }
  });

  for (const course of COURSES) {
    describe(course.name, () => {
      course.levels.forEach((_, level) => {
        it(`nivel ${LEVELS[level].name}: jugadas legales, sin huecos y una sola jugada tuya por posición`, () => {
          const { rep, errors } = build(course, level);
          expect(errors).toEqual([]);
          expect(gapKeys(rep).map((k) => where(rep, k))).toEqual([]);
          const conflicts = Object.entries(rep.positions)
            .filter(([key, pos]) => isUserTurn(rep, key) && pos.moves.length > 1)
            .map(([key, pos]) => `${where(rep, key)}: ${pos.moves.map((m) => m.san).join('/')}`);
          expect(conflicts).toEqual([]);
        });
      });

      it('cada nivel añade líneas al anterior', () => {
        const counts = course.levels.map((_, level) => allLines(build(course, level).rep).length);
        for (let i = 1; i < counts.length; i++) expect(counts[i]).toBeGreaterThan(counts[i - 1]);
      });

      it('ampliar nivel a nivel da lo mismo que importar el curso entero', () => {
        const stepwise = newRepertoire(course.name, course.color);
        course.levels.forEach((_, level) => importPgn(stepwise, levelPgn(course, level)));
        const full = build(course, course.levels.length - 1).rep;
        expect(trainableKeys(stepwise).sort()).toEqual(trainableKeys(full).sort());
      });

      it('los comentarios no se repiten al ampliar', () => {
        const rep = newRepertoire(course.name, course.color);
        importPgn(rep, coursePgn(course));
        importPgn(rep, coursePgn(course)); // reimportar no duplica nada
        for (const pos of Object.values(rep.positions)) {
          for (const m of pos.moves) {
            if (m.comment) expect(m.comment.length, m.comment).toBeLessThan(300);
          }
        }
      });

      it('la primera jugada está explicada', () => {
        const rep = build(course, 0).rep;
        const first = Object.values(rep.positions).flatMap((p) => p.moves).find((m) => m.comment);
        expect(first).toBeDefined();
      });
    });
  }
});

describe('notación española', () => {
  it('traduce las letras de las piezas', () => {
    expect(toSpanish('Nf3')).toBe('Cf3');
    expect(toSpanish('Bxc4+')).toBe('Axc4+');
    expect(toSpanish('Rfe1')).toBe('Tfe1');
    expect(toSpanish('Qd2')).toBe('Dd2');
    expect(toSpanish('Kg1')).toBe('Rg1');
    expect(toSpanish('exd8=Q#')).toBe('exd8=D#');
    expect(toSpanish('O-O-O')).toBe('O-O-O');
    expect(toSpanish('e4')).toBe('e4');
  });
});
