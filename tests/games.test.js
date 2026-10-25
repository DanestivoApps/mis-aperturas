import { describe, it, expect } from 'vitest';
import { parseGames, analyzeGame, summarize, moveNumber } from '../src/games.js';
import { SAMPLES } from './fixtures.js';
import { repFromPgn, keyAfter } from './helpers.js';

const italian = repFromPgn(SAMPLES[0].pgn, 'white');
const caro = repFromPgn(SAMPLES[1].pgn, 'black');
const reps = [italian, caro];

const game = (white, black, moves, extra = '') =>
  `[White "${white}"]\n[Black "${black}"]\n${extra}\n${moves}`;

describe('leer partidas', () => {
  it('separa partidas, lee cabeceras e ignora comentarios, relojes y variantes', () => {
    const pgn = [
      game('Yo', 'Rival', '1. e4 {[%clk 0:05:00]} e5 (1... c5 2. Nf3) 2. Nf3 $1 Nc6 1-0', '[Result "1-0"]'),
      game('Otro', 'Yo', '1. d4 d5 2. c4 1/2-1/2'),
    ].join('\n\n');
    const games = parseGames(pgn);
    expect(games).toHaveLength(2);
    expect(games[0].headers).toMatchObject({ White: 'Yo', Black: 'Rival', Result: '1-0' });
    expect(games[0].sans).toEqual(['e4', 'e5', 'Nf3', 'Nc6']);
    expect(games[1].sans).toEqual(['d4', 'd5', 'c4']);
    expect(games[1].headers.Result).toBe('1/2-1/2');
  });

  it('numera las jugadas', () => {
    expect(moveNumber(0)).toBe('1.');
    expect(moveNumber(5)).toBe('3...');
  });
});

describe('comparar con el repertorio', () => {
  const analyze = (pgn, user = 'yo') => analyzeGame(parseGames(pgn)[0], reps, user);

  it('detecta cuando seguiste tu repertorio hasta el final', () => {
    const r = analyze(game('Yo', 'Rival', '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O O-O 7. Re1 h6 *'));
    expect(r).toMatchObject({ outcome: 'fin', color: 'white', ply: 13, played: 'h6', opponent: 'Rival' });
  });

  it('detecta tu desviación y qué decía el repertorio', () => {
    const r = analyze(game('Yo', 'Rival', '1. e4 e5 2. Nf3 Nc6 3. d4 exd4 *'));
    expect(r).toMatchObject({ outcome: 'te-desviaste', ply: 4, played: 'd4', expected: ['Bc4'] });
    expect(r.key).toBe(keyAfter(['e4', 'e5', 'Nf3', 'Nc6']));
    expect(r.ucis).toEqual(['e2e4', 'e7e5', 'g1f3', 'b8c6']);
    expect(r.repId).toBe(italian.id);
  });

  it('detecta cuando el rival se sale de tu preparación', () => {
    const r = analyze(game('Yo', 'Rival', '1. e4 e5 2. Nf3 Nc6 3. Bc4 Nd4 *'));
    expect(r).toMatchObject({ outcome: 'rival-se-salio', ply: 5, played: 'Nd4', playedUci: 'c6d4' });
  });

  it('funciona con negras y sin distinguir mayúsculas en el usuario', () => {
    const r = analyze(game('Rival', 'YO', '1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6 5. Be2 c5 6. Be3 Qb6 *'));
    expect(r).toMatchObject({ outcome: 'te-desviaste', color: 'black', ply: 11, played: 'Qb6', expected: ['cxd4'] });
  });

  it('detecta posiciones sin respuesta', () => {
    const shallow = repFromPgn('1. e4 e5 *', 'white');
    const r = analyzeGame(parseGames(game('Yo', 'R', '1. e4 e5 2. Nf3 *'))[0], [shallow], 'yo');
    expect(r).toMatchObject({ outcome: 'hueco', ply: 2 });
  });

  it('la partida puede terminar dentro del repertorio', () => {
    expect(analyze(game('Yo', 'R', '1. e4 e5 2. Nf3 0-1'))).toMatchObject({ outcome: 'fin-partida', ply: 3 });
  });

  it('descarta partidas ajenas, sin repertorio o desde otra posición', () => {
    expect(analyze(game('A', 'B', '1. e4 *')).outcome).toBe('no-jugador');
    expect(analyzeGame(parseGames(game('R', 'Yo', '1. e4 c6 *'))[0], [italian], 'yo').outcome).toBe('sin-repertorio');
    expect(analyze(game('Yo', 'R', '1. e4 *', '[Variant "Chess960"]')).outcome).toBe('otra-variante');
  });
});

describe('resumen', () => {
  it('agrupa desviaciones repetidas y calcula la media de jugadas en teoría', () => {
    const pgn = [
      game('Yo', 'R1', '1. e4 e5 2. Nf3 Nc6 3. d4 *'),
      game('Yo', 'R2', '1. e4 e5 2. Nf3 Nc6 3. d4 exd4 *'),
      game('Yo', 'R3', '1. e4 e5 2. Nf3 Nc6 3. Bc4 Nd4 *'),
      game('A', 'B', '1. d4 *'),
    ].join('\n\n');
    const results = parseGames(pgn).map((g) => analyzeGame(g, reps, 'yo'));
    const summary = summarize(results);
    expect(summary.counts).toEqual({ 'te-desviaste': 2, 'rival-se-salio': 1, 'no-jugador': 1 });
    expect(summary.analyzed).toBe(3);
    expect(summary.deviations).toHaveLength(1);
    expect(summary.deviations[0]).toMatchObject({ count: 2, played: 'd4' });
    expect(summary.surprises[0]).toMatchObject({ count: 1, played: 'Nd4' });
    expect(summary.averageBook).toBeCloseTo((4 + 4 + 5) / 3);
  });
});
