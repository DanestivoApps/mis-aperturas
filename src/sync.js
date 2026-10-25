// Sincronización entre dispositivos con un gist privado de GitHub.
// Cada dispositivo guarda su token (permiso "gist"); los datos se fusionan sin perder progreso:
//  - repertorios: gana la versión editada más recientemente (jugadas, comentarios, nombre),
//  - progreso de repaso: por posición, gana el repaso más reciente,
//  - borrados: un repertorio borrado no reaparece (salvo que se edite después en otro dispositivo),
//  - historial: cada dispositivo aporta el suyo y las estadísticas los suman.
import { getData, getSettings, updateSettings, save, onSave } from './store.js';
import { trainableKeys, wasReset } from './repertoire.js';
import { mergeBest } from './session.js';

const trainableKeysOf = (rep) => trainableKeys(rep);

export const GIST_FILE = 'mis-aperturas.json';
export const GIST_DESCRIPTION = 'Mis Aperturas · sincronización (no borrar)';
export const TOKEN_URL = 'https://github.com/settings/tokens/new?scopes=gist&description=Mis%20Aperturas';

export function buildPayload(data) {
  return {
    app: 'mis-aperturas',
    version: 1,
    repertoires: data.repertoires,
    deleted: data.deleted,
    history: { ...data.historyOthers, [data.settings.deviceId]: data.history },
  };
}

function mergeRep(local, remote) {
  const remoteNewer = (remote.updatedAt ?? 0) > (local.updatedAt ?? 0);
  const base = remoteNewer ? remote : local;
  const other = remoteNewer ? local : remote;
  const cards = { ...other.cards };
  for (const [key, card] of Object.entries(base.cards ?? {})) {
    if (!cards[key] || (card.last ?? 0) >= (cards[key].last ?? 0)) cards[key] = card;
  }
  // Los reinicios de progreso ("volver a aprender") de cualquiera de los dos dispositivos se respetan.
  const resets = { ...other.resets };
  for (const [key, time] of Object.entries(base.resets ?? {})) resets[key] = Math.max(resets[key] ?? 0, time);
  const reset = {
    progressResetAt: Math.max(local.progressResetAt ?? 0, remote.progressResetAt ?? 0),
    resets,
  };
  const keep = new Set(trainableKeysOf(base));
  // Se modifica el objeto local (no se sustituye) para no romper una pantalla que lo esté usando.
  Object.assign(local, {
    name: base.name,
    color: base.color,
    positions: base.positions,
    source: base.source,
    updatedAt: base.updatedAt,
    ...reset,
    cards: Object.fromEntries(
      Object.entries(cards).filter(([key, card]) => keep.has(key) && !wasReset(reset, key, card)),
    ),
  });
  if (!base.source) delete local.source;
  // Récords de la contrarreloj: el mejor de cada dispositivo.
  const best = mergeBest(local.drillBest, remote.drillBest);
  if (Object.keys(best).length) local.drillBest = best;
  // Sin reinicios no se añaden campos vacíos (si no, cada sincronización parecería un cambio).
  if (!local.progressResetAt) delete local.progressResetAt;
  if (!Object.keys(local.resets).length) delete local.resets;
  return local;
}

export function mergeRepertoires(local, remote, deleted) {
  const alive = (rep) => !(deleted[rep.id] && deleted[rep.id] >= (rep.updatedAt ?? 0));
  const remoteById = new Map(remote.map((r) => [r.id, r]));
  const localIds = new Set(local.map((r) => r.id));
  const result = [];
  for (const rep of local) {
    if (!alive(rep)) continue;
    const other = remoteById.get(rep.id);
    result.push(other && alive(other) ? mergeRep(rep, other) : rep);
  }
  for (const rep of remote) if (!localIds.has(rep.id) && alive(rep)) result.push(rep);
  return result;
}

