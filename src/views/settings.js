// Ajustes: entrenamiento, apariencia, sincronización, copias de seguridad y Lichess.
import { h, fill, toast, download, openDialog } from '../dom.js';
import { getSettings, updateSettings, DEFAULT_SETTINGS, exportBackup, importBackup, getData } from '../store.js';
import { BOARD_THEMES, applyBoardTheme, createBoard } from '../board.js';
import { THEMES, applyTheme } from '../theme.js';
import { play } from '../sound.js';
import { TOKEN_URL } from '../lichess.js';
import { syncNow, syncError, TOKEN_URL as SYNC_TOKEN_URL } from '../sync.js';

const SPEEDS = [
  { value: 200, label: 'Rápida' },
  { value: 450, label: 'Normal' },
  { value: 900, label: 'Lenta' },
];

const RATINGS = [1000, 1200, 1400, 1600, 1800, 2000, 2200, 2500];

export function renderSettings(root) {
  const s = getSettings();
  const previewEl = h('div', { class: 'board preview-board' });

  const toggle = (key, label, help, onChange) =>
    h('label', { class: 'switch-row' },
      h('input', {
        type: 'checkbox',
        checked: s[key],
        onChange: (e) => {
          updateSettings({ [key]: e.target.checked });
          onChange?.(e.target.checked);
        },
      }),
      h('span', null, h('strong', null, label), help ? h('span', { class: 'muted small' }, help) : null),
    );

  const segmented = (options, current, onPick) => {
    const buttons = options.map((o) =>
      h('button', {
        type: 'button',
        class: `seg ${o.value === current ? 'on' : ''}`,
        onClick: (e) => {
          buttons.forEach((b) => b.classList.toggle('on', b === e.currentTarget));
          onPick(o.value);
        },
      }, o.label));
    return h('div', { class: 'segmented' }, buttons);
  };

  const tokenInput = h('input', {
    type: 'password',
    autocomplete: 'off',
    placeholder: 'lip_…',
    value: s.lichessToken,
    onChange: (e) => {
      updateSettings({ lichessToken: e.target.value.trim() });
      toast(e.target.value.trim() ? 'Token guardado' : 'Token borrado', 'ok');
    },
  });

  const minRating = Math.min(...s.explorerRatings);

  root.append(
    h('section', { class: 'page narrow' },
      h('div', { class: 'page-head' }, h('h1', null, 'Ajustes')),

      h('div', { class: 'card settings-card' },
        h('h3', null, 'Entrenamiento'),
        h('label', { class: 'field' },
          h('span', null, 'Jugadas nuevas por sesión'),
          h('input', {
            type: 'number', min: '0', max: '100', value: String(s.newPerSession),
            onChange: (e) => {
              const n = Math.max(0, Math.min(100, Number(e.target.value) || 0));
              e.target.value = n;
              updateSettings({ newPerSession: n });
            },
          }),
        ),
        h('label', { class: 'field' },
          h('span', null, 'Objetivo diario (jugadas respondidas; 0 = sin objetivo)'),
          h('input', {
            type: 'number', min: '0', max: '500', step: '5', value: String(s.dailyGoal),
            onChange: (e) => {
              const n = Math.max(0, Math.min(500, Math.round(Number(e.target.value)) || 0));
              e.target.value = n;
              updateSettings({ dailyGoal: n });
            },
          }),
        ),
        h('div', { class: 'field' },
          h('span', null, 'Velocidad de las jugadas del rival'),
          segmented(SPEEDS, s.opponentDelay, (v) => updateSettings({ opponentDelay: v })),
        ),
        toggle('showMoves', 'Ver siempre la jugada que toca',
          'Al entrenar, cada turno tuyo muestra la flecha de la jugada. También se activa con el botón «Ver jugada» junto al tablero (o la tecla V).'),
        toggle('skipKnown', 'Saltar las jugadas que ya sabes',
          'En el repaso, tus jugadas que no tocan repasar se juegan solas. Más rápido, pero repasas menos.'),
        toggle('sound', 'Sonidos', 'Jugadas, aciertos y fallos.', (on) => on && play('correct')),
        toggle('vibrate', 'Vibrar al fallar', 'En los móviles que lo permiten (Android).', (on) => on && navigator.vibrate?.(120)),
      ),

      h('div', { class: 'card settings-card' },
        h('h3', null, 'Apariencia'),
        h('div', { class: 'field' },
          h('span', null, 'Tema'),
          segmented(THEMES, s.theme, (v) => {
            updateSettings({ theme: v });
            applyTheme(v);
          }),
        ),
        h('p', { class: 'muted small' }, 'En automático, la app se pone clara u oscura según tu sistema.'),
        h('div', { class: 'field' },
          h('span', null, 'Cómo se escriben las jugadas'),
          segmented(
            [
              { value: 'es', label: 'Española (Cf3, Ac4)' },
              { value: 'en', label: 'Inglesa (Nf3, Bc4)' },
            ],
            s.notation,
            (v) => updateSettings({ notation: v }),
          ),
        ),
        h('p', { class: 'muted small' },
          'Los PGN que importas o exportas siempre usan la inglesa, que es la que entienden Lichess y Chess.com.'),
        h('div', { class: 'field' }, h('span', null, 'Colores del tablero')),
        h('div', { class: 'theme-swatches' },
          Object.entries(BOARD_THEMES).map(([id, theme]) =>
            h('button', {
              type: 'button',
              class: `swatch ${s.boardTheme === id ? 'on' : ''}`,
              title: theme.name,
              style: `--light:${theme.light};--dark:${theme.dark}`,
              onClick: (e) => {
                updateSettings({ boardTheme: id });
                applyBoardTheme(id);
                document.querySelectorAll('.swatch').forEach((b) => b.classList.toggle('on', b === e.currentTarget));
              },
            }, h('span', { class: 'swatch-board' }), theme.name),
          ),
        ),
        previewEl,
        toggle('coordinates', 'Mostrar coordenadas', null, (on) => {
          preview.set({ coordinates: on });
          preview.redrawAll();
        }),
      ),

      syncCard(),

      h('div', { class: 'card settings-card' },
        h('h3', null, 'Copia de seguridad'),
        h('p', { class: 'small' },
          'Tus repertorios y tu progreso se guardan en este navegador. Descarga una copia de vez en cuando para no perderlos (no incluye tus tokens).'),
        h('div', { class: 'actions' },
          h('button', { class: 'btn', onClick: backup, disabled: !getData().repertoires.length }, 'Descargar copia'),
          h('label', { class: 'btn' },
            'Restaurar copia…',
            h('input', { type: 'file', accept: '.json,application/json', hidden: true, onChange: restore }),
          ),
        ),
      ),

      h('div', { class: 'card settings-card' },
        h('h3', null, 'Lichess'),
        toggle('showEval', 'Mostrar la evaluación de Lichess en el editor', 'Usa la evaluación en la nube (no hace falta token).'),
        h('label', { class: 'field' },
          h('span', null, 'Token personal de Lichess (para el explorador de aperturas)'),
          tokenInput,
        ),
        h('p', { class: 'muted small' },
          'Lichess pide un token gratuito para consultar el explorador. ',
          h('a', { href: TOKEN_URL, target: '_blank', rel: 'noopener' }, 'Crea uno aquí'),
          ' sin marcar ningún permiso, cópialo y pégalo arriba. Se guarda solo en este navegador.'),
        h('div', { class: 'field' },
          h('span', null, 'Explorador "Aficionados": Elo mínimo de las partidas'),
          segmented(
            [1000, 1600, 1800, 2000, 2200].map((r) => ({ value: r, label: `${r}+` })),
            minRating,
            (v) => updateSettings({ explorerRatings: RATINGS.filter((r) => r >= v) }),
          ),
        ),
      ),

      h('div', { class: 'actions' },
        h('button', {
          class: 'btn ghost',
          onClick: () => {
            if (!confirm('¿Volver a los ajustes por defecto? (Tu token de Lichess se mantiene.)')) return;
            const keep = ['lichessToken', 'syncToken', 'syncGistId', 'lastSync', 'deviceId'];
            updateSettings({ ...DEFAULT_SETTINGS, ...Object.fromEntries(keep.map((k) => [k, getSettings()[k]])) });
            applyBoardTheme();
            applyTheme();
            window.dispatchEvent(new HashChangeEvent('hashchange'));
          },
        }, 'Restablecer ajustes'),
      ),
    ),
  );

  function backup() {
    const date = new Date().toISOString().slice(0, 10);
    download(`mis-aperturas-${date}.json`, exportBackup(), 'application/json');
  }

  async function restore(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    e.target.value = '';
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
              location.hash = '#/';
            } catch (err) {
              toast(err.message || 'No se pudo leer el archivo', 'error');
            }
          },
        }, 'Reemplazar'),
      ),
    );
  }

  // Sincronización entre dispositivos con un gist privado de GitHub.
  function syncCard() {
    const card = h('div', { class: 'card settings-card' });
    const status = h('p', { class: 'muted small', 'aria-live': 'polite' });

    const run = async (button) => {
      button.disabled = true;
      status.textContent = 'Sincronizando…';
      try {
        const { changed } = await syncNow();
        status.textContent = changed ? 'Sincronizado: han llegado cambios de otro dispositivo.' : 'Sincronizado.';
        renderCard();
      } catch (err) {
        status.textContent = err.message;
      } finally {
        button.disabled = false;
      }
    };

    function renderCard() {
      const connected = Boolean(getSettings().syncToken);
      const last = getSettings().lastSync;
      if (!connected) {
        const tokenInput = h('input', { type: 'password', autocomplete: 'off', placeholder: 'ghp_…' });
        const connectBtn = h('button', {
          class: 'btn primary',
          onClick: async (e) => {
            const token = tokenInput.value.trim();
            if (!token) return toast('Pega primero el token', 'error');
            updateSettings({ syncToken: token, syncGistId: '' });
            await run(e.currentTarget);
            if (!getSettings().lastSync) updateSettings({ syncToken: '' }); // no funcionó: no se guarda
            renderCard();
          },
        }, 'Conectar y sincronizar');
        fill(card,
          h('h3', null, 'Sincronizar entre dispositivos'),
          h('p', { class: 'small' },
            'Ten los mismos repertorios y el mismo progreso en el móvil y en el ordenador. Se guardan en un gist privado de tu cuenta de GitHub.'),
          h('ol', { class: 'small steps' },
            h('li', null, h('a', { href: SYNC_TOKEN_URL, target: '_blank', rel: 'noopener' }, 'Crea un token de GitHub'),
              ' con el permiso «gist» (ya viene marcado) y sin caducidad o con la que prefieras.'),
            h('li', null, 'Pégalo aquí y pulsa «Conectar». Haz lo mismo en tus otros dispositivos con el mismo token.'),
          ),
          h('label', { class: 'field' }, h('span', null, 'Token de GitHub'), tokenInput),
          h('div', { class: 'actions' }, connectBtn),
          status,
          h('p', { class: 'muted small' }, 'El token se guarda solo en este dispositivo y no se incluye en las copias de seguridad.'),
        );
        return;
      }
      const error = syncError();
      fill(card,
        h('h3', null, 'Sincronizar entre dispositivos'),
        h('p', { class: 'small' },
          '✓ Conectado. Se sincroniza solo al abrir la app, al volver a ella y unos segundos después de cada cambio.'),
        last ? h('p', { class: 'muted small' }, `Última sincronización: ${new Date(last).toLocaleString('es')}`) : null,
        error ? h('p', { class: 'notice warn' }, error) : null,
        h('div', { class: 'actions' },
          h('button', { class: 'btn primary', onClick: (e) => run(e.currentTarget) }, 'Sincronizar ahora'),
          h('button', {
            class: 'btn ghost',
            onClick: () => {
              if (!confirm('¿Desconectar este dispositivo? Tus datos se quedan aquí y en GitHub; solo deja de sincronizarse.')) return;
              updateSettings({ syncToken: '', syncGistId: '', lastSync: 0 });
              renderCard();
            },
          }, 'Desconectar'),
        ),
        status,
      );
    }

    renderCard();
    return card;
  }

  const preview = createBoard(previewEl, { viewOnly: true, fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3' });
  return () => preview.destroy();
}
