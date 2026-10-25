import { describe, it, expect } from 'vitest';
import { allLines } from '../src/repertoire.js';
import { drillPositions, uniqueLines, mergeBest, shuffle } from '../src/session.js';
import { pieceHint } from '../src/notation.js';
import { repFromPgn, keyAfter } from './helpers.js';

const text = (path) => path.map((s) => s.move.san).join(' ');

describe('contrarreloj', () => {
  it('saca cada posición tuya una sola vez, con el camino más corto', () => {
    // Las dos líneas llegan a la misma posición tras 1.e4 e5 2.Nf3 Nc6 / 1.e4 Nc6 2.Nf3 e5.
    const rep = repFromPgn('1. e4 e5 (1... Nc6 2. Nf3 e5 3. Bc4) 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 *');
    const positions = drillPositions(rep, allLines(rep));
    const keys = positions.map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain(keyAfter([])); // tu primera jugada
    const italian = positions.find((p) => p.key === keyAfter(['e4', 'e5', 'Nf3', 'Nc6']));
    expect(text(italian.path)).toBe('e4 e5 Nf3 Nc6');
    // Todas son posiciones en las que mueves tú (blancas).
    expect(positions.every((p) => p.path.length % 2 === 0)).toBe(true);
  });

  it('con negras, solo las posiciones en las que mueven las negras', () => {
    const rep = repFromPgn('1. e4 c6 2. d4 d5 (2... e6) *', 'black');
    const positions = drillPositions(rep, allLines(rep));
    expect(positions.map((p) => text(p.path))).toEqual(['e4', 'e4 c6 d4']);
  });

  it('se queda con el mejor récord de cada duración', () => {
    expect(mergeBest({ 60: 10, 180: 20 }, { 180: 25, 300: 4 })).toEqual({ 60: 10, 180: 25, 300: 4 });
    expect(mergeBest(undefined, undefined)).toEqual({});
  });
});

describe('utilidades del entrenamiento', () => {
  it('quita las líneas repetidas sin cambiar el orden', () => {
    const rep = repFromPgn('1. e4 e5 (1... c5 2. Nf3) 2. Nf3 *');
    const [a, b] = allLines(rep);
    expect(uniqueLines([a, b, a, b, a])).toEqual([a, b]);
  });

  it('barajar no pierde ni repite elementos', () => {
    const list = Array.from({ length: 20 }, (_, i) => i);
    expect(shuffle(list.slice()).sort((x, y) => x - y)).toEqual(list);
  });

  it('la pista dice qué pieza mover', () => {
    expect(pieceHint('n')).toBe('el caballo marcado');
    expect(pieceHint('q')).toBe('la dama marcada');
    expect(pieceHint(undefined)).toBe('la pieza marcada');
  });
});
