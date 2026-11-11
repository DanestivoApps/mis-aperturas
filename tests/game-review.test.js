import { describe, it, expect } from 'vitest';
import { moveLoss, winDrop, winPercent, verdict, formatEval, accuracy, scoreValue } from '../src/game-review.js';

describe('revisión de partidas', () => {
  it('mide la pérdida en peones y en probabilidad de ganar', () => {
    // +0,5 para mí antes; después el rival está a +3 → pierdo 3,5 peones
    expect(moveLoss({ cp: 50 }, { cp: 300 })).toBe(350);
    expect(moveLoss({ cp: 50 }, { cp: -80 })).toBe(0);
    expect(winPercent({ cp: 0 })).toBe(50);
    expect(winDrop({ cp: 50 }, { cp: 300 })).toBeGreaterThan(15);
    expect(scoreValue({ mate: 0 })).toBeLessThan(-9000);
  });

  it('con la partida ganada, perder algo de ventaja no es un error grave', () => {
    // +8 → +6: sigues ganando
    expect(verdict(winDrop({ cp: 800 }, { cp: -600 }), false)).not.toMatch(/error|grave/);
    // 0 → −2: sí es un error grave
    expect(verdict(winDrop({ cp: 0 }, { cp: 200 }), false)).toBe('grave');
    // dejarse un mate
    expect(verdict(winDrop({ cp: 100 }, { mate: 2 }), false)).toBe('grave');
    // dar mate no pierde nada
    expect(winDrop({ mate: 1 }, { mate: 0 })).toBe(0);
  });

  it('clasifica, formatea y calcula la precisión', () => {
    expect(verdict(0.5, false)).toBe('mejor');
    expect(verdict(30, true)).toBe('mejor');
    expect(verdict(3, false)).toBe('buena');
    expect(verdict(7, false)).toBe('imprecision');
    expect(verdict(12, false)).toBe('error');
    expect(formatEval({ cp: 120 }, true)).toBe('+1,2');
    expect(formatEval({ cp: 120 }, false)).toBe('−1,2');
    expect(formatEval({ cp: -4 }, true)).toBe('0,0');
    expect(formatEval({ mate: 2 }, false)).toBe('−M2');
    expect(accuracy([])).toBe(100);
    expect(accuracy([0, 0])).toBe(100);
    expect(accuracy([0, 0, 0, 40])).toBeLessThan(accuracy([0, 0, 0, 5]));
    expect(accuracy([30, 30])).toBeLessThan(40);
  });
});
