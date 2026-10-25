import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const card = (last, reps = 1) => ({ reps, interval: 1, ease: 2.5, due: last + 1, lapses: 0, last });
// Posiciones reales: "a" es la inicial (te toca a ti, con blancas) y "b" tras 1.e4.
const A = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -';
const B = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -';
const rep = (id, updatedAt, extra = {}) => ({
  id,
  name: id,
  color: 'white',
  updatedAt,
  positions: { [A]: { fen: A + ' 0 1', moves: [{ san: 'e4', uci: 'e2e4', to: B }] }, [B]: { fen: B + ' 0 1', moves: [] } },
  cards: {},
  ...extra,
});

let sync;
let store;
beforeEach(async () => {
  localStorage.clear();
  vi.resetModules();
  store = await import('../src/store.js');
  sync = await import('../src/sync.js');
});
afterEach(() => vi.unstubAllGlobals());

describe('fusión de datos', () => {
  it('gana la versión editada más reciente y el repaso más reciente de cada posición', () => {
    const local = rep('r1', 100, { name: 'local', cards: { [A]: card(50, 5) } });
    const remote = rep('r1', 200, { name: 'remota', cards: { [A]: card(10, 1) } });
    const [merged] = sync.mergeRepertoires([local], [remote], {});
    expect(merged).toBe(local); // se conserva el objeto local
    expect(merged.name).toBe('remota');
    expect(merged.cards[A].reps).toBe(5); // el repaso local era más reciente
  });

  it('descarta tarjetas de posiciones que ya no existen', () => {
    const local = rep('r1', 100, { cards: { [A]: card(5), [B]: card(9) } });
    const remote = rep('r1', 50);
    expect(Object.keys(sync.mergeRepertoires([local], [remote], {})[0].cards)).toEqual([A]); // B no es tuya
  });

  it('añade lo nuevo del otro dispositivo y respeta los borrados', () => {
    const merged = sync.mergeRepertoires([rep('a', 1), rep('b', 1)], [rep('c', 1), rep('b', 1)], { b: 5 });
    expect(merged.map((r) => r.id)).toEqual(['a', 'c']);
  });

  it('un repertorio editado después de borrarse en otro sitio no se pierde', () => {
    expect(sync.mergeRepertoires([rep('a', 10)], [], { a: 5 }).map((r) => r.id)).toEqual(['a']);
  });

  it('mergeInto suma el historial de otros dispositivos y avisa si algo cambió', () => {
    const data = store.getData();
    const me = data.settings.deviceId;
    data.history = { '2026-10-25': { ok: 3, bad: 1 } };
    const payload = {
      app: 'mis-aperturas',
      repertoires: [rep('nuevo', 1)],
      deleted: {},
      history: { movil: { '2026-10-25': { ok: 2, bad: 0 } }, [me]: { '2026-10-25': { ok: 99, bad: 99 } } },
    };
    expect(sync.mergeInto(data, payload)).toBe(true);
    expect(data.repertoires.map((r) => r.id)).toEqual(['nuevo']);
    expect(store.combinedHistory()['2026-10-25']).toEqual({ ok: 5, bad: 1 }); // lo propio no se pisa
    expect(sync.mergeInto(data, payload)).toBe(false); // segunda vez: nada nuevo
    expect(sync.mergeInto(data, { app: 'otra' })).toBe(false);
  });
});

// GitHub simulado en memoria.
function fakeGitHub({ status } = {}) {
  const gists = new Map();
  let next = 1;
  const calls = [];
  const fetchMock = vi.fn(async (url, opts = {}) => {
    const method = opts.method ?? 'GET';
    const path = url.replace('https://api.github.com', '');
    calls.push(`${method} ${path.split('?')[0]}`);
    if (status) return new Response('{}', { status });
    const json = (body, code = 200) => new Response(JSON.stringify(body), { status: code });
    if (method === 'GET' && path.startsWith('/gists?')) return json([...gists.values()]);
    if (method === 'POST' && path === '/gists') {
      const body = JSON.parse(opts.body);
      const gist = { id: `g${next++}`, description: body.description, files: body.files };
      gists.set(gist.id, gist);
      return json(gist, 201);
    }
    const id = path.split('/')[2];
    if (!gists.has(id)) return json({}, 404);
    if (method === 'PATCH') {
      Object.assign(gists.get(id).files, JSON.parse(opts.body).files);
      return json(gists.get(id));
    }
    return json(gists.get(id));
  });
  return { fetchMock, gists, calls };
}

