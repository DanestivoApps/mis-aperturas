// Repetición espaciada (variante sencilla de SM-2).
// Tarjeta: { reps, interval (días), ease, due (ms), lapses, last }

const DAY = 24 * 60 * 60 * 1000;
// Margen para que un repaso "de mañana" ya cuente aunque vuelvas a la misma hora.
const SLACK = 4 * 60 * 60 * 1000;

export function newCard(now = Date.now()) {
  return { reps: 0, interval: 0, ease: 2.5, due: now, lapses: 0, last: now };
}

export function gradeCorrect(card, now = Date.now()) {
  if (card.reps === 0) card.interval = 1;
  else if (card.reps === 1) card.interval = 3;
  else card.interval = Math.round(card.interval * card.ease);
  card.reps += 1;
  card.due = now + card.interval * DAY - SLACK;
  card.last = now;
  return card;
}

export function gradeWrong(card, now = Date.now()) {
  card.lapses += 1;
  card.reps = 0;
  card.interval = 0;
  card.ease = Math.max(1.3, card.ease - 0.2);
  card.due = now;
  card.last = now;
  return card;
}

export function isDue(card, now = Date.now()) {
  return Boolean(card) && card.due <= now;
}

// "hoy", "mañana", "en 5 días"...
export function describeDue(ms, now = Date.now()) {
  const diff = ms - now;
  if (diff <= 0) return 'ahora';
  const hours = diff / (60 * 60 * 1000);
  if (hours < 1) return 'en menos de una hora';
  if (hours < 20) return `en ${Math.round(hours)} h`;
  const days = Math.round(diff / DAY);
  if (days <= 1) return 'mañana';
  return `en ${days} días`;
}
