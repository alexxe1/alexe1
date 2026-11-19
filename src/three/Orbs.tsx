import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { GlowPoints } from './GlowPoints';

const PALETTE = ['#3d6bff', '#6a5cff', '#8a6bff', '#38b6ff', '#a98bff', '#2a4dff'];

/** Fondo del menú: orbes azules/violetas orbitando, anillos tenues y polvo, con parallax suave. */
export function Orbs({ dim = false, parallax = 0.7, baseZ = 16 }: { dim?: boolean; parallax?: number; baseZ?: number }) {
  const group = useRef<THREE.Group>(null);
  const rings = useRef<THREE.Group>(null);
  const { camera, pointer } = useThree();

  const ringGeo = useMemo(() => new THREE.TorusGeometry(1, 0.012, 6, 160), []);
  const ringMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#5b7dff', transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }),
    [],
  );
  useEffect(() => () => { ringGeo.dispose(); ringMat.dispose(); }, [ringGeo, ringMat]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (group.current) group.current.rotation.y = t * 0.035;
    if (rings.current) {
      rings.current.rotation.y = t * 0.05;
      rings.current.rotation.x = 0.9 + Math.sin(t * 0.1) * 0.1;
    }
    const k = 1 - Math.pow(0.04, dt);
    camera.position.x += (pointer.x * parallax - camera.position.x) * k * 0.5;
    camera.position.y += (pointer.y * parallax * 0.6 - camera.position.y) * k * 0.5;
    camera.position.z += (baseZ - camera.position.z) * k;
    camera.lookAt(0, 0, 0);
  });

  const o = dim ? 0.55 : 1;
  return (
    <>
      <color attach="background" args={['#02040f']} />
      <group ref={group}>
        <GlowPoints count={90} mode="orbit" colors={PALETTE} radius={[2.5, 13]} size={[0.35, 1.3]} speed={[0.04, 0.22]} opacity={o} seed={11} />
        <GlowPoints count={14} mode="orbit" colors={PALETTE} radius={[3, 11]} size={[3.5, 7]} speed={[0.02, 0.09]} opacity={0.2 * o} seed={29} />
      </group>
      <group ref={rings}>
        {[4.5, 7.5, 11, 15].map((r, i) => (
          <mesh key={r} geometry={ringGeo} material={ringMat} scale={r} rotation={[0, 0, i * 0.7]} />
        ))}
      </group>
      <GlowPoints count={160} mode="drift" colors={['#7fa4ff', '#a99bff']} size={[0.05, 0.16]} box={[40, 22, 14]} opacity={0.55 * o} seed={5} />
    </>
  );
}
