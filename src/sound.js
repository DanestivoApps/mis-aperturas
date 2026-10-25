// Sonidos sintetizados con Web Audio (sin archivos externos).
import { getSettings } from './store.js';

let ctx;

function audio() {
  if (!ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, start, duration, { type = 'sine', gain = 0.15, slide } = {}) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + start;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t0 + duration);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(amp).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

const SOUNDS = {
  move: () => tone(180, 0, 0.09, { type: 'triangle', gain: 0.25, slide: 90 }),
  capture: () => {
    tone(260, 0, 0.07, { type: 'square', gain: 0.08, slide: 120 });
    tone(140, 0.02, 0.1, { type: 'triangle', gain: 0.22, slide: 70 });
  },
  correct: () => {
    tone(660, 0, 0.12, { gain: 0.1 });
    tone(990, 0.08, 0.18, { gain: 0.1 });
  },
  wrong: () => tone(150, 0, 0.28, { type: 'sawtooth', gain: 0.06, slide: 110 }),
  done: () => {
    tone(523, 0, 0.14, { gain: 0.09 });
    tone(659, 0.1, 0.14, { gain: 0.09 });
    tone(784, 0.2, 0.26, { gain: 0.09 });
  },
};

export function play(name) {
  if (!getSettings().sound) return;
  try {
    SOUNDS[name]?.();
  } catch {
    // Sin audio disponible: no pasa nada.
  }
}

export function playMove(move) {
  play(move?.captured ? 'capture' : 'move');
}
