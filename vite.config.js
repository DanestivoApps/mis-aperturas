import { defineConfig } from 'vite';

// Rutas relativas: la carpeta dist/ funciona en cualquier hosting estático
// (GitHub Pages, Netlify, Cloudflare Pages...) aunque esté en una subcarpeta.
export default defineConfig({
  base: './',
});
