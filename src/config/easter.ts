/**
 * Easter egg: el "RSOD" (pantalla roja) del arranque.
 *
 * Reglas:
 *  - En la PRIMERA visita (no hay marca en localStorage) NUNCA aparece, para cuidar la primera impresión.
 *  - Desde la segunda visita, cada vez que se toca POWER hay una chance de EGG_PROBABILITY.
 *  - Si sale, el recorrido (torres + zoom) es IDÉNTICO al normal, para que coincida con ps2_startup.mp3.
 *    La diferencia empieza en la pantalla negra: dura EGG_BLACK_SECONDS (en vez de ~1 s) y después
 *    se funde al RSOD, que dura lo que dura public/audio/rsod.mp3. Luego sigue con el logo y el menú como siempre.
 *  - Con prefers-reduced-motion no se activa solo.
 *
 * Para probar:  ?rsod=1 lo fuerza (aunque sea tu primera vez)   ·   ?rsod=0 lo apaga.
 */
export const EGG_PROBABILITY = 0.15;
export const EGG_BLACK_SECONDS = 3; // pantalla negra antes del RSOD (la normal antes del logo dura ~1 s)
export const RSOD_SECONDS = 9; // sólo se usa si falta public/audio/rsod.mp3: con el audio, el RSOD dura lo que dura el audio (~9 s)
export const VISITED_KEY = 'alexe1.visited';
