// Inicio: lo que toca hoy, tus repertorios y acceso a la biblioteca.
import { h, toast, download, safeFilename, openDialog, dropdown } from '../dom.js';
import { getData, addRepertoire, removeRepertoire, save, streak, todayCount } from '../store.js';
import { newRepertoire, exportPgn, repStats, weakKeys, resetProgress } from '../repertoire.js';
import { describeDue } from '../srs.js';
import { LEVELS, COURSES, getCourse } from '../library.js';
import { icon } from '../icons.js';
import { miniBoard, courseFen, repFen } from '../miniboard.js';
import { outdatedReps, updateCourse, updateMessage, restoreCourse, repSnapshot, restoreSnapshot } from '../courses.js';

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export function renderHome(root) {
  const reps = getData().repertoires;
  const page = h('section', { class: 'page' });
  root.append(page);
  if (!reps.length) {
    page.append(welcome());
    return;
  }
  page.append(
    today(reps),
    updateBanner() ?? '',
    h('div', { class: 'section-head' },
      h('h2', null, 'Tus repertorios'),
      h('div', { class: 'section-actions' },
        h('button', { class: 'btn', onClick: newRepDialog }, icon('plus'), 'Nuevo'),
        h('a', { class: 'btn', href: '#/biblioteca' }, icon('book'), 'Biblioteca'),
      ),
    ),
    h('div', { class: 'rep-grid' }, reps.map(repCard)),
  );
}

