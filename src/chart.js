// Gráfico de columnas sencillo (una serie) en SVG, con tooltip al pasar el ratón.
const SVG = 'http://www.w3.org/2000/svg';

function svg(tag, attrs = {}) {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// Columna con el extremo superior redondeado (4px) y la base recta.
function barPath(x, y, w, h, r = 4) {
  r = Math.min(r, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

function niceMax(value) {
  if (value <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 2.5, 5, 10]) if (step * pow >= value) return step * pow;
  return 10 * pow;
}

// data: [{ label, value, tip, axisLabel? }]
export function columnChart(container, data, { height = 180 } = {}) {
  container.classList.add('chart');
  const tooltip = document.createElement('div');
  tooltip.className = 'chart-tip';
  tooltip.hidden = true;

  const draw = () => {
    const width = container.clientWidth;
    if (!width) return;
    const pad = { top: 10, right: 6, bottom: 24, left: 30 };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;
    const max = niceMax(Math.max(...data.map((d) => d.value), 1));
    const slot = plotW / data.length;
    const barW = Math.max(2, Math.min(24, slot - 2));
    const y = (v) => pad.top + plotH - (v / max) * plotH;

    const root = svg('svg', { width, height, role: 'img' });
    for (const tick of [0, max / 2, max]) {
      const ty = y(tick);
      root.append(svg('line', { x1: pad.left, x2: width - pad.right, y1: ty, y2: ty, class: 'grid' }));
      const label = svg('text', { x: pad.left - 6, y: ty + 4, class: 'axis', 'text-anchor': 'end' });
      label.textContent = Number.isInteger(tick) ? tick : tick.toFixed(1);
      root.append(label);
    }

    data.forEach((d, i) => {
      const cx = pad.left + slot * i + slot / 2;
      if (d.value > 0) {
        root.append(svg('path', { d: barPath(cx - barW / 2, y(d.value), barW, y(0) - y(d.value)), class: 'bar' }));
      }
      if (d.axisLabel) {
        const t = svg('text', { x: cx, y: height - 6, class: 'axis', 'text-anchor': 'middle' });
        t.textContent = d.axisLabel;
        root.append(t);
      }
      // Zona de hover: toda la franja, más grande que la columna.
      const hit = svg('rect', { x: pad.left + slot * i, y: pad.top, width: slot, height: plotH, class: 'hit' });
      hit.addEventListener('pointerenter', () => {
        tooltip.hidden = false;
        tooltip.innerHTML = '';
        const title = document.createElement('strong');
        title.textContent = d.label;
        tooltip.append(title, document.createElement('br'), d.tip);
        const left = Math.min(Math.max(cx - tooltip.offsetWidth / 2, 0), width - tooltip.offsetWidth);
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${Math.max(y(d.value) - tooltip.offsetHeight - 8, 0)}px`;
        hit.classList.add('on');
      });
      hit.addEventListener('pointerleave', () => {
        tooltip.hidden = true;
        hit.classList.remove('on');
      });
      root.append(hit);
    });

    container.replaceChildren(root, tooltip);
  };

  draw();
  const ro = new ResizeObserver(draw);
  ro.observe(container);
  return () => ro.disconnect();
}
