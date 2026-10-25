// Entrenamiento: el rival juega las jugadas de tu repertorio y tú respondes.
// Modo "repaso": repetición espaciada (lo que toca hoy + jugadas nuevas).
// Modo "libre": recorre todas las líneas en orden aleatorio, sin tocar el calendario.
// Modo "errores": solo las líneas que pasan por posiciones que sueles fallar.
// Modo "prueba": la línea principal de un curso de la biblioteca, sin añadirlo ni guardar nada.
import { Chess } from 'chess.js';
import { h, fill, toast, openDialog } from '../dom.js';
import { getRepertoire, getData, getSettings, save } from '../store.js';
import { noteAnswer, buzz } from '../feedback.js';
import { allLines, isUserTurn, repStats, stepLabel, START_FEN } from '../repertoire.js';
import { lineId, pickSrsLine, weakLines, scopeStats, uniqueLines, shuffle } from '../session.js';
import { getCourse, LEVELS } from '../library.js';
import { levelEdges, levelStats, previewRepertoire, addCourse, ownedFrom } from '../courses.js';
import { newCard, gradeCorrect, gradeWrong, describeDue } from '../srs.js';
import { createBoard, arrow } from '../board.js';
import { colorToMove, destsFor, squaresOf, tryMove, uciOf } from '../chess-utils.js';
import { loadOpenings, openingForPath } from '../openings.js';
import { play, playMove } from '../sound.js';
import { san, pieceHint } from '../notation.js';

const MODES = {
  repaso: 'Repaso con repetición espaciada.',
  libre: 'Práctica libre: no cambia tus fechas de repaso.',
  errores: 'Repaso de errores: las posiciones que más fallas. No cambia tus fechas de repaso.',
  prueba: 'Prueba del curso: su línea principal con la idea de cada jugada. No se guarda nada.',
};

const SHORTCUTS = [
  ['Enter', 'Siguiente línea (al terminar una)'],
  ['H', 'Pista: primero la pieza y, si vuelves a pulsar, la jugada'],
  ['R', 'Repetir la línea desde el principio'],
  ['S', 'Saltar la línea'],
  ['?', 'Ver estos atajos'],
];