function rerender() {
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

// Jugadas que tocan hoy en un repertorio: las vencidas y las nuevas que caben en una sesión.
function pendingCount(rep) {
  const s = repStats(rep);
  return s.due + Math.min(s.fresh, getData().settings.newPerSession);
}

const nextDueOf = (rep) => Object.values(rep.cards).reduce((min, c) => Math.min(min, c.due), Infinity);

// ---------- Hoy ----------
function today(reps) {
  const settings = getData().settings;
  const pendingReps = reps.filter((rep) => pendingCount(rep) > 0);
  const due = reps.reduce((n, rep) => n + repStats(rep).due, 0);
  const fresh = pendingReps.reduce((n, rep) => n + Math.min(repStats(rep).fresh, settings.newPerSession), 0);
  const pending = due + fresh;
  const days = streak();
  const nextDue = Math.min(...reps.map(nextDueOf));

  const detail = pending
    ? [due ? `${due} para repasar` : null, fresh ? plural(fresh, 'nueva por aprender', 'nuevas por aprender') : null]
        .filter(Boolean).join(' · ')
    : Number.isFinite(nextDue) ? `Próximo repaso: ${describeDue(nextDue)}.` : 'Añade jugadas a tus repertorios para empezar.';

  return h('div', { class: `today ${pending ? '' : 'done'}` },
    h('div', { class: 'today-main' },
      h('p', { class: 'today-label' }, 'Hoy'),
      h('h1', null, pending ? plural(pending, 'jugada pendiente', 'jugadas pendientes') : 'Estás al día'),
      h('p', { class: 'muted' }, detail),
      h('div', { class: 'today-actions' },
        pending
          ? h('a', { class: 'btn primary big', href: `#/entrenar/${pendingReps[0].id}?todo=1` }, icon('play'), 'Empezar a entrenar')
          : h('a', { class: 'btn big', href: '#/biblioteca' }, icon('book'), 'Aprender otra apertura'),
        days
          ? h('span', { class: 'streak', title: 'Días seguidos entrenando' }, icon('flame'), plural(days, 'día seguido', 'días seguidos'))
          : null,
      ),
    ),
    goalRing(settings.dailyGoal),
  );
}

// Anillo con las jugadas respondidas hoy frente al objetivo diario (Ajustes).
function goalRing(goal) {
  if (!goal) return null;
  const count = todayCount();
  const done = count >= goal;
  const length = 2 * Math.PI * 34;
  const ring = h('div', {
    class: `goal-ring ${done ? 'done' : ''}`,
    role: 'img',
    'aria-label': `Objetivo de hoy: ${count} de ${goal} jugadas`,
    title: 'Jugadas respondidas hoy. Cambia el objetivo en Ajustes.',
  });
  ring.innerHTML = `<svg viewBox="0 0 80 80"><circle class="track" cx="40" cy="40" r="34"/><circle class="fill" cx="40" cy="40" r="34" stroke-dasharray="${length.toFixed(1)}" stroke-dashoffset="${(length * (1 - Math.min(1, count / goal))).toFixed(1)}"/></svg>`;
  ring.append(h('div', { class: 'goal-ring-text' },
    done ? icon('check') : h('strong', null, String(count)),
    h('span', null, done ? 'objetivo' : `de ${goal}`)));
  return ring;
}

function updateBanner() {
  const outdated = outdatedReps();
  if (!outdated.length) return null;
  return h('div', { class: 'update-banner' },
    h('span', null,
      h('strong', null, `Hay mejoras en ${outdated.length === 1 ? '1 curso' : `${outdated.length} cursos`} que tienes`),
      h('span', { class: 'muted small' }, ` (${outdated.map((r) => r.name).join(', ')}). Se conserva tu progreso y las jugadas que añadiste tú.`),
    ),
    h('button', {
      class: 'btn primary',
      onClick: () => {
        let added = 0;
        let removed = 0;
        for (const rep of outdated) {
          const r = updateCourse(rep);
          added += r.added;
          removed += r.removed;
        }
        toast(updateMessage({ added, removed }).replace('Curso actualizado', outdated.length > 1 ? 'Cursos actualizados' : 'Curso actualizado'), 'ok');
        rerender();
      },
    }, 'Actualizar'),
  );
}

// ---------- Repertorios ----------
function repCard(rep) {
  const s = repStats(rep);
  const settings = getData().settings;
  const pending = pendingCount(rep);
  const pct = s.total ? Math.round((s.learned / s.total) * 100) : 0;
  const nextDue = nextDueOf(rep);
  const isWhite = rep.color === 'white';
  const freshToday = Math.min(s.fresh, settings.newPerSession);

  const course = getCourse(rep.source?.course);
  return h('article', { class: 'rep-card' },
    h('div', { class: 'rep-card-top' },
      h('a', { class: 'rep-thumb', href: `#/editar/${rep.id}`, tabindex: '-1', title: 'Ver las jugadas' },
        miniBoard(course ? courseFen(course) : repFen(rep), rep.color)),
      h('div', { class: 'rep-info' },
        h('div', { class: 'rep-card-head' },
          h('div', { class: 'rep-title' },
            h('h3', null, rep.name),
            h('span', { class: 'muted small' },
              h('span', { class: `side-dot ${rep.color}` }), isWhite ? 'Blancas' : 'Negras',
              rep.source ? ` · ${LEVELS[rep.source.level]?.name ?? ''}` : ''),
          ),
          repMenu(rep, s),
        ),
        h('div', { class: 'rep-progress' },
      h('div', { class: 'progress', title: `${pct}% aprendido` }, h('span', { style: `width:${pct}%` })),
          h('span', { class: 'muted small' }, s.total ? `${s.learned} de ${s.total} aprendidas` : 'Sin jugadas todavía'),
        ),
      ),
    ),
    h('div', { class: 'chips' },
      s.due ? h('span', { class: 'chip due' }, `${s.due} para repasar`) : null,
      freshToday ? h('span', { class: 'chip' }, plural(freshToday, 'nueva', 'nuevas')) : null,
      s.gaps ? h('span', { class: 'chip warn', title: 'Posiciones donde te toca mover y no tienes respuesta' }, `${s.gaps} sin respuesta`) : null,
      !pending && s.total
        ? h('span', { class: 'chip ok' }, `Al día${Number.isFinite(nextDue) ? ` · ${describeDue(nextDue)}` : ''}`)
        : null,
    ),
    h('div', { class: 'rep-actions' },
      pending ? h('a', { class: 'btn primary', href: `#/entrenar/${rep.id}` }, icon('play'), `Entrenar (${pending})`) : null,
      s.total
        ? h('a', {
            class: `btn ${pending ? '' : 'primary'}`,
            href: `#/entrenar/${rep.id}?modo=libre`,
            title: 'Todas las líneas en orden aleatorio, sin tocar tus fechas de repaso',
          }, icon('target'), 'Practicar')
        : null,
      s.total ? null : h('a', { class: 'btn primary', href: `#/editar/${rep.id}` }, icon('pencil'), 'Añadir jugadas'),
    ),
  );
}

function repMenu(rep, s) {
  const weak = weakKeys(rep).length;
  return dropdown('⋯', [
    weak ? { label: `Repasar mis errores (${weak})`, href: `#/entrenar/${rep.id}?modo=errores` } : null,
    s.total ? { label: 'Contrarreloj', href: `#/contrarreloj/${rep.id}` } : null,
    { label: 'Editar jugadas', href: `#/editar/${rep.id}` },
    'sep',
    { label: 'Renombrar', onClick: () => renameRep(rep) },
    {
      label: 'Duplicar',
      title: 'Copia las jugadas y comentarios, sin el progreso de repaso',
      onClick: () => {
        const copy = newRepertoire(`${rep.name} (copia)`, rep.color);
        copy.positions = structuredClone(rep.positions);
        addRepertoire(copy);
        toast('Repertorio duplicado (sin progreso)', 'ok');
        rerender();
      },
    },
    { label: 'Exportar PGN', onClick: () => download(`${safeFilename(rep.name)}.pgn`, exportPgn(rep), 'application/x-chess-pgn') },
    'sep',
    {
      label: 'Volver a aprender desde cero',
      title: 'Todas las jugadas vuelven a ser nuevas y las aprendes otra vez con pistas',
      onClick: () => {
        if (!confirm(`¿Volver a aprender "${rep.name}" desde cero? Todas sus jugadas volverán a ser nuevas.`)) return;
        const snap = repSnapshot(rep);
        const count = resetProgress(rep);
        save(rep);
        toast(`Progreso reiniciado: ${count} jugadas vuelven a ser nuevas`, 'ok', undo(rep, snap));
        rerender();
      },
    },
    rep.source
      ? {
          label: 'Restaurar curso original',
          title: 'Quita tus cambios y recupera el curso tal cual está en la biblioteca (tu progreso se conserva)',
          onClick: () => {
            if (!confirm(`¿Restaurar "${rep.name}" como en la biblioteca? Se quitan las jugadas que añadiste tú y vuelven las que borraste.`)) return;
            const snap = repSnapshot(rep);
            restoreCourse(rep);
            toast('Curso restaurado como en la biblioteca', 'ok', undo(rep, snap));
            rerender();
          },
        }
      : null,
    'sep',
    {
      label: 'Borrar repertorio',
      danger: true,
      onClick: () => {
        if (!confirm(`¿Seguro que quieres borrar "${rep.name}"? No se puede deshacer.`)) return;
        removeRepertoire(rep.id);
        toast('Repertorio borrado');
        rerender();
      },
    },
  ], { label: `Más opciones de ${rep.name}` });
}

const undo = (rep, snap) => ({
  label: 'Deshacer',
  onClick: () => {
    restoreSnapshot(rep, snap);
    rerender();
  },
});

function renameRep(rep) {
  const name = prompt('Nuevo nombre del repertorio:', rep.name);
  if (!name?.trim()) return;
  rep.name = name.trim();
  save(rep);
  rerender();
}

// ---------- Nuevo repertorio ----------
function newRepDialog() {
  let color = 'white';
  const nameInput = h('input', { type: 'text', placeholder: 'Ej.: Siciliana Najdorf', maxlength: '60', required: true });
  const colorBtns = ['white', 'black'].map((c) =>
    h('button', {
      type: 'button',
      class: `seg ${c === color ? 'on' : ''}`,
      onClick: (e) => {
        color = c;
        colorBtns.forEach((b) => b.classList.toggle('on', b === e.currentTarget));
      },
    }, c === 'white' ? '♔ Blancas' : '♚ Negras'),
  );
  const close = openDialog('Nuevo repertorio',
    h('form', {
      onSubmit: (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        if (!name) return;
        const rep = newRepertoire(name, color);
        addRepertoire(rep);
        close();
        location.hash = `#/editar/${rep.id}`;
      },
    },
      h('label', { class: 'field' }, h('span', null, 'Nombre'), nameInput),
      h('div', { class: 'field' }, h('span', null, 'Juegas con'), h('div', { class: 'segmented' }, colorBtns)),
      h('p', { class: 'muted small' },
        'Lo crearás jugando en el tablero o importando un PGN. ¿Prefieres un curso ya hecho? ',
        h('a', { href: '#/biblioteca', onClick: () => close() }, 'Mira la biblioteca'), '.'),
      h('div', { class: 'dialog-actions' },
        h('button', { type: 'button', class: 'btn', onClick: () => close() }, 'Cancelar'),
        h('button', { type: 'submit', class: 'btn primary' }, 'Crear'),
      ),
    ),
  );
  nameInput.focus();
}

// ---------- Primera vez ----------
function welcome() {
  return h('div', { class: 'welcome' },
    h('h1', null, 'Aprende tus aperturas'),
    h('p', { class: 'muted' },
      'El rival juega las jugadas de tu repertorio y tú respondes. La repetición espaciada te pregunta cada jugada justo antes de que la olvides.'),
    h('a', { class: 'welcome-option primary', href: '#/biblioteca' },
      h('span', { class: 'welcome-icon' }, icon('book')),
      h('span', null,
        h('strong', null, 'Elige un curso de la biblioteca'),
        h('span', { class: 'muted small' },
          `${COURSES.length} cursos con la idea de cada jugada explicada: Italiana, Española, Londres, Caro-Kann, Najdorf, Nimzoindia…`),
      ),
      h('span', { class: 'welcome-arrow' }, icon('arrow')),
    ),
    h('button', { class: 'welcome-option', type: 'button', onClick: newRepDialog },
      h('span', { class: 'welcome-icon' }, icon('pencil')),
      h('span', null,
        h('strong', null, 'Crea tu propio repertorio'),
        h('span', { class: 'muted small' }, 'Juega las jugadas en el tablero o importa un PGN.'),
      ),
      h('span', { class: 'welcome-arrow' }, icon('arrow')),
    ),
    h('p', { class: 'muted small' }, '¿Tienes una copia de seguridad o usas otro dispositivo? Ve a ',
      h('a', { href: '#/ajustes' }, 'Ajustes'), '.'),
  );
}
