import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { CommitData } from '../lib/commits';
import { bootDurations, sfx } from '../lib/audio';
import { EGG_BLACK_SECONDS } from '../config/easter';
import { useStore } from '../store';
import { GlowPoints } from './GlowPoints';
import { WispTrails } from './WispTrails';

/**
 * Intro al estilo del arranque de PS2, sincronizada con ps2_startup.mp3 (su duración manda):
 *   1) vista de pájaro del campo de torres completo (en horizontal), acercándose muy de a poco;
 *   2) avance cada vez más rápido hacia el CENTRO de la "ciudad", entrando por la avenida central;
 *      mientras tanto unas pocas luces de colores recorren las torres;
 *   3) cuando está muy cerca, fundido a negro (lo resuelve el DOM) y, ~1 s después, aparece el logo.
 *
 * Easter egg (ver config/easter.ts): el recorrido es idéntico (así coincide con el audio). La diferencia es que
 * la pantalla negra dura EGG_BLACK_SECONDS y después aparece el RSOD en vez del logo.
 */
const FALLBACK_DURATION = 10.24;
const SP = 1.25; // separación entre torres
const MAX_H = 10;
const DASH_START = 8; // segundo del audio en que la cámara arranca el dash hacia el centro
const RISE_SECONDS = 1.9; // las torres brotan del suelo todas a la vez
const CENTER = new THREE.Vector3(0, 1.5, 0); // centro de la ciudad: el cruce de las dos avenidas vacías

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** 52 semanas → 4 bloques de 13 semanas (un trimestre c/u) en 2x2, con un pasillo en cruz entre ellos. */
function towerPosition(week: number, weekday: number) {
  const q = Math.floor(week / 13);
  const col = (q % 2) * 14 + (week % 13);
  const row = Math.floor(q / 2) * 8 + weekday;
  return { x: (col - 13) * SP, z: (row - 7) * SP };
}

/** Tiempos de la intro (s). Iguales con y sin easter egg; el egg sólo alarga la pantalla negra final. */
export interface Timeline { D: number; base: number; dashStart: number; dashLen: number; end: number; egg: boolean; blackSeconds: number }
export function makeTimeline(D: number, egg: boolean): Timeline {
  const base = Math.min(DASH_START, 0.8 * D); // si el audio fuera más corto, el dash arranca al 80%
  const dashLen = D - base;
  const dashStart = base;
  return { D, base, dashStart, dashLen, end: dashStart + dashLen, egg, blackSeconds: egg ? EGG_BLACK_SECONDS : 1.1 };
}

/**
 * Trayectoria de cámara: siempre mirando al centro de la ciudad, desde el lado +z (así las semanas
 * corren de izquierda a derecha y el campo queda en horizontal). Se acerca por una recta que baja.
 */
export function cameraPath(t: number, tl: Timeline, out: { pos: THREE.Vector3; fov: number; a: number }) {
  const u2 = clamp01((t - tl.dashStart) / tl.dashLen);
  const a = 0.12 * u2 + 0.88 * Math.pow(u2, 2.2); // el dash arranca a la velocidad de la aproximación y se dispara hacia el final
  let dist: number, elev: number;
  if (t < tl.dashStart) {
    const u1 = clamp01(t / tl.base);
    dist = 37 - 9 * u1; // todo el campo a la vista, muy despacio
    elev = 70 - 6 * u1;
  } else {
    dist = 28 - 24 * a; // se mete hacia el centro
    elev = 64 - 36 * a; // y baja hasta quedar entre las torres
  }
  const el = THREE.MathUtils.degToRad(elev);
  out.pos.set(0.8 * Math.pow(1 - a, 2) * Math.sin(t * 0.5), CENTER.y + dist * Math.sin(el), CENTER.z + dist * Math.cos(el));
  out.fov = 48 + 30 * Math.pow(a, 1.5);
  out.a = a;
}

/* ---- Pocas luces de colores (4) que recorren la ciudad, con estela ---- */
const WISPS = [
  { color: '#ff3b6b', rx: 13, rz: 7.5, y: 4.5, amp: 2.5, w: 0.62, ph: 0.0, bob: 1.3 },
  { color: '#ffd23f', rx: 9, rz: 5.5, y: 6.5, amp: 2.0, w: -0.8, ph: 2.1, bob: 1.7 },
  { color: '#3bff9d', rx: 15, rz: 8.5, y: 3.5, amp: 2.0, w: 0.5, ph: 4.0, bob: 1.1 },
  { color: '#3ba7ff', rx: 11, rz: 6.5, y: 5.5, amp: 3.0, w: -0.7, ph: 5.3, bob: 1.5 },
];
export const WISP_COLORS = WISPS.map((w) => w.color);

