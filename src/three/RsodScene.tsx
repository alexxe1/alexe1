import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { WispTrails } from './WispTrails';
import { WISP_COLORS } from './IntroScene';

/** Nubes rojas de fondo (fbm con dominio distorsionado), lentas y siempre en movimiento. */
const cloudsFrag = /* glsl */ `
varying vec2 vUv; uniform float uTime;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(17.0, 9.0); a *= 0.5; } return v; }
void main(){
  vec2 p = (vUv - 0.5) * vec2(3.2, 2.4);
  float t = uTime * 0.04;
  vec2 q = vec2(fbm(p + vec2(t, 0.0)), fbm(p + vec2(5.2, 1.3) - t));
  float f = fbm(p * 1.1 + 2.0 * q + vec2(0.0, t * 1.5));
  vec3 col = mix(vec3(0.05, 0.0, 0.01), vec3(0.62, 0.04, 0.03), smoothstep(0.25, 0.75, f));
  col = mix(col, vec3(1.0, 0.38, 0.12), pow(smoothstep(0.55, 0.95, f), 2.0) * 0.55);
  float vig = smoothstep(1.1, 0.25, length(vUv - 0.5) * 1.6);
  col *= 0.35 + 0.65 * vig;
  gl_FragColor = vec4(col, 1.0);
}`;

const ORBITS = [
  { r: 2.7, s: 0.9, tilt: 0.5, ph: 0.0 },
  { r: 3.4, s: -1.1, tilt: -0.4, ph: 1.6 },
  { r: 3.9, s: 0.75, tilt: 1.0, ph: 3.2 },
  { r: 3.1, s: -0.85, tilt: 0.2, ph: 4.8 },
];
function orbitAt(i: number, tau: number, out: THREE.Vector3) {
  const o = ORBITS[i % ORBITS.length];
  const a = o.ph + tau * o.s;
  const x = Math.cos(a) * o.r, y = Math.sin(a) * o.r * 0.6, z = Math.sin(a) * o.r * 0.8;
  out.set(x * Math.cos(o.tilt) - y * Math.sin(o.tilt), x * Math.sin(o.tilt) + y * Math.cos(o.tilt), z);
}

function Cube({ position, speed, phase, shared }: { position: [number, number, number]; speed: number; phase: number; shared: Shared }) {
  const g = useRef<THREE.Group>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime * speed + phase;
    g.current?.rotation.set(t * 0.8, t * 1.1, t * 0.3);
  });
  return (
    <group ref={g} position={position}>
      <mesh geometry={shared.box} material={shared.glass} />
      <mesh geometry={shared.box} material={shared.core} scale={0.5} />
      <lineSegments geometry={shared.edges} material={shared.line} />
    </group>
  );
}
interface Shared { box: THREE.BoxGeometry; edges: THREE.EdgesGeometry; glass: THREE.Material; core: THREE.Material; line: THREE.Material }

/** Pantalla del RSOD: nubes rojas, dos cubos translúcidos girando en bucle y cuatro luces dando vueltas. */
export function RsodScene() {
  const t0 = useRef(-1);
  const shared = useMemo<Shared>(() => {
    const box = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    return {
      box,
      edges: new THREE.EdgesGeometry(box),
      glass: new THREE.MeshStandardMaterial({ color: '#ff4a2b', transparent: true, opacity: 0.38, roughness: 0.15, metalness: 0.2, emissive: '#8a1608', emissiveIntensity: 0.9, depthWrite: false, side: THREE.DoubleSide }),
      core: new THREE.MeshStandardMaterial({ color: '#1a0303', roughness: 0.6, emissive: '#5a0a04', emissiveIntensity: 0.8 }),
      line: new THREE.LineBasicMaterial({ color: '#ffd9c9', transparent: true, opacity: 0.75 }),
    };
  }, []);
  const bg = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: cloudsFrag,
        depthWrite: false,
      }),
    [],
  );
  useEffect(
    () => () => {
      shared.box.dispose(); shared.edges.dispose(); shared.glass.dispose(); shared.core.dispose(); shared.line.dispose(); bg.dispose();
    },
    [shared, bg],
  );

  useFrame((state) => {
    if (t0.current < 0) t0.current = state.clock.elapsedTime;
    bg.uniforms.uTime.value = state.clock.elapsedTime;
    const cam = state.camera as THREE.PerspectiveCamera;
    cam.position.set(0, 0.2, 9.5);
    cam.fov = 40;
    cam.updateProjectionMatrix();
    cam.lookAt(0, 0, 0);
  });

  return (
    <>
      <color attach="background" args={['#050001']} />
      <mesh position={[0, 0, -12]} material={bg}>
        <planeGeometry args={[30, 20]} />
      </mesh>
      <ambientLight intensity={0.5} color="#ff9a80" />
      <pointLight position={[0, 2.5, 5]} intensity={45} color="#ff7a3a" distance={20} />
      <pointLight position={[-4, -2, 3]} intensity={25} color="#ff2a1a" distance={20} />
      <Cube position={[-1.9, 0.1, 0]} speed={1} phase={0} shared={shared} />
      <Cube position={[1.9, 0.1, 0]} speed={-0.85} phase={2.4} shared={shared} />
      <WispTrails
        colors={WISP_COLORS}
        at={orbitAt}
        size={0.9}
        state={() => {
          const t = performance.now() / 1000 - 0; // reloj propio: las luces giran en bucle indefinido
          return { t, warp: 1, opacity: 1 };
        }}
      />
    </>
  );
}
