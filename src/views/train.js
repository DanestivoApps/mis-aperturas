// Entrenamiento: el rival juega las jugadas de tu repertorio y tú respondes.
// Modo "repaso": repetición espaciada (lo que toca hoy + jugadas nuevas).
// Modo "libre": recorre todas las líneas en orden aleatorio, sin tocar el calendario.
// Modo "errores": solo las líneas que pasan por posiciones que sueles fallar.
import { Chess } from 'chess.js';
import { h, fill } from '../dom.js';
import { getRepertoire, getData, getSettings, save, recordAnswer } from '../store.js';
import { allLines, isUserTurn, repStats, stepLabel, START_FEN } from '../repertoire.js';
import { lineId, pickSrsLine, weakLines, scopeStats } from '../session.js';
import { getCourse, LEVELS } from '../library.js';
import { levelEdges } from '../courses.js';
import { newCard, gradeCorrect, gradeWrong, describeDue } from '../srs.js';
import { createBoard, arrow } from '../board.js';
import { colorToMove, destsFor, squaresOf, tryMove, uciOf } from '../chess-utils.js';
import { loadOpenings, openingForPath } from '../openings.js';
import { play, playMove } from '../sound.js';
import { san } from '../notation.js';

const MODES = {
  repaso: 'Repaso con repetición espaciada.',
  libre: 'Práctica libre: no cambia tus fechas de repaso.',
  errores: 'Repaso de errores: las posiciones que más fallas. No cambia tus fechas de repaso.',
};

