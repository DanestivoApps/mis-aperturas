import { describe, it, expect } from 'vitest';
import { moveLoss, verdict, formatEval, accuracy, scoreValue } from '../src/game-review.js';

describe('revisión de partidas', () => {
  it('mide la pérdida de una jugada con evaluaciones desde quien mueve', () => {
    // +0,5 para mí antes; después el rival está a +3 → pierdo 3,5
    expect(moveLoss({ cp: 50 }, { cp: 300 })).toBe(350);
    // jugada que mejora no pierde nada
    expect(moveLoss({ cp: 50 }, { cp: -80 })).toBe(0);
    // dejarse un mate es un error grave
    expect(verdict(moveLoss({ cp: 100 }, { mate: 2 }), false)).toBe('grave');
    // dar mate: el rival está mateado (mate 0)
    expect(moveLoss({ mate: 1 }, { mate: 0 })).toBe(0);
    expect(scoreValue({ mate: 0 })).toBeLessThan(-9000);
  });

  it('clasifica y formatea', () => {
    expect(verdict(5, false)).toBe('mejor');
    expect(verdict(200, true)).toBe('mejor');
    expect(verdict(30, false)).toBe('buena');
    expect(verdict(80, false)).toBe('imprecision');
    expect(verdict(200, false)).toBe('error');
    expect(formatEval({ cp: 120 }, true)).toBe('+1,2');
    expect(formatEval({ cp: 120 }, false)).toBe('−1,2');
    expect(formatEval({ mate: 2 }, false)).toBe('−M2');
    expect(accuracy([])).toBe(100);
    expect(accuracy([0, 0])).toBe(100);
    expect(accuracy([300, 300])).toBeLessThan(30);
  });
});
