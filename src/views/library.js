// Biblioteca: cursos listos para añadir, con niveles de profundidad (como en Chessreps).
import { h, fill, toast } from '../dom.js';
import { COURSES, LEVELS } from '../library.js';
import {
  ownedFrom, addCourse, expandCourse, updateCourse, updateMessage, isOutdated, levelStats, levelProgress,
  relearnLevel, repSnapshot, restoreSnapshot,
} from '../courses.js';

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'white', label: '♔ Con blancas' },
  { id: 'black', label: '♚ Con negras' },
];

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

  function renderGrid() {
    const list = COURSES.filter((c) => (filter === 'all' || c.color === filter) && matches(c, query));
    fill(grid, list.length ? list.map(courseCard) : h('p', { class: 'muted' }, 'No hay cursos que coincidan con la búsqueda.'));
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
              selectedLevel.delete(course.id);
              renderGrid();
            },
          }, `Añadir · ${LEVELS[level].name}`),
          h('a', {
            class: 'btn',
            href: `#/probar/${course.id}`,
            title: 'Juega la línea principal con sus explicaciones, sin añadir el curso',
          }, '▶ Probar la línea principal'),
        );
        return;
      }

      const name = LEVELS[level].name;
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
      const viewBtn = h('a', { class: 'btn ghost', href: `#/editar/${owned.id}` }, 'Ver jugadas');

      // Un nivel que aún no tienes: ampliar.
      if (level > ownedLevel) {
        fill(action,
          updateBtn,
          h('button', {
            class: 'btn primary',
            onClick: () => {
              const added = expandCourse(owned, level);
              toast(`Ampliado a ${name}: ${added} jugadas nuevas`, 'ok');
              selectedLevel.delete(course.id);
              renderGrid();
            },
          }, `Ampliar a ${name}`),
          h('a', { class: 'btn', href: `#/entrenar/${owned.id}` }, 'Entrenar'),
          viewBtn,
        );
        return;
      }

      // Un nivel que ya tienes: repasarlo, practicarlo o volver a aprenderlo.
      fill(action,
        updateBtn,
        h('a', {
          class: 'btn primary',
          href: `#/entrenar/${owned.id}?nivel=${level}`,
          title: 'Repetición espaciada solo con las líneas de este nivel',
        }, `Repasar ${name}`),
        h('a', {
          class: 'btn',
          href: `#/entrenar/${owned.id}?modo=libre&nivel=${level}`,
          title: 'Todas las líneas del nivel en orden aleatorio, sin tocar tu calendario de repaso',
        }, `Practicar ${name}`),
        h('button', {
          class: 'btn',
          title: 'Las jugadas de este nivel vuelven a ser nuevas y las aprendes otra vez con pistas',
          onClick: () => {
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
          },
        }, `↺ Volver a aprender ${name}`),
        viewBtn,
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
      owned ? h('p', { class: 'muted small level-help' }, 'Pulsa un nivel para repasarlo, practicarlo o volver a aprenderlo.') : null,
      action,
    );
  }

  renderGrid();
}