export function renderTrain(root, { id, modo = 'repaso', desde = '', todo = false, nivel = null }) {
  const rep = getRepertoire(id);
  if (!rep) {
    root.append(h('section', { class: 'page' }, h('h1', null, 'Repertorio no encontrado'), h('a', { href: '#/' }, '← Volver')));
    return;
  }
  if (!MODES[modo]) modo = 'repaso';
  const srs = modo === 'repaso'; // solo el repaso toca el calendario
  const settings = getSettings();
  const prefix = desde ? desde.split(',') : [];
  // Con `nivel`, solo las líneas de ese nivel del curso (Esencial, Avanzado...).
  const course = nivel != null ? getCourse(rep.source?.course) : null;
  const levelName = course ? LEVELS[nivel]?.name : null;
  const edges = course ? levelEdges(course, nivel) : null;
  const levelQuery = course ? `&nivel=${nivel}` : '';
  const lines = allLines(rep).filter(
    (line) =>
      line.length > prefix.length &&
      prefix.every((uci, i) => line[i].move.uci === uci) &&
      (!edges || line.every((s) => edges.has(`${s.from}|${s.move.uci}`))),
  );

  // Temporizadores protegidos: si salimos de la vista no se ejecutan.
  let alive = true;
  const timers = new Set();
  const later = (fn, ms) => {
    const t = setTimeout(() => {
      timers.delete(t);
      if (alive) fn();
    }, ms);
    timers.add(t);
  };
  // Igual, pero solo si seguimos en la misma línea (al saltar líneas rápido no se mezclan).
  const laterInLine = (fn, ms) => {
    const owner = cur;
    later(() => {
      if (cur === owner) fn();
    }, ms);
  };

  const session = {
    correct: 0,
    wrong: 0,
    lines: 0,
    newBudget: settings.newPerSession,
    queue: modo === 'libre' ? shuffle(lines.slice()) : modo === 'errores' ? weakLines(rep, lines) : null,
    skipped: new Set(),
  };
  // Estado de la línea en curso.
  let cur = null;

  // ---------- Interfaz ----------
  const boardEl = h('div', { class: 'board' });
  const feedback = h('div', { class: 'feedback', 'aria-live': 'polite' });
  const comment = h('div', { class: 'train-comment' });
  const openingEl = h('div', { class: 'opening-name' });
  const moveText = h('p', { class: 'line-text' });
  const counters = h('div', { class: 'chips' });
  const hintBtn = h('button', { class: 'btn', onClick: showHint, title: 'Atajo: H' }, 'Pista');
  const nextBtn = h('button', { class: 'btn primary', hidden: true, onClick: nextLine, title: 'Atajo: Enter' }, 'Siguiente línea →');
  const skipBtn = h('button', { class: 'btn', onClick: skipLine }, 'Saltar línea');
  const repeatBtn = h('button', { class: 'btn', onClick: repeatLine, title: 'Vuelve a jugar esta línea desde el principio (atajo: R)' }, '↺ Repetir línea');
  const actions = h('div', { class: 'actions' },
    nextBtn, repeatBtn, hintBtn, skipBtn, h('a', { class: 'btn ghost', href: `#/editar/${rep.id}` }, 'Editar repertorio'));
  const panel = h('div', { class: 'panel' },
    h('div', { class: 'panel-head' },
      h('a', { href: '#/', class: 'back' }, '← Repertorios'),
      h('h1', null, h('span', { class: `piece-badge ${rep.color}` }, rep.color === 'white' ? '♔' : '♚'), rep.name),
      levelName ? h('span', { class: 'chip due level-chip' }, `Nivel ${levelName}`) : null,
      h('p', { class: 'muted small' }, MODES[modo], prefix.length ? ' Desde la posición elegida.' : ''),
    ),
    counters,
    feedback,
    comment,
    h('div', { class: 'card' }, h('h3', null, 'Línea'), openingEl, moveText),
    actions,
  );

  root.append(h('section', { class: 'layout' }, h('div', { class: 'board-col' }, boardEl), panel));
  loadOpenings();

  const board = createBoard(boardEl, {
    orientation: rep.color,
    fen: START_FEN,
    movable: { free: false, color: undefined, showDests: true, events: { after: onUserMove } },
  });

  function say(text, kind = 'neutral') {
    feedback.textContent = text;
    feedback.dataset.kind = kind;
  }

  function flash(kind) {
    boardEl.classList.remove('flash-ok', 'shake');
    void boardEl.offsetWidth; // reinicia la animación
    boardEl.classList.add(kind);
  }

  function updateCounters() {
    const s = scopeStats(rep, lines, { fromIndex: prefix.length });
    fill(counters,
      srs
        ? [
            h('span', { class: `chip ${s.due ? 'due' : ''}` }, `${s.due} para repasar`),
            h('span', { class: 'chip' }, `${Math.min(s.fresh, Math.max(session.newBudget, 0))} nuevas en esta sesión`),
          ]
        : h('span', { class: 'chip' }, `Línea ${session.lines + (cur ? 1 : 0)} · quedan ${session.queue.length}`),
      h('span', { class: 'chip ok' }, `✓ ${session.correct}`),
      h('span', { class: 'chip bad' }, `✗ ${session.wrong}`),
    );
  }

  function updateLineText() {
    const played = cur.line.slice(0, cur.idx);
    moveText.textContent = played.length ? played.map((s, i) => stepLabel(rep, s, i === 0, san)).join(' ') : '—';
    const opening = openingForPath(played);
    fill(openingEl, opening ? [h('span', { class: 'eco' }, opening.eco), ' ', opening.name] : null);
  }

  // ---------- Elección de líneas ----------
  function pickLine() {
    if (!srs) return session.queue.shift() ?? null;
    return pickSrsLine(rep, lines, {
      prefixLength: prefix.length,
      newBudget: session.newBudget,
      skipped: session.skipped,
    });
  }

  function nextLine() {
    const line = pickLine();
    if (!line) return finish();
    startLine(line);
  }

  // Vuelve a jugar la línea actual (o la que acabas de terminar) desde el principio.
  function repeatLine() {
    if (!cur) return;
    startLine(cur.line);
    say('Otra vez desde el principio.', 'info');
  }

  function startLine(line) {
    nextBtn.hidden = true;
    cur = { line, idx: 0, chess: new Chess(), awaiting: false, hinted: false, failed: false, lineFailed: false };
    fill(comment);
    board.set({
      fen: START_FEN,
      turnColor: 'white',
      lastMove: undefined,
      check: false,
      movable: { color: undefined, dests: new Map() },
      drawable: { autoShapes: [] },
    });
    hintBtn.disabled = false;
    skipBtn.disabled = false;
    updateCounters();
    updateLineText();
    if (!feedback.textContent.startsWith('Otra vez')) say(rep.color === 'white' ? 'Empiezas tú.' : 'El rival empieza…');
    laterInLine(advance, 350);
  }

  // ¿Esta jugada tuya se puede jugar sola? (ajuste "saltar las que ya sabes")
  function isKnownAndNotDue(step) {
    if (!srs || !settings.skipKnown) return false;
    const card = rep.cards[step.from];
    return Boolean(card) && card.due > Date.now();
  }

  function advance() {
    const { line, idx } = cur;
    if (idx >= line.length) return lineDone();
    const step = line[idx];
    const auto = idx < prefix.length || !isUserTurn(rep, step.from) || isKnownAndNotDue(step);
    if (auto) {
      // Jugada del rival, del tramo inicial elegido o que ya sabes: se juega sola.
      const fast = idx < prefix.length || isUserTurn(rep, step.from);
      laterInLine(() => {
        playStep(step);
        cur.idx++;
        updateLineText();
        advance();
      }, fast ? 260 : settings.opponentDelay);
      return;
    }
    awaitUser(step);
  }

  function playStep(step) {
    const [from, to] = squaresOf(step.move.uci);
    const move = cur.chess.move({ from, to, promotion: step.move.uci[4] });
    playMove(move);
    syncBoard([from, to], false);
    showComment(step.move);
  }

  function syncBoard(lastMove, movable) {
    const chess = cur.chess;
    board.set({
      fen: chess.fen(),
      turnColor: colorToMove(chess),
      lastMove,
      check: chess.inCheck(),
      movable: movable ? { color: rep.color, dests: destsFor(chess) } : { color: undefined, dests: new Map() },
    });
  }

  function showComment(move) {
    fill(comment, move.comment ? h('p', null, '💬 ', move.comment) : null);
  }

  function awaitUser(step) {
    const card = rep.cards[step.from];
    cur.awaiting = true;
    cur.hinted = false;
    cur.failed = false;
    const last = cur.line[cur.idx - 1];
    syncBoard(last ? squaresOf(last.move.uci) : undefined, true);
    if (srs && !card) {
      // Jugada nueva: se enseña primero.
      cur.hinted = true;
      session.newBudget--;
      board.setAutoShapes([arrow(step.move.uci, 'green')]);
      say(`Jugada nueva: memoriza ${stepLabel(rep, step, true, san)} y juégala.`, 'info');
      // La explicación se muestra antes de jugarla, para aprender la idea y no solo la jugada.
      if (step.move.comment) comment.append(h('p', { class: 'learn' }, '💡 ', step.move.comment));
    } else {
      board.setAutoShapes([]);
      say('Tu turno: ¿qué jugarías aquí?');
    }
  }

  function onUserMove(orig, dest) {
    if (!cur?.awaiting) return;
    const step = cur.line[cur.idx];
    const move = tryMove(cur.chess, orig, dest);
    if (!move) return syncBoard(undefined, true);
    const uci = uciOf(move);

    if (uci === step.move.uci) {
      cur.awaiting = false;
      const clean = !cur.failed && !cur.hinted;
      gradeSuccess(step);
      board.setAutoShapes([]);
      syncBoard([move.from, move.to], false);
      showComment(step.move);
      if (clean) {
        play('correct');
        flash('flash-ok');
        say('¡Correcto!', 'ok');
      } else {
        playMove(move);
        say(`Bien: ${san(step.move.san)}.`, 'ok');
      }
      cur.idx++;
      updateLineText();
      updateCounters();
      advance();
      return;
    }

    cur.chess.undo();
    const prev = cur.line[cur.idx - 1];
    const prevMove = prev ? squaresOf(prev.move.uci) : undefined;
    const alternative = rep.positions[step.from].moves.find((m) => m.uci === uci);
    if (alternative) {
      say(`${san(move.san)} también está en tu repertorio, pero esta línea sigue con otra jugada. Prueba otra vez.`, 'warn');
      syncBoard(prevMove, true);
      return;
    }
    play('wrong');
    flash('shake');
    if (cur.hinted && !cur.failed) {
      say(`Es una jugada nueva: juega ${san(step.move.san)} (flecha verde).`, 'info');
    } else {
      registerFailure(step);
      say(`No es ${san(move.san)}. La jugada de tu repertorio es ${san(step.move.san)}: juégala para seguir.`, 'bad');
    }
    syncBoard(prevMove, true);
    board.setAutoShapes([arrow(step.move.uci, 'green')]);
  }

  function gradeSuccess(step) {
    if (cur.failed) return;
    if (cur.hinted) {
      // Recién aprendida: queda pendiente para repetirla sin ayuda en esta sesión.
      rep.cards[step.from] ??= newCard();
      save();
      return;
    }
    session.correct++;
    recordAnswer(true);
    if (!srs) return;
    const card = rep.cards[step.from];
    if (card && card.due <= Date.now()) {
      gradeCorrect(card);
      save();
    }
  }

  function registerFailure(step) {
    if (cur.failed) return;
    cur.failed = true;
    cur.lineFailed = true;
    session.wrong++;
    recordAnswer(false);
    updateCounters();
    if (!srs) return;
    const card = (rep.cards[step.from] ??= newCard());
    gradeWrong(card);
    save();
  }

  function showHint() {
    if (!cur?.awaiting) return;
    const step = cur.line[cur.idx];
    board.setAutoShapes([arrow(step.move.uci, 'green')]);
    if (cur.hinted) return;
    registerFailure(step);
    say(`Pista: ${stepLabel(rep, step, true, san)}. Cuenta como fallo.`, 'warn');
  }

  function skipLine() {
    if (!cur) return;
    session.skipped.add(lineId(cur.line));
    cur.awaiting = false;
    nextLine();
  }

  function lineDone() {
    session.lines++;
    hintBtn.disabled = true;
    skipBtn.disabled = true;
    if (!srs && cur.lineFailed) session.queue.push(cur.line); // se repite al final
    updateCounters();
    nextBtn.hidden = false;
    if (cur.lineFailed) {
      say('Línea completada, con algún fallo. Volverá a salir pronto.', 'warn');
      nextBtn.focus();
    } else {
      play('done');
      say('¡Línea completada sin fallos! ✓', 'ok');
      laterInLine(() => {
        if (!nextBtn.hidden) nextLine();
      }, comment.textContent ? 2600 : 1300);
    }
  }

  // Siguiente repertorio con algo pendiente (para "Repasar todo").
  function nextPendingRep() {
    const reps = getData().repertoires;
    const idx = reps.findIndex((r) => r.id === rep.id);
    return reps.slice(idx + 1).find((r) => {
      const s = repStats(r);
      return s.due > 0 || (s.fresh > 0 && settings.newPerSession > 0);
    });
  }

  function finish() {
    cur = null;
    board.set({ movable: { color: undefined, dests: new Map() }, drawable: { autoShapes: [] } });
    const total = session.correct + session.wrong;
    const pct = total ? Math.round((session.correct / total) * 100) : 0;
    const nextDue = Object.values(rep.cards).reduce((min, c) => Math.min(min, c.due), Infinity);
    const s = scopeStats(rep, lines, { fromIndex: prefix.length });
    fill(counters);
    fill(comment);
    fill(openingEl);
    moveText.textContent = '—';

    let text;
    if (!lines.length) text = 'No hay líneas para entrenar aquí. Añade jugadas en el editor.';
    else if (!session.lines && session.skipped.size) text = 'Has saltado todas las líneas pendientes.';
    else if (!session.lines) {
      text = modo === 'errores'
        ? 'No tienes errores pendientes en este repertorio. 🎉'
        : srs ? 'No tienes nada pendiente: estás al día. 🎉' : 'No quedan líneas.';
    } else {
      text = `Sesión terminada: ${session.lines} ${session.lines === 1 ? 'línea' : 'líneas'}, ${pct}% de aciertos.`;
      play('done');
    }
    say(text, 'ok');

    const nextRep = todo ? nextPendingRep() : null;
    fill(actions,
      nextRep
        ? h('a', { class: 'btn primary', href: `#/entrenar/${nextRep.id}?todo=1` }, `Siguiente: ${nextRep.name} →`)
        : h('a', { class: 'btn primary', href: '#/' }, 'Volver a mis repertorios'),
      srs && s.fresh && session.newBudget <= 0
        ? h('button', { class: 'btn', onClick: restart }, `Aprender más jugadas nuevas (${s.fresh})`)
        : null,
      srs
        ? h('a', { class: 'btn', href: `#/entrenar/${rep.id}?modo=libre${levelQuery}` }, levelName ? `↺ Practicar el nivel ${levelName} otra vez` : '↺ Repasar todas las líneas otra vez')
        : h('button', { class: 'btn', onClick: restart }, '↺ Otra vuelta'),
      nextRep ? h('a', { class: 'btn ghost', href: '#/' }, 'Terminar') : null,
    );
    if (srs && Number.isFinite(nextDue)) {
      fill(comment, h('p', { class: 'muted' }, `Próximo repaso de este repertorio: ${describeDue(nextDue)}.`));
    }
    if (nextRep) {
      say(`${text} Ahora sigue "${nextRep.name}"…`, 'ok');
      later(() => {
        location.hash = `#/entrenar/${nextRep.id}?todo=1`;
      }, 2500);
    }
  }

  function restart() {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }

  function onKey(e) {
    if (e.target.closest?.('input, textarea, dialog')) return;
    if (e.key === 'Enter' && !nextBtn.hidden) {
      e.preventDefault();
      nextLine();
    } else if (e.key.toLowerCase() === 'h') {
      showHint();
    } else if (e.key.toLowerCase() === 'r') {
      repeatLine();
    }
  }
  document.addEventListener('keydown', onKey);

  nextLine();

  return () => {
    alive = false;
    timers.forEach(clearTimeout);
    document.removeEventListener('keydown', onKey);
    board.destroy();
  };
}

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}
