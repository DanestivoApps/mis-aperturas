// Biblioteca: cursos listos para añadir, con niveles de profundidad (como en Chessreps).
import { h, fill, toast, dropdown } from '../dom.js';
import { icon } from '../icons.js';
import { COURSES, LEVELS } from '../library.js';
import { miniBoard, courseFen } from '../miniboard.js';
import {
  ownedFrom, addCourse, expandCourse, updateCourse, updateMessage, isOutdated, levelStats, levelProgress,
  relearnLevel, repSnapshot, restoreSnapshot,
} from '../courses.js';

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'white', label: '♔ Blancas' },
  { id: 'black', label: '♚ Negras' },
  { id: 'mine', label: 'Míos' },
];

// Los cursos se agrupan por lo que decides antes de empezar la partida:
// con blancas, tu primera jugada; con negras, la del rival.
const GROUPS = [
  { id: 'w-e4', title: 'Con blancas · empiezas 1.e4' },
  { id: 'w-d4', title: 'Con blancas · empiezas 1.d4' },
  { id: 'w-other', title: 'Con blancas · otras salidas' },
  { id: 'b-e4', title: 'Con negras · contra 1.e4' },
  { id: 'b-d4', title: 'Con negras · contra 1.d4' },
  { id: 'b-other', title: 'Con negras · contra otras salidas' },
  { id: 'g-white', title: 'Gambitos de internet · con blancas' },
  { id: 'g-black', title: 'Gambitos de internet · con negras' },
];

export function courseGroup(course) {
  if (course.gambit) return course.color === 'white' ? 'g-white' : 'g-black';
  if (course.color === 'white') {
    const first = course.levels[0].match(/^1\. (\S+)/)?.[1];
    return first === 'e4' ? 'w-e4' : first === 'd4' ? 'w-d4' : 'w-other';
  }
  return course.against.startsWith('1.e4') ? 'b-e4' : course.against.startsWith('1.d4') ? 'b-d4' : 'b-other';
}

function passesFilter(course) {
  if (filter === 'mine') return Boolean(ownedFrom(course.id));
  return filter === 'all' || course.color === filter;
}

let filter = 'all';
let query = '';
const selectedLevel = new Map(); // curso → nivel elegido en su tarjeta

// Para buscar sin importar tildes ni mayúsculas.
const normalize = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function matches(course, q) {
  if (!q.trim()) return true;
  const haystack = normalize([course.name, course.against, course.tagline, course.intro, ...course.covers].join(' '));
  return normalize(q).trim().split(/\s+/).every((word) => haystack.includes(word));
}

