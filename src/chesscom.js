// Partidas públicas de Chess.com (no hace falta cuenta ni token).

const STANDARD_START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// Devuelve el PGN de las `max` partidas más recientes (ajedrez normal), de la más nueva a la más antigua.
export async function fetchChesscomGames(username, { max = 50, months = 6 } = {}) {
  const user = encodeURIComponent(username.trim().toLowerCase());
  const res = await fetch(`https://api.chess.com/pub/player/${user}/games/archives`);
  if (res.status === 404) throw new Error('No existe ese usuario en Chess.com.');
  if (!res.ok) throw new Error(`Chess.com respondió con un error (${res.status}).`);
  const { archives = [] } = await res.json();

  const pgns = [];
  for (const url of archives.slice(-months).reverse()) {
    const month = await fetch(url);
    if (!month.ok) continue;
    const { games = [] } = await month.json();
    const standard = games
      .filter((g) => g.rules === 'chess' && g.pgn && (!g.initial_setup || g.initial_setup === STANDARD_START))
      .sort((a, b) => (b.end_time ?? 0) - (a.end_time ?? 0));
    for (const g of standard) {
      pgns.push(g.pgn);
      if (pgns.length >= max) return pgns.join('\n\n');
    }
  }
  return pgns.join('\n\n');
}
