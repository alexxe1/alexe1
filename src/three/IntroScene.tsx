import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { CommitData } from '../lib/commits';
import { bootDurations, sfx } from '../lib/audio';
import { GlowPoints } from './GlowPoints';

/**
 * Intro al estilo del arranque de PS2, sincronizada con ps2_startup.mp3 (su duración manda):
 *   1) vista de pájaro del campo de torres completo (en horizontal), acercándose muy de a poco;
 *   2) avance cada vez más rápido hacia el CENTRO de la "ciudad", entrando por la avenida central;
 *      mientras tanto unas pocas luces de colores recorren las torres;
 *   3) cuando está muy cerca, fundido a negro (lo resuelve el DOM) y, ~1 s después, aparece el logo.
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

/**
 * Trayectoria de cámara: siempre mirando al centro de la ciudad, desde el lado +z (así las semanas
 * corren de izquierda a derecha y el campo queda en horizontal). Se acerca por una recta que baja.
 */
function cameraPath(t: number, D: number, out: { pos: THREE.Vector3; fov: number; a: number }) {
  const tf = Math.min(DASH_START, 0.8 * D); // si el audio fuera más corto, el dash arranca al 80%
  const u1 = clamp01(t / tf);
  const u2 = clamp01((t - tf) / (D - tf));
  const a = 0.12 * u2 + 0.88 * Math.pow(u2, 2.2); // el dash arranca a la velocidad de la aproximación y se dispara hacia el final
  let dist: number, elev: number;
  if (t < tf) {
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
const TRAIL = 18;
const TRAIL_DT = 0.05;

function wispAt(i: number, tau: number, out: THREE.Vector3) {
  const w = WISPS[i];
  const ang = w.ph + tau * w.w;
  return out.set(Math.cos(ang) * w.rx, w.y + Math.sin(tau * w.bob + w.ph) * w.amp, Math.sin(ang) * w.rz);
}

function Wisps({ timeRef }: { timeRef: { current: { t: number; D: number } } }) {
  const total = WISPS.length * TRAIL;
  const { geo, mat, pos } = useMemo(() => {
    const pos = new Float32Array(total * 3);
    const size = new Float32Array(total);
    const alpha = new Float32Array(total);
    const col = new Float32Array(total * 3);
    WISPS.forEach((w, i) => {
      const c = new THREE.Color(w.color);
      for (let k = 0; k < TRAIL; k++) {
        const j = i * TRAIL + k;
        const f = k / (TRAIL - 1);
        size[j] = 1.15 * (1 - 0.82 * f);
        alpha[j] = Math.pow(1 - f, 1.6);
        col.set([c.r, c.g, c.b], j * 3);
      }
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1));
    geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uScale: { value: 600 }, uOpacity: { value: 0 } },
      vertexShader: `
        uniform float uScale; attribute float aSize; attribute float aAlpha; attribute vec3 aColor;
        varying vec3 vC; varying float vA;
        void main(){
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aSize * uScale / max(0.1, -mv.z);
          vC = aColor; vA = aAlpha;
        }`,
      fragmentShader: `
        uniform float uOpacity; varying vec3 vC; varying float vA;
        void main(){
          float d = length(gl_PointCoord - 0.5) * 2.0;
          if (d > 1.0) discard;
          float core = pow(1.0 - d, 2.4);
          gl_FragColor = vec4(mix(vC, vec3(1.0), core * 0.55), (core + 0.25 * (1.0 - d)) * vA * uOpacity);
        }`,
    });
    return { geo, mat, pos };
  }, [total]);
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const { t, D } = timeRef.current;
    const warp = 1 + 0.8 * (t / D); // las luces se aceleran un poco junto con la cámara
    for (let i = 0; i < WISPS.length; i++)
      for (let k = 0; k < TRAIL; k++) {
        wispAt(i, (t - k * TRAIL_DT) * warp, v);
        pos.set([v.x, v.y, v.z], (i * TRAIL + k) * 3);
      }
    geo.attributes.position.needsUpdate = true;
    mat.uniforms.uOpacity.value = smooth(0.18 * D, 0.4 * D, t) * (1 - smooth(D - 0.45, D - 0.05, t));
    const cam = state.camera as THREE.PerspectiveCamera;
    mat.uniforms.uScale.value = (state.size.height * state.viewport.dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2));
  });
  return <points geometry={geo} material={mat} frustumCulled={false} />;
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
  onPhase: (p: 'black' | 'logo') => void;
}

export function IntroScene({ data, onPhase }: Props) {
  const body = useRef<THREE.InstancedMesh>(null);
  const caps = useRef<THREE.InstancedMesh>(null);
  const timeRef = useRef({ t: 0, D: FALLBACK_DURATION });
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
      sfx.bootStart(); // arranca ps2_startup.mp3 junto con el primer frame
    }
    const t = state.clock.elapsedTime - s.t0;
    const D = s.D;

    /* ---- Cámara ---- */
    cameraPath(t, D, path);
    const cam = state.camera as THREE.PerspectiveCamera;
    cam.position.copy(path.pos);
    cam.lookAt(CENTER);
    cam.rotateZ(path.a * 0.12 * Math.sin(t * 1.9)); // ligero vaivén al lanzarse
    cam.fov = path.fov;
    cam.updateProjectionMatrix();

    /* ---- Torres ---- */
    if (t < RISE_SECONDS + 0.1) layout(t);
    else if (!s.laidOut) { layout(10); s.laidOut = true; }
    const bright = 1 + 1.3 * smooth(D - 2.6, D - 0.5, t);
    bodyMat.color.setScalar(bright);
    capMat.color.setScalar(bright);

    timeRef.current.t = t;
    timeRef.current.D = D;

    /* ---- Fases (el DOM hace el fundido a negro y el logo) ---- */
    if (!s.black && t >= D - 0.45) { s.black = true; onPhase('black'); }
    if (!s.logo && t >= D + 0.65) { s.logo = true; onPhase('logo'); setDone(true); } // ~1 s en negro antes del logo
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
      <Wisps timeRef={timeRef} />
    </>
  );
}
