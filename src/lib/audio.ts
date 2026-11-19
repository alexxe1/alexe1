import { AMBIENT_TRACKS, AMBIENT_VOLUME, BOOT_AUDIO, CROSSFADE_SECONDS } from '../config/audio';

/* -------------------------------------------------------------------------- */
/*  Contexto, buses y reverb                                                  */
/* -------------------------------------------------------------------------- */
let ctx: AudioContext | null = null;
let master: GainNode;
let sfxBus: GainNode;
let musicBus: GainNode;
let reverbIn: GainNode;
let muted = false;

function makeImpulse(c: AudioContext, seconds: number, decay: number): AudioBuffer {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

/** Debe llamarse desde un gesto del usuario (el botón POWER). Idempotente. */
export function initAudio(): AudioContext | null {
  if (ctx) {
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  }
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 0.9;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.ratio.value = 3;
  master.connect(comp).connect(ctx.destination);

  sfxBus = ctx.createGain();
  sfxBus.gain.value = 0.85;
  sfxBus.connect(master);
  musicBus = ctx.createGain();
  musicBus.gain.value = 1;
  musicBus.connect(master);

  const conv = ctx.createConvolver();
  conv.buffer = makeImpulse(ctx, 2.8, 2.6);
  const wet = ctx.createGain();
  wet.gain.value = 0.6;
  reverbIn = ctx.createGain();
  reverbIn.connect(conv).connect(wet).connect(master);
  return ctx;
}

export function setMuted(m: boolean) {
  muted = m;
  if (ctx) master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.05);
}

const NOTE = (n: number) => 440 * Math.pow(2, (n - 69) / 12); // MIDI -> Hz

/* -------------------------------------------------------------------------- */
/*  Voces básicas: campana cristalina y gota de agua                          */
/* -------------------------------------------------------------------------- */
interface BellOpts { dur?: number; gain?: number; send?: number; dest?: AudioNode }

