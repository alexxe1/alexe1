import { Suspense, useLayoutEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import type * as THREE from 'three';
import { useStore, type Screen } from '../store';
import type { CommitData } from '../lib/commits';
import { PowerScene } from './Ps2Model';
import { IntroScene } from './IntroScene';
import { Orbs } from './Orbs';
import { MemoryCardScene } from './MemoryCardScene';
import { RsodScene } from './RsodScene';

const FOV: Record<Screen, number> = { power: 30, boot: 56, menu: 50, about: 50, cv: 50, contact: 50, projects: 32 };

function CameraSetup({ screen }: { screen: Screen }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.fov = FOV[screen];
    camera.near = 0.1;
    camera.far = 300;
    if (screen === 'projects') camera.position.set(0, 0, 17);
    else if (screen === 'power') camera.position.set(0, 1.15, 6.6);
    else if (screen !== 'boot') camera.position.set(0, 0, 16);
    camera.updateProjectionMatrix();
  }, [camera, screen]);
  return null;
}

interface Props {
  commits: CommitData;
  /** fase de la intro: 'rsod' muestra la escena del easter egg; 'logo' no renderiza nada (negro). */
  bootPhase: 'fly' | 'black' | 'rsod' | 'logo';
  onPhase: (p: 'black' | 'logo' | 'rsod') => void;
  onPower: () => void;
}

/** Un único <Canvas> persistente: cada pantalla monta/desmonta su escena (y libera sus recursos). */
export function SceneRoot({ commits, bootPhase, onPhase, onPower }: Props) {
  const screen = useStore((s) => s.screen);
  return (
    <Canvas
      flat
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 50, near: 0.1, far: 300, position: [0, 0, 16] }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <CameraSetup screen={screen} />
      {screen === 'power' && (
        <Suspense fallback={null}>
          <PowerScene onPower={onPower} />
        </Suspense>
      )}
      {screen === 'boot' && (bootPhase === 'fly' || bootPhase === 'black') && <IntroScene data={commits} onPhase={onPhase} />}
      {screen === 'boot' && bootPhase === 'rsod' && <RsodScene />}
      {(screen === 'menu' || screen === 'about' || screen === 'cv' || screen === 'contact') && <Orbs />}
      {screen === 'projects' && (
        <>
          <Orbs dim parallax={0.25} baseZ={17} />
          <MemoryCardScene />
        </>
      )}
    </Canvas>
  );
}
