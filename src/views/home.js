// Inicio: lista de repertorios, crear nuevos, copias de seguridad y acceso a la biblioteca.
import { h, toast, download, safeFilename, openDialog } from '../dom.js';
import { getData, addRepertoire, removeRepertoire, save, exportBackup, importBackup, streak } from '../store.js';
import { newRepertoire, importPgn, exportPgn, repStats, weakKeys } from '../repertoire.js';
import { describeDue } from '../srs.js';
import { LEVELS } from '../library.js';

export function renderHome(root) {
  const data = getData();
  const reps = data.repertoires;

  const totals = reps.reduce(
    (acc, rep) => {
      const s = repStats(rep);
      acc.due += s.due;
      acc.fresh += s.fresh;
      return acc;
    },
    { due: 0, fresh: 0 },
  );

  const summary = !reps.length
    ? 'Añade un curso de la biblioteca o crea tu propio repertorio desde cero.'
    : totals.due
      ? `Hoy tienes ${totals.due} ${totals.due === 1 ? 'jugada' : 'jugadas'} para repasar.`
      : totals.fresh
        ? `Estás al día. Tienes ${totals.fresh} jugadas nuevas por aprender.`
        : 'Estás al día con tus repasos. ¡Buen trabajo!';

  const days = streak();
  const firstPending = reps.find((rep) => pendingCount(rep) > 0);
  const allPending = reps.reduce((n, rep) => n + pendingCount(rep), 0);

  root.append(
    h('section', { class: 'page' },
      h('div', { class: 'page-head with-action' },
        h('div', null,
          h('h1', null, 'Tus repertorios'),
          h('p', { class: 'muted' }, summary,
            days ? h('span', { class: 'streak', title: 'Días seguidos entrenando' }, ` · 🔥 ${days} ${days === 1 ? 'día' : 'días'} seguidos`) : null),
        ),
        firstPending && reps.length > 1
          ? h('a', { class: 'btn primary big', href: `#/entrenar/${firstPending.id}?todo=1` }, `Repasar todo (${allPending})`)
          : null,
      ),
      reps.length
        ? null
        : h('a', { class: 'library-cta', href: '#/biblioteca' },
            h('span', { class: 'library-cta-icon' }, '📚'),
            h('span', null,
              h('strong', null, 'Empieza con la biblioteca de aperturas'),
              h('span', { class: 'muted' }, '11 cursos con explicaciones y variantes del rival: Italiana, Londres, Caro-Kann, Siciliana, Eslava, India de Rey…'),
            ),
            h('span', { class: 'btn primary' }, 'Ver cursos →'),
          ),
      h('div', { class: 'rep-grid' },
        reps.map(repCard),
        newRepForm(),
      ),
      h('div', { class: 'tools' },
        h('a', { class: 'btn ghost', href: '#/biblioteca' }, '📚 Biblioteca de aperturas'),
        h('button', { class: 'btn ghost', onClick: backup, disabled: !reps.length }, 'Descargar copia de seguridad'),
        h('label', { class: 'btn ghost' },
          'Restaurar copia',
          h('input', { type: 'file', accept: '.json,application/json', hidden: true, onChange: restore }),
        ),
      ),
      h('p', { class: 'muted small' },
        'Todo se guarda en este navegador. Descarga una copia de seguridad de vez en cuando para no perder tus repertorios.',
      ),
    ),
  );
}

