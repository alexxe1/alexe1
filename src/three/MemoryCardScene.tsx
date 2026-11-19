import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { projects } from '../data/projects';
import { useStore } from '../store';
import { sfx } from '../lib/audio';
import { buildIcon } from './icons';
import { useRoomEnv } from './useRoomEnv';

export const GRID_COLS = 5;
const COL_GAP = 2.3;
const GRID_CENTER_Y = 0.75;
const ICON_Z = 1.9; // distancia del ícono respecto de su baldosa (mayor que el radio de giro del ícono más ancho)

export function slotCount(n = projects.length) {
  return Math.max(2 * GRID_COLS, Math.ceil(n / GRID_COLS) * GRID_COLS);
}

function slotLayout(i: number, total: number) {
  const rows = Math.ceil(total / GRID_COLS);
  const rowGap = rows <= 2 ? 2.5 : 5.3 / rows;
  const col = i % GRID_COLS;
  const row = Math.floor(i / GRID_COLS);
  return {
    x: (col - (GRID_COLS - 1) / 2) * COL_GAP,
    y: GRID_CENTER_Y + ((rows - 1) / 2 - row) * rowGap,
    size: Math.min(2.05, rowGap * 0.86),
  };
}

const cursorVert = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }';
const cursorFrag = `
varying vec2 vUv; uniform float uTime; uniform vec3 uColor;
float sdRR(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
void main(){
  vec2 p = (vUv - 0.5) * 2.0;
  float d = sdRR(p, vec2(0.9), 0.16);
  float border = smoothstep(0.045, 0.0, abs(d));
  float glow = smoothstep(0.4, 0.0, abs(d)) * 0.4;
  float pulse = 0.78 + 0.22 * sin(uTime * 4.0);
  float a = (border + glow) * pulse;
  gl_FragColor = vec4(uColor * (0.6 + border), a);
}`;

