import { describe, it, expect, beforeEach } from 'vitest';
import { allLines } from '../src/repertoire.js';
import { lineId, lineCounts, pickSrsLine, weakLines } from '../src/session.js';
import { repFromPgn, keyAfter } from './helpers.js';

const NOW = 1_000_000;
const card = (due, extra = {}) => ({ reps: 1, interval: 1, ease: 2.5, due, lapses: 0, last: 0, ...extra });
const text = (line) => line.map((s) => s.move.san).join(' ');

let rep;
let lines;
beforeEach(() => {
  // Línea A: 1.e4 e5 2.Nf3 · Línea B: 1.e4 c5 2.Nc3
  rep = repFromPgn('1. e4 e5 (1... c5 2. Nc3) 2. Nf3 *');
  lines = allLines(rep);
});

describe('elegir la línea del repaso', () => {
  it('con todo nuevo empieza por la línea principal', () => {
    expect(lines.map(text)).toEqual(['e4 e5 Nf3', 'e4 c5 Nc3']);
    expect(text(pickSrsLine(rep, lines, { newBudget: 10, now: NOW }))).toBe('e4 e5 Nf3');
  });

  it('sin cupo de nuevas y sin pendientes no hay nada que hacer', () => {
    expect(pickSrsLine(rep, lines, { newBudget: 0, now: NOW })).toBeNull();
  });

  it('elige la línea con más jugadas vencidas', () => {
    rep.cards[keyAfter([])] = card(NOW + 1000);
    rep.cards[keyAfter(['e4', 'e5'])] = card(NOW + 1000);
    rep.cards[keyAfter(['e4', 'c5'])] = card(NOW - 1000);
    expect(text(pickSrsLine(rep, lines, { newBudget: 0, now: NOW }))).toBe('e4 c5 Nc3');
  });

  it('no repite líneas saltadas', () => {
    const skipped = new Set([lineId(lines[0])]);
    expect(text(pickSrsLine(rep, lines, { newBudget: 10, skipped, now: NOW }))).toBe('e4 c5 Nc3');
  });

  it('no cuenta las jugadas del tramo inicial elegido', () => {
    rep.cards[keyAfter([])] = card(NOW - 1000); // 1.e4 vencida, pero está en el tramo inicial
    expect(lineCounts(rep, lines[0], { fromIndex: 1, now: NOW })).toEqual({ due: 0, fresh: 1 });
    expect(lineCounts(rep, lines[0], { fromIndex: 0, now: NOW })).toEqual({ due: 1, fresh: 1 });
  });
});

describe('modo errores', () => {
  it('devuelve una línea por cada posición débil', () => {
    rep.cards[keyAfter(['e4', 'c5'])] = card(NOW, { lapses: 2, interval: 0 });
    expect(weakLines(rep, lines).map(text)).toEqual(['e4 c5 Nc3']);
  });

  it('sin fallos no hay nada', () => {
    expect(weakLines(rep, lines)).toEqual([]);
  });
});
