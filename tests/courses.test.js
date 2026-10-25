import { describe, it, expect, beforeEach, vi } from 'vitest';
import { trainableKeys } from '../src/repertoire.js';

let courses;
let store;
let library;
beforeEach(async () => {
  localStorage.clear();
  vi.resetModules();
  store = await import('../src/store.js');
  courses = await import('../src/courses.js');
  library = await import('../src/library.js');
});

describe('cursos de la biblioteca', () => {
  it('añade un curso al nivel elegido y lo recuerda', () => {
    const course = library.getCourse('caro-kann');
    expect(courses.ownedFrom('caro-kann')).toBeUndefined();
    const rep = courses.addCourse(course, 0);
    expect(rep).toMatchObject({ name: course.name, color: 'black', source: { course: 'caro-kann', level: 0 } });
    expect(courses.ownedFrom('caro-kann')).toBe(rep);
    expect(store.getData().repertoires).toHaveLength(1);
    expect(trainableKeys(rep).length).toBe(courses.levelStats(course)[0].positions);
  });

  it('ampliar añade las jugadas de los niveles siguientes', () => {
    const course = library.getCourse('italiana');
    const rep = courses.addCourse(course, 0);
    const added = courses.expandCourse(rep, 2);
    expect(added).toBeGreaterThan(0);
    expect(rep.source.level).toBe(2);
    expect(trainableKeys(rep).length).toBe(courses.levelStats(course)[2].positions);
  });

  it('ampliar respeta lo que hayas añadido tú', () => {
    const course = library.getCourse('londres');
    const rep = courses.addCourse(course, 0);
    const mine = Object.keys(rep.positions).length;
    rep.positions.mia = { fen: 'x', moves: [] }; // posición inventada que no debe tocarse
    courses.expandCourse(rep, 1);
    expect(rep.positions.mia).toBeDefined();
    expect(Object.keys(rep.positions).length).toBeGreaterThan(mine);
  });

  it('las estadísticas por nivel crecen con cada nivel', () => {
    for (const course of library.COURSES) {
      const stats = courses.levelStats(course);
      expect(stats).toHaveLength(course.levels.length);
      for (let i = 1; i < stats.length; i++) expect(stats[i].lines).toBeGreaterThan(stats[i - 1].lines);
    }
  });
});
