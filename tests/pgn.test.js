import { describe, it, expect } from 'vitest';
import { newRepertoire, importPgn, exportPgn, ROOT_KEY, cleanMoveToken } from '../src/repertoire.js';
import { SAMPLES } from './fixtures.js';
import { keyAfter, fenAfter, movesAfter } from './helpers.js';

const edgesOf = (rep) =>
  Object.entries(rep.positions)
    .flatMap(([key, pos]) => pos.moves.map((m) => `${key}|${m.uci}|${m.to}|${m.comment ?? ''}`))
    .sort();

describe('importar PGN', () => {
  it('entiende variantes anidadas', () => {
    const rep = newRepertoire('r', 'white');
    const { errors } = importPgn(rep, '1. e4 e5 (1... c5 2. Nf3 (2. Nc3 Nc6) d6) 2. Nf3 Nc6 *');
    expect(errors).toEqual([]);
    expect(movesAfter(rep, ['e4'])).toEqual(['e5', 'c5']);
    expect(movesAfter(rep, ['e4', 'c5'])).toEqual(['Nf3', 'Nc3']);
    expect(movesAfter(rep, ['e4', 'c5', 'Nc3'])).toEqual(['Nc6']);
    expect(movesAfter(rep, ['e4', 'c5', 'Nf3'])).toEqual(['d6']);
    expect(movesAfter(rep, ['e4', 'e5', 'Nf3'])).toEqual(['Nc6']);
  });

  it('guarda comentarios y quita las marcas de Lichess', () => {
    const rep = newRepertoire('r', 'white');
    importPgn(rep, '1. e4 {Mejor por test [%cal Ge2e4]} e5 { [%clk 0:01:00] } ; resto de línea\n2. Nf3 *');
    const e4 = rep.positions[ROOT_KEY].moves[0];
    expect(e4.comment).toBe('Mejor por test');
    // El reloj se descarta; el comentario con ";" es de la jugada anterior (e5).
    expect(rep.positions[keyAfter(['e4'])].moves[0].comment).toBe('resto de línea');
    expect(movesAfter(rep, ['e4', 'e5'])).toEqual(['Nf3']);
  });

  it('acepta anotaciones, NAG, números pegados y enroques con ceros', () => {
    const rep = newRepertoire('r', 'white');
    const { errors } = importPgn(rep, '1.e4! e5?! 2.Nf3 $1 Nc6 3. Bc4 Bc5 4. 0-0 Nf6 1-0');
    expect(errors).toEqual([]);
    expect(movesAfter(rep, ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'])).toEqual(['O-O']);
  });

  it('un error en una variante solo descarta esa variante', () => {
    const rep = newRepertoire('r', 'white');
    const { errors } = importPgn(rep, '1. e4 e5 (1... c5 2. Qxx7 d6) 2. Nf3 *');
    expect(errors).toHaveLength(1);
    expect(movesAfter(rep, ['e4'])).toEqual(['e5', 'c5']);
    expect(movesAfter(rep, ['e4', 'c5'])).toEqual([]);
    expect(movesAfter(rep, ['e4', 'e5'])).toEqual(['Nf3']);
  });

  it('un error en la línea principal descarta el resto de esa partida', () => {
    const rep = newRepertoire('r', 'white');
    const { errors } = importPgn(rep, '1. e4 e5 2. Kxx Nc6 3. Nf3 *\n1. d4 *');
    expect(errors).toHaveLength(1);
    expect(movesAfter(rep, ['e4', 'e5'])).toEqual([]);
    expect(rep.positions[ROOT_KEY].moves.map((m) => m.san)).toEqual(['e4', 'd4']);
  });

  it('separa varias partidas por cabeceras aunque falte el resultado', () => {
    const rep = newRepertoire('r', 'white');
    importPgn(rep, '[Event "a"]\n1. e4 e5\n\n[Event "b"]\n1. c4 *');
    expect(rep.positions[ROOT_KEY].moves.map((m) => m.san)).toEqual(['e4', 'c4']);
  });

  it('un capítulo con FEN continúa si esa posición ya está en el repertorio', () => {
    const rep = newRepertoire('r', 'white');
    importPgn(rep, '1. e4 e5 *');
    const { errors } = importPgn(rep, `[FEN "${fenAfter(['e4', 'e5'])}"]\n[SetUp "1"]\n\n2. Nf3 Nc6 *`);
    expect(errors).toEqual([]);
    expect(movesAfter(rep, ['e4', 'e5'])).toEqual(['Nf3']);
  });

  it('ignora un capítulo con FEN desconocida', () => {
    const rep = newRepertoire('r', 'white');
    const { added, errors } = importPgn(rep, '[FEN "8/8/8/8/8/8/8/K6k w - - 0 1"]\n\n1. Kb1 *');
    expect(added).toBe(0);
    expect(errors).toHaveLength(1);
  });

  it('reimportar lo mismo no añade nada', () => {
    const rep = newRepertoire('r', 'white');
    const pgn = '1. e4 e5 2. Nf3 Nc6 *';
    expect(importPgn(rep, pgn).added).toBe(4);
    expect(importPgn(rep, pgn).added).toBe(0);
  });

  it('cleanMoveToken limpia lo que no es jugada', () => {
    expect(cleanMoveToken('12...Nf6!?')).toBe('Nf6');
    expect(cleanMoveToken('$14')).toBeNull();
    expect(cleanMoveToken('3.')).toBeNull();
    expect(cleanMoveToken('0-0-0')).toBe('O-O-O');
    expect(cleanMoveToken('--')).toBeNull();
  });
});

describe('exportar PGN', () => {
  for (const sample of SAMPLES) {
    it(`"${sample.name}" se importa sin errores y sobrevive a exportar + importar`, () => {
      const rep = newRepertoire(sample.name, sample.color);
      expect(importPgn(rep, sample.pgn).errors).toEqual([]);
      const copy = newRepertoire('copia', sample.color);
      expect(importPgn(copy, exportPgn(rep)).errors).toEqual([]);
      expect(edgesOf(copy)).toEqual(edgesOf(rep));
    });
  }

  it('no entra en bucle con repeticiones de posición', () => {
    const rep = newRepertoire('r', 'white');
    // Tras 2...Ng8 se repite la posición inicial, así que 3.e4 es una alternativa a 1.Nf3.
    importPgn(rep, '1. Nf3 Nf6 2. Ng1 Ng8 3. e4 *');
    const pgn = exportPgn(rep);
    expect(pgn).toContain('1. Nf3 (1. e4) 1... Nf6 2. Ng1 Ng8 *');
    const copy = newRepertoire('c', 'white');
    importPgn(copy, pgn);
    expect(edgesOf(copy)).toEqual(edgesOf(rep));
  });
});