function rerender() {
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

function pendingCount(rep) {
  const s = repStats(rep);
  return s.due + Math.min(s.fresh, getData().settings.newPerSession);
}

function repCard(rep) {
  const s = repStats(rep);
  const pending = pendingCount(rep);
  const weak = weakKeys(rep).length;
  const pct = s.total ? Math.round((s.learned / s.total) * 100) : 0;
  const nextDue = Object.values(rep.cards).reduce((min, c) => Math.min(min, c.due), Infinity);
  const isWhite = rep.color === 'white';

  return h('article', { class: 'rep-card' },
    h('div', { class: 'rep-card-head' },
      h('span', { class: `piece-badge ${rep.color}`, title: isWhite ? 'Blancas' : 'Negras' }, isWhite ? '♔' : '♚'),
      h('div', { class: 'rep-title' },
        h('h2', null, rep.name),
        h('span', { class: 'muted small' }, `${isWhite ? 'Blancas' : 'Negras'} · ${s.total} posiciones${rep.source ? ` · curso ${LEVELS[rep.source.level]?.name.toLowerCase() ?? ''}` : ''}`),
      ),
      menu(rep),
    ),
    h('div', { class: 'chips' },
      h('span', { class: `chip ${s.due ? 'due' : ''}` }, `${s.due} para repasar`),
      h('span', { class: 'chip' }, `${s.fresh} nuevas`),
      h('span', { class: 'chip' }, `${s.learned} aprendidas`),
      s.gaps ? h('span', { class: 'chip warn', title: 'Posiciones donde te toca mover y no tienes respuesta' }, `${s.gaps} sin respuesta`) : null,
    ),
    h('div', { class: 'progress', title: `${pct}% aprendido` }, h('span', { style: `width:${pct}%` })),
    h('div', { class: 'rep-actions' },
      pending
        ? h('a', { class: 'btn primary', href: `#/entrenar/${rep.id}` }, `Entrenar (${pending})`)
        : h('span', { class: 'btn done' },
            s.total ? `Al día ✓${Number.isFinite(nextDue) ? ' · ' + describeDue(nextDue) : ''}` : 'Vacío'),
      h('a', { class: 'btn', href: `#/editar/${rep.id}` }, 'Editar'),
      s.total ? h('a', { class: 'btn', href: `#/entrenar/${rep.id}?modo=libre` }, 'Práctica libre') : null,
      weak ? h('a', { class: 'btn', href: `#/entrenar/${rep.id}?modo=errores`, title: 'Posiciones que sueles fallar' }, `Errores (${weak})`) : null,
    ),
  );
}

function menu(rep) {
  const details = h('details', { class: 'menu' },
    h('summary', { class: 'icon-btn', 'aria-label': 'Más opciones' }, '⋯'),
    h('div', { class: 'menu-list' },
      h('button', {
        onClick: () => {
          const name = prompt('Nuevo nombre del repertorio:', rep.name);
          if (name?.trim()) {
            rep.name = name.trim();
            save();
            rerender();
          }
        },
      }, 'Renombrar'),
      h('button', { onClick: () => download(`${safeFilename(rep.name)}.pgn`, exportPgn(rep), 'application/x-chess-pgn') }, 'Exportar PGN'),
      h('button', {
        title: 'Copia las jugadas y comentarios, sin el progreso de repaso',
        onClick: () => {
          const copy = newRepertoire(`${rep.name} (copia)`, rep.color);
          copy.positions = structuredClone(rep.positions);
          addRepertoire(copy);
          toast('Repertorio duplicado (sin progreso)', 'ok');
          rerender();
        },
      }, 'Duplicar'),
      h('button', {
        onClick: () => {
          if (!confirm(`¿Seguro que quieres borrar "${rep.name}"? No se puede deshacer.`)) return;
          removeRepertoire(rep.id);
          toast('Repertorio borrado');
          rerender();
        },
      }, 'Borrar repertorio'),
    ),
  );
  return details;
}

function newRepForm() {
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

  return h('form', {
    class: 'rep-card new-rep',
    onSubmit: (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      if (!name) return;
      const rep = newRepertoire(name, color);
      addRepertoire(rep);
      location.hash = `#/editar/${rep.id}`;
    },
  },
    h('h2', null, 'Nuevo repertorio'),
    h('label', { class: 'field' }, h('span', null, 'Nombre'), nameInput),
    h('div', { class: 'field' }, h('span', null, 'Juegas con'), h('div', { class: 'segmented' }, colorBtns)),
    h('button', { class: 'btn primary', type: 'submit' }, 'Crear y empezar a añadir jugadas'),
  );
}


function backup() {
  const date = new Date().toISOString().slice(0, 10);
  download(`mis-aperturas-${date}.json`, exportBackup(), 'application/json');
}

async function restore(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  const close = openDialog('Restaurar copia de seguridad',
    h('p', null, 'Esto reemplazará todos tus repertorios actuales por los de la copia. ¿Continuar?'),
    h('div', { class: 'dialog-actions' },
      h('button', { class: 'btn', onClick: () => close() }, 'Cancelar'),
      h('button', {
        class: 'btn primary',
        onClick: () => {
          try {
            importBackup(text);
            toast('Copia restaurada', 'ok');
            close();
            rerender();
          } catch (err) {
            toast(err.message || 'No se pudo leer el archivo', 'error');
          }
        },
      }, 'Reemplazar'),
    ),
  );
  e.target.value = '';
}
