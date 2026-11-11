// Inicio: lo que toca hoy, tus repertorios y acceso a la biblioteca.
import { h, fill, toast, download, safeFilename, openDialog, dropdown } from '../dom.js';
import { getData, addRepertoire, removeRepertoire, save, streak, todayCount, getRepertoire, updateSettings } from '../store.js';
import { newRepertoire, exportPgn, repStats, weakKeys, resetProgress, allLines } from '../repertoire.js';
import { newCard, gradeWrong } from '../srs.js';
import { san } from '../notation.js';
import { moveNumber } from '../games.js';
import { coverageGaps, recommendations, trapExercises } from '../insights.js';
import { loadReport, refreshReport } from '../partidas.js';
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
  const insights = h('div', { class: 'insights' });
  page.append(
    today(reps),
    updateBanner() ?? '',
    insights,
    h('div', { class: 'section-head' },
      h('h2', null, 'Tus repertorios'),
      h('div', { class: 'section-actions' },
        h('button', { class: 'btn', onClick: addDialog }, icon('plus'), 'Añadir'),
      ),
    ),
    h('div', { class: 'rep-grid' }, reps.map(repCard)),
  );
  fill(insights, gamesCard(reps, loadReport()), gapsNote(reps));
  // Las partidas se analizan solas en segundo plano; al terminar se redibuja este bloque.
  const shown = loadReport()?.at;
  refreshReport()
    .then((report) => {
      if (report && report.at !== shown && insights.isConnected) fill(insights, gamesCard(reps, report), gapsNote(reps));
    })
    .catch((err) => {
      if (insights.isConnected && getData().settings.chesscomUser) {
        insights.prepend(h('p', { class: 'muted small' }, `No se pudieron leer tus partidas: ${err.message}`));
      }
    });
}

// ---------- Tus partidas ----------
const lineOf = (item) => `tras ${plural(item.ucis.length, 'jugada', 'jugadas')} de tu repertorio`;
const numbered = (ply, move) => `${moveNumber(ply)}${san(move)}`;

function gamesCard(reps, report) {
  const user = getData().settings.chesscomUser;
  if (!user) {
    const input = h('input', { type: 'text', placeholder: 'Tu usuario de Chess.com', autocomplete: 'off', 'aria-label': 'Usuario de Chess.com' });
    return h('form', {
      class: 'card insight-card',
      onSubmit: (e) => {
        e.preventDefault();
        const name = input.value.trim();
        if (!name) return;
        updateSettings({ chesscomUser: name, gamesSource: 'chesscom' });
        toast('Analizando tus partidas…', 'info');
        rerender();
      },
    },
      h('h3', null, icon('chart'), ' Aprende de tus partidas'),
      h('p', { class: 'muted small' }, 'Con tu usuario de Chess.com, la app mira tus últimas partidas y te dice dónde te sales del repertorio, qué te juegan sin tenerlo preparado y qué repasar primero.'),
      h('div', { class: 'inline-field' }, input, h('button', { class: 'btn primary', type: 'submit' }, 'Conectar')),
    );
  }
  if (!report) {
    return h('div', { class: 'card insight-card' },
      h('h3', null, icon('chart'), ` Tus partidas de ${user}`),
      h('p', { class: 'muted small' }, 'Analizando tus últimas partidas de Chess.com…'));
  }
  const dev = report.deviations.slice(0, 3);
  // Las primeras jugadas sin preparar ya salen en «Cursos que te convienen».
  const surprises = report.surprises.filter((x) => x.ucis.length > 1).slice(0, 2);
  const recs = recommendations(report, reps);
  const outOfBook = report.counts['te-desviaste'] ?? 0;
  return h('div', { class: 'card insight-card' },
    h('div', { class: 'section-head' },
      h('h3', null, icon('chart'), ` Tus últimas ${report.analyzed} partidas`),
      h('a', { class: 'small', href: '#/partidas' }, 'Ver todo'),
    ),
    h('p', { class: 'muted small' },
      `De media sigues tu repertorio ${report.averageBook.toFixed(1)} jugadas. `,
      outOfBook ? `Te saliste de él en ${plural(outOfBook, 'partida', 'partidas')}. ` : 'No te has salido de él en ninguna. ',
      'Al repasar, lo que te sale en tus partidas va primero.'),
    dev.length
      ? h('div', null,
          h('p', { class: 'insight-title' }, 'Donde te equivocas'),
          h('ul', { class: 'insight-list' }, dev.map((d) => h('li', null,
            h('span', null, 'Jugaste ', h('strong', null, numbered(d.ucis.length, d.played)),
              ' en vez de ', h('strong', null, d.expected.map((m) => numbered(d.ucis.length, m)).join(' / ')),
              h('span', { class: 'muted small' }, ` · ${plural(d.count, 'vez', 'veces')}`)),
            h('button', { class: 'btn', onClick: (e) => markForReview(d, e.currentTarget) }, 'Repasar'),
          ))))
      : null,
    surprises.length
      ? h('div', null,
          h('p', { class: 'insight-title' }, 'Lo que te juegan y no tienes preparado'),
          h('ul', { class: 'insight-list' }, surprises.map((s) => h('li', null,
            h('span', null, h('strong', null, numbered(s.ucis.length, s.played)), ` ${lineOf(s)}`,
              h('span', { class: 'muted small' }, ` · ${plural(s.count, 'vez', 'veces')}`)),
            getRepertoire(s.repId) ? h('a', { class: 'btn', href: `#/editar/${s.repId}?ruta=${s.ucis.join(',')}` }, 'Preparar') : null,
          ))))
      : null,
    recs.length
      ? h('div', null,
          h('p', { class: 'insight-title' }, 'Cursos que te convienen'),
          h('ul', { class: 'insight-list' }, recs.map((r) => h('li', null,
            h('span', null, r.color === 'white' ? 'Con blancas te juegan ' : 'Con negras te juegan ',
              h('strong', null, numbered(r.sans.length - 1, r.sans[r.sans.length - 1])),
              ` en ${r.count} de ${r.total} partidas y no lo tienes preparado.`,
              r.courses.length ? [' ', h('span', { class: 'muted small' }, 'Prueba: ')] : null,
              r.courses.map((c2, i) => [i ? ', ' : '', h('a', { href: `#/biblioteca?q=${encodeURIComponent(c2.name)}` }, c2.name)])),
          ))))
      : null,
  );
}