function wispAt(i: number, tau: number, out: THREE.Vector3) {
  const w = WISPS[i];
  const ang = w.ph + tau * w.w;
  out.set(Math.cos(ang) * w.rx, w.y + Math.sin(tau * w.bob + w.ph) * w.amp, Math.sin(ang) * w.rz);
}

const BEAMS = [
  { x: -11, z: -6, color: '#3d7bff', ph: 0.0 },
  { x: -4, z: 5, color: '#31d6ff', ph: 1.7 },
  { x: 3, z: -4, color: '#6a5cff', ph: 3.1 },
  { x: 9, z: 6, color: '#3d7bff', ph: 4.4 },
  { x: 14, z: -3, color: '#31d6ff', ph: 5.2 },
];

function Beam({ color, phase, x, z }: { color: string; phase: number; x: number; z: number }) {
  const group = useRef<THREE.Group>(null);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color(color) }, uTime: { value: 0 }, uPhase: { value: phase } },
        vertexShader: `
          varying float vH; varying vec3 vN; varying vec3 vV;
          void main(){
            vH = clamp((position.y + 25.0) / 50.0, 0.0, 1.0);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal);
            vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          uniform vec3 uColor; uniform float uTime; uniform float uPhase;
          varying float vH; varying vec3 vN; varying vec3 vV;
          void main(){
            float f = pow(abs(dot(normalize(vN), normalize(vV))), 1.7);
            float a = f * (0.1 + 0.9 * pow(vH, 1.6)) * 0.34 * (0.8 + 0.2 * sin(uTime * 0.9 + uPhase));
            gl_FragColor = vec4(uColor, a);
          }`,
      }),
    [color, phase],
  );
  const geo = useMemo(() => new THREE.CylinderGeometry(0.12, 2.6, 50, 28, 1, true), []);
  useEffect(() => () => { mat.dispose(); geo.dispose(); }, [mat, geo]);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    mat.uniforms.uTime.value = t;
    if (!group.current) return;
    group.current.position.set(x, 50, z);
    group.current.rotation.z = Math.sin(t * 0.25 + phase) * 0.18;
    group.current.rotation.x = Math.cos(t * 0.2 + phase) * 0.1;
  });
  return (
    <group ref={group}>
      <mesh geometry={geo} material={mat} position={[0, -25, 0]} />
    </group>
  );
}

interface Props {
  data: CommitData;
  onPhase: (p: 'black' | 'logo' | 'rsod') => void;
}

