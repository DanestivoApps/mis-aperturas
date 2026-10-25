// Mis partidas: compara tus partidas de Chess.com / Lichess / PGN con tus repertorios.
import { Chess } from 'chess.js';
import { h, fill, toast } from '../dom.js';
import { getData, getSettings, updateSettings, getRepertoire, save } from '../store.js';
import { addMove, pathFromUcis, pathTo } from '../repertoire.js';
import { parseGames, analyzeGame, summarize, moveNumber, OUTCOMES } from '../games.js';
import { fetchChesscomGames } from '../chesscom.js';
import { fetchLichessGames } from '../lichess.js';
import { newCard, gradeWrong } from '../srs.js';
import { moveFromUci } from '../chess-utils.js';
import { san } from '../notation.js';

const SOURCES = [
  { id: 'chesscom', label: 'Chess.com' },
  { id: 'lichess', label: 'Lichess' },
  { id: 'pgn', label: 'PGN' },
];

// Último análisis de esta sesión, para no perderlo al cambiar de pantalla.
let last = null;

export function renderGames(root) {
  const settings = getSettings();
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
    const skipped = (c['no-jugador'] ?? 0) + (c['otra-variante'] ?? 0) + (c['sin-repertorio'] ?? 0) + (c.error ?? 0);

    fill(results,
      h('div', { class: 'tiles' },
        tile('Partidas comparadas', summary.analyzed, `Media: ${summary.averageBook.toFixed(1)} jugadas dentro de tu repertorio`),
        tile('Seguiste tu repertorio', followed, 'Hasta el final de tu preparación'),
        tile('Te desviaste', c['te-desviaste'] ?? 0, 'Jugaste algo distinto a lo preparado'),
        tile('El rival te sorprendió', (c['rival-se-salio'] ?? 0) + (c.hueco ?? 0), 'Jugadas o posiciones sin preparar'),
      ),
      skipped
        ? h('p', { class: 'muted small' },
            `${skipped} partidas no se compararon: ${[
              c['no-jugador'] && `${c['no-jugador']} con otro nombre de jugador`,
              c['sin-repertorio'] && `${c['sin-repertorio']} con un color sin repertorio`,
              c['otra-variante'] && `${c['otra-variante']} desde otra posición o variante`,
              c.error && `${c.error} ilegibles`,
            ].filter(Boolean).join(', ')}.`)
        : null,

      section('Tus desviaciones', 'Posiciones donde no jugaste lo de tu repertorio. Márcalas para repasarlas.',
        summary.deviations, (d) => [
          h('div', null,
            lineText(d), ' ',
            h('span', null, `jugaste `, h('strong', null, san(d.played)), times(d.count), ' · tu repertorio: ', h('strong', null, d.expected.map(san).join(' / '))),
          ),
          h('div', { class: 'weak-actions' },
            h('button', { class: 'btn', onClick: (e) => markForReview(d, e.currentTarget) }, 'Repasar esta posición'),
            editorLink(d.repId, pathUcis(d)),
          ),
        ]),

      section('Jugadas del rival que no tienes preparadas', 'Lo que te juegan y aún no está en tu repertorio. Prepara una respuesta.',
        summary.surprises, (s) => [
          h('div', null, lineText(s), ' ', h('strong', null, `${moveNumber(s.ply)} ${san(s.played)}`), times(s.count)),
          h('div', { class: 'weak-actions' },
            h('button', { class: 'btn primary', onClick: () => prepareReply(s) }, 'Preparar respuesta'),
          ),
        ]),

      section('Posiciones sin respuesta preparada', 'El rival jugó algo de tu repertorio, pero ahí no tienes jugada.',
        summary.gaps, (g) => [
          h('div', null, lineText(g), times(g.count)),
          h('div', { class: 'weak-actions' }, editorLink(g.repId, pathUcis(g), 'Preparar respuesta')),
        ]),

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
              link ? h('a', { class: 'btn ghost', href: link, target: '_blank', rel: 'noopener' }, 'Ver ↗') : null,
            );
          }),
        ),
      ),
    );
  }

  renderForm();
  renderResults();
}

function tile(label, value, sub) {
  return h('div', { class: 'tile' },
    h('span', { class: 'tile-label' }, label),
    h('span', { class: 'tile-value' }, value),
    h('span', { class: 'muted small' }, sub),
  );
}

function times(count) {
  return count > 1 ? [' ', h('span', { class: 'chip' }, `${count} veces`)] : null;
}

function section(title, help, items, row) {
  if (!items.length) return null;
  return h('div', { class: 'card' },
    h('h3', null, title),
    h('p', { class: 'muted small' }, help),
    h('ul', { class: 'weak-list' }, items.slice(0, 15).map((item) => h('li', null, row(item)))),
    items.length > 15 ? h('p', { class: 'muted small' }, `… y ${items.length - 15} más.`) : null,
  );
}

// Jugadas de la partida hasta la posición, con números: "1. e4 e5 2. Nf3 Nc6".
function lineText(r) {
  const sans = r.game.sans.slice(0, r.ply);
  const text = sans.map((move, i) => (i % 2 === 0 ? `${moveNumber(i)} ${san(move)}` : san(move))).join(' ');
  return h('span', { class: 'weak-line' }, text || 'Posición inicial');
}

function describe(r) {
  const base = OUTCOMES[r.outcome];
  if (r.outcome === 'te-desviaste') return `${base}: ${moveNumber(r.ply)} ${san(r.played)} (tu repertorio: ${r.expected.map(san).join(' / ')})`;
  if (r.outcome === 'rival-se-salio') return `${base}: ${moveNumber(r.ply)} ${san(r.played)}`;
  if (r.outcome === 'fin' || r.outcome === 'fin-partida') return `${base} (${r.ply} jugadas)`;
  if (r.outcome === 'hueco') return `${base} (tras ${moveNumber(r.ply - 1)} ${san(r.game.sans[r.ply - 1])})`;
  return base;
}

// Camino (en UCI) hasta la posición dentro del repertorio que la contiene.
function pathUcis(r) {
  const rep = getRepertoire(r.repId);
  if (!rep) return [];
  const path = pathFromUcis(rep, r.ucis) ?? pathTo(rep, r.key) ?? [];
  return path.map((s) => s.move.uci);
}

function editorLink(repId, ucis, label = 'Ver en el editor') {
  if (!getRepertoire(repId)) return null;
  return h('a', { class: 'btn', href: `#/editar/${repId}?ruta=${ucis.join(',')}` }, label);
}

function markForReview(r, button) {
  const rep = getRepertoire(r.repId);
  if (!rep) return;
  const card = (rep.cards[r.key] ??= newCard());
  gradeWrong(card);
  save();
  button.disabled = true;
  button.textContent = 'Marcada ✓';
  toast('Saldrá en tu próximo repaso', 'ok');
}

function prepareReply(r) {
  const rep = getRepertoire(r.repId);
  if (!rep?.positions[r.key]) return;
  const move = moveFromUci(new Chess(rep.positions[r.key].fen), r.playedUci);
  if (!move) return;
  addMove(rep, move, { own: Boolean(rep.source) });
  save(rep);
  location.hash = `#/editar/${rep.id}?ruta=${[...pathUcis(r), r.playedUci].join(',')}`;
}
