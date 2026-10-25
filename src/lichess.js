// Acceso a la API pública de Lichess: evaluación en la nube, explorador y estudios.
// El explorador exige un token personal (gratuito, sin permisos) desde 2025.

const cache = new Map();
let blockedUntil = 0;

export class LichessError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function getJson(url, token) {
  if (cache.has(url)) return cache.get(url);
  if (Date.now() < blockedUntil) throw new LichessError('Lichess pide esperar un minuto (demasiadas consultas).', 429);
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (res.status === 404) {
    cache.set(url, null);
    return null;
  }
  if (res.status === 429) {
    blockedUntil = Date.now() + 60_000;
    throw new LichessError('Lichess pide esperar un minuto (demasiadas consultas).', 429);
  }
  if (res.status === 401) throw new LichessError('Lichess no acepta el token. Revisa el que pusiste en Ajustes.', 401);
  if (!res.ok) throw new LichessError(`Lichess respondió con un error (${res.status}).`, res.status);
  const json = await res.json();
  cache.set(url, json);
  return json;
}

// { cp?, mate?, depth, best } desde el punto de vista de las blancas, o null si no hay.
export async function cloudEval(fen) {
  const data = await getJson(`https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}`);
  const pv = data?.pvs?.[0];
  if (!pv) return null;
  return { cp: pv.cp, mate: pv.mate, depth: data.depth, best: pv.moves.split(' ')[0] };
}

export function formatEval({ cp, mate }) {
  if (mate != null) return `${mate > 0 ? '' : '-'}M${Math.abs(mate)}`;
  const value = (cp ?? 0) / 100;
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}`;
}

// Jugadas más populares de una posición: { white, draws, black, moves: [...], opening }.
export async function explorer(fen, { db, ratings, token }) {
  const params = new URLSearchParams({ fen, moves: '12', topGames: '0' });
  let url = 'https://explorer.lichess.ovh/masters';
  if (db === 'lichess') {
    url = 'https://explorer.lichess.ovh/lichess';
    params.set('variant', 'standard');
    params.set('speeds', 'blitz,rapid,classical');
    params.set('ratings', ratings.join(','));
    params.set('recentGames', '0');
  }
  return getJson(`${url}?${params}`, token);
}

// Partidas recientes de un usuario en PGN. Lichess puede pedir el token para esto.
export async function fetchLichessGames(username, { max = 50, token } = {}) {
  const params = new URLSearchParams({
    max: String(max),
    perfType: 'bullet,blitz,rapid,classical,correspondence',
    moves: 'true',
    tags: 'true',
    clocks: 'false',
    evals: 'false',
    opening: 'false',
  });
  const headers = { Accept: 'application/x-chess-pgn' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`https://lichess.org/api/games/user/${encodeURIComponent(username.trim())}?${params}`, { headers });
  if (res.status === 404 || res.status === 401) {
    throw new LichessError(
      token
        ? 'Lichess no ha devuelto partidas. Comprueba el nombre de usuario.'
        : 'Lichess no ha devuelto partidas: puede que pida tu token (ponlo en Ajustes). También puedes exportar tus partidas desde lichess.org y pegarlas en la pestaña PGN.',
      res.status,
    );
  }
  if (res.status === 429) throw new LichessError('Lichess pide esperar un minuto (demasiadas consultas).', 429);
  if (!res.ok) throw new LichessError(`Lichess respondió con un error (${res.status}).`, res.status);
  return res.text();
}

export const TOKEN_URL = 'https://lichess.org/account/oauth/token/create?description=Mis%20Aperturas';

// Acepta enlaces como lichess.org/study/AbCdEfGh o lichess.org/study/AbCdEfGh/ChApTeR1
export function parseStudyUrl(text) {
  const match = text.match(/lichess\.org\/study\/([A-Za-z0-9]{8})(?:\/([A-Za-z0-9]{8}))?/);
  return match ? { study: match[1], chapter: match[2] } : null;
}

export async function fetchStudyPgn({ study, chapter }, token) {
  const url = chapter
    ? `https://lichess.org/api/study/${study}/${chapter}.pgn`
    : `https://lichess.org/api/study/${study}.pgn`;
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (res.status === 404 || res.status === 403) {
    throw new LichessError('No se encontró el estudio. Si es privado, pon tu token en Ajustes o hazlo público.', res.status);
  }
  if (!res.ok) throw new LichessError(`Lichess respondió con un error (${res.status}).`, res.status);
  return res.text();
}
