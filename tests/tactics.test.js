import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { Chess } from 'chess.js';
import { pickPuzzle, updateRating } from '../src/views/tactics.js';
import { moveFromUci } from '../src/chess-utils.js';
import { COURSES } from '../src/library.js';
import counts from '../src/data/puzzle-counts.json';

describe('tácticas', () => {
  it('cada curso tiene problemas válidos para su color', () => {
    for (const course of COURSES) {
      expect(counts[course.id], course.id).toBeGreaterThan(50);
      const list = JSON.parse(readFileSync(`public/puzzles/${course.id}.json`, 'utf8'));
      expect(list.length).toBe(counts[course.id]);
      for (const [, fen, moves] of list.slice(0, 20)) {
        const chess = new Chess(fen);
        // resuelve el bando contrario al que mueve en el FEN, que es el del curso
        expect(chess.turn() === 'w' ? 'black' : 'white').toBe(course.color);
        for (const uci of moves.split(' ')) expect(moveFromUci(chess, uci), `${fen} ${uci}`).toBeTruthy();
      }
    }
  });

  it('elige problemas cerca de tu nivel y ajusta la puntuación', () => {
    const puzzles = [['a', '', '', 800, ''], ['b', '', '', 1200, ''], ['c', '', '', 1250, ''], ['d', '', '', 2000, '']];
    for (let i = 0; i < 20; i++) expect(pickPuzzle(puzzles, 1210, {}).at(3)).toBeLessThan(2100);
    expect(pickPuzzle(puzzles, 1210, { a: 1, b: 1, c: 1 })[0]).toBe('d');
    expect(updateRating(1200, 1200, true)).toBe(1216);
    expect(updateRating(1200, 1200, false)).toBe(1184);
    expect(updateRating(1200, 2000, true) - 1200).toBeGreaterThan(30);
  });
});
