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
  // «Ver jugada» (flecha de la jugada que toca) al empezar: al entrenar, no; al practicar, sí.
  showMovesTrain: false,
  showMovesPractice: true,
  vibrate: true, // vibra al fallar (en los móviles que lo permiten)
  dailyGoal: 20, // jugadas respondidas al día (0 = sin objetivo)
  theme: 'auto', // 'auto' (como el sistema), 'light' o 'dark'
  drillDuration: 180, // segundos de la contrarreloj
  showEval: true,
  lichessToken: '',
  explorerDb: 'masters',
  explorerRatings: [1800, 2000, 2200, 2500],
  gamesSource: 'chesscom',
  gamesCount: 50,
  chesscomUser: '',
  lichessUser: '',
  pgnUser: '',
  // Sincronización entre dispositivos (gist privado de GitHub)
  syncToken: '',
  syncGistId: '',
  lastSync: 0,
  deviceId: '',
};

const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

const defaults = () => ({
  version: 1,
  repertoires: [],
  settings: { ...DEFAULT_SETTINGS },
  // Respuestas de ESTE dispositivo por día: { 'AAAA-MM-DD': { ok, bad } }
  history: {},
  // Respuestas de tus otros dispositivos (llegan al sincronizar): { [deviceId]: { día: { ok, bad } } }
  historyOthers: {},
  // Repertorios borrados ({ id: fecha }), para que no reaparezcan al sincronizar.
  deleted: {},
});

function normalize(parsed) {
  const data = {
    ...defaults(),
    ...parsed,
    settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
    history: parsed.history ?? {},
    historyOthers: parsed.historyOthers ?? {},
    deleted: parsed.deleted ?? {},
  };
  if (!data.settings.deviceId) data.settings.deviceId = newId();
  return data;
}

let data = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return normalize(raw ? JSON.parse(raw) : {});
  } catch {
    return normalize({});
  }
}

// Guarda. Si pasas el repertorio que has cambiado (jugadas, comentarios, nombre...), se anota
// la fecha para que la sincronización sepa cuál es la versión más reciente.
export function save(changedRep = null, { silent = false } = {}) {
  if (changedRep) changedRep.updatedAt = Date.now();
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (err) {
    console.error('No se pudo guardar', err);
    return false;
  }
  if (!silent) listeners.forEach((fn) => fn());
  return true;
}

// Avisa cada vez que se guardan cambios (lo usa la sincronización automática).
export function onSave(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getData() {
  return data;
}

export function getSettings() {
  return data.settings;
}

export function updateSettings(patch) {
  Object.assign(data.settings, patch);
  save(null, { silent: true });
}

export function getRepertoire(id) {
  return data.repertoires.find((r) => r.id === id);
}

export function addRepertoire(rep) {
  data.repertoires.push(rep);
  save(rep);
}

export function removeRepertoire(id) {
  data.repertoires = data.repertoires.filter((r) => r.id !== id);
  data.deleted[id] = Date.now();
  save();
}

export function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Anota una respuesta de hoy. Devuelve cuántas llevas hoy entre todos tus dispositivos.
export function recordAnswer(ok) {
  const key = dayKey();
  const day = (data.history[key] ??= { ok: 0, bad: 0 });
  if (ok) day.ok++;
  else day.bad++;
  save();
  return todayCount();
}

export function todayCount() {
  const day = combinedHistory()[dayKey()];
  return day ? day.ok + day.bad : 0;
}

// Historial de todos tus dispositivos sumado por día.
export function combinedHistory() {
  const total = {};
  for (const source of [data.history, ...Object.values(data.historyOthers)]) {
    for (const [day, { ok, bad }] of Object.entries(source)) {
      const t = (total[day] ??= { ok: 0, bad: 0 });
      t.ok += ok;
      t.bad += bad;
    }
  }
  return total;
}

// Días seguidos con al menos una respuesta (hoy cuenta si ya has entrenado;
// si aún no, la racha de ayer sigue viva).
export function streak() {
  const history = combinedHistory();
  const date = new Date();
  if (!history[dayKey(date)]) date.setDate(date.getDate() - 1);
  let days = 0;
  while (history[dayKey(date)]) {
    days++;
    date.setDate(date.getDate() - 1);
  }
  return days;
}

const PRIVATE_SETTINGS = { lichessToken: '', syncToken: '', syncGistId: '', lastSync: 0, deviceId: '' };

// La copia no incluye tus tokens ni datos de este dispositivo, por si la compartes.
export function exportBackup() {
  return JSON.stringify({ ...data, settings: { ...data.settings, ...PRIVATE_SETTINGS } }, null, 1);
}

export function importBackup(text) {
  const parsed = JSON.parse(text);
  if (!parsed || !Array.isArray(parsed.repertoires)) throw new Error('El archivo no es una copia de seguridad válida.');
  const keep = Object.fromEntries(Object.keys(PRIVATE_SETTINGS).map((k) => [k, data.settings[k]]));
  data = normalize(parsed);
  for (const [k, v] of Object.entries(keep)) if (v) data.settings[k] = v;
  save();
}