function bell(freq: number, when: number, o: BellOpts = {}) {
  if (!ctx) return;
  const { dur = 1.2, gain = 0.15, send = 0.8, dest = sfxBus } = o;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(gain, when + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(gain * 0.4, when);
  g2.gain.exponentialRampToValueAtTime(0.0001, when + dur * 0.22);
  const o1 = ctx.createOscillator();
  o1.type = 'sine';
  o1.frequency.value = freq;
  const o2 = ctx.createOscillator();
  o2.type = 'sine';
  o2.frequency.value = freq * 2.76; // parcial inarmónico = timbre de campana/cristal
  o1.connect(g);
  o2.connect(g2);
  g.connect(dest);
  g2.connect(dest);
  const s = ctx.createGain();
  s.gain.value = send;
  g.connect(s);
  g2.connect(s);
  s.connect(reverbIn);
  o1.start(when);
  o2.start(when);
  o1.stop(when + dur + 0.1);
  o2.stop(when + dur + 0.1);
}

function drop(from: number, to: number, when: number, dur = 0.12, gain = 0.1) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(from, when);
  o.frequency.exponentialRampToValueAtTime(to, when + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(gain, when + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur + 0.06);
  o.connect(g);
  g.connect(sfxBus);
  const s = ctx.createGain();
  s.gain.value = 0.7;
  g.connect(s).connect(reverbIn);
  o.start(when);
  o.stop(when + dur + 0.1);
}

/* -------------------------------------------------------------------------- */
/*  SFX de interfaz                                                            */
/* -------------------------------------------------------------------------- */
const PENTA = [81, 84, 86, 89, 91, 93].map(NOTE); // E5 G#... escala abierta, sonido "agua"
let moveStep = 0;
let lastMove = 0;

let bootPad: { gain: GainNode; oscs: OscillatorNode[] } | null = null;

/* ---- Audios de arranque (mp3 propios, con reemplazo sintetizado si faltan) ---- */
const rawBoot: Partial<Record<'startup' | 'logo', ArrayBuffer>> = {};
const bootBuf: Partial<Record<'startup' | 'logo', AudioBuffer>> = {};
let bootSrc: { src: AudioBufferSourceNode; gain: GainNode } | null = null;

/** Descarga los mp3 apenas carga la página (no necesita AudioContext ni gesto del usuario). */
export function prefetchBootAudio() {
  (['startup', 'logo'] as const).forEach((k) => {
    fetch(BOOT_AUDIO[k])
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
      .then((ab) => { rawBoot[k] = ab; })
      .catch(() => undefined);
  });
}

/** Decodifica los mp3 (requiere el AudioContext ya creado por el gesto de POWER). Nunca rechaza. */
export async function decodeBootAudio(): Promise<void> {
  if (!ctx) return;
  const c = ctx;
  await Promise.all(
    (['startup', 'logo'] as const).map(async (k) => {
      if (bootBuf[k]) return;
      // si la descarga todavía no terminó, esperar un poco
      for (let i = 0; i < 20 && !rawBoot[k]; i++) await new Promise((r) => setTimeout(r, 100));
      const ab = rawBoot[k];
      if (!ab) return;
      try {
        bootBuf[k] = await c.decodeAudioData(ab.slice(0));
      } catch {
        /* formato no soportado → se usa el sonido sintetizado */
      }
    }),
  );
}

/** Duración (s) de los audios de arranque, o null si no se cargaron. */
export const bootDurations = () => ({ startup: bootBuf.startup?.duration ?? null, logo: bootBuf.logo?.duration ?? null });

function playBoot(k: 'startup' | 'logo'): boolean {
  const buf = bootBuf[k];
  if (!ctx || !buf) return false;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const gain = ctx.createGain();
  gain.gain.value = 1;
  src.connect(gain).connect(sfxBus);
  src.start();
  if (k === 'startup') bootSrc = { src, gain };
  return true;
}

export const sfx = {
  move() {
    if (!ctx) return;
    const now = ctx.currentTime;
    if (now - lastMove < 0.04) return;
    lastMove = now;
    moveStep = (moveStep + 1 + Math.floor(Math.random() * 2)) % PENTA.length;
    bell(PENTA[moveStep], now, { dur: 0.55, gain: 0.07, send: 0.9 });
    drop(900, 1500, now, 0.05, 0.025);
  },
  confirm() {
    if (!ctx) return;
    const t = ctx.currentTime;
    drop(380, 1100, t, 0.14, 0.09);
    bell(NOTE(88), t + 0.03, { dur: 0.9, gain: 0.11 });
    bell(NOTE(95), t + 0.1, { dur: 1.3, gain: 0.1 });
  },
  back() {
    if (!ctx) return;
    const t = ctx.currentTime;
    bell(NOTE(91), t, { dur: 0.6, gain: 0.08 });
    bell(NOTE(83), t + 0.07, { dur: 0.9, gain: 0.08 });
    drop(900, 300, t, 0.15, 0.05);
  },
  error() {
    if (!ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(190, t);
    o.frequency.exponentialRampToValueAtTime(130, t + 0.16);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g).connect(sfxBus);
    o.start(t);
    o.stop(t + 0.25);
  },
  /** Encendido: clic seco agudo + chirrido ascendente de tres notas + destello cristalino. */
  power() {
    if (!ctx) return;
    const t = ctx.currentTime;
    // clic de relé (ruido filtrado en agudos)
    const len = Math.floor(ctx.sampleRate * 0.03);
    const nb = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = nb.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
    const n = ctx.createBufferSource();
    n.buffer = nb;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 3500;
    const ng = ctx.createGain();
    ng.gain.value = 0.3;
    n.connect(hp).connect(ng).connect(sfxBus);
    n.start(t);
    // chirrido ascendente: B6 → E7 → G#7
    [[1976, 0.0], [2637, 0.075], [3322, 0.15]].forEach(([f, dt], i) => {
      const o = ctx!.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(f * 0.97, t + dt);
      o.frequency.exponentialRampToValueAtTime(f, t + dt + 0.03);
      const g = ctx!.createGain();
      const end = i === 2 ? 0.45 : 0.1;
      g.gain.setValueAtTime(0.0001, t + dt);
      g.gain.exponentialRampToValueAtTime(0.11, t + dt + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dt + end);
      o.connect(g).connect(sfxBus);
      const s2 = ctx!.createGain();
      s2.gain.value = 0.6;
      g.connect(s2).connect(reverbIn);
      o.start(t + dt);
      o.stop(t + dt + end + 0.05);
    });
    bell(NOTE(103), t + 0.17, { dur: 1.1, gain: 0.05, send: 1 });
  },
  /** Colchón de acordes que crece durante el recorrido de las torres. */
  bootStart() {
    if (!ctx || bootPad || bootSrc) return;
    if (playBoot('startup')) return;
    const t = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.16, t + 7);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(260, t);
    lp.frequency.exponentialRampToValueAtTime(3200, t + 12);
    gain.connect(lp);
    lp.connect(sfxBus);
    const send = ctx.createGain();
    send.gain.value = 0.9;
    lp.connect(send).connect(reverbIn);
    const oscs: OscillatorNode[] = [];
    [38, 50, 57, 62, 66, 69, 73].forEach((m, i) => {
      for (const det of [-6, 6]) {
        const o = ctx!.createOscillator();
        o.type = i < 2 ? 'triangle' : 'sine';
        o.frequency.value = NOTE(m);
        o.detune.value = det;
        const vg = ctx!.createGain();
        vg.gain.value = i < 2 ? 0.7 : 0.35;
        o.connect(vg).connect(gain);
        o.start(t);
        oscs.push(o);
      }
    });
    bootPad = { gain, oscs };
  },
  /** Destello de luz + logo: racimo de campanas con brillos. */
  bootLogo() {
    if (!ctx) return;
    const t = ctx.currentTime;
    if (bootSrc) {
      bootSrc.gain.gain.setTargetAtTime(0, t, 0.05);
      const old = bootSrc.src;
      setTimeout(() => { try { old.stop(); } catch { /* ya detenido */ } }, 300);
      bootSrc = null;
    }
    if (playBoot('logo')) return;
    if (bootPad) {
      bootPad.gain.gain.cancelScheduledValues(t);
      bootPad.gain.gain.setValueAtTime(bootPad.gain.gain.value, t);
      bootPad.gain.gain.exponentialRampToValueAtTime(0.0001, t + 4.5);
      const pad = bootPad;
      setTimeout(() => pad.oscs.forEach((o) => { try { o.stop(); } catch { /* ya detenido */ } }), 5000);
      bootPad = null;
    }
    [62, 69, 74, 78, 81, 86].forEach((m, i) => bell(NOTE(m), t + i * 0.06, { dur: 3.6, gain: 0.12, send: 1 }));
    for (let i = 0; i < 12; i++) bell(NOTE(86 + Math.floor(Math.random() * 12)), t + 0.4 + Math.random() * 2.2, { dur: 1.4, gain: 0.04, send: 1 });
    drop(200, 2400, t, 0.8, 0.07);
  },
  /** Corta el colchón del arranque (si el usuario saltea la intro). */
  bootStop() {
    if (!ctx) return;
    const t = ctx.currentTime;
    if (bootSrc) {
      bootSrc.gain.gain.setTargetAtTime(0, t, 0.08);
      const old = bootSrc.src;
      setTimeout(() => { try { old.stop(); } catch { /* ya detenido */ } }, 500);
      bootSrc = null;
    }
    if (!bootPad) return;
    bootPad.gain.gain.cancelScheduledValues(t);
    bootPad.gain.gain.setValueAtTime(bootPad.gain.gain.value, t);
    bootPad.gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
    const pad = bootPad;
    setTimeout(() => pad.oscs.forEach((o) => { try { o.stop(); } catch { /* ya detenido */ } }), 1000);
    bootPad = null;
  },
};

