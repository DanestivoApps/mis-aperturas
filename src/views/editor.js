// Editor: juega en el tablero para añadir jugadas, navega el árbol, comenta e importa PGN.
import { Chess } from 'chess.js';
import { h, fill, toast, download, safeFilename, openDialog } from '../dom.js';
import { getRepertoire, getSettings, updateSettings, save } from '../store.js';
import {
  ROOT_KEY, addMove, deleteMove, importPgn, exportPgn, isUserTurn, gapKeys, pathTo,
  stepLabel, pathToText, fenAfterPath, allLines, repStats, parentCount, pathFromUcis, resetProgress,
} from '../repertoire.js';
import { createBoard, arrow } from '../board.js';
import { colorToMove, destsFor, squaresOf, tryMove, moveFromUci, sanOf } from '../chess-utils.js';
import { loadOpenings, openingForPath } from '../openings.js';
import { cloudEval, formatEval, explorer, parseStudyUrl, fetchStudyPgn, TOKEN_URL } from '../lichess.js';
import { playMove } from '../sound.js';
import { reviewRepertoire } from '../review.js';
import { getCourse, LEVELS } from '../library.js';
import { expandCourse, updateCourse, updateMessage, isOutdated } from '../courses.js';
import { san } from '../notation.js';

export function renderEditor(root, { id, ruta = '' }) {
  const rep = getRepertoire(id);
  if (!rep) return notFound(root);
  const settings = getSettings();

  // fullPath guarda la línea entera; cursor indica hasta dónde estamos (permite "adelante").
  let fullPath = (ruta && pathFromUcis(rep, ruta.split(','))) || [];
  let cursor = fullPath.length;
  let renderId = 0; // descarta respuestas de Lichess que llegan tarde
  const chess = new Chess();

  const boardEl = h('div', { class: 'board' });
  const panel = h('div', { class: 'panel' });

  root.append(
    h('section', { class: 'layout' },
      h('div', { class: 'board-col' },
        boardEl,
        h('div', { class: 'board-controls' },
          h('button', { class: 'icon-btn', title: 'Inicio (Inicio)', onClick: () => go(0) }, '⏮'),
          h('button', { class: 'icon-btn', title: 'Atrás (←)', onClick: () => go(cursor - 1) }, '◀'),
          h('button', { class: 'icon-btn', title: 'Adelante (→)', onClick: forward }, '▶'),
          h('button', { class: 'icon-btn', title: 'Final (Fin)', onClick: () => go(fullPath.length) }, '⏭'),
          h('button', { class: 'icon-btn', title: 'Girar tablero (F)', onClick: () => board.toggleOrientation() }, '⟲'),
        ),
      ),
      panel,
    ),
  );

  const board = createBoard(boardEl, {
    orientation: rep.color,
    movable: { free: false, showDests: true, events: { after: onBoardMove } },
  });

  const current = () => fullPath.slice(0, cursor);
  const currentKey = () => (cursor ? fullPath[cursor - 1].move.to : ROOT_KEY);

  function go(n) {
    cursor = Math.max(0, Math.min(fullPath.length, n));
    sync();
  }

  function forward() {
    if (cursor < fullPath.length) return go(cursor + 1);
    const first = rep.positions[currentKey()]?.moves[0];
    if (first) {
      fullPath.push({ from: currentKey(), move: first });
      go(cursor + 1);
    }
  }

  function enter(move) {
    const step = { from: currentKey(), move };
    if (fullPath[cursor]?.move.uci !== move.uci) fullPath = [...current(), step];
    go(cursor + 1);
  }

  function addAndEnter(move) {
    playMove(move);
    // En un curso de la biblioteca, lo que añades tú se marca como propio y sobrevive a las actualizaciones.
    const edge = addMove(rep, move, { own: Boolean(rep.source) });
    save(rep);
    enter(edge);
  }

  function onBoardMove(orig, dest) {
    const move = tryMove(chess, orig, dest);
    if (!move) return sync();
    addAndEnter(move);
  }

  function playUci(uci) {
    const move = moveFromUci(chess, uci);
    if (move) addAndEnter(move);
  }

  function sync() {
    const path = current();
    chess.load(fenAfterPath(rep, path));
    const last = path[path.length - 1];
    const key = currentKey();
    const brush = isUserTurn(rep, key) ? 'green' : 'paleBlue';
    board.set({
      fen: chess.fen(),
      turnColor: colorToMove(chess),
      lastMove: last ? squaresOf(last.move.uci) : undefined,
      check: chess.inCheck(),
      movable: { color: colorToMove(chess), dests: destsFor(chess) },
      drawable: { autoShapes: (rep.positions[key]?.moves ?? []).map((m) => arrow(m.uci, brush)) },
    });
    renderPanel();
  }

  function renderPanel() {
    const myRender = ++renderId;
    const key = currentKey();
    const pos = rep.positions[key];
    const moves = pos?.moves ?? [];
    const userTurn = isUserTurn(rep, key);
    const path = current();
    const last = path[cursor - 1];
    const stats = repStats(rep);
    const gaps = gapKeys(rep);
    const isWhite = rep.color === 'white';
    const fen = chess.fen();

    const openingEl = h('div', { class: 'opening-name' });
    const evalEl = h('span', { class: 'eval', hidden: true });
    const explorerEl = h('div', { class: 'explorer' });

    let hint;
    if (userTurn && !moves.length && key !== ROOT_KEY) {
      hint = h('div', { class: 'notice warn' }, '⚠ Te toca mover y aún no tienes respuesta. Juega en el tablero la jugada que quieres usar.');
    } else if (userTurn && moves.length > 1) {
      hint = h('div', { class: 'notice warn' },
        `Tienes ${moves.length} jugadas propias aquí. En el entrenamiento cada una se practicará en su propia línea; lo normal es tener solo una.`);
    } else if (userTurn) {
      hint = h('p', { class: 'muted' }, 'Te toca a ti. Juega en el tablero la jugada de tu repertorio (flecha verde).');
    } else {
      hint = h('p', { class: 'muted' }, 'Turno del rival. Añade las respuestas del rival que quieras preparar (flechas azules).');
    }

    const linesHere = moves.length ? allLines(rep, { from: key, trim: false, maxLines: 400 }) : [];

    fill(panel,
      h('div', { class: 'panel-head' },
        h('a', { href: '#/', class: 'back' }, '← Repertorios'),
        h('h1', null,
          h('span', { class: `piece-badge ${rep.color}` }, isWhite ? '♔' : '♚'),
          rep.name,
        ),
        h('p', { class: 'muted small' },
          `${stats.total} posiciones · ${allLines(rep).length} líneas · ${stats.gaps} sin respuesta`),
        courseInfo(),
      ),

      h('div', { class: 'card' },
        h('div', { class: 'card-row' }, h('h3', null, 'Línea actual'), evalEl),
        openingEl,
        h('div', { class: 'movelist' },
          h('button', { class: `mv ${cursor === 0 ? 'on' : ''}`, onClick: () => go(0) }, 'Inicio'),
          fullPath.map((step, i) =>
            h('button', {
              class: `mv ${i + 1 === cursor ? 'on' : ''} ${i + 1 > cursor ? 'future' : ''} ${isUserTurn(rep, step.from) ? 'mine' : ''}`,
              onClick: () => go(i + 1),
            }, stepLabel(rep, step, i === 0, san)),
          ),
        ),
        parentCount(rep, key) > 1
          ? h('p', { class: 'muted small transpo' }, '↔ A esta posición también se llega con otro orden de jugadas de tu repertorio.')
          : null,
      ),

      h('div', { class: 'card' },
        h('h3', null, userTurn ? 'Tu jugada aquí' : 'Respuestas del rival preparadas'),
        hint,
        moves.length
          ? h('ul', { class: 'move-rows' },
              moves.map((m, i) =>
                h('li', null,
                  h('button', { class: 'mv big', onClick: () => enter(m) }, san(m.san)),
                  h('span', { class: `tag ${userTurn ? 'mine' : 'theirs'}` }, userTurn ? 'tuya' : 'rival'),
                  m.comment ? h('span', { class: 'muted small ellipsis', title: m.comment }, m.comment) : h('span', { class: 'spacer' }),
                  i > 0
                    ? h('button', {
                        class: 'icon-btn',
                        title: 'Hacer principal (primera al exportar y al avanzar con →)',
                        onClick: () => makeMain(key, m),
                      }, '↑')
                    : null,
                  h('button', {
                    class: 'icon-btn danger',
                    title: 'Borrar esta jugada y lo que cuelga de ella',
                    onClick: () => removeMove(key, m),
                  }, '🗑'),
                ),
              ),
            )
          : null,
      ),

      last
        ? h('div', { class: 'card' },
            h('h3', null, `Comentario de ${san(last.move.san)}`),
            commentBox(last.move),
          )
        : null,

      h('div', { class: 'card' },
        h('div', { class: 'card-row' },
          h('h3', null, 'Explorador de Lichess'),
          h('div', { class: 'segmented small-seg' },
            ['masters', 'lichess'].map((db) =>
              h('button', {
                class: `seg ${settings.explorerDb === db ? 'on' : ''}`,
                onClick: () => {
                  updateSettings({ explorerDb: db });
                  renderPanel();
                },
              }, db === 'masters' ? 'Maestros' : 'Aficionados'),
            ),
          ),
        ),
        explorerEl,
      ),

      linesHere.length
        ? h('details', { class: 'card lines-card' },
            h('summary', null, h('h3', null, `Líneas desde aquí (${linesHere.length}${linesHere.length >= 400 ? '+' : ''})`)),
            h('ol', { class: 'lines-list' },
              linesHere.slice(0, 150).map((line) =>
                h('li', null,
                  h('button', {
                    class: 'line-link',
                    onClick: () => {
                      fullPath = [...current(), ...line];
                      go(fullPath.length);
                    },
                  }, line.map((s, i) => stepLabel(rep, s, i === 0, san)).join(' ')),
                ),
              ),
            ),
            linesHere.length > 150 ? h('p', { class: 'muted small' }, `… y ${linesHere.length - 150} más.`) : null,
          )
        : null,

      h('div', { class: 'actions' },
        h('a', {
          class: 'btn primary',
          href: `#/entrenar/${rep.id}?modo=libre${cursor ? '&desde=' + path.map((s) => s.move.uci).join(',') : ''}`,
        }, cursor ? 'Practicar desde aquí' : 'Practicar todo'),
        h('button', {
          class: 'btn',
          title: 'Las jugadas tuyas que cuelgan de esta posición vuelven a ser nuevas y las aprendes otra vez',
          onClick: relearn,
        }, cursor ? 'Volver a aprender desde aquí' : 'Volver a aprender todo'),
        gaps.length ? h('button', { class: 'btn', onClick: () => jumpToGap(gaps) }, 'Ir a una posición sin respuesta') : null,
        h('button', {
          class: 'btn',
          title: 'Compara tus jugadas con la evaluación de la nube de Lichess',
          onClick: openReview,
        }, cursor ? 'Revisar desde aquí con el motor' : 'Revisar con el motor'),
        h('button', { class: 'btn', onClick: openImport }, 'Importar PGN o estudio'),
        h('button', {
          class: 'btn',
          onClick: () => download(`${safeFilename(rep.name)}.pgn`, exportPgn(rep), 'application/x-chess-pgn'),
        }, 'Exportar PGN'),
        h('button', { class: 'btn', onClick: () => copy(fen, 'FEN copiado') }, 'Copiar FEN'),
        cursor ? h('button', { class: 'btn', onClick: () => copy(pathToText(rep, path), 'Línea copiada') }, 'Copiar línea') : null,
        h('a', {
          class: 'btn',
          href: `https://lichess.org/analysis/standard/${fen.replace(/ /g, '_')}`,
          target: '_blank',
          rel: 'noopener',
        }, 'Analizar en Lichess ↗'),
      ),
    );

    // Partes asíncronas: nombre de la apertura, evaluación y explorador.
    const stillHere = () => myRender === renderId;
    loadOpenings().then(() => {
      if (!stillHere()) return;
      const opening = openingForPath(path);
      fill(openingEl, opening ? [h('span', { class: 'eco' }, opening.eco), ' ', opening.name] : null);
    });

    // Pequeña espera para no lanzar consultas mientras navegas rápido con las flechas.
    setTimeout(() => {
      if (!stillHere()) return;
      if (settings.showEval) loadEval(fen, evalEl, stillHere);
      loadExplorer(fen, moves, explorerEl, stillHere);
    }, 250);
  }

  async function loadEval(fen, el, stillHere) {
    try {
      const ev = await cloudEval(fen);
      if (!stillHere() || !ev) return;
      const best = sanOf(new Chess(fen), ev.best);
      el.hidden = false;
      el.title = `Evaluación de la nube de Lichess (profundidad ${ev.depth}). Mejor jugada: ${best ? san(best) : '?'}`;
      fill(el, h('strong', null, formatEval(ev)), best ? ` · mejor: ${san(best)}` : null);
    } catch {
      // Sin evaluación disponible: no mostramos nada.
    }
  }

  async function loadExplorer(fen, repMoves, el, stillHere) {
    if (!settings.lichessToken) {
      fill(el,
        h('p', { class: 'muted small' },
          'Muestra las jugadas más populares y sus resultados. Lichess pide un token personal gratuito: ',
          h('a', { href: TOKEN_URL, target: '_blank', rel: 'noopener' }, 'créalo aquí'),
          ' (sin marcar ningún permiso) y pégalo en ',
          h('a', { href: '#/ajustes' }, 'Ajustes'), '.'),
      );
      return;
    }
    fill(el, h('p', { class: 'muted small' }, 'Cargando…'));
    try {
      const data = await explorer(fen, {
        db: settings.explorerDb,
        ratings: settings.explorerRatings,
        token: settings.lichessToken,
      });
      if (!stillHere()) return;
      const total = data ? data.white + data.draws + data.black : 0;
      if (!data || !total) {
        fill(el, h('p', { class: 'muted small' }, 'No hay partidas con esta posición en la base de datos.'));
        return;
      }
      const inRep = new Set(repMoves.map((m) => m.san));
      fill(el,
        h('table', { class: 'explorer-table' },
          h('thead', null, h('tr', null,
            h('th', null, 'Jugada'), h('th', null, 'Partidas'), h('th', null, 'Blancas / tablas / negras'))),
          h('tbody', null,
            data.moves.map((m) => {
              const games = m.white + m.draws + m.black;
              const pct = (n) => (games ? Math.round((n / games) * 100) : 0);
              return h('tr', {
                class: inRep.has(m.san) ? 'in-rep' : '',
                title: inRep.has(m.san) ? 'Ya está en tu repertorio' : 'Clic para añadirla',
                onClick: () => playUci(m.uci),
              },
                h('td', { class: 'ex-move' }, san(m.san), inRep.has(m.san) ? h('span', { class: 'ex-check' }, ' ✓') : null),
                h('td', { class: 'ex-games' }, `${Math.round((games / total) * 100)}%`, h('span', { class: 'muted' }, ` · ${compact(games)}`)),
                h('td', null,
                  h('div', { class: 'wdl', 'aria-label': `${pct(m.white)}% blancas, ${pct(m.draws)}% tablas, ${pct(m.black)}% negras` },
                    h('span', { class: 'w', style: `flex:${m.white}` }, pct(m.white) >= 12 ? `${pct(m.white)}%` : ''),
                    h('span', { class: 'd', style: `flex:${m.draws}` }, pct(m.draws) >= 12 ? `${pct(m.draws)}%` : ''),
                    h('span', { class: 'b', style: `flex:${m.black}` }, pct(m.black) >= 12 ? `${pct(m.black)}%` : ''),
                  ),
                ),
              );
            }),
          ),
        ),
        h('p', { class: 'muted small' }, `${compact(total)} partidas · ${settings.explorerDb === 'masters' ? 'maestros' : 'Lichess, ' + settings.explorerRatings[0] + '+ de Elo, blitz/rápidas/clásicas'}. Clic en una jugada para añadirla.`),
      );
    } catch (err) {
      if (stillHere()) fill(el, h('p', { class: 'muted small' }, err.message || 'No se pudo consultar Lichess.'));
    }
  }

  function commentBox(move) {
    let timer;
    return h('textarea', {
      class: 'comment',
      rows: '2',
      placeholder: 'Ideas, planes o trampas de esta jugada (se muestran al entrenar)',
      value: move.comment ?? '',
      onInput: (e) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          const text = e.target.value.trim();
          if (text) move.comment = text;
          else delete move.comment;
          move.commentEdited = true;
          save(rep);
        }, 300);
      },
    });
  }

  // Si el repertorio viene de la biblioteca: explicación del curso y botón para ampliarlo.
  function courseInfo() {
    const course = getCourse(rep.source?.course);
    if (!course) return null;
    const next = rep.source.level + 1;
    return h('details', { class: 'course-details' },
      h('summary', null, `Curso de la biblioteca · nivel ${LEVELS[rep.source.level].name}`),
      h('p', null, course.intro),
      h('ul', null, course.covers.map((c) => h('li', null, c))),
      isOutdated(rep)
        ? h('div', { class: 'notice warn' },
            'Hay una versión mejorada de este curso. Al actualizar conservas tu progreso y tus jugadas propias. ',
            h('button', {
              class: 'btn',
              onClick: () => {
                const snap = snapshot();
                const result = updateCourse(rep);
                sync();
                toast(updateMessage(result), 'ok', { label: 'Deshacer', onClick: () => undoTo(snap) });
              },
            }, 'Actualizar curso'),
          )
        : null,
      next < course.levels.length
        ? h('button', {
            class: 'btn',
            onClick: () => {
              const snap = snapshot();
              const added = expandCourse(rep, next);
              sync();
              toast(`Ampliado a ${LEVELS[next].name}: ${added} jugadas nuevas`, 'ok', { label: 'Deshacer', onClick: () => undoTo(snap) });
            },
          }, `Ampliar a ${LEVELS[next].name}`)
        : null,
    );
  }

  // Copia del repertorio y de la línea actual para poder deshacer borrados e importaciones.
  function snapshot() {
    return {
      data: JSON.stringify({
        positions: rep.positions,
        cards: rep.cards,
        source: rep.source,
        progressResetAt: rep.progressResetAt,
        resets: rep.resets,
      }),
      ucis: fullPath.map((s) => s.move.uci),
      cursor,
    };
  }

  function undoTo(snap) {
    const saved = JSON.parse(snap.data);
    for (const key of ['source', 'progressResetAt', 'resets']) if (saved[key] === undefined) delete rep[key];
    Object.assign(rep, saved);
    save(rep);
    fullPath = pathFromUcis(rep, snap.ucis) ?? [];
    cursor = Math.min(snap.cursor, fullPath.length);
    sync();
    toast('Deshecho', 'ok');
  }

  function removeMove(fromKey, move) {
    const snap = snapshot();
    const idx = fullPath.findIndex((s) => s.from === fromKey && s.move.uci === move.uci);
    const before = Object.keys(rep.positions).length;
    deleteMove(rep, fromKey, move.uci);
    // Si es una jugada del curso, se recuerda para que una actualización no la devuelva.
    if (rep.source && !move.own) rep.source.removed = [...(rep.source.removed ?? []), `${fromKey}|${move.uci}`];
    save(rep);
    if (idx !== -1) {
      fullPath = fullPath.slice(0, idx);
      cursor = Math.min(cursor, idx);
    }
    sync();
    const removed = before - Object.keys(rep.positions).length;
    toast(`${san(move.san)} borrada${removed > 1 ? ` (${removed} posiciones)` : ''}`, 'info', { label: 'Deshacer', onClick: () => undoTo(snap) });
  }

  // Olvida el progreso de lo que cuelga de la posición actual para volver a aprenderlo.
  function relearn() {
    const snap = snapshot();
    const count = resetProgress(rep, { from: currentKey() });
    save(rep);
    renderPanel();
    toast(
      count ? `${count} jugadas vuelven a ser nuevas: las repasarás con pistas` : 'No había progreso que reiniciar aquí',
      'ok',
      count ? { label: 'Deshacer', onClick: () => undoTo(snap) } : null,
    );
  }

  function makeMain(fromKey, move) {
    const list = rep.positions[fromKey].moves;
    list.splice(list.indexOf(move), 1);
    list.unshift(move);
    save(rep);
    renderPanel();
  }

  function jumpToGap(gaps) {
    // Prioriza el hueco más cercano a la posición inicial.
    const paths = gaps.map((g) => pathTo(rep, g)).filter(Boolean).sort((a, b) => a.length - b.length);
    if (!paths.length) return;
    fullPath = paths[0];
    go(fullPath.length);
  }

  function openImport() {
    const textarea = h('textarea', {
      class: 'pgn-input',
      rows: '9',
      placeholder: '1. e4 e5 2. Nf3 Nc6 (2... d6 3. d4) 3. Bc4 ...',
    });
    const fileInput = h('input', {
      type: 'file',
      accept: '.pgn,text/plain',
      onChange: async (e) => {
        const file = e.target.files?.[0];
        if (file) textarea.value = await file.text();
      },
    });
    const studyInput = h('input', { type: 'text', placeholder: 'https://lichess.org/study/…' });
    const studyBtn = h('button', {
      class: 'btn',
      type: 'button',
      onClick: async () => {
        const ref = parseStudyUrl(studyInput.value);
        if (!ref) return toast('Pega un enlace de estudio de Lichess (lichess.org/study/…)', 'error');
        studyBtn.disabled = true;
        studyBtn.textContent = 'Descargando…';
        try {
          textarea.value = await fetchStudyPgn(ref, settings.lichessToken);
          const chapters = (textarea.value.match(/^\[Event /gm) ?? []).length;
          toast(`Estudio descargado (${chapters} ${chapters === 1 ? 'capítulo' : 'capítulos'}). Revisa y pulsa Importar.`, 'ok');
        } catch (err) {
          toast(err.message || 'No se pudo descargar el estudio', 'error');
        } finally {
          studyBtn.disabled = false;
          studyBtn.textContent = 'Traer';
        }
      },
    }, 'Traer');

    const close = openDialog('Importar PGN',
      h('p', { class: 'muted small' },
        'Pega uno o varios PGN (con variantes y comentarios), elige un archivo o trae un estudio de Lichess. Las jugadas se añaden a este repertorio.'),
      h('label', { class: 'field' }, h('span', null, 'Estudio de Lichess (enlace)'),
        h('div', { class: 'inline-field' }, studyInput, studyBtn)),
      h('label', { class: 'field' }, h('span', null, 'PGN'), textarea),
      h('label', { class: 'field' }, h('span', null, 'O desde un archivo .pgn'), fileInput),
      h('div', { class: 'dialog-actions' },
        h('button', { class: 'btn', onClick: () => close() }, 'Cancelar'),
        h('button', {
          class: 'btn primary',
          onClick: () => {
            const snap = snapshot();
            const { added, errors } = importPgn(rep, textarea.value, { own: Boolean(rep.source) });
            save(rep);
            close();
            sync();
            const undo = added ? { label: 'Deshacer', onClick: () => undoTo(snap) } : null;
            if (errors.length) {
              toast(`${added} jugadas añadidas. ${errors.length} avisos: ${errors.slice(0, 2).join(' · ')}`, 'error', undo);
            } else {
              toast(added ? `${added} jugadas añadidas` : 'No había jugadas nuevas', 'ok', undo);
            }
          },
        }, 'Importar'),
      ),
    );
    textarea.focus();
  }

  function openReview() {
    const from = currentKey();
    const controller = new AbortController();
    const progress = h('progress', { max: '1', value: '0' });
    const statusEl = h('p', { class: 'muted small' }, 'Consultando la evaluación de Lichess…');
    const list = h('div', { class: 'review-results' });
    const actions = h('div', { class: 'dialog-actions' },
      h('button', { class: 'btn', onClick: () => controller.abort() }, 'Parar'));

    const close = openDialog('Revisar con el motor',
      h('p', { class: 'muted small' },
        `Compara cada jugada tuya ${cursor ? 'desde esta posición' : 'del repertorio'} con la evaluación de la nube de Lichess y señala las que pierden ventaja. `,
        'Solo hay datos de posiciones conocidas; las muy profundas o raras salen como "sin datos".'),
      progress, statusEl, list, actions,
    );
    list.closest('dialog').addEventListener('close', () => controller.abort());

    // Una consulta cada vez y una pequeña pausa, para no saturar a Lichess.
    const evaluate = async (fen) => {
      const ev = await cloudEval(fen);
      await new Promise((r) => setTimeout(r, 120));
      return ev;
    };

    reviewRepertoire(rep, {
      from,
      evaluate,
      signal: controller.signal,
      onProgress: (done, total) => {
        progress.max = total;
        progress.value = done;
        statusEl.textContent = `Revisadas ${done} de ${total} posiciones…`;
      },
    })
      .then(({ results, noData, checked, total }) => {
        const bad = results.filter((r) => r.kind !== 'ok').sort((a, b) => b.loss - a.loss);
        progress.hidden = true;
        statusEl.textContent =
          `${checked} de ${total} posiciones revisadas · ${results.length} jugadas con evaluación · ${noData} sin datos.` +
          (total > checked && !controller.signal.aborted ? ' (Máximo 120 por revisión.)' : '');
        fill(list,
          bad.length
            ? h('ul', { class: 'weak-list' },
                bad.map((r) => {
                  const path = pathTo(rep, r.key) ?? [];
                  return h('li', null,
                    h('div', null,
                      h('span', { class: `tag ${r.kind}` }, r.kind === 'error' ? 'Error' : 'Dudosa'), ' ',
                      h('span', { class: 'muted small' }, path.length ? pathToText(rep, path, san) + ' ' : ''),
                      h('strong', null, stepLabel(rep, { from: r.key, move: r.move }, true, san)),
                      h('div', { class: 'muted small' },
                        `Pierde ${(r.loss / 100).toFixed(1)} peones según Lichess · mejor: ${r.best ? san(r.best) : '?'}`),
                    ),
                    h('button', {
                      class: 'btn',
                      onClick: () => {
                        close();
                        fullPath = path;
                        go(fullPath.length);
                      },
                    }, 'Ir'),
                  );
                }),
              )
            : h('p', { class: 'notice ok' }, results.length
                ? '✓ No hay jugadas dudosas entre las que tienen evaluación.'
                : 'Lichess no tiene evaluación para estas posiciones.'),
        );
      })
      .catch((err) => {
        statusEl.textContent = err.message || 'No se pudo consultar Lichess.';
      })
      .finally(() => fill(actions, h('button', { class: 'btn primary', onClick: () => close() }, 'Cerrar')));
  }

  function onKey(e) {
    if (e.target.closest?.('input, textarea, dialog')) return;
    if (e.key === 'ArrowLeft') go(cursor - 1);
    else if (e.key === 'ArrowRight') forward();
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(fullPath.length);
    else if (e.key.toLowerCase() === 'f') board.toggleOrientation();
    else return;
    e.preventDefault();
  }
  document.addEventListener('keydown', onKey);

  sync();

  return () => {
    renderId++;
    document.removeEventListener('keydown', onKey);
    board.destroy();
  };
}

async function copy(text, message) {
  try {
    await navigator.clipboard.writeText(text);
    toast(message, 'ok');
  } catch {
    toast('No se pudo copiar', 'error');
  }
}

function compact(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace('.0', '')}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1).replace('.0', '')}k`;
  return String(n);
}

function notFound(root) {
  root.append(
    h('section', { class: 'page' },
      h('h1', null, 'Repertorio no encontrado'),
      h('p', null, h('a', { href: '#/' }, '← Volver a tus repertorios')),
    ),
  );
}
