import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// localStorage en memoria para probar el guardado fuera del navegador.
function memoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
  };
}

let store;
beforeEach(async () => {
  vi.stubGlobal('localStorage', memoryStorage());
  vi.resetModules();
  store = await import('../src/store.js');
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('historial y racha', () => {
  it('cuenta los días seguidos entrenando', () => {
    vi.useFakeTimers();
    const day = (d) => vi.setSystemTime(new Date(2026, 9, d, 18));
    day(20);
    store.recordAnswer(true);
    day(21);
    store.recordAnswer(true);
    store.recordAnswer(false);
    day(22);
    store.recordAnswer(true);
    expect(store.streak()).toBe(3);
    expect(store.getData().history['2026-10-21']).toEqual({ ok: 1, bad: 1 });

    day(23); // hoy aún no has entrenado: la racha de ayer sigue viva
    expect(store.streak()).toBe(3);
    day(25); // te saltaste un día
    expect(store.streak()).toBe(0);
  });

  it('guarda en localStorage y lo vuelve a leer', async () => {
    store.updateSettings({ newPerSession: 7 });
    vi.resetModules();
    const again = await import('../src/store.js');
    expect(again.getSettings().newPerSession).toBe(7);
    expect(again.getSettings().sound).toBe(true); // valores por defecto para lo que falte
  });
});

describe('objetivo diario', () => {
  it('cuenta las respuestas de hoy de todos tus dispositivos', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 21, 18));
    expect(store.todayCount()).toBe(0);
    expect(store.recordAnswer(true)).toBe(1);
    expect(store.recordAnswer(false)).toBe(2);
    store.getData().historyOthers.movil = { '2026-10-21': { ok: 5, bad: 1 }, '2026-10-20': { ok: 9, bad: 0 } };
    expect(store.todayCount()).toBe(8);
    expect(store.getSettings().dailyGoal).toBe(20);
  });
});

describe('copias de seguridad', () => {
  it('no incluye el token de Lichess', () => {
    store.updateSettings({ lichessToken: 'secreto' });
    const backup = JSON.parse(store.exportBackup());
    expect(backup.settings.lichessToken).toBe('');
    expect(store.getSettings().lichessToken).toBe('secreto');
  });

  it('al restaurar conserva tu token actual', () => {
    store.updateSettings({ lichessToken: 'secreto' });
    store.importBackup(JSON.stringify({ repertoires: [{ id: 'x', name: 'R', color: 'white', positions: {}, cards: {} }] }));
    expect(store.getData().repertoires).toHaveLength(1);
    expect(store.getSettings().lichessToken).toBe('secreto');
  });

  it('rechaza archivos que no son copias', () => {
    expect(() => store.importBackup('{"hola": 1}')).toThrow();
    expect(() => store.importBackup('no es json')).toThrow();
  });
});
