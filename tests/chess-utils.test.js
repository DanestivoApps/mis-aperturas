import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import { moveFromUci, sanOf, destsFor, uciOf, tryMove, colorToMove } from '../src/chess-utils.js';

const CASTLE = 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';

describe('jugadas en UCI', () => {
  it('traduce el enroque de Lichess (rey a la torre)', () => {
    expect(moveFromUci(new Chess(CASTLE), 'e1h1').san).toBe('O-O');
    expect(moveFromUci(new Chess(CASTLE), 'e1a1').san).toBe('O-O-O');
    expect(moveFromUci(new Chess(CASTLE.replace(' w ', ' b ')), 'e8h8').san).toBe('O-O');
    expect(moveFromUci(new Chess(CASTLE), 'e1g1').san).toBe('O-O');
  });

  it('no confunde una torre en e1 con un enroque', () => {
    expect(moveFromUci(new Chess('4k3/8/8/8/8/8/8/K3R3 w - - 0 1'), 'e1h1').san).toBe('Rh1');
  });

  it('respeta la pieza de coronación (dama por defecto)', () => {
    const fen = '8/P7/8/8/8/8/8/k6K w - - 0 1';
    expect(moveFromUci(new Chess(fen), 'a7a8n').san).toBe('a8=N');
    expect(moveFromUci(new Chess(fen), 'a7a8').san).toBe('a8=Q+');
  });

  it('devuelve null si la jugada es ilegal', () => {
    expect(moveFromUci(new Chess(), 'e2e5')).toBeNull();
    expect(tryMove(new Chess(), 'e2', 'e5')).toBeNull();
  });

  it('sanOf no cambia la posición', () => {
    const chess = new Chess();
    const fen = chess.fen();
    expect(sanOf(chess, 'g1f3')).toBe('Nf3');
    expect(chess.fen()).toBe(fen);
  });
});

describe('utilidades del tablero', () => {
  it('calcula destinos legales y el color que mueve', () => {
    const chess = new Chess();
    expect(destsFor(chess).get('e2')).toEqual(['e3', 'e4']);
    expect(destsFor(chess).size).toBe(10);
    expect(colorToMove(chess)).toBe('white');
    expect(uciOf(chess.move('e4'))).toBe('e2e4');
    expect(colorToMove(chess)).toBe('black');
  });
});
