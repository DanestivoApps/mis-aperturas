// Mis partidas: compara tus partidas de Chess.com / Lichess / PGN con tus repertorios.
import { h, fill, toast } from '../dom.js';
import { getData, getSettings, updateSettings } from '../store.js';
import { parseGames, analyzeGame, summarize, moveNumber, OUTCOMES } from '../games.js';
import { fetchChesscomGames } from '../chesscom.js';
import { fetchLichessGames } from '../lichess.js';
import { san } from '../notation.js';
import { lastAnalysis } from '../partidas.js';
import { buildReport, gameActions } from '../insights.js';
import { actionList } from './actions.js';

const SOURCES = [
  { id: 'chesscom', label: 'Chess.com' },
  { id: 'lichess', label: 'Lichess' },
  { id: 'pgn', label: 'PGN' },
];

// Último análisis de esta sesión, para no perderlo al cambiar de pantalla.
let last = null;

export function renderGames(root) {
  const settings = getSettings();
  if (!last && lastAnalysis) last = { ...lastAnalysis, summary: summarize(lastAnalysis.analysis) };
  const reps = getData().repertoires;
  let source = settings.gamesSource;

  const form = h('div', { class: 'card games-form' });
  const status = h('p', { class: 'muted small', 'aria-live': 'polite' });
  const results = h('div', { class: 'games-results' });

  root.append(
    h('section', { class: 'page' },
      h('div', { class: 'page-head' },
        h('h1', null, 'Mis partidas'),
        h('p', { class: 'muted' },
          'Compara tus partidas con tus repertorios: dónde te desvías tú y qué te juegan los rivales que aún no tienes preparado.'),
      ),
      reps.length ? form : h('p', { class: 'notice warn' }, 'Primero crea un repertorio en la pantalla de inicio.'),
      results,
    ),
  );
  if (!reps.length) return;

  function renderForm() {
    const userKey = { chesscom: 'chesscomUser', lichess: 'lichessUser', pgn: 'pgnUser' }[source];
    const userInput = h('input', {
      type: 'text',
      placeholder: source === 'pgn' ? 'Tu nombre tal como aparece en las partidas' : 'Nombre de usuario',
      value: settings[userKey],
      autocomplete: 'off',
    });
    const countSelect = h('select', null,
      [20, 50, 100, 200].map((n) => h('option', { value: String(n), selected: settings.gamesCount === n }, `${n} partidas`)),
    );
    const pgnInput = h('textarea', { class: 'pgn-input', rows: '6', placeholder: '[White "..."] [Black "..."] 1. e4 e5 ...' });
    const fileInput = h('input', {
      type: 'file',
      accept: '.pgn,text/plain',
      onChange: async (e) => {
        const file = e.target.files?.[0];
        if (file) pgnInput.value = await file.text();
      },
    });
    const runBtn = h('button', { class: 'btn primary', type: 'submit' }, 'Analizar mis partidas');

    fill(form,
      h('div', { class: 'segmented' },
        SOURCES.map((s) =>
          h('button', {
            type: 'button',
            class: `seg ${s.id === source ? 'on' : ''}`,
            onClick: () => {
              source = s.id;
              updateSettings({ gamesSource: s.id });
              renderForm();
            },
          }, s.label),
        ),
      ),
      h('form', {
        class: 'games-fields',
        onSubmit: async (e) => {
          e.preventDefault();
          const username = userInput.value.trim();
          if (!username) return toast('Escribe tu nombre de usuario', 'error');
          const max = Number(countSelect.value);
          updateSettings({ [userKey]: username, gamesCount: max });
          runBtn.disabled = true;
          try {
            let pgn;
            if (source === 'pgn') {
              pgn = pgnInput.value;
            } else {
              status.textContent = `Descargando tus partidas de ${source === 'lichess' ? 'Lichess' : 'Chess.com'}…`;
              pgn = source === 'lichess'
                ? await fetchLichessGames(username, { max, token: settings.lichessToken })
                : await fetchChesscomGames(username, { max });
            }
            const games = parseGames(pgn);
            if (!games.length) throw new Error('No se encontraron partidas.');
            const analysis = games.map((g) => analyzeGame(g, getData().repertoires, username));
            last = { username, source, analysis, summary: summarize(analysis) };
            status.textContent = `${games.length} partidas leídas.`;
            renderResults();
          } catch (err) {
            status.textContent = err.message || 'No se pudieron leer las partidas.';
          } finally {
            runBtn.disabled = false;
          }
        },
      },
        source === 'pgn'
          ? [
              h('label', { class: 'field' }, h('span', null, 'Pega tus partidas en PGN'), pgnInput),
              h('label', { class: 'field' }, h('span', null, 'O elige un archivo .pgn'), fileInput),
            ]
          : null,
        h('div', { class: 'inline-field' },
          h('label', { class: 'field grow' }, h('span', null, source === 'pgn' ? 'Tu nombre en esas partidas' : 'Usuario'), userInput),
          source === 'pgn' ? null : h('label', { class: 'field' }, h('span', null, 'Cuántas'), countSelect),
        ),
        source === 'lichess' && !settings.lichessToken
          ? h('p', { class: 'muted small' },
              'Si Lichess no devuelve partidas, pon tu token en ', h('a', { href: '#/ajustes' }, 'Ajustes'), '.')
          : null,
        h('div', { class: 'actions' }, runBtn),
        status,
      ),
    );
  }

  function renderResults() {
    if (!last) return fill(results);
    const { summary, analysis } = last;
    const c = summary.counts;
    const followed = (c.fin ?? 0) + (c['fin-partida'] ?? 0);
    const mine = analysis.filter((r) => r.color && !['no-jugador', 'otra-variante', 'error'].includes(r.outcome)).length;
    const noRep = (c['sin-repertorio'] ?? 0) + (c['otra-apertura'] ?? 0);
    const actions = gameActions(buildReport(analysis, { username: last.username }), getData().repertoires);

    fill(results,
      h('div', { class: 'tiles' },
        tile('Tus partidas', mine, c['no-jugador'] ? `${c['no-jugador']} no eran tuyas (otro usuario)` : 'Las que has descargado'),
        tile('Fuera de tus repertorios', noRep, 'Aperturas que no tienes preparadas'),
        tile('Dentro de tu preparación', followed, 'Llegaste hasta donde tenías preparado'),
        tile('Te pillaron o te saliste', (c['te-desviaste'] ?? 0) + (c['rival-se-salio'] ?? 0) + (c.hueco ?? 0), 'Dentro de tu repertorio'),
      ),
      actions.length
        ? h('div', { class: 'card' },
            h('h3', null, 'Qué hacer ahora'),
            h('p', { class: 'muted small' }, 'Por orden de importancia: primero lo que más te sale en tus partidas.'),
            actionList(actions, { limit: 12, onChange: renderResults }),
            actions.length > 12 ? h('p', { class: 'muted small' }, `… y ${actions.length - 12} cosas más de menos importancia.`) : null,
          )
        : h('p', { class: 'notice ok' }, '¡Todo en orden! En estas partidas no hay nada que no tengas preparado.'),

      h('details', { class: 'card' },
        h('summary', null, h('h3', { class: 'inline' }, `Partida a partida (${analysis.length})`)),
        h('ul', { class: 'game-list' },
          analysis.map((r) => {
            const hd = r.game.headers;
            const link = hd.Link || (/^https?:/.test(hd.Site ?? '') ? hd.Site : null);
            return h('li', null,
              h('span', { class: `dot ${r.outcome}` }),
              h('div', null,
                h('div', null,
                  r.color ? `${r.color === 'white' ? '♔' : '♚'} vs ${r.opponent ?? '?'}` : `${hd.White ?? '?'} – ${hd.Black ?? '?'}`,
                  h('span', { class: 'muted small' }, ` · ${(hd.Date ?? hd.UTCDate ?? '').replace(/\./g, '/')} · ${hd.Result ?? ''}`),
                ),
                h('div', { class: 'muted small' }, describe(r)),
              ),
              h('div', { class: 'game-actions' },
                r.color && r.game.sans.length > 1 && !['otra-variante', 'error'].includes(r.outcome)
                  ? h('button', { class: 'btn', title: 'Stockfish valora cada jugada y te dice qué había que jugar', onClick: () => openReview(r, link) }, 'Revisar')
                  : null,
                link ? h('a', { class: 'btn ghost', href: link, target: '_blank', rel: 'noopener' }, 'Ver ↗') : null,
              ),
            );
          }),
        ),
      ),
    );
  }

  renderForm();
  renderResults();
}

