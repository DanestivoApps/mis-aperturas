// Biblioteca: cursos listos para añadir, con niveles de profundidad (como en Chessreps).
import { h, fill, toast } from '../dom.js';
import { COURSES, LEVELS } from '../library.js';
import { ownedFrom, addCourse, expandCourse, levelStats } from '../courses.js';

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'white', label: '♔ Con blancas' },
  { id: 'black', label: '♚ Con negras' },
];

let filter = 'all';

export function renderLibrary(root) {
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
        h('h1', null, 'Biblioteca de aperturas'),
        h('p', { class: 'muted' },
          'Cursos listos para entrenar, con la idea de cada jugada explicada y las respuestas más habituales del rival. ',
          'Elige hasta dónde quieres llegar: puedes empezar por lo esencial y ampliar el curso cuando quieras.'),
      ),
      h('div', { class: 'segmented filter' }, filterBtns),
      grid,
    ),
  );

  function renderGrid() {
    fill(grid, COURSES.filter((c) => filter === 'all' || c.color === filter).map(courseCard));
  }

  function courseCard(course) {
    const stats = levelStats(course);
    const owned = ownedFrom(course.id);
    const isWhite = course.color === 'white';
    let level = owned ? Math.min(owned.source.level + 1, course.levels.length - 1) : 0;

    const levelBtns = course.levels.map((_, i) =>
      h('button', {
        type: 'button',
        class: `level ${i === level ? 'on' : ''} ${owned && i <= owned.source.level ? 'have' : ''}`,
        title: LEVELS[i].hint,
        disabled: owned && i <= owned.source.level,
        onClick: (e) => {
          level = i;
          levelBtns.forEach((b) => b.classList.toggle('on', b === e.currentTarget));
          updateAction();
        },
      },
        h('strong', null, LEVELS[i].name),
        h('span', null, `${stats[i].lines} líneas`),
      ),
    );

    const action = h('div', { class: 'rep-actions' });
    function updateAction() {
      if (!owned) {
        fill(action,
          h('button', {
            class: 'btn primary',
            onClick: () => {
              const rep = addCourse(course, level);
              toast(`"${course.name}" añadido (${LEVELS[level].name})`, 'ok', {
                label: 'Entrenar',
                onClick: () => (location.hash = `#/entrenar/${rep.id}`),
              });
              renderGrid();
            },
          }, `Añadir · ${LEVELS[level].name}`),
        );
        return;
      }
      const maxed = owned.source.level >= course.levels.length - 1;
      fill(action,
        h('a', { class: 'btn primary', href: `#/entrenar/${owned.id}` }, 'Entrenar'),
        h('a', { class: 'btn', href: `#/editar/${owned.id}` }, 'Ver jugadas'),
        maxed
          ? null
          : h('button', {
              class: 'btn',
              onClick: () => {
                const added = expandCourse(owned, level);
                toast(`Ampliado a ${LEVELS[level].name}: ${added} jugadas nuevas`, 'ok');
                renderGrid();
              },
            }, `Ampliar a ${LEVELS[level].name}`),
      );
    }
    updateAction();

    return h('article', { class: `rep-card course-card ${owned ? 'owned' : ''}` },
      h('div', { class: 'rep-card-head' },
        h('span', { class: `piece-badge ${course.color}`, title: isWhite ? 'Con blancas' : 'Con negras' }, isWhite ? '♔' : '♚'),
        h('div', { class: 'rep-title' },
          h('h2', null, course.name),
          h('span', { class: 'muted small' }, `${isWhite ? 'Blancas' : 'Negras'} · contra ${course.against}`),
        ),
        owned ? h('span', { class: 'chip due', title: 'Ya está en tus repertorios' }, `✓ ${LEVELS[owned.source.level].name}`) : null,
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

  renderGrid();
}