describe('sincronizar con GitHub', () => {
  it('crea el gist la primera vez y lo reutiliza después', async () => {
    const gh = fakeGitHub();
    vi.stubGlobal('fetch', gh.fetchMock);
    store.updateSettings({ syncToken: 't' });
    store.addRepertoire(rep('r1', 1));
    await sync.syncNow();
    expect(gh.calls).toEqual(['GET /gists', 'POST /gists']);
    expect(store.getSettings().syncGistId).toBe('g1');
    const saved = JSON.parse(gh.gists.get('g1').files[sync.GIST_FILE].content);
    expect(saved.repertoires.map((r) => r.id)).toEqual(['r1']);
    expect(gh.fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer t');

    gh.calls.length = 0;
    await sync.syncNow(); // nada cambió: solo lee
    expect(gh.calls).toEqual(['GET /gists/g1']);
  });

  it('dos dispositivos acaban con lo mismo sin perder progreso', async () => {
    const gh = fakeGitHub();
    vi.stubGlobal('fetch', gh.fetchMock);

    // Dispositivo A: crea un repertorio y sincroniza.
    store.updateSettings({ syncToken: 't' });
    store.addRepertoire(rep('r1', 1));
    await sync.syncNow();
    const devA = JSON.parse(localStorage.getItem('mis-aperturas.v1'));

    // Dispositivo B (otro almacenamiento): encuentra el gist, entrena y sincroniza.
    localStorage.clear();
    vi.resetModules();
    const storeB = await import('../src/store.js');
    const syncB = await import('../src/sync.js');
    storeB.updateSettings({ syncToken: 't' });
    await syncB.syncNow();
    expect(storeB.getData().repertoires.map((r) => r.id)).toEqual(['r1']);
    storeB.getData().repertoires[0].cards[A] = card(500, 4);
    storeB.recordAnswer(true);
    await syncB.syncNow();

    // De vuelta en A: recibe el progreso de B.
    localStorage.setItem('mis-aperturas.v1', JSON.stringify(devA));
    vi.resetModules();
    const storeA = await import('../src/store.js');
    const syncA = await import('../src/sync.js');
    const { changed } = await syncA.syncNow();
    expect(changed).toBe(true);
    expect(storeA.getData().repertoires[0].cards[A].reps).toBe(4);
    expect(Object.values(storeA.combinedHistory())[0]).toEqual({ ok: 1, bad: 0 });
  });

  it('explica los errores de token', async () => {
    vi.stubGlobal('fetch', fakeGitHub({ status: 401 }).fetchMock);
    store.updateSettings({ syncToken: 'malo' });
    await expect(sync.syncNow()).rejects.toThrow(/no acepta el token/);
  });

  it('sin token no hace nada', async () => {
    await expect(sync.syncNow()).rejects.toThrow(/Falta el token/);
  });

  it('la copia de seguridad no incluye el token de sincronización', () => {
    store.updateSettings({ syncToken: 'secreto', syncGistId: 'g9' });
    const backup = JSON.parse(store.exportBackup());
    expect(backup.settings.syncToken).toBe('');
    expect(backup.settings.syncGistId).toBe('');
  });
});

describe('reinicios de progreso al sincronizar', () => {
  it('un reinicio en otro dispositivo borra el progreso antiguo, no el nuevo', () => {
    const local = rep('r1', 100, { cards: { [A]: card(50, 5) } });
    const remote = rep('r1', 100, { cards: {}, progressResetAt: 80 });
    const [merged] = sync.mergeRepertoires([local], [remote], {});
    expect(merged.cards).toEqual({}); // el repaso local (50) es anterior al reinicio (80)
    expect(merged.progressResetAt).toBe(80);

    const local2 = rep('r1', 100, { cards: { [A]: card(90, 1) } });
    const [merged2] = sync.mergeRepertoires([local2], [rep('r1', 100, { progressResetAt: 80 })], {});
    expect(merged2.cards[A].reps).toBe(1); // aprendido después del reinicio: se queda
  });

  it('respeta los reinicios de una sola posición', () => {
    const local = rep('r1', 100, { cards: { [A]: card(50, 5) }, resets: {} });
    const remote = rep('r1', 100, { cards: { [A]: card(40, 3) }, resets: { [A]: 70 } });
    expect(sync.mergeRepertoires([local], [remote], {})[0].cards).toEqual({});
  });
});