// Fusiona en `data` lo que llega del gist. Devuelve true si ha cambiado algo local.
export function mergeInto(data, payload) {
  if (!payload || payload.app !== 'mis-aperturas') return false;
  const before = JSON.stringify([data.repertoires, data.deleted, data.historyOthers]);
  for (const [id, time] of Object.entries(payload.deleted ?? {})) {
    data.deleted[id] = Math.max(data.deleted[id] ?? 0, time);
  }
  data.repertoires = mergeRepertoires(data.repertoires, payload.repertoires ?? [], data.deleted);
  const mine = data.settings.deviceId;
  for (const [device, history] of Object.entries(payload.history ?? {})) {
    if (device !== mine) data.historyOthers[device] = history;
  }
  return JSON.stringify([data.repertoires, data.deleted, data.historyOthers]) !== before;
}

// ---------- API de GitHub ----------

export class SyncError extends Error {}

async function api(path, { method = 'GET', body } = {}) {
  const token = getSettings().syncToken;
  let res;
  try {
    res = await fetch(`https://api.github.com${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new SyncError('Sin conexión con GitHub. Se sincronizará cuando vuelvas a tener internet.');
  }
  if (res.status === 401) throw new SyncError('GitHub no acepta el token. Revisa que sea correcto y tenga el permiso «gist».');
  if (res.status === 403) throw new SyncError('GitHub ha rechazado la petición: el token necesita el permiso «gist».');
  if (!res.ok) {
    const err = new SyncError(`GitHub respondió con un error (${res.status}).`);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

async function findGist() {
  const gists = await api('/gists?per_page=100');
  return gists.find((g) => g.description === GIST_DESCRIPTION && g.files?.[GIST_FILE]) ?? null;
}

async function readGist(id) {
  const gist = await api(`/gists/${id}`);
  const file = gist.files?.[GIST_FILE];
  if (!file) return null;
  const text = file.truncated ? await (await fetch(file.raw_url)).text() : file.content;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

let running = null;

// Trae lo del gist, lo fusiona con lo local y sube el resultado.
export function syncNow() {
  running ??= doSync().finally(() => {
    running = null;
  });
  return running;
}

async function doSync() {
  if (!getSettings().syncToken) throw new SyncError('Falta el token de GitHub.');
  let id = getSettings().syncGistId;
  let remote = null;
  if (id) {
    try {
      remote = await readGist(id);
    } catch (err) {
      if (err.status !== 404) throw err;
      id = ''; // el gist se borró: se busca o se crea otro
    }
  }
  if (!id) {
    const found = await findGist();
    if (found) {
      id = found.id;
      remote = await readGist(id);
    }
  }
  const data = getData();
  const changed = remote ? mergeInto(data, remote) : false;
  const payload = buildPayload(data);
  const content = JSON.stringify(payload);
  if (!id) {
    const created = await api('/gists', {
      method: 'POST',
      body: { description: GIST_DESCRIPTION, public: false, files: { [GIST_FILE]: { content } } },
    });
    id = created.id;
  } else if (!remote || JSON.stringify(remote) !== content) {
    await api(`/gists/${id}`, { method: 'PATCH', body: { files: { [GIST_FILE]: { content } } } });
  }
  updateSettings({ syncGistId: id, lastSync: Date.now() });
  if (changed) save(null, { silent: true });
  return { changed };
}

// Último resultado de la sincronización automática (para mostrarlo en Ajustes).
let lastError = '';
export function syncError() {
  return lastError;
}

// Sincroniza al abrir la app, al volver a ella y unos segundos después de cada cambio.
export function startAutoSync(onRemoteChange) {
  let timer = null;
  const run = () =>
    syncNow()
      .then((result) => {
        lastError = '';
        if (result.changed) onRemoteChange?.();
      })
      .catch((err) => {
        lastError = err.message;
      });

  if (getSettings().syncToken) run();
  onSave(() => {
    if (!getSettings().syncToken) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      run();
    }, 8000);
  });
  document.addEventListener('visibilitychange', () => {
    if (!getSettings().syncToken) return;
    if (document.visibilityState === 'visible') run();
    else if (timer) {
      clearTimeout(timer);
      timer = null;
      run();
    }
  });
}