/* -------------------------------------------------------------------------- */
/*  Música ambiental: playlist con crossfade o ambiente generativo            */
/* -------------------------------------------------------------------------- */
type Listener = () => void;
const listeners = new Set<Listener>();
let ambientTitle = '';
const setTitle = (t: string) => {
  ambientTitle = t;
  listeners.forEach((l) => l());
};
export const ambientStore = {
  subscribe: (l: Listener) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getTitle: () => ambientTitle,
  hasPlaylist: () => AMBIENT_TRACKS.length > 0,
  canSkip: () => AMBIENT_TRACKS.length > 1,
};

let ambientRunning = false;
let stopAmbientImpl: (() => void) | null = null;
let skipImpl: (() => void) | null = null;

export function startAmbient() {
  if (!ctx || ambientRunning) return;
  ambientRunning = true;
  if (AMBIENT_TRACKS.length > 0) startPlaylist();
  else startGenerative();
}
export function stopAmbient() {
  stopAmbientImpl?.();
  stopAmbientImpl = null;
  skipImpl = null;
  ambientRunning = false;
}
export function nextAmbientTrack() {
  skipImpl?.();
}

function startPlaylist() {
  const c = ctx!;
  const F = CROSSFADE_SECONDS;
  const els = [new Audio(), new Audio()];
  const gains = els.map((el) => {
    el.preload = 'auto';
    const g = c.createGain();
    g.gain.value = 0;
    c.createMediaElementSource(el).connect(g);
    return g;
  });
  const bus = c.createGain();
  bus.gain.value = AMBIENT_VOLUME;
  bus.connect(musicBus);
  gains.forEach((g) => {
    g.disconnect();
    g.connect(bus);
  });

  let active = 0;
  let idx = 0;
  let fading = false;

  const load = (slot: number, track: number) => {
    els[slot].src = AMBIENT_TRACKS[track].src;
    els[slot].currentTime = 0;
    void els[slot].play().catch(() => undefined);
  };
  const crossfade = () => {
    if (fading) return;
    fading = true;
    const next = (idx + 1) % AMBIENT_TRACKS.length;
    const other = 1 - active;
    const now = c.currentTime;
    load(other, next);
    gains[other].gain.cancelScheduledValues(now);
    gains[other].gain.setValueAtTime(0, now);
    gains[other].gain.linearRampToValueAtTime(1, now + F);
    gains[active].gain.cancelScheduledValues(now);
    gains[active].gain.setValueAtTime(gains[active].gain.value, now);
    gains[active].gain.linearRampToValueAtTime(0, now + F);
    const old = active;
    setTitle(AMBIENT_TRACKS[next].title ?? AMBIENT_TRACKS[next].src);
    setTimeout(() => {
      els[old].pause();
      active = other;
      idx = next;
      fading = false;
    }, F * 1000 + 100);
  };

  load(0, 0);
  gains[0].gain.setValueAtTime(0, c.currentTime);
  gains[0].gain.linearRampToValueAtTime(1, c.currentTime + 2.5);
  setTitle(AMBIENT_TRACKS[0].title ?? AMBIENT_TRACKS[0].src);

  const timer = window.setInterval(() => {
    const el = els[active];
    if (!fading && el.duration && isFinite(el.duration) && el.duration - el.currentTime < F + 0.3) crossfade();
  }, 250);
  skipImpl = crossfade;
  stopAmbientImpl = () => {
    clearInterval(timer);
    els.forEach((e) => e.pause());
    setTitle('');
  };
}

