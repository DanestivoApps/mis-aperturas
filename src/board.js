// Envoltorio del tablero de Lichess (chessground) y sus temas de color.
import { Chessground } from '@lichess-org/chessground';
import { getSettings } from './store.js';
import { squaresOf } from './chess-utils.js';

export const BOARD_THEMES = {
  brown: { name: 'Marrón', light: '#f0d9b5', dark: '#b58863' },
  blue: { name: 'Azul', light: '#dee3e6', dark: '#8ca2ad' },
  green: { name: 'Verde', light: '#ffffdd', dark: '#86a666' },
  grey: { name: 'Gris', light: '#e2e2e2', dark: '#a5a5a5' },
  purple: { name: 'Lila', light: '#ece4f4', dark: '#9f90b0' },
};

function boardSvg({ light, dark }) {
  let squares = '';
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      if ((rank + file) % 2) squares += `<rect x="${file}" y="${rank}" width="1" height="1" fill="${dark}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges"><rect width="8" height="8" fill="${light}"/>${squares}</svg>`;
}

// Cambia los colores de todos los tableros (el marrón es el que trae chessground).
export function applyBoardTheme(id = getSettings().boardTheme) {
  let style = document.getElementById('board-theme');
  if (!style) {
    style = document.createElement('style');
    style.id = 'board-theme';
    document.head.append(style);
  }
  const theme = BOARD_THEMES[id];
  style.textContent =
    !theme || id === 'brown'
      ? ''
      : `.cg-wrap cg-board { background-color: ${theme.light}; background-image: url("data:image/svg+xml,${encodeURIComponent(boardSvg(theme))}"); }`;
}

export function createBoard(el, config) {
  return Chessground(el, {
    coordinates: getSettings().coordinates,
    animation: { enabled: true, duration: 200 },
    highlight: { lastMove: true, check: true },
    premovable: { enabled: false },
    draggable: { enabled: true, showGhost: true },
    // Solo en desarrollo: acepta clics simulados por script, para poder probar la app automáticamente.
    trustAllEvents: import.meta.env.DEV,
    ...config,
  });
}

export function arrow(uci, brush) {
  const [orig, dest] = squaresOf(uci);
  return { orig, dest, brush };
}