// Partida que se está revisando (también en sessionStorage, para sobrevivir a recargar la página).
const REVIEW_KEY = 'mis-aperturas.revisar';
let reviewing = null;

function openReview(r, link) {
  const hd = r.game.headers;
  reviewing = {
    sans: r.game.sans,
    color: r.color,
    link,
    title: `${r.color === 'white' ? '♔' : '♚'} vs ${r.opponent ?? '?'} · ${(hd.Date ?? hd.UTCDate ?? '').replace(/\./g, '/')} · ${hd.Result ?? ''}`,
  };
  try {
    sessionStorage.setItem(REVIEW_KEY, JSON.stringify(reviewing));
  } catch {
    // Sin almacenamiento: vale con la memoria.
  }
  location.hash = '#/revisar';
}

export function reviewGame() {
  if (reviewing) return reviewing;
  try {
    return JSON.parse(sessionStorage.getItem(REVIEW_KEY)) ?? { sans: [], color: 'white' };
  } catch {
    return { sans: [], color: 'white' };
  }
}

function tile(label, value, sub) {
  return h('div', { class: 'tile' },
    h('span', { class: 'tile-label' }, label),
    h('span', { class: 'tile-value' }, value),
    h('span', { class: 'muted small' }, sub),
  );
}

function describe(r) {
  const base = OUTCOMES[r.outcome];
  if (r.outcome === 'te-desviaste') return `${base}: ${moveNumber(r.ply)} ${san(r.played)} (tu repertorio: ${r.expected.map(san).join(' / ')})`;
  if (r.outcome === 'otra-apertura') return `${base}: 1.${san(r.played)}`;
  if (r.outcome === 'rival-se-salio') return `${base}: ${moveNumber(r.ply)} ${san(r.played)}`;
  if (r.outcome === 'fin' || r.outcome === 'fin-partida') return `${base} (${r.ply} jugadas)`;
  if (r.outcome === 'hueco') return `${base} (tras ${moveNumber(r.ply - 1)} ${san(r.game.sans[r.ply - 1])})`;
  return base;
}