export function renderLibrary(root, { q = null } = {}) {
  if (q != null) {
    query = q;
    filter = 'all';
  }
  let alive = true;
  let drawing = 0; // cada dibujo de la cuadrícula anula las tandas pendientes del anterior
  const grid = h('div', { class: 'course-grid' });
  const filterBtns = FILTERS.map((f) =>
    h('button', {
      type: 'button',
      class: `seg ${f.id === filter ? 'on' : ''}`,
      onClick: (e) => {
        filter = f.id;
        filterBtns.forEach((b) => b.classList.toggle('on', b === e.currentTarget));
        renderGrid();
      },
    }, f.label),
  );

  root.append(
    h('section', { class: 'page' },
      h('div', { class: 'page-head' },
        h('h1', null, 'Biblioteca'),
        h('p', { class: 'muted' },
          'Cursos con la idea de cada jugada explicada y las respuestas habituales del rival. Empieza por el nivel Esencial y amplíalo cuando quieras.'),
      ),
      h('div', { class: 'library-tools' },
        h('div', { class: 'segmented filter' }, filterBtns),
        h('input', {
          type: 'search',
          class: 'library-search',
          placeholder: 'Buscar: siciliana, 1.d4, gambito…',
          value: query,
          'aria-label': 'Buscar cursos',
          onInput: (e) => {
            query = e.target.value;
            renderGrid();
          },
        }),
      ),
      grid,
    ),
  );

  function groupHeading(group, count) {
    return h('h2', { class: 'course-group' }, group.title, h('span', { class: 'muted small' }, String(count)));
  }

  // `inBatches`: al abrir la pantalla, las tarjetas aparecen por tandas para que no se quede congelada.
  function renderGrid(inBatches = false) {
    const list = COURSES.filter((c) => passesFilter(c) && matches(c, query));
    drawing++;
    if (!list.length) {
      const text = filter === 'mine' && !query.trim()
        ? 'Aún no has añadido ningún curso: elige uno en «Todos».'
        : 'No hay cursos que coincidan con la búsqueda.';
      return fill(grid, h('p', { class: 'muted' }, text));
    }
    const items = GROUPS.flatMap((group) => {
      const courses = list.filter((c) => courseGroup(c) === group.id);
      return courses.length ? [() => groupHeading(group, courses.length), ...courses.map((c) => () => courseCard(c))] : [];
    });
    if (!inBatches) return fill(grid, items.map((make) => make()));
    fill(grid);
    const current = drawing;
    const addBatch = (start) => {
      if (!alive || current !== drawing) return;
      grid.append(...items.slice(start, start + 6).map((make) => make()));
      if (start + 6 < items.length) setTimeout(() => addBatch(start + 6), 0);
    };
    addBatch(0);
  }

  function courseCard(course) {
    const stats = levelStats(course);
    const owned = ownedFrom(course.id);
    const isWhite = course.color === 'white';
    const max = course.levels.length - 1;
    const ownedLevel = owned ? owned.source.level : -1;
    // Nivel elegido: se recuerda al redibujar; por defecto, el siguiente para ampliar.
    let level = Math.min(selectedLevel.get(course.id) ?? (owned ? Math.min(ownedLevel + 1, max) : 0), max);

    const levelBtns = course.levels.map((_, i) => {
      const progress = owned && i <= ownedLevel ? levelProgress(owned, i) : null;
      return h('button', {
        type: 'button',
        class: `level ${i === level ? 'on' : ''} ${progress ? 'have' : ''}`,
        title: progress ? `Repasar, practicar o volver a aprender el nivel ${LEVELS[i].name}` : LEVELS[i].hint,
        onClick: (e) => {
          level = i;
          selectedLevel.set(course.id, i);
          levelBtns.forEach((b) => b.classList.toggle('on', b === e.currentTarget));
          updateAction();
        },
      },
        h('strong', null, LEVELS[i].name),
        h('span', null, `${stats[i].lines} líneas`),
        progress
          ? [
              h('span', { class: 'level-bar', 'aria-hidden': 'true' }, h('span', { style: `width:${progress.pct}%` })),
              h('span', { class: 'level-pct' }, `${progress.pct}% aprendido`),
            ]
          : null,
      );
    });

    const action = h('div', { class: 'rep-actions' });

    function updateAction() {
      const name = LEVELS[level].name;
      // «Practicar» está siempre: con tu repertorio si ya tienes ese nivel; si no, sin añadir el curso.
      const practiceOwn = owned && level <= ownedLevel;
      const practiceBtn = h('a', {
        class: 'btn',
        href: practiceOwn
          ? `#/entrenar/${owned.id}?modo=libre&nivel=${level}`
          : `#/probar/${course.id}?nivel=${level}&lineas=todas`,
        title: practiceOwn
          ? `Todas las líneas del nivel ${name} en orden aleatorio, sin tocar tu calendario de repaso`
          : `Todas las líneas del nivel ${name}: cada jugada nueva se enseña primero. No se añade a tus repertorios.`,
      }, icon('target'), 'Practicar');

      if (!owned) {
        fill(action,
          h('button', {
            class: 'btn primary',
            onClick: () => {
              const rep = addCourse(course, level);
              toast(`"${course.name}" añadido (${name})`, 'ok', {
                label: 'Entrenar',
                onClick: () => (location.hash = `#/entrenar/${rep.id}`),
              });
              selectedLevel.delete(course.id);
              renderGrid();
            },
          }, icon('plus'), `Añadir · ${name}`),
          practiceBtn,
          dropdown('⋯', [
            { label: 'Probar solo la línea principal', href: `#/probar/${course.id}`, title: 'Con flechas y explicaciones, y después sin ayuda' },
            { label: 'Trampas del curso', href: `#/probar/${course.id}?trampas=1`, title: 'El rival se equivoca: encuentra cómo castigarlo' },
          ], { label: `Más opciones de ${course.name}` }),
        );
        return;
      }

      const updateBtn = isOutdated(owned)
        ? h('button', {
            class: 'btn primary',
            title: 'Aplica las correcciones y novedades del curso conservando tu progreso',
            onClick: () => {
              toast(updateMessage(updateCourse(owned)), 'ok');
              renderGrid();
            },
          }, 'Actualizar curso')
        : null;

      // Un nivel que aún no tienes: ampliar (y practicarlo antes, si quieres).
      if (level > ownedLevel) {
        fill(action,
          updateBtn,
          h('button', {
            class: `btn ${updateBtn ? '' : 'primary'}`,
            onClick: () => {
              const added = expandCourse(owned, level);
              toast(`Ampliado a ${name}: ${added} jugadas nuevas`, 'ok');
              selectedLevel.delete(course.id);
              renderGrid();
            },
          }, icon('plus'), `Ampliar a ${name}`),
          practiceBtn,
          dropdown('⋯', [
            { label: 'Entrenar el curso', href: `#/entrenar/${owned.id}` },
            { label: 'Ver jugadas', href: `#/editar/${owned.id}` },
          ], { label: `Más opciones de ${course.name}` }),
        );
        return;
      }

      // Un nivel que ya tienes: repasarlo o practicarlo; volver a aprenderlo, en el menú.
      fill(action,
        updateBtn,
        h('a', {
          class: `btn ${updateBtn ? '' : 'primary'}`,
          href: `#/entrenar/${owned.id}?nivel=${level}`,
          title: `Repetición espaciada solo con las líneas del nivel ${name}`,
        }, icon('play'), 'Repasar'),
        practiceBtn,
        dropdown('⋯', [
          {
            label: `Volver a aprender ${name}`,
            title: 'Las jugadas de este nivel vuelven a ser nuevas y las aprendes otra vez con pistas',
            onClick: () => relearn(name),
          },
          { label: 'Contrarreloj', href: `#/contrarreloj/${owned.id}?nivel=${level}` },
          { label: 'Trampas', href: `#/entrenar/${owned.id}?modo=trampas`, title: 'El rival se equivoca: encuentra cómo castigarlo' },
          { label: 'Ver jugadas', href: `#/editar/${owned.id}` },
        ], { label: `Más opciones de ${course.name}` }),
      );
    }

    function relearn(name) {
      if (!confirm(`¿Volver a aprender el nivel ${name} de "${course.name}" desde cero?`)) return;
      const snap = repSnapshot(owned);
      const count = relearnLevel(owned, level);
      toast(
        count ? `${count} jugadas del nivel ${name} vuelven a ser nuevas` : `El nivel ${name} ya estaba por aprender`,
        'ok',
        count
          ? {
              label: 'Deshacer',
              onClick: () => {
                restoreSnapshot(owned, snap);
                renderGrid();
              },
            }
          : null,
      );
      renderGrid();
    }

    updateAction();

    return h('article', { class: `rep-card course-card ${owned ? 'owned' : ''}` },
      h('div', { class: 'rep-card-head' },
        h('div', { class: 'course-thumb', title: isWhite ? 'Con blancas' : 'Con negras' }, miniBoard(courseFen(course), course.color)),
        h('div', { class: 'rep-title' },
          h('h2', null, course.name),
          h('span', { class: 'muted small' }, h('span', { class: `side-dot ${course.color}` }), `${isWhite ? 'Blancas' : 'Negras'} · contra ${course.against}`),
        ),
        owned
          ? isOutdated(owned)
            ? h('span', { class: 'chip warn', title: 'Hay una versión mejorada de este curso' }, 'Actualización')
            : h('span', { class: 'chip due', title: 'Ya está en tus repertorios' }, `✓ ${LEVELS[owned.source.level].name}`)
          : null,
      ),
      h('p', { class: 'tagline' }, course.tagline),
      h('details', { class: 'course-details' },
        h('summary', null, 'Qué incluye'),
        h('p', null, course.intro),
        h('ul', null, course.covers.map((c) => h('li', null, c))),
      ),
      h('div', { class: 'levels' }, levelBtns),
      action,
    );
  }

  renderGrid(true);
  return () => {
    alive = false;
  };
}
