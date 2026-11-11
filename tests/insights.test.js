import { describe, it, expect } from 'vitest';
import { getCourse, coursePgn } from '../src/library.js';
import { newRepertoire, importPgn, allLines } from '../src/repertoire.js';
import { coverageGaps, coursesFor, buildPlan, keyAfter, buildReport, recommendations, trapExercises } from '../src/insights.js';
import { parseGames, analyzeGame } from '../src/games.js';
import { pickSrsLine } from '../src/session.js';

const repOf = (id, level = 0) => {
  const course = getCourse(id);
  const rep = newRepertoire(course.name, course.color);
  importPgn(rep, coursePgn(course, level));
  rep.id = id;
  return rep;
};

describe('huecos y recomendaciones', () => {
  it('detecta las salidas sin preparar', () => {
    const reps = [repOf('italiana'), repOf('caro-kann')];
    const labels = coverageGaps(reps).map((g) => g.label);
    expect(labels).toContain('1.d4');
    expect(labels.some((l) => l.includes('c5'))).toBe(true);
    expect(labels).not.toContain('1.e4');
  });

  it('encuentra los cursos que responden a una posición', () => {
    const ids = coursesFor(keyAfter(['e4', 'c5']), 'white').map((c) => c.id);
    expect(ids).toContain('alapin');
    expect(ids).toContain('smith-morra');
  });

  it('el plan cubre las salidas principales con pocos cursos', () => {
    const picks = buildPlan({ first: 'e4', style: 'solido' });
    expect(picks.every((p) => p.course)).toBe(true);
    const black = picks.filter((p) => p.course.color === 'black');
    expect(black.length).toBeLessThanOrEqual(4);
    const agresivo = buildPlan({ first: 'e4', style: 'agresivo' }).map((p) => p.course.id);
    const solido = picks.map((p) => p.course.id);
    expect(agresivo).not.toEqual(solido);
    expect(solido).not.toContain('dragon-acelerado');
  });
});

describe('tus partidas', () => {
  const pgn = [
    '[White "yo"]\n[Black "rival"]\n\n1. e4 c5 2. Nf3 d6 *',
    '[White "yo"]\n[Black "rival"]\n\n1. e4 c5 2. Nf3 Nc6 *',
    '[White "yo"]\n[Black "rival"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 *',
  ].join('\n\n');

  it('resume las partidas y recomienda cursos para lo que te juegan', () => {
    const reps = [repOf('italiana')];
    const analysis = parseGames(pgn).map((g) => analyzeGame(g, reps, 'yo'));
    const report = buildReport(analysis, { username: 'yo', now: 1 });
    expect(report.analyzed).toBe(3);
    expect(report.firstMoves.white['e4 c5']).toBe(2);
    expect(report.deviations[0].played).toBe('Bb5');
    expect(Object.keys(report.positions).length).toBeGreaterThan(0);
    const recs = recommendations(report, reps);
    expect(recs[0].sans).toEqual(['e4', 'c5']);
    expect(recs[0].courses.length).toBeGreaterThan(0);
  });

  it('el repaso prefiere las líneas que te salen en partidas', () => {
    const rep = repOf('italiana');
    const lines = allLines(rep);
    const last = lines[lines.length - 1];
    const priority = new Map(last.map((s) => [s.from, 5]));
    const plain = pickSrsLine(rep, lines, { newBudget: 10 });
    const chosen = pickSrsLine(rep, lines, { newBudget: 10, priority });
    expect(plain).not.toBe(last);
    expect(chosen).toBe(last);
  });
});

describe('trampas', () => {
  it('empiezan en el error del rival y sigue tu jugada', () => {
    const rep = repOf('stafford');
    const ex = trapExercises(rep);
    expect(ex.length).toBeGreaterThan(2);
    for (const { line, start } of ex) {
      expect(line[start].move.comment).toMatch(/error|trampa|glotón|regalo/i);
      expect(line.length).toBeGreaterThan(start + 1);
    }
  });
});

describe('qué hacer con tus partidas', () => {
  const pgnGame = (white, black, moves) => `[White "${white}"]\n[Black "${black}"]\n\n${moves} *\n`;
  it('separa «otra apertura» de los desvíos y propone pasos con cursos', async () => {
    const { gameActions } = await import('../src/insights.js');
    const rep = repOf('pirc-alekhine');
    const games = [
      ...Array(5).fill(pgnGame('Yo', 'R', '1. d4 d5 2. c4')),
      ...Array(3).fill(pgnGame('Yo', 'R', '1. e4 e5 2. Nf3')),
      ...Array(4).fill(pgnGame('R', 'Yo', '1. e4 c5')),
    ];
    const analysis = parseGames(games.join('\n')).map((g) => analyzeGame(g, [rep], 'Yo'));
    expect(analysis.filter((r) => r.outcome === 'otra-apertura')).toHaveLength(5);
    const report = buildReport(analysis, { username: 'Yo' });
    expect(report.deviations).toHaveLength(0);
    const actions = gameActions(report, [rep]);
    const d4 = actions.find((a) => a.type === 'apertura' && a.color === 'white');
    expect(d4).toMatchObject({ count: 5, total: 8 });
    expect(d4.courses.length).toBeGreaterThan(0);
    const black = actions.find((a) => a.type === 'apertura' && a.color === 'black');
    expect(black.courses.length).toBeGreaterThan(0);
    const e5 = actions.find((a) => a.type === 'respuesta');
    expect(e5).toMatchObject({ ucis: ['e2e4', 'e7e5'], count: 3 });
    expect(e5.courses.map((c) => c.id)).toContain('italiana');
  });

  it('sugiere jugadas de los cursos y copia la línea de un curso', async () => {
    const { courseSuggestions, graftFromCourse } = await import('../src/courses.js');
    const key = keyAfter(['e4', 'e5']);
    const sugg = courseSuggestions(key, 'white');
    expect(sugg[0].san).toBe('Nf3');
    expect(sugg[0].courses.length).toBeGreaterThan(2);
    const rep = repOf('pirc-alekhine');
    const added = graftFromCourse(rep, getCourse('italiana'), key, 'g1f3');
    expect(added).toBeGreaterThan(5);
    expect(rep.positions[key].moves[0].comment).toBeTruthy();
    expect(coverageGaps([rep]).some((g) => g.sans.join(' ') === 'e4 e5')).toBe(false);
  });
});
