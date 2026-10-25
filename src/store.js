// Persistencia en el navegador (localStorage) + copia de seguridad en JSON.

const KEY = 'mis-aperturas.v1';

export const DEFAULT_SETTINGS = {
  notation: 'es', // 'es' (C, A, T, D, R) o 'en' (N, B, R, Q, K)
  newPerSession: 10,
  opponentDelay: 450,
  sound: true,
  coordinates: true,
  boardTheme: 'brown',
  skipKnown: false, // en el repaso, juega solas tus jugadas que no tocan
  showEval: true,
  lichessToken: '',
  explorerDb: 'masters',
  explorerRatings: [1800, 2000, 2200, 2500],
  gamesSource: 'chesscom',
  gamesCount: 50,
  chesscomUser: '',
  lichessUser: '',
  pgnUser: '',
};

const defaults = () => ({
  version: 1,
  repertoires: [],
  settings: { ...DEFAULT_SETTINGS },
  // Respuestas por día: { 'AAAA-MM-DD': { ok, bad } }
  history: {},
});

function normalize(parsed) {
  return {
    ...defaults(),
    ...parsed,
    settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
    history: parsed.history ?? {},
  };
}

let data = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? normalize(JSON.parse(raw)) : defaults();
  } catch {
    return defaults();
  }
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('No se pudo guardar', err);
    return false;
  }
}

export function getData() {
  return data;
}

export function getSettings() {
  return data.settings;
}

export function updateSettings(patch) {
  Object.assign(data.settings, patch);
  save();
}

export function getRepertoire(id) {
  return data.repertoires.find((r) => r.id === id);
}

export function addRepertoire(rep) {
  data.repertoires.push(rep);
  save();
}

export function removeRepertoire(id) {
  data.repertoires = data.repertoires.filter((r) => r.id !== id);
  save();
}

export function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function recordAnswer(ok) {
  const key = dayKey();
  const day = (data.history[key] ??= { ok: 0, bad: 0 });
  if (ok) day.ok++;
  else day.bad++;
  save();
}

// Días seguidos con al menos una respuesta (hoy cuenta si ya has entrenado;
// si aún no, la racha de ayer sigue viva).
export function streak() {
  const date = new Date();
  if (!data.history[dayKey(date)]) date.setDate(date.getDate() - 1);
  let days = 0;
  while (data.history[dayKey(date)]) {
    days++;
    date.setDate(date.getDate() - 1);
  }
  return days;
}

// La copia no incluye el token de Lichess, por si la compartes.
export function exportBackup() {
  return JSON.stringify({ ...data, settings: { ...data.settings, lichessToken: '' } }, null, 1);
}

export function importBackup(text) {
  const parsed = JSON.parse(text);
  if (!parsed || !Array.isArray(parsed.repertoires)) throw new Error('El archivo no es una copia de seguridad válida.');
  const token = data.settings.lichessToken;
  data = normalize(parsed);
  if (!data.settings.lichessToken) data.settings.lichessToken = token;
  save();
}
