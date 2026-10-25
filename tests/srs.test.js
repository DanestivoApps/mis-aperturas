import { describe, it, expect } from 'vitest';
import { newCard, gradeCorrect, gradeWrong, isDue, describeDue } from '../src/srs.js';

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const NOW = new Date(2026, 9, 25, 12).getTime();

describe('repetición espaciada', () => {
  it('los intervalos crecen 1, 3, 8, 20 días', () => {
    const card = newCard(NOW);
    const intervals = [];
    for (let i = 0; i < 4; i++) intervals.push(gradeCorrect(card, NOW).interval);
    expect(intervals).toEqual([1, 3, 8, 20]);
    expect(card.reps).toBe(4);
  });

  it('el repaso vence un poco antes para no depender de la hora exacta', () => {
    const card = gradeCorrect(newCard(NOW), NOW);
    expect(card.due).toBe(NOW + DAY - 4 * HOUR);
    expect(isDue(card, NOW + DAY - 5 * HOUR)).toBe(false);
    expect(isDue(card, NOW + DAY - 4 * HOUR)).toBe(true);
  });

  it('un fallo reinicia la tarjeta y baja la facilidad con un mínimo', () => {
    const card = newCard(NOW);
    gradeCorrect(card, NOW);
    gradeCorrect(card, NOW);
    gradeWrong(card, NOW);
    expect(card).toMatchObject({ reps: 0, interval: 0, lapses: 1, due: NOW });
    expect(card.ease).toBeCloseTo(2.3);
    for (let i = 0; i < 10; i++) gradeWrong(card, NOW);
    expect(card.ease).toBe(1.3);
    expect(gradeCorrect(card, NOW).interval).toBe(1);
  });

  it('isDue es falso sin tarjeta', () => {
    expect(isDue(undefined, NOW)).toBe(false);
  });

  it('describe cuándo toca el próximo repaso', () => {
    expect(describeDue(NOW - 1, NOW)).toBe('ahora');
    expect(describeDue(NOW + 30 * 60 * 1000, NOW)).toBe('en menos de una hora');
    expect(describeDue(NOW + 5 * HOUR, NOW)).toBe('en 5 h');
    expect(describeDue(NOW + DAY, NOW)).toBe('mañana');
    expect(describeDue(NOW + 3 * DAY, NOW)).toBe('en 3 días');
  });
});
