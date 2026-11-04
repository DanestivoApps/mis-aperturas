import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

// Identifica cada publicación: la app y su service worker llevan la misma.
const BUILD = Date.now().toString(36);

// Crea sw.js con los archivos de esta publicación, para que la app funcione entera sin conexión.
// De las fuentes solo se guardan las del alfabeto latino: las demás no se usan en español.
function serviceWorker() {
  return {
    name: 'service-worker',
    apply: 'build',
    generateBundle(_, bundle) {
      const assets = Object.keys(bundle).filter(
        (file) => !file.endsWith('.html') && (!file.endsWith('.woff2') || file.includes('latin')),
      );
      const source = readFileSync('src/sw.template.js', 'utf8')
        .replaceAll('__BUILD__', BUILD)
        .replace('__ASSETS__', JSON.stringify(assets));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

// Rutas relativas: la carpeta dist/ funciona en cualquier hosting estático
// (GitHub Pages, Netlify, Cloudflare Pages...) aunque esté en una subcarpeta.
export default defineConfig({
  base: './',
  define: { __BUILD__: JSON.stringify(BUILD) },
  plugins: [serviceWorker()],
});
