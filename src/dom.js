// Utilidades mínimas de DOM.

export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value == null || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'value') el.value = value;
    else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value);
    else el.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    el.append(child instanceof Node ? child : String(child));
  }
  return el;
}

// Como el.replaceChildren, pero ignorando null/false (que el DOM convertiría en texto).
export function fill(el, ...children) {
  el.replaceChildren(...children.flat(Infinity).filter((c) => c != null && c !== false));
}

let toastTimer;
// Aviso flotante. Con `action` ({ label, onClick }) muestra un botón, p. ej. "Deshacer".
export function toast(message, kind = 'info', action = null) {
  let el = document.getElementById('toast');
  if (!el) {
    el = h('div', { id: 'toast', role: 'status' });
    document.body.append(el);
  }
  const hide = () => el.classList.remove('show', 'has-action');
  fill(el,
    h('span', null, message),
    action
      ? h('button', {
          class: 'toast-action',
          onClick: () => {
            hide();
            action.onClick();
          },
        }, action.label)
      : null,
  );
  el.dataset.kind = kind;
  el.classList.add('show');
  el.classList.toggle('has-action', Boolean(action));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hide, action ? 7000 : 2600);
}

export function download(filename, text, mime = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type: `${mime};charset=utf-8` }));
  const a = h('a', { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function safeFilename(name) {
  return name.replace(/[\\/:*?"<>|]+/g, '').trim() || 'repertorio';
}

// Abre un <dialog> con el contenido dado; devuelve una función para cerrarlo.
export function openDialog(title, ...content) {
  closeDialogs();
  const dialog = h(
    'dialog',
    { class: 'dialog' },
    h('div', { class: 'dialog-head' },
      h('h2', null, title),
      h('button', { class: 'icon-btn', 'aria-label': 'Cerrar', onClick: () => dialog.close() }, '✕'),
    ),
    ...content,
  );
  dialog.addEventListener('close', () => dialog.remove());
  document.body.append(dialog);
  dialog.showModal();
  return () => {
    dialog.close();
    dialog.remove();
  };
}

export function closeDialogs() {
  document.querySelectorAll('dialog').forEach((d) => d.remove());
}

// Menú desplegable (⋯). `items`: { label, onClick?, href?, title?, danger? } o 'sep' para separar grupos.
export function dropdown(summary, items, { label = 'Más opciones', className = '' } = {}) {
  const details = h('details', { class: `menu ${className}` });
  const close = () => (details.open = false);
  const list = h('div', { class: 'menu-list', role: 'menu' },
    items.filter(Boolean).map((item) => {
      if (item === 'sep') return h('hr', { class: 'menu-sep' });
      const props = {
        class: item.danger ? 'danger' : null,
        title: item.title,
        role: 'menuitem',
        onClick: (e) => {
          close();
          item.onClick?.(e);
        },
      };
      return item.href
        ? h('a', { ...props, href: item.href, target: item.external ? '_blank' : null, rel: item.external ? 'noopener' : null }, item.label)
        : h('button', { ...props, type: 'button' }, item.label);
    }),
  );
  details.append(h('summary', { class: 'menu-btn', 'aria-label': label, title: label }, summary), list);
  return details;
}
