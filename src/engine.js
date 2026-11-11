// Stockfish en el navegador (un worker con WASM, unos 2 MB que se descargan la primera vez que juegas).
let worker = null;
let ready = null;
let queue = Promise.resolve();
let listener = null;

function start() {
  if (worker) return ready;
  worker = new Worker('./engine/stockfish-19-lite-single.js');
  worker.onmessage = (e) => listener?.(String(e.data));
  ready = new Promise((resolve, reject) => {
    worker.onerror = () => reject(new Error('No se pudo cargar el motor.'));
    listener = (line) => {
      if (line === 'uciok') resolve();
    };
    worker.postMessage('uci');
  });
  return ready;
}

export const LEVELS = {
  facil: { label: 'Fácil', skill: 1, movetime: 150 },
  medio: { label: 'Medio', skill: 8, movetime: 300 },
  fuerte: { label: 'Fuerte', skill: 20, movetime: 800 },
};

// La jugada del motor (UCI) para esta posición.
export function bestMove(fen, level = 'medio') {
  const { skill, movetime } = LEVELS[level] ?? LEVELS.medio;
  const task = queue.then(async () => {
    await start();
    return new Promise((resolve) => {
      listener = (line) => {
        if (line.startsWith('bestmove')) resolve(line.split(' ')[1]);
      };
      worker.postMessage('setoption name MultiPV value 1');
      worker.postMessage(`setoption name Skill Level value ${skill}`);
      worker.postMessage(`position fen ${fen}`);
      worker.postMessage(`go movetime ${movetime}`);
    });
  });
  queue = task.catch(() => {});
  return task;
}

// Evaluación de una posición a toda fuerza: { cp | mate (desde quien mueve), best, pv }.
// Con `multipv` > 1, además `lines`: las mejores jugadas, cada una con su evaluación y su línea.
export function analyse(fen, depth = 13, multipv = 1) {
  const task = queue.then(async () => {
    await start();
    return new Promise((resolve) => {
      const lines = [];
      listener = (line) => {
        if (line.startsWith('info') && line.includes(' pv ') && line.includes(' score ')) {
          const cp = line.match(/ score cp (-?\d+)/);
          const mate = line.match(/ score mate (-?\d+)/);
          const n = Number(line.match(/ multipv (\d+)/)?.[1] ?? 1);
          lines[n - 1] = { cp: cp ? Number(cp[1]) : null, mate: mate ? Number(mate[1]) : null, pv: line.split(' pv ')[1].trim().split(' ') };
        } else if (line.startsWith('bestmove')) {
          resolve({ ...(lines[0] ?? {}), best: line.split(' ')[1], lines: lines.filter(Boolean) });
        }
      };
      worker.postMessage(`setoption name MultiPV value ${multipv}`);
      worker.postMessage('setoption name Skill Level value 20');
      worker.postMessage(`position fen ${fen}`);
      worker.postMessage(`go depth ${depth}`);
    });
  });
  queue = task.catch(() => {});
  return task;
}

export function stopEngine() {
  worker?.postMessage('stop');
}
