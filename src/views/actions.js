// «Qué hacer ahora» a partir de tus partidas: pasos concretos, cada uno con su botón.
import { Chess } from 'chess.js';
import { h, toast } from '../dom.js';
import { getRepertoire, save } from '../store.js';
import { addMove, pathFromUcis } from '../repertoire.js';
import { addCourse, ownedFrom } from '../courses.js';
import { LEVELS } from '../library.js';
import { moveFromUci } from '../chess-utils.js';
import { newCard, gradeWrong } from '../srs.js';
import { san } from '../notation.js';

// "1.e4 e5 2.Cf3" a partir de jugadas UCI desde la posición inicial.
export function lineFromUcis(ucis) {
  const chess = new Chess();
  const out = [];
  for (const u of ucis) {
    const ply = out.length;
    const m = moveFromUci(chess, u);
    if (!m) break;
    out.push(ply % 2 === 0 ? `${ply / 2 + 1}.${san(m.san)}` : san(m.san));
  }
  return out.join(' ');
}

// "2.Cf3" / "2...Cc6" para la jugada número `ply` (0 = primera de las blancas).
const numbered = (ply, move) => `${Math.floor(ply / 2) + 1}${ply % 2 ? '...' : '.'}${san(move)}`;
const times = (n) => (n === 1 ? '1 vez' : `${n} veces`);

export function actionList(actions, { limit = actions.length, onChange = () => {} } = {}) {
  return h('ol', { class: 'action-list' }, actions.slice(0, limit).map((a) => h('li', { class: `action ${a.type}` }, actionBody(a, onChange))));
}

function actionBody(a, onChange) {
  const colorName = a.color === 'white' ? 'blancas' : 'negras';
  if (a.type === 'apertura') {
    const what = a.color === 'white'
      ? ['Con blancas sales con ', h('strong', null, lineFromUcis(a.ucis)), ` en ${a.count} de ${a.total} partidas, pero ningún repertorio tuyo empieza así.`]
      : ['Con negras te juegan ', h('strong', null, lineFromUcis(a.ucis)), ` en ${a.count} de ${a.total} partidas y no tienes nada preparado.`];
    return [
      h('p', { class: 'action-title' }, what),
      a.courses.length
        ? [h('p', { class: 'muted small' }, 'Añade uno de estos cursos (empiezas por el nivel Esencial, lo justo para no perderte):'), courseButtons(a.courses, onChange)]
        : h('p', { class: 'muted small' }, 'No hay cursos para esto en la biblioteca: crea un repertorio y añade tus jugadas en el editor.'),
    ];
  }
  if (a.type === 'respuesta') {
    const rep = getRepertoire(a.repId);
    const last = a.ucis.length - 1;
    const line = lineFromUcis(a.ucis);
    return [
      h('p', { class: 'action-title' },
        'Tras ', h('strong', null, line), ` (${times(a.count)}) no sabes qué jugar`,
        rep ? [' en ', h('em', null, rep.name)] : null, '.'),
      h('p', { class: 'muted small' },
        last >= 0 ? 'Abre el editor en esa posición: te enseña lo que juegan los cursos y Stockfish, y eliges con un clic.' : ''),
      h('div', { class: 'weak-actions' },
        rep ? h('button', { class: 'btn primary', onClick: () => prepare(rep, a.ucis) }, 'Preparar mi respuesta') : null,
        a.courses.length ? h('span', { class: 'muted small' }, `O un curso que lo cubre (${colorName}):`) : null,
      ),
      a.courses.length ? courseButtons(a.courses.slice(0, 3), onChange) : null,
    ];
  }
  // Desvío: en tu repertorio había otra jugada.
  const ply = a.ucis.length;
  return [
    h('p', { class: 'action-title' },
      ply ? ['Tras ', h('strong', null, lineFromUcis(a.ucis)), ' jugaste '] : 'Jugaste ',
      h('strong', null, numbered(ply, a.played)), ` (${times(a.count)}), pero tu repertorio dice `,
      h('strong', null, a.expected.map((m) => numbered(ply, m)).join(' o ')), '.'),
    h('div', { class: 'weak-actions' },
      h('button', { class: 'btn', onClick: (e) => markForReview(a, e.currentTarget) }, 'Repasar esta posición'),
      getRepertoire(a.repId) ? h('a', { class: 'btn ghost', href: `#/editar/${a.repId}?ruta=${a.ucis.join(',')}` }, 'Ver en el editor') : null,
    ),
  ];
}

function courseButtons(courses, onChange) {
  return h('ul', { class: 'action-courses' }, courses.map((c) => {
    const owned = ownedFrom(c.id);
    return h('li', null,
      h('a', { href: `#/biblioteca?q=${encodeURIComponent(c.name)}` }, c.name),
      owned
        ? h('a', { class: 'btn small', href: `#/entrenar/${owned.id}` }, 'Ya lo tienes · Entrenar')
        : h('button', {
            class: 'btn small primary',
            onClick: () => {
              const rep = addCourse(c, 0);
              toast(`«${c.name}» añadido (${LEVELS[0].name})`, 'ok', { label: 'Entrenar', onClick: () => (location.hash = `#/entrenar/${rep.id}`) });
              onChange();
            },
          }, '+ Añadir'),
    );
  }));
}

// Lleva al editor justo en la posición, añadiendo antes la jugada del rival si aún no estaba.
function prepare(rep, ucis) {
  const chess = new Chess();
  for (const u of ucis) {
    const m = moveFromUci(chess, u);
    if (!m) return;
    addMove(rep, m, { own: Boolean(rep.source) });
  }
  save(rep);
  const ok = pathFromUcis(rep, ucis);
  location.hash = `#/editar/${rep.id}?ruta=${ok ? ucis.join(',') : ''}`;
}

function markForReview(a, button) {
  const rep = getRepertoire(a.repId);
  if (!rep) return;
  gradeWrong((rep.cards[a.key] ??= newCard()));
  save();
  button.disabled = true;
  button.textContent = 'Marcada ✓';
  toast('Saldrá en tu próximo repaso', 'ok');
}
