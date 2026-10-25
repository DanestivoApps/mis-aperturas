// Ajustes: entrenamiento, tablero, sonido y conexión con Lichess.
import { h, toast } from '../dom.js';
import { getSettings, updateSettings, DEFAULT_SETTINGS } from '../store.js';
import { BOARD_THEMES, applyBoardTheme, createBoard } from '../board.js';
import { play } from '../sound.js';
import { TOKEN_URL } from '../lichess.js';

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
        h('div', { class: 'field' },
          h('span', null, 'Velocidad de las jugadas del rival'),
          segmented(SPEEDS, s.opponentDelay, (v) => updateSettings({ opponentDelay: v })),
        ),
        toggle('skipKnown', 'Saltar las jugadas que ya sabes',
          'En el repaso, tus jugadas que no tocan repasar se juegan solas. Más rápido, pero repasas menos.'),
        toggle('sound', 'Sonidos', 'Jugadas, aciertos y fallos.', (on) => on && play('correct')),
      ),

      h('div', { class: 'card settings-card' },
        h('h3', null, 'Notación'),
        h('div', { class: 'field' },
          h('span', null, 'Cómo se escriben las jugadas'),
          segmented(
            [
              { value: 'es', label: 'Española: Cf3, Ac4, Te1, Dd2, Rg1' },
              { value: 'en', label: 'Inglesa: Nf3, Bc4, Re1, Qd2, Kg1' },
            ],
            s.notation,
            (v) => updateSettings({ notation: v }),
          ),
        ),
        h('p', { class: 'muted small' },
          'Los PGN que importas o exportas siempre usan la inglesa, que es la que entienden Lichess y Chess.com.'),
      ),

      h('div', { class: 'card settings-card' },
        h('h3', null, 'Tablero'),
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
            updateSettings({ ...DEFAULT_SETTINGS, lichessToken: getSettings().lichessToken });
            applyBoardTheme();
            window.dispatchEvent(new HashChangeEvent('hashchange'));
          },
        }, 'Restablecer ajustes'),
      ),
    ),
  );

  const preview = createBoard(previewEl, { viewOnly: true, fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3' });
  return () => preview.destroy();
}
