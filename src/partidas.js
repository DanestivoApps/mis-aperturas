// Tus partidas de Chess.com, analizadas solas cada pocas horas y guardadas en este dispositivo.
import { getData, getSettings } from './store.js';
import { fetchChesscomGames } from './chesscom.js';
import { parseGames, analyzeGame } from './games.js';
import { buildReport } from './insights.js';

const KEY = 'mis-aperturas.partidas';
const MAX_AGE = 6 * 60 * 60 * 1000;

// Último análisis completo de esta sesión (lo usa la pantalla Partidas).
export let lastAnalysis = null;
let pending = null;

export function loadReport() {
  try {
    const report = JSON.parse(localStorage.getItem(KEY));
    // Los resúmenes antiguos (sin aperturas) se rehacen.
    return report?.openings && report.username === getSettings().chesscomUser ? report : null;
  } catch {
    return null;
  }
}

function storeReport(report) {
  try {
    localStorage.setItem(KEY, JSON.stringify(report));
  } catch {
    // Sin espacio: el resumen se recalcula la próxima vez.
  }
}

// Vuelve a analizar si el resumen es viejo (o si `force`). Devuelve el resumen o null.
export async function refreshReport({ force = false } = {}) {
  const username = getSettings().chesscomUser?.trim();
  if (!username || !getData().repertoires.length) return null;
  const current = loadReport();
  if (!force && current && Date.now() - current.at < MAX_AGE) return current;
  pending ??= (async () => {
    try {
      const pgn = await fetchChesscomGames(username, { max: 60 });
      const games = parseGames(pgn);
      const analysis = games.map((g) => analyzeGame(g, getData().repertoires, username));
      lastAnalysis = { username, source: 'chesscom', analysis };
      const report = buildReport(analysis, { username });
      storeReport(report);
      return report;
    } finally {
      pending = null;
    }
  })();
  return pending;
}

// Posiciones que te salen en tus partidas (para dar prioridad en el repaso).
export function gamePriority() {
  return new Map(Object.entries(loadReport()?.positions ?? {}));
}
