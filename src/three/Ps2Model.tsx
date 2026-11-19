import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useStore } from '../store';
import { RadialPlane } from './RadialPlane';
import { useRoomEnv } from './useRoomEnv';
import { GlowPoints } from './GlowPoints';

/**
 * "PS2 Slim low poly" by alexdperdomo — CC BY 4.0 — https://skfb.ly/6X6RH
 * El modelo es una caja con textura pintada; el botón de encendido (franja "I/O" del frente)
 * y su LED se agregan encima como geometría 3D interactiva.
 */
export const PS2_URL = './models/ps2_slim_low_poly.glb';
useLoader.preload(GLTFLoader, PS2_URL);

/* Medidas del archivo (espacio del glTF, ya con la rotación de Sketchfab aplicada) */
const MODEL_CENTER = new THREE.Vector3(0, 1.15, 0);
const MODEL_W = 6.428;
const FRONT_Z = 2.226;
const BTN = new THREE.Vector3(2.84, 1.33, FRONT_Z); // centro del botón (franja "I/O")
const LED = new THREE.Vector3(2.575, 1.33, FRONT_Z);

const S = 3.1 / MODEL_W; // escala para que mida ~3.1 unidades de ancho
const YAW = -0.42; // gira el extremo derecho hacia la cámara (ahí está el botón)

const LED_STANDBY = new THREE.Color('#ff7a12');
const LED_ON = new THREE.Color('#34ff80');

function makeGlowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.25, 'rgba(255,255,255,0.45)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function Ps2Model({ onPower, groupRef }: { onPower: () => void; groupRef: React.RefObject<THREE.Group> }) {
  const gltf = useLoader(GLTFLoader, PS2_URL);
  const powering = useStore((s) => s.powering);
  const hover = useRef(false);
  const ledMesh = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Mesh>(null);
  const ledLight = useRef<THREE.PointLight>(null);
  const btn = useRef<THREE.Mesh>(null);

  const scene = useMemo(() => {
    const root = gltf.scene.clone(true);
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        const mat = (m.material as THREE.MeshStandardMaterial).clone();
        mat.roughness = 0.5;
        mat.metalness = 0.12;
        mat.envMapIntensity = 1.4;
        mat.color.multiplyScalar(1.5); // la textura es muy oscura: la levantamos un poco
        m.material = mat;
      }
    });
    return root;
  }, [gltf]);

  const res = useMemo(
    () => ({
      btnGeo: new THREE.BoxGeometry(0.42, 0.07, 0.05),
      ledGeo: new THREE.BoxGeometry(0.055, 0.055, 0.03),
      hitGeo: new THREE.BoxGeometry(0.85, 0.34, 0.5),
      btnMat: new THREE.MeshStandardMaterial({ color: '#1a1c24', roughness: 0.3, metalness: 0.5, emissive: '#6aa0ff', emissiveIntensity: 0 }),
      ledMat: new THREE.MeshBasicMaterial({ color: LED_STANDBY.clone() }),
      glowTex: makeGlowTexture(),
      glowMat: new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: LED_STANDBY.clone() }),
      glowGeo: new THREE.PlaneGeometry(0.5, 0.5),
    }),
    [],
  );
  res.glowMat.map = res.glowTex;

  useEffect(
    () => () => {
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) (m.material as THREE.Material).dispose();
      });
      res.btnGeo.dispose(); res.ledGeo.dispose(); res.hitGeo.dispose(); res.glowGeo.dispose();
      res.btnMat.dispose(); res.ledMat.dispose(); res.glowMat.dispose(); res.glowTex.dispose();
    },
    [scene, res],
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = YAW + Math.sin(t * 0.25) * 0.05;
      groupRef.current.position.y = Math.sin(t * 0.8) * 0.012;
    }
    const target = powering ? LED_ON : LED_STANDBY;
    const pulse = powering ? 1 : 0.5 + 0.5 * Math.sin(t * 2.4);
    res.ledMat.color.lerp(target, Math.min(1, dt * 12));
    res.glowMat.color.copy(res.ledMat.color).multiplyScalar(0.35 + 0.65 * pulse);
    if (glow.current) glow.current.scale.setScalar(0.8 + pulse * 0.5);
    if (ledLight.current) {
      ledLight.current.color.copy(res.ledMat.color);
      ledLight.current.intensity = 0.6 + pulse * 1.6;
    }
    const hov = hover.current && !powering ? 1 : 0;
    res.btnMat.emissiveIntensity += (hov * 0.9 + (powering ? 0.4 : 0) - res.btnMat.emissiveIntensity) * Math.min(1, dt * 10);
    if (btn.current) btn.current.position.z += ((powering ? FRONT_Z + 0.005 : FRONT_Z + 0.025) - btn.current.position.z) * Math.min(1, dt * 14);
  });

  const cursor = (v: boolean) => {
    hover.current = v && !powering;
    document.body.style.cursor = hover.current ? 'pointer' : '';
  };

  return (
    <group ref={groupRef} scale={S}>
      <group position={[-MODEL_CENTER.x, -MODEL_CENTER.y, -MODEL_CENTER.z]}>
        <primitive object={scene} />
        {/* botón de encendido sobre la franja "I/O" */}
        <mesh ref={btn} geometry={res.btnGeo} material={res.btnMat} position={[BTN.x, BTN.y, FRONT_Z + 0.025]} />
        <mesh ref={ledMesh} geometry={res.ledGeo} material={res.ledMat} position={[LED.x, LED.y, FRONT_Z + 0.015]} />
        <mesh ref={glow} geometry={res.glowGeo} material={res.glowMat} position={[LED.x, LED.y, FRONT_Z + 0.06]} />
        <pointLight ref={ledLight} position={[LED.x, LED.y, FRONT_Z + 0.9]} distance={7} decay={2} intensity={1} color="#ff7a12" />
        {/* zona de click generosa (invisible) */}
        <mesh
          geometry={res.hitGeo}
          position={[BTN.x - 0.1, BTN.y, FRONT_Z + 0.12]}
          onPointerOver={(e) => { e.stopPropagation(); cursor(true); }}
          onPointerOut={() => cursor(false)}
          onClick={(e) => { e.stopPropagation(); cursor(false); onPower(); }}
        >
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

/** Escena de la pantalla POWER: consola, halo azul, polvo y dolly hacia el botón al encender. */
export function PowerScene({ onPower }: { onPower: () => void }) {
  useRoomEnv(0.6);
  const camera = useThree((s) => s.camera);
  const powering = useStore((s) => s.powering);
  const group = useRef<THREE.Group>(null);
  const p0 = useRef(-1);
  const tmp = useMemo(() => ({ btn: new THREE.Vector3(), n: new THREE.Vector3(), end: new THREE.Vector3(), look: new THREE.Vector3(), a: new THREE.Vector3(), b: new THREE.Vector3() }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (powering && p0.current < 0) p0.current = t;
    const k = powering ? Math.min(1, (t - p0.current) / 1.5) : 0;
    const e = k * k * (3 - 2 * k);
    // vista de reposo: algo elevada, mirando la consola
    tmp.a.set(Math.sin(t * 0.2) * 0.2, 2.15, 5.6);
    tmp.b.set(0.2, 0.0, 0);
    if (group.current) {
      // al encender: acercarse al botón de encendido
      group.current.updateWorldMatrix(true, true);
      tmp.btn.set(BTN.x - MODEL_CENTER.x, BTN.y - MODEL_CENTER.y, BTN.z - MODEL_CENTER.z);
      group.current.localToWorld(tmp.btn);
      tmp.n.set(0, 0, 1).transformDirection(group.current.matrixWorld);
      tmp.end.copy(tmp.btn).addScaledVector(tmp.n, 1.1).add(tmp.look.set(0.15, 0.32, 0));
      tmp.a.lerp(tmp.end, e);
      tmp.b.lerp(tmp.btn, e);
    }
    camera.position.copy(tmp.a);
    camera.lookAt(tmp.b);
  });

  return (
    <>
      <color attach="background" args={['#010208']} />
      <fog attach="fog" args={['#010208', 9, 24]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 6, 5]} intensity={1.6} color="#cfe0ff" />
      <spotLight position={[-5, 3, -4]} angle={0.7} penumbra={1} intensity={90} color="#3d6bff" distance={22} decay={2} />
      <spotLight position={[5, 2, -3]} angle={0.7} penumbra={1} intensity={55} color="#7a5cff" distance={22} decay={2} />

      <RadialPlane color="#2442c8" opacity={0.5} additive position={[0, 0.5, -3.5]} scale={[18, 10, 1]} power={1.6} />
      <RadialPlane color="#000000" opacity={0.9} position={[0, -0.215, 0.1]} rotation={[-Math.PI / 2, 0, 0]} scale={[5.6, 3.6, 1]} power={1.3} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.22, 0]}>
        <circleGeometry args={[10, 48]} />
        <meshStandardMaterial color="#04060e" roughness={0.3} metalness={0.8} />
      </mesh>
      <GlowPoints count={140} mode="drift" colors={['#6f95ff', '#9d8bff']} size={[0.03, 0.1]} box={[14, 7, 8]} opacity={0.6} seed={3} />

      <Ps2Model onPower={onPower} groupRef={group} />
    </>
  );
}