function markForReview(d, button) {
  const rep = getRepertoire(d.repId);
  if (!rep) return;
  gradeWrong((rep.cards[d.key] ??= newCard()));
  save();
  button.disabled = true;
  button.textContent = 'Marcada ✓';
  toast('Saldrá en tu próximo repaso', 'ok');
}

// Huecos del repertorio: salidas habituales para las que no tienes nada.
function gapsNote(reps) {
  const gaps = coverageGaps(reps);
  if (!gaps.length) return null;
  return h('div', { class: 'notice warn gaps-note' },
    h('span', null, icon('alert'), ' Te falta preparar: ', h('strong', null, gaps.slice(0, 4).map((g) => g.label).join(', ')),
      gaps.length > 4 ? ` y ${gaps.length - 4} más` : '', '.'),
    h('a', { class: 'btn', href: '#/plan' }, 'Ver mi plan'),
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
          h('span', { class: 'muted small' }, s.total ? `${s.learned}/${s.total} aprendidas` : 'Sin jugadas todavía'),
        ),
        repStatus(s, pending, freshToday, nextDue),
      ),
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

// Qué toca en este repertorio, en una línea: lo pendiente, o cuándo es el próximo repaso.
function repStatus(s, pending, freshToday, nextDue) {
  const parts = [];
  if (s.due) parts.push(h('span', { class: 'due' }, `${s.due} para repasar`));
  if (freshToday) parts.push(plural(freshToday, 'nueva', 'nuevas'));
  if (!pending && s.total) {
    parts.push(h('span', { class: 'ok' }, `✓ Al día${Number.isFinite(nextDue) ? ` · repaso ${describeDue(nextDue)}` : ''}`));
  }
  if (s.gaps) {
    parts.push(h('span', { class: 'warn', title: 'Posiciones donde te toca mover y no tienes respuesta' }, `${s.gaps} sin respuesta`));
  }
  if (!parts.length) return null;
  return h('p', { class: 'rep-status small' }, parts.flatMap((p, i) => (i ? [' · ', p] : [p])));
}

function repMenu(rep, s) {
  const weak = weakKeys(rep).length;
  return dropdown('⋯', [
    weak ? { label: `Repasar mis errores (${weak})`, href: `#/entrenar/${rep.id}?modo=errores` } : null,
    s.total ? { label: 'Contrarreloj', href: `#/contrarreloj/${rep.id}` } : null,
    trapCount(rep) ? { label: `Trampas (${trapCount(rep)})`, href: `#/entrenar/${rep.id}?modo=trampas`, title: 'El rival se equivoca: encuentra cómo castigarlo' } : null,
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

// ---------- Añadir ----------
function addDialog() {
  const close = openDialog('Añadir un repertorio',
    h('div', { class: 'add-options' },
      h('a', { class: 'welcome-option primary', href: '#/biblioteca', onClick: () => close() },
        h('span', { class: 'welcome-icon' }, icon('book')),
        h('span', null,
          h('strong', null, 'Un curso de la biblioteca'),
          h('span', { class: 'muted small' }, `${COURSES.length} aperturas con la idea de cada jugada explicada.`)),
        h('span', { class: 'welcome-arrow' }, icon('arrow')),
      ),
      h('button', { class: 'welcome-option', type: 'button', onClick: () => { close(); newRepDialog(); } },
        h('span', { class: 'welcome-icon' }, icon('pencil')),
        h('span', null,
          h('strong', null, 'Tu propio repertorio'),
          h('span', { class: 'muted small' }, 'Juega las jugadas en el tablero o importa un PGN.')),
        h('span', { class: 'welcome-arrow' }, icon('arrow')),
      ),
    ),
  );
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

const trapCache = new WeakMap();
function trapCount(rep) {
  if (!trapCache.has(rep)) trapCache.set(rep, trapExercises(rep, allLines(rep)).length);
  return trapCache.get(rep);
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
    h('a', { class: 'welcome-option', href: '#/plan' },
      h('span', { class: 'welcome-icon' }, icon('target')),
      h('span', null,
        h('strong', null, 'Hazme un plan de repertorio'),
        h('span', { class: 'muted small' }, 'Dime cómo te gusta jugar y te propongo una apertura con blancas y una respuesta a cada salida con negras.'),
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
