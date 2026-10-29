// Iconos de trazo (24×24) para la interfaz. icon('flame') devuelve un <span> con el SVG.
const PATHS = {
  flame: '<path d="M12 21c-3.9 0-7-2.8-7-6.6 0-2.7 1.6-4.6 3.2-6.3.3 1.6 1.1 2.8 2.3 3.4C10.3 7.6 12 5 14.6 3c.2 2.6 1.4 4.3 2.7 5.9 1.1 1.4 1.7 3 1.7 5.1C19 17.9 15.9 21 12 21z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  clock: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2.5h5"/>',
  book: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5zM5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/>',
  pencil: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z M13.5 6.5l4 4"/>',
  play: '<path d="M7 4.5v15l12-7.5z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  check: '<path d="M4.5 12.5l5 5L19.5 7"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.3 1.1 2.2h5c0-.9.5-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>',
  alert: '<path d="M12 3l9.5 17h-19zM12 10v4M12 17.5h.01"/>',
  repeat: '<path d="M4 12a8 8 0 0 1 14-5.3M20 4v4h-4M20 12a8 8 0 0 1-14 5.3M4 20v-4h4"/>',
  skip: '<path d="M5 5l9 7-9 7zM18 5v14"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5a3.5 3.5 0 0 0 3.8 3.5M16 6h3.5a3.5 3.5 0 0 1-3.8 3.5M12 13v4M8.5 21h7M10 17h4l.5 4h-5z"/>',
  chart: '<path d="M5 20v-8M12 20V5M19 20v-5M3 20h18"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
};

export function icon(name, { className = '' } = {}) {
  const span = document.createElement('span');
  span.className = `ico ${className}`.trim();
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = `<svg viewBox="0 0 24 24">${PATHS[name] ?? ''}</svg>`;
  return span;
}
