import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { MeshProps } from '@react-three/fiber';

/** Plano con degradé radial (halo de luz o sombra de contacto suave). */
export function RadialPlane({
  color, opacity = 1, additive = false, power = 2, ...props
}: { color: string; opacity?: number; additive?: boolean; power?: number } & MeshProps) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
        uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity }, uPower: { value: power } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader:
          'uniform vec3 uColor; uniform float uOpacity; uniform float uPower; varying vec2 vUv; void main(){ float d = length(vUv - 0.5) * 2.0; float a = pow(clamp(1.0 - d, 0.0, 1.0), uPower); gl_FragColor = vec4(uColor, a * uOpacity); }',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh {...props} material={material}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}
