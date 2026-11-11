// Genera public/puzzles/<curso>.json con problemas de táctica de la base de datos de Lichess (CC0)
// que salen de partidas jugadas con las aperturas de cada curso de la biblioteca.
// Uso: node scripts/build-puzzles.mjs   (descarga en streaming unos 300 MB; no guarda nada grande)
//
// Cómo se relaciona un problema con un curso: Lichess etiqueta cada problema con la apertura de su
// partida («Italian_Game Italian_Game_Giuoco_Piano»). Para cada curso calculamos los nombres de
// apertura de todas sus posiciones (con la lista de Lichess, en inglés) y nos quedamos con los
// problemas cuya etiqueta más concreta está entre ellos y que resuelve el bando del curso.
import { mkdirSync, writeFileSync } from 'node:fs';
import { Readable, Transform } from 'node:stream';
import readline from 'node:readline';
import zlib from 'node:zlib';
import { Chess } from 'chess.js';
import { COURSES, coursePgn } from '../src/library.js';
import { newRepertoire, importPgn, posKey } from '../src/repertoire.js';

const PUZZLES_URL = 'https://database.lichess.org/lichess_db_puzzle.csv.zst';
const OPENINGS_URL = (f) => `https://raw.githubusercontent.com/lichess-org/chess-openings/master/${f}.tsv`;
const OUT = 'public/puzzles';
const BANDS = [600, 900, 1100, 1300, 1500, 1700, 1900, 2100, 2400, 3500]; // franjas de dificultad
const PER_BAND = 22;

// Nombres demasiado generales (cualquier partida que empiece por 1.e4, 1.d4…): no sirven para un curso.
const GENERIC = new Set(['Kings_Pawn_Game', 'Queens_Pawn_Game', 'Kings_Knight_Opening', 'Indian_Defense',
  'Kings_Knight_Opening_Normal_Variation', 'Queens_Pawn_Game_Symmetrical_Variation', 'English_Opening',
  'Zukertort_Opening', 'Kings_Pawn_Game_Wayward_Queen_Attack', 'Queens_Pawn_Game_Accelerated_London_System']);

// Nombre de apertura → etiquetas de Lichess.
const tagOf = (s) => s.replace(/['.]/g, '').trim().replace(/\s+/g, '_');
function tagsOf(name) {
  const [family, rest] = name.split(':');
  const tags = [tagOf(family)];
  if (rest) tags.push(`${tagOf(family)}_${tagOf(rest.split(',')[0])}`);
  return tags;
}

async function openingNames() {
  const byKey = new Map();
  for (const f of ['a', 'b', 'c', 'd', 'e']) {
    const text = await (await fetch(OPENINGS_URL(f))).text();
    for (const line of text.split('\n').slice(1)) {
      const [, name, pgn] = line.split('\t');
      if (!pgn) continue;
      const chess = new Chess();
      try {
        chess.loadPgn(pgn);
      } catch {
        continue;
      }
      byKey.set(posKey(chess.fen()), name);
    }
  }
  return byKey;
}

// Etiqueta más concreta de cada posición del curso.
function courseTags(course, names) {
  const rep = newRepertoire(course.name, course.color);
  importPgn(rep, coursePgn(course));
  const tags = new Set();
  for (const key of Object.keys(rep.positions)) {
    const name = names.get(key);
    const tag = name && tagsOf(name).at(-1);
    if (tag && !GENERIC.has(tag)) tags.add(tag);
  }
  return tags;
}

// pzstd mete un «skippable frame» antes de cada bloque; zlib no los entiende, así que los quitamos.
function stripSkippable() {
  let buf = Buffer.alloc(0);
  let pass = 0;
  return new Transform({
    transform(chunk, _enc, done) {
      buf = Buffer.concat([buf, chunk]);
      const out = [];
      while (buf.length) {
        if (pass > 0) {
          const n = Math.min(pass, buf.length);
          out.push(buf.subarray(0, n));
          buf = buf.subarray(n);
          pass -= n;
          continue;
        }
        if (buf.length < 12) break;
        if ((buf.readUInt32LE(0) & 0xfffffff0) === 0x184d2a50) {
          const size = buf.readUInt32LE(4);
          if (buf.length < 8 + size) break;
          pass = size === 4 ? buf.readUInt32LE(8) : 0;
          buf = buf.subarray(8 + size);
        } else {
          pass = Infinity;
        }
      }
      done(null, out.length ? Buffer.concat(out) : undefined);
    },
  });
}

const names = await openingNames();
const courses = COURSES.map((c) => ({ course: c, tags: courseTags(c, names), bands: BANDS.map(() => []) }));
for (const c of courses) console.log(c.course.id, c.tags.size, [...c.tags].slice(0, 4).join(' '));

const res = await fetch(PUZZLES_URL);
const lines = readline.createInterface({
  input: Readable.fromWeb(res.body).pipe(stripSkippable()).pipe(zlib.createZstdDecompress()),
});
let seen = 0;
for await (const line of lines) {
  if (++seen % 500000 === 0) console.log(`${seen} problemas leídos…`);
  const [id, fen, moves, rating, deviation, popularity, plays, themes, , openingTags] = line.split(',');
  if (!openingTags || id === 'PuzzleId') continue;
  if (Number(popularity) < 80 || Number(plays) < 300 || Number(deviation) > 90) continue;
  const tag = openingTags.split(' ').at(-1);
  // En el FEN mueve el rival (su jugada es la primera de la lista); resuelve el otro bando.
  const solver = fen.split(' ')[1] === 'w' ? 'black' : 'white';
  const r = Number(rating);
  const band = BANDS.findIndex((b) => r < b);
  for (const c of courses) {
    if (c.course.color !== solver || !c.tags.has(tag) || band < 0) continue;
    const list = c.bands[band];
    list.push([id, fen, moves, r, themes, Number(popularity), Number(plays)]);
    if (list.length > PER_BAND * 3) {
      list.sort((a, b) => b[5] - a[5] || b[6] - a[6]);
      list.length = PER_BAND;
    }
  }
}

mkdirSync(OUT, { recursive: true });
const counts = {};
for (const c of courses) {
  const puzzles = c.bands.flatMap((list) => list.sort((a, b) => b[5] - a[5] || b[6] - a[6]).slice(0, PER_BAND))
    .map(([id, fen, moves, r, themes]) => [id, fen, moves, r, themes])
    .sort((a, b) => a[3] - b[3]);
  counts[c.course.id] = puzzles.length;
  if (puzzles.length) writeFileSync(`${OUT}/${c.course.id}.json`, JSON.stringify(puzzles));
}
writeFileSync('src/data/puzzle-counts.json', `${JSON.stringify(counts, null, 1)}\n`);
console.log('Hecho:', counts);
