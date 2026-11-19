/**
 * Música ambiental: poné tus archivos en /public/audio y listalos acá.
 * Se reproducen en bucle (playlist circular) con crossfade suave entre pistas.
 *
 *   export const AMBIENT_TRACKS: AmbientTrack[] = [
 *     { src: './audio/ambient-1.mp3', title: 'Ambient I' },
 *     { src: './audio/ambient-2.ogg', title: 'Ambient II' },
 *   ];
 *
 * Si el array está vacío se usa un ambiente generativo sintetizado con Web Audio.
 */
export interface AmbientTrack {
  src: string;
  title?: string;
}

export const AMBIENT_TRACKS: AmbientTrack[] = [];

export const AMBIENT_VOLUME = 0.55; // volumen relativo de la música ambiental (0..1)
export const CROSSFADE_SECONDS = 4;

/**
 * Audios del arranque (PS2). Poné los archivos en /public/audio con EXACTAMENTE estos nombres
 * (o cambiá las rutas acá):
 *
 *   public/audio/ps2_startup.mp3  → suena durante el recorrido de las torres (~10,2 s).
 *                                   La duración real del archivo marca el ritmo de TODA la intro:
 *                                   si lo reemplazás por otro más largo/corto, la animación se ajusta sola.
 *   public/audio/ps2_logo.mp3     → suena cuando aparece el logo + "alexe1" (~0,9 s).
 *
 * Si falta algún archivo, se usa un sonido sintetizado de reemplazo y la intro dura ~10 s.
 */
export const BOOT_AUDIO = {
  startup: './audio/ps2_startup.mp3',
  logo: './audio/ps2_logo.mp3',
};
