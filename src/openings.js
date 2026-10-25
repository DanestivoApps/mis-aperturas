// Nombres de aperturas (base de datos de Lichess, dominio público CC0).
// Se carga bajo demanda para no hacer más pesada la carga inicial.

let table = null;
let loading = null;

export function loadOpenings() {
  loading ??= import('./data/openings.json').then((mod) => {
    table = mod.default;
    return table;
  });
  return loading;
}

// Nombre de la última posición con nombre a lo largo del camino.
export function openingForPath(path) {
  if (!table) return null;
  for (let i = path.length - 1; i >= 0; i--) {
    const entry = table[path[i].move.to];
    if (entry) return { eco: entry[0], name: entry[1] };
  }
  return null;
}