/** Navegador de Memory Card: grilla de ranuras con un ícono 3D flotante por proyecto. */
export function MemoryCardScene() {
  useRoomEnv(0.5);
  const total = slotCount();
  const n = projects.length;

  const iconMat = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.5, metalness: 0.15 }), []);
  const iconMatDouble = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.5, metalness: 0.15, side: THREE.DoubleSide }), []);
  const rigs = useMemo(() => projects.map((p) => buildIcon(p.icon, iconMat, iconMatDouble)), [iconMat, iconMatDouble]);

  const layout = useMemo(() => Array.from({ length: total }, (_, i) => slotLayout(i, total)), [total]);
  const tileGeo = useMemo(() => new RoundedBoxGeometry(layout[0].size, layout[0].size, 0.1, 3, 0.15), [layout]);
  const tileMats = useMemo(
    () =>
      Array.from({ length: total }, (_, i) =>
        new THREE.MeshStandardMaterial({
          color: i < n ? '#0f1c4a' : '#0a1030',
          roughness: 0.25,
          metalness: 0.45,
          transparent: true,
          opacity: i < n ? 0.78 : 0.45,
          emissive: '#2a4bff',
          emissiveIntensity: 0.1,
        }),
      ),
    [total, n],
  );
  const cursorMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color('#8fd0ff') } },
        vertexShader: cursorVert,
        fragmentShader: cursorFrag,
      }),
    [],
  );

  useEffect(
    () => () => {
      rigs.forEach((r) => r.dispose());
      iconMat.dispose();
      iconMatDouble.dispose();
      tileGeo.dispose();
      tileMats.forEach((m) => m.dispose());
      cursorMat.dispose();
    },
    [rigs, iconMat, iconMatDouble, tileGeo, tileMats, cursorMat],
  );

  const slotRefs = useRef<(THREE.Group | null)[]>([]);
  const tileRefs = useRef<(THREE.Mesh | null)[]>([]);
  const cursor = useRef<THREE.Mesh>(null);
  const ks = useRef<number[]>(Array.from({ length: total }, () => 0));
  const mount = useRef(-1);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const t = state.clock.elapsedTime;
    if (mount.current < 0) mount.current = t;
    const { focus } = useStore.getState();
    cursorMat.uniforms.uTime.value = t;

    for (let i = 0; i < total; i++) {
      const enter = Math.min(1, Math.max(0, (t - mount.current - i * 0.045) / 0.45));
      const ease = 1 - Math.pow(1 - enter, 3);
      const target = i === focus && i < n ? 1 : 0;
      ks.current[i] += (target - ks.current[i]) * Math.min(1, dt * 9);
      const k = ks.current[i];

      const slot = slotRefs.current[i];
      if (slot) slot.scale.setScalar(Math.max(0.0001, ease));
      const tm = tileMats[i];
      tm.emissiveIntensity = 0.1 + 0.6 * k;
      tm.opacity = (i < n ? 0.78 : 0.45) * (0.55 + 0.45 * ease) + 0.12 * k;

      if (i < n) {
        const rig = rigs[i];
        const root = rig.root;
        root.rotation.y += dt * (0.45 + 3.4 * k);
        // El ícono flota bien adelante de la baldosa: así, al girar de canto, ninguna parte (ni los cuerpos
        // que orbitan) la atraviesa. Se compensa la perspectiva para que se vea centrado sobre su ranura.
        const zi = ICON_Z + 0.2 * k;
        const camZ = Math.max(state.camera.position.z, zi + 1);
        const sh = zi / (camZ - zi); // cuánto se "corre" hacia afuera un objeto adelantado
        const L = layout[i];
        root.position.set(-L.x * sh, Math.sin(t * 1.3 + i * 0.9) * 0.06 + k * 0.14 - L.y * sh, zi);
        root.scale.setScalar((0.92 * (1 + 0.3 * k)) / (1 + sh));
        rig.update(t, k, dt);
      }
    }

    if (cursor.current) {
      const L = layout[Math.min(focus, total - 1)];
      const kk = 1 - Math.pow(0.0005, dt);
      cursor.current.position.x += (L.x - cursor.current.position.x) * kk;
      cursor.current.position.y += (L.y - cursor.current.position.y) * kk;
    }
  });

  const hover = (i: number) => {
    const s = useStore.getState();
    if (s.projView !== 'grid' || i >= n) return;
    document.body.style.cursor = 'pointer';
    if (s.focus !== i) {
      s.setFocus(i);
      sfx.move();
    }
  };
  const click = (i: number) => {
    const s = useStore.getState();
    if (s.projView !== 'grid' || i >= n) return;
    s.setFocus(i);
    s.setProjView('menu');
    sfx.confirm();
  };

  const first = layout[0];
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 4, 7]} intensity={2.3} color="#e6f0ff" />
      <pointLight position={[-6, -2, 4]} intensity={30} color="#4466ff" distance={20} />
      <pointLight position={[6, 3, 4]} intensity={20} color="#9a7bff" distance={20} />

      {layout.map((L, i) => (
        <group key={i} ref={(el) => { slotRefs.current[i] = el; }} position={[L.x, L.y, 0]}>
          <mesh ref={(el) => { tileRefs.current[i] = el; }} geometry={tileGeo} material={tileMats[i]} position={[0, 0, -0.05]} />
          {i < n && <primitive object={rigs[i].root} />}
          <mesh
            position={[0, 0, 0.5]}
            onPointerOver={(e) => { e.stopPropagation(); hover(i); }}
            onPointerOut={() => { document.body.style.cursor = ''; }}
            onClick={(e) => { e.stopPropagation(); click(i); }}
          >
            <planeGeometry args={[L.size, L.size]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      ))}

      <mesh ref={cursor} position={[first.x, first.y, 0.12]} material={cursorMat}>
        <planeGeometry args={[first.size * 1.14, first.size * 1.14]} />
      </mesh>
    </>
  );
}
