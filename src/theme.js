// Tema de la app: como el sistema (automático), claro u oscuro.
import { getSettings } from './store.js';

export const THEMES = [
  { value: 'auto', label: 'Automático' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
];

export function applyTheme(theme = getSettings().theme) {
  const root = document.documentElement;
  if (theme === 'light' || theme === 'dark') root.dataset.theme = theme;
  else delete root.dataset.theme;
}
