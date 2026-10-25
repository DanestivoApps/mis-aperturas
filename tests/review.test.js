import { describe, it, expect } from 'vitest';
import { scoreFor, moveLoss, classify, userPositionsFrom, reviewRepertoire } from '../src/review.js';
import { ROOT_KEY } from '../src/repertoire.js';
import { repFromPgn, fenAfter, keyAfter } from './helpers.js';

describe('pérdida de evaluación', () => {
  it('mira la evaluación desde tu color', () => {
    expect(scoreFor({ cp: 30 }, 'white')).toBe(30);
    expect(scoreFor({ cp: 30 }, 'black')).toBe(-30);
    expect(scoreFor({ mate: 3 }, 'white')).toBe(9970);
    expect(scoreFor({ mate: -2 }, 'white')).toBe(-9980);
  });

  it('calcula cuánto empeora tu jugada y la clasifica', () => {
    expect(moveLoss({ cp: 30 }, { cp: -50 }, 'white')).toBe(80);
    expect(moveLoss({ cp: 30 }, { cp: 200 }, 'black')).toBe(170);
    expect(classify(20)).toBe('ok');
    expect(classify(80)).toBe('dudosa');
    expect(classify(170)).toBe('error');
  });
});

describe('revisar el repertorio', () => {
  const rep = repFromPgn('1. e4 e5 2. Qh5 *', 'white');
  const evals = new Map([
    [fenAfter([]), { cp: 30, best: 'e2e4' }],
    [fenAfter(['e4', 'e5']), { cp: 40, best: 'g1f3' }],
    [fenAfter(['e4', 'e5', 'Qh5']), { cp: -60, best: 'b8c6' }],
  ]);
  const evaluate = async (fen) => evals.get(fen) ?? null;

  it('encuentra tus posiciones desde una posición dada', () => {
    expect(userPositionsFrom(rep)).toEqual([ROOT_KEY, keyAfter(['e4', 'e5'])]);
    expect(userPositionsFrom(rep, keyAfter(['e4']))).toEqual([keyAfter(['e4', 'e5'])]);
  });

  it('marca la jugada dudosa y da por buena la que coincide con la mejor', async () => {
    const progress = [];
    const { results, noData, checked, total } = await reviewRepertoire(rep, {
      evaluate,
      onProgress: (done, of) => progress.push(`${done}/${of}`),
    });
    expect(results.map((r) => [r.move.san, r.kind, r.loss, r.best])).toEqual([
      ['e4', 'ok', 0, 'e4'],
      ['Qh5', 'dudosa', 100, 'Nf3'],
    ]);
    expect({ noData, checked, total }).toEqual({ noData: 0, checked: 2, total: 2 });
    expect(progress).toEqual(['1/2', '2/2']);
  });

  it('cuenta las posiciones sin datos en la nube', async () => {
    const { results, noData } = await reviewRepertoire(rep, { evaluate: async () => null });
    expect(results).toEqual([]);
    expect(noData).toBe(2);
  });

  it('se puede cancelar', async () => {
    const controller = new AbortController();
    controller.abort();
    const { checked } = await reviewRepertoire(rep, { evaluate, signal: controller.signal });
    expect(checked).toBe(0);
  });
});
