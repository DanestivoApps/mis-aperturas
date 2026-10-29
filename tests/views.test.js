import { describe, it, expect } from 'vitest';

// Cada pantalla debe cargarse sin errores de sintaxis ni de importación.
const VIEWS = ['home', 'library', 'train', 'editor', 'drill', 'stats', 'games', 'settings'];

describe('pantallas', () => {
  for (const name of VIEWS) {
    it(`carga ${name}`, async () => {
      const mod = await import(`../src/views/${name}.js`);
      expect(Object.keys(mod).some((k) => k.startsWith('render'))).toBe(true);
    });
  }
});