export function renderTrain(root, { id, modo = 'repaso', desde = '', todo = false, nivel = null, curso = null }) {
  // Probar un curso: un repertorio en memoria que no se guarda.
  const previewCourse = curso ? getCourse(curso) : null;
  const rep = previewCourse ? previewRepertoire(previewCourse) : curso ? null : getRepertoire(id);
  if (!rep) {
    root.append(h('section', { class: 'page' },
      h('h1', null, curso ? 'Curso no encontrado' : 'Repertorio no encontrado'),
      h('a', { href: curso ? '#/biblioteca' : '#/' }, '← Volver')));
    return;
  }
  if (previewCourse) modo = 'prueba';
  else if (!MODES[modo] || modo === 'prueba') modo = 'repaso';
  const preview = modo === 'prueba';
  const srs = modo === 'repaso';
  // Solo el repaso toca el calendario (y deja de hacerlo al repasar los fallos de la sesión).
  let grading = srs;
  const settings = getSettings();
  const prefix = desde && !preview ? desde.split(',') : [];
  // Con `nivel`, solo las líneas de ese nivel del curso (Esencial, Avanzado...).
  const course = nivel != null && !preview ? getCourse(rep.source?.course) : null;
  const levelName = course ? LEVELS[nivel]?.name : null;
  const edges = course ? levelEdges(course, nivel) : null;
  const levelQuery = course ? `&nivel=${nivel}` : '';
  const lines = preview
    ? allLines(rep).slice(0, 1)
    : allLines(rep).filter(
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
    queue: modo === 'libre' ? shuffle(lines.slice()) : modo === 'errores' ? weakLines(rep, lines) : preview ? lines.slice() : null,
    skipped: new Set(),
    mistakes: new Map(), // "posición|jugada" → { line, idx, played }
    retry: false, // repasando los fallos de esta sesión
    assist: preview, // en la prueba, la primera vuelta es con ayuda
  };
  // Las líneas salen de una cola (y las falladas vuelven al final) salvo en el repaso.
  const queued = () => !srs || session.retry;
  // Estado de la línea en curso.
  let cur = null;

  // ---------- Interfaz ----------
  const boardEl = h('div', { class: 'board' });
  const feedback = h('div', { class: 'feedback', 'aria-live': 'polite' });
  const comment = h('div', { class: 'train-comment' });
  const openingEl = h('div', { class: 'opening-name' });
  const moveText = h('p', { class: 'line-text' });
  const counters = h('div', { class: 'chips' });
  const summary = h('div', { class: 'train-summary' });
  const modeText = h('p', { class: 'muted small' }, MODES[modo], prefix.length ? ' Desde la posición elegida.' : '');
  const hintBtn = h('button', { class: 'btn', onClick: showHint, title: 'Primero te marca la pieza; si vuelves a pulsar, la jugada (atajo: H)' }, 'Pista');
  const nextBtn = h('button', { class: 'btn primary', hidden: true, onClick: nextLine, title: 'Atajo: Enter' }, 'Siguiente línea →');
  const skipBtn = h('button', { class: 'btn', hidden: preview, onClick: skipLine, title: 'Atajo: S' }, 'Saltar línea');
  const repeatBtn = h('button', { class: 'btn', onClick: repeatLine, title: 'Vuelve a jugar esta línea desde el principio (atajo: R)' }, '↺ Repetir línea');
  const baseActions = [
    nextBtn, repeatBtn, hintBtn, skipBtn,
    preview ? null : h('a', { class: 'btn ghost', href: `#/editar/${rep.id}` }, 'Editar repertorio'),
  ];
  const actions = h('div', { class: 'actions' }, baseActions);
  const panel = h('div', { class: 'panel' },
    h('div', { class: 'panel-head' },
      preview
        ? h('a', { href: '#/biblioteca', class: 'back' }, '← Biblioteca')
        : h('a', { href: '#/', class: 'back' }, '← Repertorios'),
      h('h1', null, h('span', { class: `piece-badge ${rep.color}` }, rep.color === 'white' ? '♔' : '♚'), rep.name),
      levelName ? h('span', { class: 'chip due level-chip' }, `Nivel ${levelName}`) : null,
      preview ? h('span', { class: 'chip due level-chip' }, 'Prueba gratuita del curso') : null,
      modeText,
    ),
    counters,
    feedback,
    comment,
    h('div', { class: 'card' }, h('h3', null, 'Línea'), openingEl, moveText),
    actions,
    summary,
    h('button', { type: 'button', class: 'link-btn keys-hint', onClick: showShortcuts }, '⌨ Atajos de teclado (?)'),
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
    let progress;
    if (preview) progress = h('span', { class: 'chip' }, session.assist ? 'Primera vuelta: con ayuda' : 'Ahora tú, sin ayuda');
    else if (srs && !session.retry) {
      progress = [
        h('span', { class: `chip ${s.due ? 'due' : ''}` }, `${s.due} para repasar`),
        h('span', { class: 'chip' }, `${Math.min(s.fresh, Math.max(session.newBudget, 0))} nuevas en esta sesión`),
      ];
    } else progress = h('span', { class: 'chip' }, `Línea ${session.lines + (cur ? 1 : 0)} · quedan ${session.queue.length}`);
    fill(counters,
      progress,
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
    if (queued()) return session.queue.shift() ?? null;
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
    nextBtn.textContent = 'Siguiente línea →';
    cur = {
      line,
      idx: 0,
      chess: new Chess(),
      awaiting: false,
      hinted: false,
      hintLevel: 0,
      failed: false,
      lineFailed: false,
      assist: session.assist,
    };
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
    if (!grading || !settings.skipKnown) return false;
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
    cur.hintLevel = 0;
    cur.failed = false;
    const last = cur.line[cur.idx - 1];
    syncBoard(last ? squaresOf(last.move.uci) : undefined, true);
    if ((grading && !card) || cur.assist) {
      // Jugada nueva (o primera vuelta de la prueba): se enseña primero.
      cur.hinted = true;
      if (grading) session.newBudget--;
      board.setAutoShapes([arrow(step.move.uci, 'green')]);
      const label = stepLabel(rep, step, true, san);
      say(cur.assist ? `Juega ${label} (flecha verde).` : `Jugada nueva: memoriza ${label} y juégala.`, 'info');
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
    buzz();
    if (cur.hinted && !cur.failed) {
      say(`${cur.assist ? 'Fíjate en la flecha' : 'Es una jugada nueva'}: juega ${san(step.move.san)} (flecha verde).`, 'info');
    } else {
      registerFailure(step, move.san);
      say(`No es ${san(move.san)}. La jugada de tu repertorio es ${san(step.move.san)}: juégala para seguir.`, 'bad');
    }
    syncBoard(prevMove, true);
    board.setAutoShapes([arrow(step.move.uci, 'green')]);
  }

  // La prueba de un curso no cuenta en tu historial.
  function answer(ok) {
    if (!preview) noteAnswer(ok);
  }

  function gradeSuccess(step) {
    if (cur.failed) return;
    if (cur.hinted) {
      // Recién aprendida: queda pendiente para repetirla sin ayuda en esta sesión.
      if (grading) {
        rep.cards[step.from] ??= newCard();
        save();
      }
      return;
    }
    session.correct++;
    answer(true);
    if (!grading) return;
    const card = rep.cards[step.from];
    if (card && card.due <= Date.now()) {
      gradeCorrect(card);
      save();
    }
  }

  // `played`: la jugada equivocada (SAN), o null si pediste pista.
  function registerFailure(step, played = null) {
    if (cur.failed) return;
    cur.failed = true;
    cur.lineFailed = true;
    session.wrong++;
    session.mistakes.set(`${step.from}|${step.move.uci}`, { line: cur.line, idx: cur.idx, played });
    answer(false);
    updateCounters();
    if (!grading) return;
    const card = (rep.cards[step.from] ??= newCard());
    gradeWrong(card);
    save();
  }

  // Pista en dos pasos: primero la pieza que hay que mover y, si hace falta, la jugada.
  function showHint() {
    if (!cur?.awaiting) return;
    const step = cur.line[cur.idx];
    const [from] = squaresOf(step.move.uci);
    if (!cur.hinted && !cur.failed && cur.hintLevel === 0) {
      cur.hintLevel = 1;
      registerFailure(step);
      board.setAutoShapes([{ orig: from, brush: 'green' }]);
      say(`Pista: mueve ${pieceHint(cur.chess.get(from)?.type)}. Si pulsas otra vez Pista, verás la jugada. Cuenta como fallo.`, 'warn');
      return;
    }
    cur.hintLevel = 2;
    board.setAutoShapes([arrow(step.move.uci, 'green')]);
    if (!cur.hinted) say(`Pista: ${stepLabel(rep, step, true, san)}.`, 'warn');
  }

  function skipLine() {
    if (!cur || preview) return;
    session.skipped.add(lineId(cur.line));
    cur.awaiting = false;
    nextLine();
  }

  function lineDone() {
    session.lines++;
    hintBtn.disabled = true;
    skipBtn.disabled = true;
    nextBtn.hidden = false;
    if (preview && session.assist) {
      // Prueba: después de verla con ayuda, la juegas tú solo.
      session.assist = false;
      session.queue.push(cur.line);
      updateCounters();
      play('done');
      nextBtn.textContent = 'Ahora sin ayuda →';
      say('¡Línea completada! Ahora juégala tú sin flechas.', 'ok');
      nextBtn.focus();
      return;
    }
    if (queued() && cur.lineFailed) session.queue.push(cur.line); // se repite al final
    updateCounters();
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

  // ---------- Resumen de la sesión ----------
  function mistakesCard() {
    const list = [...session.mistakes.values()];
    if (!list.length) return null;
    return h('div', { class: 'card mistakes' },
      h('h3', null, `Tus fallos en esta sesión (${list.length})`),
      h('ol', { class: 'mistake-list' }, list.map(mistakeItem)),
    );
  }

  function mistakeItem({ line, idx, played }) {
    const step = line[idx];
    const start = Math.max(0, idx - 4);
    const context = line.slice(start, idx).map((s, i) => stepLabel(rep, s, i === 0, san)).join(' ');
    const ruta = line.slice(0, idx).map((s) => s.move.uci).join(',');
    return h('li', null,
      h('span', { class: 'mistake-context' }, start ? '… ' : '', context || 'Al empezar'),
      ' → ',
      h('strong', null, stepLabel(rep, step, true, san)),
      h('span', { class: 'muted small' }, played ? ` · jugaste ${san(played)}` : ' · pediste pista'),
      preview ? null : [' ', h('a', { class: 'small', href: `#/editar/${rep.id}?ruta=${ruta}`, title: 'Ver la posición en el editor' }, 'Ver')],
    );
  }

  function retryMistakes() {
    session.queue = uniqueLines([...session.mistakes.values()].map((m) => m.line));
    Object.assign(session, { correct: 0, wrong: 0, lines: 0, retry: true, mistakes: new Map() });
    grading = false;
    modeText.textContent = 'Repaso de los fallos de esta sesión: no cambia tus fechas de repaso.';
    fill(actions, baseActions);
    fill(summary);
    feedback.textContent = '';
    nextLine();
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
    fill(summary, mistakesCard());

    if (preview) return finishPreview();

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
    const mistakes = session.mistakes.size;
    fill(actions,
      nextRep
        ? h('a', { class: 'btn primary', href: `#/entrenar/${nextRep.id}?todo=1` }, `Siguiente: ${nextRep.name} →`)
        : h('a', { class: 'btn primary', href: '#/' }, 'Volver a mis repertorios'),
      mistakes
        ? h('button', { class: 'btn', onClick: retryMistakes, title: 'Vuelve a jugar ahora las líneas en las que has fallado' }, `Repasar mis fallos (${mistakes})`)
        : null,
      srs && s.fresh && session.newBudget <= 0
        ? h('button', { class: 'btn', onClick: restart }, `Aprender más jugadas nuevas (${s.fresh})`)
        : null,
      srs
        ? h('a', { class: 'btn', href: `#/entrenar/${rep.id}?modo=libre${levelQuery}` }, levelName ? `↺ Practicar el nivel ${levelName} otra vez` : '↺ Repasar todas las líneas otra vez')
        : h('button', { class: 'btn', onClick: restart }, '↺ Otra vuelta'),
      lines.length
        ? h('a', { class: 'btn', href: `#/contrarreloj/${rep.id}${course ? `?nivel=${nivel}` : ''}`, title: 'Posiciones sueltas de tu repertorio contra el reloj' }, '⏱ Contrarreloj')
        : null,
      nextRep ? h('a', { class: 'btn ghost', href: '#/' }, 'Terminar') : null,
    );
    if (srs && Number.isFinite(nextDue)) {
      fill(comment, h('p', { class: 'muted' }, `Próximo repaso de este repertorio: ${describeDue(nextDue)}.`));
    }
    // En "Repasar todo" se pasa solo al siguiente, salvo que haya fallos que quieras repasar.
    if (nextRep && !mistakes) {
      say(`${text} Ahora sigue "${nextRep.name}"…`, 'ok');
      later(() => {
        location.hash = `#/entrenar/${nextRep.id}?todo=1`;
      }, 2500);
    }
  }

  function finishPreview() {
    if (!lines.length) return say('Este curso no tiene líneas.', 'warn');
    play('done');
    say(session.wrong
      ? `Prueba terminada, con ${session.wrong} ${session.wrong === 1 ? 'fallo' : 'fallos'}.`
      : '¡Prueba terminada sin fallos! 🎉', 'ok');
    const owned = ownedFrom(previewCourse.id);
    const stats = levelStats(previewCourse);
    fill(comment, h('p', { class: 'muted' },
      `El curso tiene ${stats[0].lines} líneas en el nivel ${LEVELS[0].name}`,
      stats.length > 1 ? ` y ${stats[stats.length - 1].lines} en el ${LEVELS[stats.length - 1].name}` : '',
      '. Con la repetición espaciada aprendes unas pocas jugadas nuevas cada día.'));
    fill(actions,
      owned
        ? h('a', { class: 'btn primary', href: `#/entrenar/${owned.id}` }, 'Entrenar el curso')
        : h('button', {
            class: 'btn primary',
            onClick: () => {
              const added = addCourse(previewCourse, 0);
              toast(`"${previewCourse.name}" añadido (${LEVELS[0].name})`, 'ok');
              location.hash = `#/entrenar/${added.id}`;
            },
          }, `Añadir el curso (${LEVELS[0].name})`),
      h('button', { class: 'btn', onClick: restart }, '↺ Probar otra vez'),
      h('a', { class: 'btn ghost', href: '#/biblioteca' }, 'Volver a la biblioteca'),
    );
  }

  function restart() {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }

  function showShortcuts() {
    openDialog('Atajos de teclado',
      h('dl', { class: 'shortcuts' },
        SHORTCUTS.flatMap(([key, text]) => [h('dt', null, h('kbd', null, key)), h('dd', null, text)])),
    );
  }

  function onKey(e) {
    if (e.target.closest?.('input, textarea, dialog') || e.ctrlKey || e.metaKey || e.altKey) return;
    const key = e.key.toLowerCase();
    if (e.key === 'Enter' && !nextBtn.hidden) {
      e.preventDefault();
      nextLine();
    } else if (key === 'h') {
      showHint();
    } else if (key === 'r') {
      repeatLine();
    } else if (key === 's' && !skipBtn.disabled) {
      skipLine();
    } else if (e.key === '?') {
      showShortcuts();
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
