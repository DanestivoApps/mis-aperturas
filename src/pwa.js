// La app instalable: registra el service worker y avisa cuando hay una versión nueva publicada.
import { toast } from './dom.js';

const HOUR = 60 * 60 * 1000;

function workerVersion(worker) {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (e) => resolve(e.data);
    worker.postMessage('version', [channel.port2]);
  });
}

export function startPwa() {
  const sw = navigator.serviceWorker;
  // Si no había service worker, el cambio de abajo es la primera instalación, no una versión nueva.
  const hadWorker = Boolean(sw.controller);
  let lastCheck = Date.now();

  sw.register('./sw.js')
    .then((registration) => {
      // En el móvil la app se queda abierta en segundo plano: al volver, mira si hay novedades.
      document.addEventListener('visibilitychange', () => {
        if (document.hidden || Date.now() - lastCheck < HOUR) return;
        lastCheck = Date.now();
        registration.update().catch(() => {});
      });
    })
    .catch(() => {});

  sw.addEventListener('controllerchange', async () => {
    if (!hadWorker) return;
    // Si la página ya es esa versión (se abrió justo cuando se estaba instalando), no hay nada que avisar.
    if ((await workerVersion(sw.controller)) === __BUILD__) return;
    toast('Hay una versión nueva de la app', 'info', {
      label: 'Actualizar',
      onClick: () => location.reload(),
    }, { duration: 15000 });
  });
}