function startGenerative() {
  const c = ctx!;
  const bus = c.createGain();
  bus.gain.value = AMBIENT_VOLUME * 0.5;
  bus.connect(musicBus);
  const rv = c.createGain();
  rv.gain.value = 0.9;
  bus.connect(rv).connect(reverbIn);
  setTitle('~');

  // Acordes suaves (Dmaj9 / Bm9 / Gmaj7 / Asus2) en la misma tonalidad que el arranque
  const chords = [
    [50, 57, 61, 64, 69],
    [47, 54, 57, 62, 66],
    [43, 50, 54, 59, 62],
    [45, 52, 57, 59, 64],
  ];
  let ci = 0;
  const voices: OscillatorNode[] = [];

  const playChord = () => {
    const t = c.currentTime;
    const chord = chords[ci++ % chords.length];
    chord.forEach((m, i) => {
      const o = c.createOscillator();
      o.type = i === 0 ? 'triangle' : 'sine';
      o.frequency.value = NOTE(m);
      o.detune.value = (Math.random() - 0.5) * 10;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(i === 0 ? 0.1 : 0.06, t + 4);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 11);
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 900 + i * 220;
      o.connect(g).connect(lp).connect(bus);
      o.start(t);
      o.stop(t + 11.5);
      voices.push(o);
      o.onended = () => {
        const k = voices.indexOf(o);
        if (k >= 0) voices.splice(k, 1);
      };
    });
  };
  const sparkle = () => {
    const base = chords[(ci + 3) % chords.length];
    const m = base[1 + Math.floor(Math.random() * (base.length - 1))] + 24;
    bell(NOTE(m), c.currentTime, { dur: 2.2, gain: 0.05, send: 1, dest: bus });
  };

  playChord();
  const t1 = window.setInterval(playChord, 8000);
  let t2 = window.setTimeout(function tick() {
    sparkle();
    t2 = window.setTimeout(tick, 2500 + Math.random() * 4500);
  }, 2000);
  stopAmbientImpl = () => {
    clearInterval(t1);
    clearTimeout(t2);
    bus.gain.setTargetAtTime(0, c.currentTime, 0.4);
    setTimeout(() => voices.forEach((o) => { try { o.stop(); } catch { /* ya detenido */ } }), 1500);
    setTitle('');
  };
}
