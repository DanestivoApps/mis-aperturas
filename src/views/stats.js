// Estadísticas: racha, precisión, respuestas por día, previsión y puntos débiles.
import { h } from '../dom.js';
import { getData, dayKey, streak } from '../store.js';
import { repStats, trainableKeys, weakKeys, pathTo, pathToText } from '../repertoire.js';
import { columnChart } from '../chart.js';
import { san } from '../notation.js';

const DAY = 24 * 60 * 60 * 1000;
const fmtDay = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' });
const fmtWeekday = new Intl.DateTimeFormat('es', { weekday: 'short', day: 'numeric' });

export function renderStats(root) {
  const { repertoires: reps, history } = getData();
  const cleanups = [];

  // Últimos 30 días de respuestas.
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const entry = history[dayKey(date)] ?? { ok: 0, bad: 0 };
    days.push({ date, ...entry, total: entry.ok + entry.bad });
  }
  const sum = days.reduce((acc, d) => ({ ok: acc.ok + d.ok, bad: acc.bad + d.bad }), { ok: 0, bad: 0 });
  const answered = sum.ok + sum.bad;
  const today = days[days.length - 1];

  // Repasos previstos en los próximos 14 días (los atrasados cuentan para hoy).
  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);
  const forecast = Array.from({ length: 14 }, (_, i) => ({ date: new Date(startToday.getTime() + i * DAY), value: 0 }));
  let totalPositions = 0;
  let learned = 0;
  for (const rep of reps) {
    const s = repStats(rep);
    totalPositions += s.total;
    learned += s.learned;
    for (const card of Object.values(rep.cards)) {
      const idx = Math.max(0, Math.floor((card.due - startToday.getTime()) / DAY));
      if (idx < forecast.length) forecast[idx].value++;
    }
  }

  const activityEl = h('div');
  const forecastEl = h('div');

  root.append(
    h('section', { class: 'page' },
      h('div', { class: 'page-head' }, h('h1', null, 'Estadísticas')),
      h('div', { class: 'tiles' },
        tile('Racha', `${streak()} ${streak() === 1 ? 'día' : 'días'}`, 'Días seguidos entrenando'),
        tile('Respuestas hoy', today.total, today.total ? `${pct(today.ok, today.total)}% de aciertos` : 'Aún no has entrenado hoy'),
        tile('Precisión (30 días)', answered ? `${pct(sum.ok, answered)}%` : '—', `${answered} respuestas`),
        tile('Jugadas aprendidas', `${learned} / ${totalPositions}`, 'Posiciones tuyas al día'),
      ),

      h('div', { class: 'card chart-card' },
        h('h3', null, 'Respuestas por día · últimos 30 días'),
        answered ? activityEl : h('p', { class: 'muted' }, 'Aún no hay respuestas. Entrena un poco y aquí verás tu progreso.'),
        answered ? dataTable(['Día', 'Aciertos', 'Fallos'], days.filter((d) => d.total).map((d) => [fmtDay.format(d.date), d.ok, d.bad])) : null,
      ),

      h('div', { class: 'card chart-card' },
        h('h3', null, 'Repasos previstos · próximos 14 días'),
        forecast.some((d) => d.value) ? forecastEl : h('p', { class: 'muted' }, 'Cuando aprendas jugadas, aquí verás cuántas te tocará repasar cada día.'),
        forecast.some((d) => d.value) ? dataTable(['Día', 'Repasos'], forecast.map((d, i) => [i ? fmtWeekday.format(d.date) : 'Hoy', d.value])) : null,
      ),

      reps.length ? repTable(reps) : null,
      weakList(reps),
    ),
  );

  if (answered) {
    cleanups.push(columnChart(activityEl, days.map((d, i) => ({
      label: fmtDay.format(d.date),
      value: d.total,
      tip: d.total ? `${d.ok} aciertos · ${d.bad} fallos (${pct(d.ok, d.total)}%)` : 'Sin entrenar',
      axisLabel: i % 7 === 2 || i === 29 ? (i === 29 ? 'hoy' : fmtDay.format(d.date)) : '',
    }))));
  }
  if (forecast.some((d) => d.value)) {
    cleanups.push(columnChart(forecastEl, forecast.map((d, i) => ({
      label: i ? fmtWeekday.format(d.date) : 'Hoy',
      value: d.value,
      tip: `${d.value} ${d.value === 1 ? 'repaso' : 'repasos'}`,
      axisLabel: i === 0 ? 'hoy' : i % 2 === 0 ? fmtWeekday.format(d.date) : '',
    }))));
  }

  return () => cleanups.forEach((fn) => fn());
}

