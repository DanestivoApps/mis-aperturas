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
      worker.postMessage(`setoption name Skill Level value ${skill}`);
      worker.postMessage(`position fen ${fen}`);
      worker.postMessage(`go movetime ${movetime}`);
    });
  });
  queue = task.catch(() => {});
  return task;
}

// Evaluación de una posición a toda fuerza: { cp | mate (desde quien mueve), best, pv }.
export function analyse(fen, depth = 13) {
  const task = queue.then(async () => {
    await start();
    return new Promise((resolve) => {
      let last = {};
      listener = (line) => {
        if (line.startsWith('info') && line.includes(' pv ') && line.includes(' score ')) {
          const cp = line.match(/ score cp (-?\d+)/);
          const mate = line.match(/ score mate (-?\d+)/);
          last = { cp: cp ? Number(cp[1]) : null, mate: mate ? Number(mate[1]) : null, pv: line.split(' pv ')[1].trim().split(' ') };
        } else if (line.startsWith('bestmove')) {
          resolve({ ...last, best: line.split(' ')[1] });
        }
      };
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
