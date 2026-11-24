import { EGG_PROBABILITY, VISITED_KEY } from '../config/easter';

/**
 * Decide si esta vez sale el RSOD. Se llama al apretar POWER (así quien abre la página y no enciende
 * la consola sigue siendo "primera vez"). Si el navegador bloquea localStorage → tratado como primera visita.
 */
export function decideEgg(): boolean {
  let returning = false;
  try {
    returning = localStorage.getItem(VISITED_KEY) === '1';
    localStorage.setItem(VISITED_KEY, '1');
  } catch {
    /* sin almacenamiento: no se puede saber si es la primera vez → no hay easter egg */
  }
  const flag = new URLSearchParams(window.location.search).get('rsod');
  if (flag === '1') return true;
  if (flag === '0') return false;
  if (!returning) return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  return Math.random() < EGG_PROBABILITY;
}
