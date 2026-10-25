import { describe, it, expect, afterEach, vi } from 'vitest';
import { fetchChesscomGames } from '../src/chesscom.js';
import { fetchLichessGames, parseStudyUrl, formatEval } from '../src/lichess.js';

const json = (body, status = 200) => new Response(JSON.stringify(body), { status });

afterEach(() => vi.unstubAllGlobals());

describe('Chess.com', () => {
  it('trae las partidas más recientes de ajedrez normal, hasta el máximo', async () => {
    const base = 'https://api.chess.com/pub/player/yo/games';
    const months = {
      [`${base}/2026/09`]: [
        { rules: 'chess', pgn: 'sep-1', end_time: 1 },
        { rules: 'chess960', pgn: 'sep-960', end_time: 2 },
      ],
      [`${base}/2026/10`]: [
        { rules: 'chess', pgn: 'oct-1', end_time: 10 },
        { rules: 'chess', pgn: 'oct-2', end_time: 20 },
        { rules: 'chess', pgn: 'oct-fen', end_time: 30, initial_setup: '8/8/8/8/8/8/8/K6k w - - 0 1' },
      ],
    };
    const fetchMock = vi.fn(async (url) =>
      url.endsWith('/archives') ? json({ archives: Object.keys(months) }) : json({ games: months[url] }));
    vi.stubGlobal('fetch', fetchMock);

    expect(await fetchChesscomGames('Yo', { max: 3 })).toBe('oct-2\n\noct-1\n\nsep-1');
    expect(fetchMock.mock.calls[0][0]).toBe(`${base}/archives`); // usuario en minúsculas
    expect(await fetchChesscomGames('yo', { max: 1 })).toBe('oct-2');
  });

  it('avisa si el usuario no existe', async () => {
    vi.stubGlobal('fetch', async () => json({}, 404));
    await expect(fetchChesscomGames('nadie')).rejects.toThrow('No existe ese usuario');
  });
});

describe('Lichess', () => {
  it('pide las partidas en PGN y manda el token si lo hay', async () => {
    const fetchMock = vi.fn(async () => new Response('[White "yo"]\n1. e4 *'));
    vi.stubGlobal('fetch', fetchMock);
    await fetchLichessGames('yo', { max: 20, token: 'abc' });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/api/games/user/yo?max=20');
    expect(options.headers).toMatchObject({ Accept: 'application/x-chess-pgn', Authorization: 'Bearer abc' });
  });

  it('explica qué hacer si Lichess no devuelve partidas sin token', async () => {
    vi.stubGlobal('fetch', async () => new Response('', { status: 404 }));
    await expect(fetchLichessGames('yo')).rejects.toThrow(/token/);
  });

  it('reconoce enlaces de estudios y capítulos', () => {
    expect(parseStudyUrl('https://lichess.org/study/AbCdEfGh')).toEqual({ study: 'AbCdEfGh', chapter: undefined });
    expect(parseStudyUrl('lichess.org/study/AbCdEfGh/ChApTeR1#3')).toEqual({ study: 'AbCdEfGh', chapter: 'ChApTeR1' });
    expect(parseStudyUrl('https://lichess.org/abc')).toBeNull();
  });

  it('formatea la evaluación', () => {
    expect(formatEval({ cp: 18 })).toBe('+0.2');
    expect(formatEval({ cp: -130 })).toBe('-1.3');
    expect(formatEval({ mate: -3 })).toBe('-M3');
  });
});
