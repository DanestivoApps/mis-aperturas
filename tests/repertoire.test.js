import { describe, it, expect } from 'vitest';
import {
  newRepertoire, deleteMove, posKey, ROOT_KEY, START_FEN, allLines, gapKeys, pathTo, pathFromUcis,
  repStats, trainableKeys, parentCount, weakKeys, pathToText, stepLabel, fenAfterPath,
  resetProgress, subtreeKeys, wasReset,
} from '../src/repertoire.js';
import { play, keyAfter, movesAfter } from './helpers.js';

const lineText = (rep, line) => line.map((s) => s.move.san).join(' ');

describe('claves de posición', () => {
  it('ignora los contadores de jugadas', () => {
    expect(posKey(START_FEN)).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -');
    expect(ROOT_KEY).toBe(posKey(START_FEN));
  });

  it('no marca al paso si no se puede capturar', () => {
    expect(keyAfter(['e4']).endsWith(' b KQkq -')).toBe(true);
  });
});

describe('añadir y borrar jugadas', () => {
  it('no duplica una jugada que ya existe', () => {
    const rep = newRepertoire('r', 'white');
    play(rep, ['e4']);
    play(rep, ['e4']);
    expect(rep.positions[ROOT_KEY].moves).toHaveLength(1);
  });

  it('une las transposiciones en la misma posición', () => {
    const rep = newRepertoire('r', 'black');
    const a = play(rep, ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4']);
    const b = play(rep, ['e4', 'c6', 'd4', 'd5', 'Nd2', 'dxe4', 'Nxe4']);
    const end = a.at(-1).move.to;
    expect(b.at(-1).move.to).toBe(end);
    expect(parentCount(rep, end)).toBe(2);
  });

  it('al borrar una jugada se eliminan las posiciones y tarjetas huérfanas', () => {
    const rep = newRepertoire('r', 'white');
    play(rep, ['e4', 'e5', 'Nf3']);
    play(rep, ['d4', 'd5']);
    rep.cards[keyAfter(['e4', 'e5'])] = { reps: 1, interval: 1, ease: 2.5, due: 0, lapses: 0, last: 0 };
    deleteMove(rep, ROOT_KEY, 'e2e4');
    expect(Object.keys(rep.positions)).toHaveLength(3); // inicio, 1.d4, 1...d5
    expect(rep.cards).toEqual({});
  });

  it('borrar una rama no toca lo que se alcanza por otro camino', () => {
    const rep = newRepertoire('r', 'black');
    play(rep, ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5']);
    play(rep, ['e4', 'c6', 'd4', 'd5', 'Nd2', 'dxe4', 'Nxe4']);
    deleteMove(rep, keyAfter(['e4', 'c6', 'd4', 'd5']), 'b1c3');
    expect(movesAfter(rep, ['e4', 'c6', 'd4', 'd5', 'Nd2', 'dxe4', 'Nxe4'])).toEqual(['Bf5']);
  });
});

describe('líneas y huecos', () => {
  it('recorta las jugadas finales del rival', () => {
    const rep = newRepertoire('r', 'white');
    play(rep, ['e4', 'e5', 'Nf3', 'Nc6']);
    expect(allLines(rep).map((l) => lineText(rep, l))).toEqual(['e4 e5 Nf3']);
  });

  it('sin recorte devuelve las líneas completas desde una posición', () => {
    const rep = newRepertoire('r', 'white');
    play(rep, ['e4', 'e5', 'Nf3', 'Nc6']);
    play(rep, ['e4', 'c5']);
    const lines = allLines(rep, { from: keyAfter(['e4']), trim: false });
    expect(lines.map((l) => lineText(rep, l))).toEqual(['e5 Nf3 Nc6', 'c5']);
  });

  it('termina aunque haya repeticiones de posición', () => {
    const rep = newRepertoire('r', 'white');
    play(rep, ['Nf3', 'Nf6', 'Ng1', 'Ng8']); // vuelve a la posición inicial
    expect(keyAfter(['Nf3', 'Nf6', 'Ng1', 'Ng8'])).toBe(ROOT_KEY);
    expect(allLines(rep).map((l) => lineText(rep, l))).toEqual(['Nf3 Nf6 Ng1']);
  });

  it('detecta posiciones sin respuesta', () => {
    const rep = newRepertoire('r', 'white');
    play(rep, ['e4', 'e5']);
    expect(gapKeys(rep)).toEqual([keyAfter(['e4', 'e5'])]);
    play(rep, ['e4', 'e5', 'Nf3']);
    expect(gapKeys(rep)).toEqual([]);
  });

  it('la posición inicial vacía no cuenta como hueco', () => {
    expect(gapKeys(newRepertoire('r', 'white'))).toEqual([]);
  });
});

describe('caminos', () => {
  it('pathTo devuelve el camino más corto', () => {
    const rep = newRepertoire('r', 'black');
    play(rep, ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4']);
    const path = pathTo(rep, keyAfter(['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4']));
    expect(path).toHaveLength(7);
    expect(pathTo(rep, ROOT_KEY)).toEqual([]);
    expect(pathTo(rep, 'no existe')).toBeNull();
  });

  it('pathFromUcis reconstruye un camino o devuelve null', () => {
    const rep = newRepertoire('r', 'white');
    play(rep, ['e4', 'e5', 'Nf3']);
    expect(pathFromUcis(rep, ['e2e4', 'e7e5']).map((s) => s.move.san)).toEqual(['e4', 'e5']);
    expect(pathFromUcis(rep, ['e2e4', 'c7c5'])).toBeNull();
    expect(fenAfterPath(rep, pathFromUcis(rep, ['e2e4']))).toContain(' b KQkq ');
  });

  it('numera las jugadas al mostrar un camino', () => {
    const rep = newRepertoire('r', 'white');
    const path = play(rep, ['e4', 'e5', 'Nf3', 'Nc6']);
    expect(pathToText(rep, path)).toBe('1. e4 e5 2. Nf3 Nc6');
    expect(pathToText(rep, path.slice(1))).toBe('1... e5 2. Nf3 Nc6');
    expect(stepLabel(rep, path[3])).toBe('Nc6');
  });
});

describe('estadísticas y posiciones débiles', () => {
  it('cuenta pendientes, nuevas y aprendidas', () => {
    const rep = newRepertoire('r', 'white');
    play(rep, ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4']);
    const [a, b, c] = trainableKeys(rep);
    expect(trainableKeys(rep)).toHaveLength(3);
    rep.cards[a] = { reps: 1, interval: 1, ease: 2.5, due: 0, lapses: 0, last: 0 }; // vencida
    rep.cards[b] = { reps: 1, interval: 1, ease: 2.5, due: Date.now() + 1e9, lapses: 0, last: 0 };
    expect(repStats(rep)).toEqual({ total: 3, due: 1, fresh: 1, learned: 1, gaps: 0 });
    expect(c).toBeDefined();
  });

  it('weakKeys ordena por fallos y descarta lo consolidado', () => {
    const rep = newRepertoire('r', 'white');
    play(rep, ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4']);
    const [a, b, c] = trainableKeys(rep);
    rep.cards[a] = { reps: 0, interval: 0, ease: 2, due: 0, lapses: 1, last: 1 };
    rep.cards[b] = { reps: 0, interval: 0, ease: 2, due: 0, lapses: 3, last: 1 };
    rep.cards[c] = { reps: 5, interval: 30, ease: 2, due: 0, lapses: 4, last: 1 }; // ya consolidada
    expect(weakKeys(rep)).toEqual([b, a]);
  });
});

describe('volver a aprender', () => {
  const setup = () => {
    const rep = newRepertoire('r', 'white');
    play(rep, ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4']);
    play(rep, ['e4', 'c5', 'Nf3']);
    for (const key of trainableKeys(rep)) rep.cards[key] = { reps: 2, interval: 3, ease: 2.5, due: 0, lapses: 0, last: 100 };
    return rep;
  };

  it('reinicia todo el progreso y deja marca de fecha', () => {
    const rep = setup();
    expect(resetProgress(rep, { now: 500 })).toBe(4);
    expect(rep.cards).toEqual({});
    expect(rep.progressResetAt).toBe(500);
    expect(repStats(rep).fresh).toBe(4);
  });

  it('desde una posición solo reinicia lo que cuelga de ella', () => {
    const rep = setup();
    const afterE5 = keyAfter(['e4', 'e5']);
    expect(resetProgress(rep, { from: afterE5, now: 500 })).toBe(2); // 2.Cf3 y 3.Ac4
    expect(Object.keys(rep.cards).sort()).toEqual([ROOT_KEY, keyAfter(['e4', 'c5'])].sort());
    expect(rep.resets[afterE5]).toBe(500);
    expect(subtreeKeys(rep, afterE5)).toContain(keyAfter(['e4', 'e5', 'Nf3', 'Nc6']));
  });

  it('wasReset distingue el progreso anterior del nuevo', () => {
    const rep = setup();
    resetProgress(rep, { now: 500 });
    expect(wasReset(rep, ROOT_KEY, { last: 100 })).toBe(true);
    expect(wasReset(rep, ROOT_KEY, { last: 600 })).toBe(false);
  });
});
