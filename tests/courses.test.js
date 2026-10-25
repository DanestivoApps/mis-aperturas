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

  it('ampliar respeta lo que hayas añadido tú', async () => {
    const { Chess } = await import('chess.js');
    const { addMove, ROOT_KEY } = await import('../src/repertoire.js');
    const course = library.getCourse('londres');
    const rep = courses.addCourse(course, 0);
    const before = Object.keys(rep.positions).length;
    const c4 = new Chess().move('c4');
    addMove(rep, c4, { own: true }); // 1.c4 añadida por ti
    courses.expandCourse(rep, 1);
    expect(rep.positions[ROOT_KEY].moves.map((m) => m.san)).toEqual(['d4', 'c4']);
    expect(Object.keys(rep.positions).length).toBeGreaterThan(before);
  });

  it('detecta cursos desactualizados y los actualiza conservando progreso y jugadas propias', async () => {
    const { Chess } = await import('chess.js');
    const { addMove, posKey, deleteMove, ROOT_KEY } = await import('../src/repertoire.js');
    const course = library.getCourse('caro-kann');
    const rep = courses.addCourse(course, 0);
    expect(courses.isOutdated(rep)).toBe(false);

    // Progreso en la posición inicial (1...c6 tras 1.e4) y una jugada propia.
    const afterE4 = Object.values(rep.positions)[0].moves[0].to;
    rep.cards[afterE4] = { reps: 3, interval: 8, ease: 2.5, due: 1, lapses: 0, last: 1 };
    const chess = new Chess();
    chess.move('d4');
    const own = addMove(rep, chess.history({ verbose: true })[0], { own: true });
    chess.move('d5');
    addMove(rep, chess.history({ verbose: true })[1], { own: true });
    // Una jugada del curso borrada a propósito (2.Cc3 de las blancas, tras 1...c6).
    const afterC6 = rep.positions[afterE4].moves[0].to;
    const nc3 = rep.positions[afterC6].moves.find((m) => m.san === 'Nc3');
    deleteMove(rep, afterC6, nc3.uci);
    rep.source.removed = [`${afterC6}|${nc3.uci}`];

    rep.source.version = 'vieja';
    expect(courses.isOutdated(rep)).toBe(true);
    expect(courses.outdatedReps()).toEqual([rep]);

    courses.updateCourse(rep);
    expect(courses.isOutdated(rep)).toBe(false);
    expect(rep.cards[afterE4].reps).toBe(3); // progreso conservado
    expect(rep.positions[ROOT_KEY].moves.some((m) => m.uci === own.uci && m.own)).toBe(true); // jugada propia
    expect(rep.positions[afterC6].moves.some((m) => m.uci === nc3.uci)).toBe(false); // borrada sigue borrada
    expect(rep.positions[posKey(chess.fen())]).toBeDefined();
  });

  it('actualizar quita las jugadas corregidas del curso', async () => {
    const { posKey } = await import('../src/repertoire.js');
    const course = library.getCourse('londres');
    const rep = courses.addCourse(course, 0);
    const root = Object.keys(rep.positions)[0];
    // Simula una versión antigua con otra jugada tuya en la posición inicial.
    rep.positions[root].moves.push({ san: 'e4', uci: 'e2e4', to: 'x' });
    rep.positions.x = { fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1', moves: [] };
    rep.source.version = 'vieja';
    const { removed } = courses.updateCourse(rep);
    expect(removed).toBe(1);
    expect(rep.positions[root].moves.map((m) => m.san)).toEqual(['d4']);
    expect(posKey).toBeTypeOf('function');
  });

  it('las estadísticas por nivel crecen con cada nivel', () => {
    for (const course of library.COURSES) {
      const stats = courses.levelStats(course);
      expect(stats).toHaveLength(course.levels.length);
      for (let i = 1; i < stats.length; i++) expect(stats[i].lines).toBeGreaterThan(stats[i - 1].lines);
    }
  });
});

describe('restaurar el curso original', () => {
  it('quita tus jugadas, recupera las borradas y conserva el progreso', async () => {
    localStorage.clear();
    vi.resetModules();
    const courses = await import('../src/courses.js');
    const library = await import('../src/library.js');
    const { Chess } = await import('chess.js');
    const { addMove, deleteMove, ROOT_KEY } = await import('../src/repertoire.js');
    const rep = courses.addCourse(library.getCourse('londres'), 0);
    rep.cards[ROOT_KEY] = { reps: 4, interval: 20, ease: 2.5, due: 1, lapses: 0, last: 1 };
    addMove(rep, new Chess().move('c4'), { own: true });
    const afterD4 = rep.positions[ROOT_KEY].moves[0].to;
    const d5 = rep.positions[afterD4].moves.find((m) => m.san === 'd5');
    deleteMove(rep, afterD4, d5.uci);
    rep.source.removed = [`${afterD4}|${d5.uci}`];

    const snap = courses.repSnapshot(rep);
    courses.restoreCourse(rep);
    expect(rep.positions[ROOT_KEY].moves.map((m) => m.san)).toEqual(['d4']);
    expect(rep.positions[afterD4].moves.some((m) => m.san === 'd5')).toBe(true);
    expect(rep.cards[ROOT_KEY].reps).toBe(4);

    courses.restoreSnapshot(rep, snap); // deshacer
    expect(rep.positions[ROOT_KEY].moves.map((m) => m.san)).toEqual(['d4', 'c4']);
  });
});

describe('niveles de un curso que ya tienes', () => {
  it('cada nivel tiene sus líneas, su progreso y se puede volver a aprender', async () => {
    localStorage.clear();
    vi.resetModules();
    const courses = await import('../src/courses.js');
    const library = await import('../src/library.js');
    const { allLines } = await import('../src/repertoire.js');
    const course = library.getCourse('italiana');
    const rep = courses.addCourse(course, 1);
    const stats = courses.levelStats(course);

    // Las líneas de tu repertorio que usan solo jugadas del nivel Esencial son las del nivel.
    const edges = courses.levelEdges(course, 0);
    const lines = allLines(rep).filter((l) => l.every((s) => edges.has(`${s.from}|${s.move.uci}`)));
    expect(lines.length).toBe(stats[0].lines);

    // Aprende todo el nivel Esencial (repaso futuro): 100 %.
    const future = Date.now() + 1e9;
    for (const l of lines) for (const s of l) if (rep.positions[s.from] && s.from.split(' ')[1] === 'w') {
      rep.cards[s.from] = { reps: 1, interval: 1, ease: 2.5, due: future, lapses: 0, last: Date.now() };
    }
    expect(courses.levelProgress(rep, 0).pct).toBe(100);
    expect(courses.levelProgress(rep, 1).pct).toBeLessThan(100);

    // Volver a aprender el Esencial: su progreso vuelve a 0 y se puede deshacer.
    const snap = courses.repSnapshot(rep);
    expect(courses.relearnLevel(rep, 0)).toBeGreaterThan(0);
    expect(courses.levelProgress(rep, 0).pct).toBe(0);
    courses.restoreSnapshot(rep, snap);
    expect(courses.levelProgress(rep, 0).pct).toBe(100);
  });
});
