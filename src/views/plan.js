// Plan de repertorio: con qué abrir, qué responder y qué cursos cubren cada salida, sin huecos.
import { h, fill, toast } from '../dom.js';
import { getData, getSettings, updateSettings } from '../store.js';
import { LEVELS } from '../library.js';
import { ownedFrom, addCourse } from '../courses.js';
import { buildPlan, coverageGaps } from '../insights.js';
import { loadReport } from '../partidas.js';
import { icon } from '../icons.js';

const FIRSTS = [['e4', '1.e4', 'Partidas abiertas y tácticas'], ['d4', '1.d4', 'Juego posicional, centro sólido'], ['c4', '1.c4', 'Inglesa: flexible, menos teoría']];
const STYLES = [['solido', 'Sólido', 'Posiciones seguras y planes claros'], ['agresivo', 'Al ataque', 'Gambitos, iniciativa y trampas']];

export function renderPlan(root) {
  const settings = getSettings();
  let first = settings.planFirst ?? guessFirst();
  let style = settings.planStyle ?? 'solido';
  const body = h('div');

  root.append(h('section', { class: 'page' },
    h('div', { class: 'page-head' },
      h('h1', null, 'Tu plan de repertorio'),
      h('p', { class: 'muted' },
        'Un repertorio completo es una apertura con blancas y una respuesta con negras a cada salida habitual. Elige cómo te gusta jugar y te propongo los cursos justos, sin huecos.'),
    ),
    body,
  ));

  function choice(options, value, onPick) {
    return h('div', { class: 'plan-choices' }, options.map(([id, label, hint]) =>
      h('button', {
        type: 'button',
        class: `plan-choice ${id === value ? 'on' : ''}`,
        'aria-pressed': String(id === value),
        onClick: () => onPick(id),
      }, h('strong', null, label), h('span', { class: 'muted small' }, hint))));
  }

  function render() {
    const reps = getData().repertoires;
    const owned = new Set(reps.map((r) => r.source?.course).filter(Boolean));
    const report = loadReport();
    // Lo que más te juegan pesa más al elegir.
    const weights = {};
    for (const [key, n] of Object.entries(report?.positions ?? {})) weights[key] = Math.min(n / 10, 1);
    const picks = buildPlan({ first, style, owned, weights });
    const gaps = coverageGaps(reps);

    fill(body,
      h('div', { class: 'card' },
        h('h3', null, '¿Con qué abres con blancas?'),
        choice(FIRSTS, first, (id) => { first = id; updateSettings({ planFirst: id }); render(); }),
        h('h3', null, '¿Cómo te gusta jugar?'),
        choice(STYLES, style, (id) => { style = id; updateSettings({ planStyle: id }); render(); }),
      ),
      gaps.length && reps.length
        ? h('div', { class: 'notice warn' },
            icon('alert'), ' Ahora mismo no tienes nada preparado contra: ', h('strong', null, gaps.map((g) => g.label).join(', ')), '.')
        : null,
      ['white', 'black'].map((color) => h('div', { class: 'plan-group' },
        h('h2', { class: 'course-group' }, color === 'white' ? 'Con blancas' : 'Con negras'),
        picks.filter((p) => (p.course?.color ?? p.slots[0].color) === color).map((pick) => planRow(pick)),
      )),
      report
        ? h('p', { class: 'muted small' }, `Teniendo en cuenta tus ${report.analyzed} últimas partidas de Chess.com: lo que más te juegan va primero.`)
        : h('p', { class: 'muted small' }, 'Pon tu usuario de Chess.com en el inicio y el plan tendrá en cuenta lo que te juegan de verdad.'),
    );
  }

  function planRow({ course, slots, alternatives }) {
    const covers = slots.map((s) => s.label).join(' · ');
    if (!course) {
      return h('div', { class: 'card plan-row' },
        h('div', null, h('strong', null, covers), h('p', { class: 'muted small' }, 'Ningún curso de la biblioteca lo cubre todavía: prepáralo en el editor.')));
    }
    const mine = ownedFrom(course.id);
    return h('div', { class: `card plan-row ${mine ? 'owned' : ''}` },
      h('div', null,
        h('strong', null, course.name),
        h('p', { class: 'muted small' }, 'Cubre: ', covers),
        alternatives.length
          ? h('p', { class: 'muted small' }, 'Otras opciones: ',
              alternatives.map((c, i) => [i ? ', ' : '', h('a', { href: `#/biblioteca?q=${encodeURIComponent(c.name)}` }, c.name)]))
          : null,
      ),
      mine
        ? h('span', { class: 'chip due' }, '✓ Lo tienes')
        : h('div', { class: 'rep-actions' },
            h('button', {
              class: 'btn primary',
              onClick: () => {
                addCourse(course, 0);
                toast(`"${course.name}" añadido (${LEVELS[0].name})`, 'ok');
                render();
              },
            }, icon('plus'), 'Añadir'),
            h('a', { class: 'btn', href: `#/probar/${course.id}?nivel=0&lineas=todas` }, 'Practicar'),
          ),
    );
  }

  render();
}

// Tu primera jugada con blancas si ya tienes repertorio; si no, 1.e4.
function guessFirst() {
  for (const rep of getData().repertoires) {
    if (rep.color !== 'white') continue;
    const san = Object.values(rep.positions)[0]?.moves[0]?.san;
    if (san && FIRSTS.some(([id]) => id === san)) return san;
  }
  return 'e4';
}