function pct(part, total) {
  return total ? Math.round((part / total) * 100) : 0;
}

function tile(label, value, sub) {
  return h('div', { class: 'tile' },
    h('span', { class: 'tile-label' }, label),
    h('span', { class: 'tile-value' }, value),
    h('span', { class: 'muted small' }, sub),
  );
}

function dataTable(head, rows) {
  return h('details', { class: 'table-view' },
    h('summary', null, 'Ver como tabla'),
    h('table', { class: 'data-table' },
      h('thead', null, h('tr', null, head.map((c) => h('th', null, c)))),
      h('tbody', null, rows.map((r) => h('tr', null, r.map((c) => h('td', null, c))))),
    ),
  );
}

function repTable(reps) {
  return h('div', { class: 'card' },
    h('h3', null, 'Por repertorio'),
    h('div', { class: 'table-scroll' },
      h('table', { class: 'data-table' },
        h('thead', null, h('tr', null,
          ['Repertorio', 'Posiciones', 'Nuevas', 'Aprendiendo', 'Consolidadas', 'Para hoy'].map((c) => h('th', null, c)))),
        h('tbody', null, reps.map((rep) => {
          const s = repStats(rep);
          let learning = 0;
          let mature = 0;
          for (const key of trainableKeys(rep)) {
            const card = rep.cards[key];
            if (!card) continue;
            if (card.interval >= 21) mature++;
            else learning++;
          }
          return h('tr', null,
            h('td', null, h('a', { href: `#/editar/${rep.id}` }, rep.name)),
            h('td', null, s.total), h('td', null, s.fresh), h('td', null, learning),
            h('td', null, mature), h('td', null, s.due),
          );
        })),
      ),
    ),
    h('p', { class: 'muted small' }, 'Consolidadas: jugadas que recuerdas con un intervalo de 3 semanas o más.'),
  );
}

function weakList(reps) {
  const items = [];
  for (const rep of reps) {
    for (const key of weakKeys(rep, 10)) {
      const path = pathTo(rep, key);
      if (path) items.push({ rep, key, path, card: rep.cards[key] });
    }
  }
  items.sort((a, b) => b.card.lapses - a.card.lapses);
  return h('div', { class: 'card' },
    h('h3', null, 'Posiciones que más fallas'),
    items.length
      ? h('ul', { class: 'weak-list' },
          items.slice(0, 12).map(({ rep, key, path, card }) => {
            const answer = rep.positions[key]?.moves[0];
            return h('li', null,
              h('div', null,
                h('span', { class: 'weak-line' }, path.length ? pathToText(rep, path, san) : 'Posición inicial'),
                h('span', { class: 'muted small' }, ` · ${rep.name} · ${card.lapses} ${card.lapses === 1 ? 'fallo' : 'fallos'}`),
              ),
              h('div', { class: 'weak-actions' },
                answer ? h('details', { class: 'reveal' }, h('summary', null, 'Ver respuesta'), h('strong', null, san(answer.san))) : null,
                h('a', { class: 'btn', href: `#/editar/${rep.id}?ruta=${path.map((s) => s.move.uci).join(',')}` }, 'Ver en el editor'),
              ),
            );
          }),
        )
      : h('p', { class: 'muted' }, 'No tienes posiciones problemáticas. Las que falles aparecerán aquí hasta que las consolides.'),
    items.length
      ? h('div', { class: 'actions' },
          [...new Set(items.map((i) => i.rep))].map((rep) =>
            h('a', { class: 'btn primary', href: `#/entrenar/${rep.id}?modo=errores` }, `Repasar errores de ${rep.name}`)),
        )
      : null,
  );
}
