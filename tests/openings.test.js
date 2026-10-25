import { describe, it, expect } from 'vitest';
import { loadOpenings, openingForPath } from '../src/openings.js';
import { newRepertoire } from '../src/repertoire.js';
import { play } from './helpers.js';

describe('nombres de aperturas', () => {
  it('nombra la última posición conocida del camino', async () => {
    const table = await loadOpenings();
    expect(Object.keys(table).length).toBeGreaterThan(3000);
    const rep = newRepertoire('r', 'white');
    const path = play(rep, ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'h3']); // h3 no tiene nombre propio
    expect(openingForPath(path)).toEqual({ eco: 'C50', name: 'Partida Italiana: Giuoco Piano' });
    expect(openingForPath([])).toBeNull();
  });

  it('las claves usan el mismo formato que el repertorio', async () => {
    const table = await loadOpenings();
    for (const key of Object.keys(table).slice(0, 200)) expect(key.split(' ')).toHaveLength(4);
  });
});