export function IntroScene({ data, onPhase }: Props) {
  const body = useRef<THREE.InstancedMesh>(null);
  const caps = useRef<THREE.InstancedMesh>(null);
  const timeRef = useRef({ t: 0, D: FALLBACK_DURATION, end: FALLBACK_DURATION });
  const tlRef = useRef<Timeline>(makeTimeline(FALLBACK_DURATION, false));
  const [done, setDone] = useState(false);
  const st = useRef({ t0: -1, D: FALLBACK_DURATION, black: false, logo: false, laidOut: false });
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const path = useMemo(() => ({ pos: new THREE.Vector3(), fov: 48, a: 0 }), []);
  const count = data.days.length;

  const towers = useMemo(
    () =>
      data.days.map((d) => {
        const p = towerPosition(d.week, d.weekday);
        return { x: p.x, z: p.z, level: d.count / data.max, wob: Math.sin(d.week * 12.9898 + d.weekday * 78.233) * 0.5 + 0.5 };
      }),
    [data],
  );

  const bodyGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(0.8, 1, 0.8);
    g.translate(0, 0.5, 0);
    const pos = g.attributes.position;
    const col = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const v = 0.18 + 0.82 * pos.getY(i); // degradé: base oscura → tope brillante
      col.set([v, v, v], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, []);
  const capGeo = useMemo(() => new THREE.BoxGeometry(0.86, 0.05, 0.86), []);
  const bodyMat = useMemo(() => new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.62, blending: THREE.AdditiveBlending, depthWrite: false }), []);
  const capMat = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }), []);
  useEffect(() => () => { bodyGeo.dispose(); capGeo.dispose(); bodyMat.dispose(); capMat.dispose(); }, [bodyGeo, capGeo, bodyMat, capMat]);

  // Color por torre (una sola vez): azul → cian → blanco según los commits del día
  useLayoutEffect(() => {
    const low = new THREE.Color('#2a47ff');
    const mid = new THREE.Color('#2fd2ff');
    const hi = new THREE.Color('#f2fbff');
    const c = new THREE.Color();
    towers.forEach((tw, i) => {
      const l = tw.level;
      if (l < 0.5) c.copy(low).lerp(mid, l / 0.5);
      else c.copy(mid).lerp(hi, (l - 0.5) / 0.5);
      c.multiplyScalar(0.32 + 0.95 * Math.sqrt(l));
      body.current?.setColorAt(i, c);
      c.copy(mid).lerp(hi, 0.4 + 0.6 * l).multiplyScalar(0.55 + 0.8 * Math.sqrt(l));
      caps.current?.setColorAt(i, c);
    });
    if (body.current?.instanceColor) body.current.instanceColor.needsUpdate = true;
    if (caps.current?.instanceColor) caps.current.instanceColor.needsUpdate = true;
  }, [towers]);

  const layout = (t: number) => {
    if (!body.current || !caps.current) return;
    for (let i = 0; i < count; i++) {
      const tw = towers[i];
      const u = clamp01(t / RISE_SECONDS);
      const grow = 1 - Math.pow(1 - u, 3); // todas juntas, de abajo hacia arriba, frenando al llegar
      const h = Math.max(0.001, (0.16 + Math.pow(tw.level, 0.72) * MAX_H) * grow);
      dummy.position.set(tw.x, 0, tw.z);
      dummy.scale.set(1, h, 1);
      dummy.updateMatrix();
      body.current.setMatrixAt(i, dummy.matrix);
      dummy.position.set(tw.x, h, tw.z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      caps.current.setMatrixAt(i, dummy.matrix);
    }
    body.current.instanceMatrix.needsUpdate = true;
    caps.current.instanceMatrix.needsUpdate = true;
  };

  useFrame((state) => {
    const s = st.current;
    if (s.t0 < 0) {
      s.t0 = state.clock.elapsedTime;
      s.D = bootDurations().startup ?? FALLBACK_DURATION;
      tlRef.current = makeTimeline(s.D, useStore.getState().egg);
      sfx.bootStart(); // arranca ps2_startup.mp3 junto con el primer frame
    }
    const t = state.clock.elapsedTime - s.t0;
    const tl = tlRef.current;
    const end = tl.end;

    /* ---- Cámara ---- */
    cameraPath(t, tl, path);
    const cam = state.camera as THREE.PerspectiveCamera;
    cam.position.copy(path.pos);
    cam.lookAt(CENTER);
    cam.rotateZ(path.a * 0.12 * Math.sin(t * 1.9)); // ligero vaivén al lanzarse
    cam.fov = path.fov;
    cam.updateProjectionMatrix();

    /* ---- Torres ---- */
    if (t < RISE_SECONDS + 0.1) layout(t);
    else if (!s.laidOut) { layout(10); s.laidOut = true; }
    const bright = 1 + 1.3 * smooth(end - 2.6, end - 0.5, t);
    bodyMat.color.setScalar(bright);
    capMat.color.setScalar(bright);

    timeRef.current.t = t;
    timeRef.current.D = tl.D;
    timeRef.current.end = end;

    /* ---- Fases (el DOM hace el fundido a negro y el logo) ---- */
    if (!s.black && t >= end - 0.45) { s.black = true; onPhase('black'); }
    // La pantalla negra empieza en end - 0.45. Normal: ~1 s en negro antes del logo. Easter egg: EGG_BLACK_SECONDS antes del RSOD.
    if (!s.logo && t >= end - 0.45 + tl.blackSeconds) { s.logo = true; onPhase(tl.egg ? 'rsod' : 'logo'); setDone(true); }
  });

  if (done) return null;
  return (
    <>
      <color attach="background" args={['#02040c']} />
      <fogExp2 attach="fog" args={['#030816', 0.013]} />
      <gridHelper args={[90, 72, '#16388a', '#0a1c4a']} position={[0, 0.004, 0]} />
      <instancedMesh ref={body} args={[bodyGeo, bodyMat, count]} frustumCulled={false} />
      <instancedMesh ref={caps} args={[capGeo, capMat, count]} frustumCulled={false} />
      {BEAMS.map((bm, i) => (
        <Beam key={i} color={bm.color} phase={bm.ph} x={bm.x} z={bm.z} />
      ))}
      <group position={[0, 14, 0]}>
        <GlowPoints count={170} mode="drift" colors={['#7fb0ff', '#5fe3ff', '#ffffff']} size={[0.06, 0.18]} box={[44, 34, 26]} opacity={0.5} seed={19} />
      </group>
      <WispTrails
        colors={WISP_COLORS}
        at={wispAt}
        state={() => {
          const { t, D, end } = timeRef.current;
          return {
            t,
            warp: 1 + 0.8 * clamp01(t / D), // las luces se aceleran un poco junto con la cámara 
            opacity: smooth(0.18 * D, 0.4 * D, t) * (1 - smooth(end - 0.45, end - 0.05, t)),
          };
        }}
      />
    </>
  );
}
