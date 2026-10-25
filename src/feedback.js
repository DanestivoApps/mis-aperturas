// Lo que pasa al responder en cualquier entrenamiento: historial, objetivo diario y vibración.
import { toast } from './dom.js';
import { getSettings, recordAnswer } from './store.js';

// Anota la respuesta y, si con ella se llega al objetivo diario, lo celebra.
export function noteAnswer(ok) {
  const count = recordAnswer(ok);
  const goal = getSettings().dailyGoal;
  if (goal && count === goal) toast(`🎯 ¡Objetivo de hoy cumplido: ${count} jugadas!`, 'ok');
}

// Vibración corta al fallar (solo en los móviles que lo permiten).
export function buzz() {
  if (getSettings().vibrate) navigator.vibrate?.(120);
}
