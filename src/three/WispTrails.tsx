import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const TRAIL = 18;
const TRAIL_DT = 0.05;

export interface WispState {
  /** tiempo base (s) */
  t: number;
  /** multiplicador de velocidad del recorrido */
  warp: number;
  /** 0..1 */
  opacity: number;
}

interface Props {
  /** un color por luz */
  colors: string[];
  /** posición de la luz `i` en el instante `tau` (se escribe en `out`) */
  at: (i: number, tau: number, out: THREE.Vector3) => void;
  /** estado actual, leído en cada frame (sin re-render de React) */
  state: () => WispState;
  /** tamaño de la cabeza de cada luz (unidades de mundo) */
  size?: number;
}

/** Unas pocas luces de colores con estela: la cabeza sigue `at()` y la cola son posiciones pasadas. */
export function WispTrails({ colors, at, state, size = 1.15 }: Props) {
  const n = colors.length;
  const total = n * TRAIL;
  const { geo, mat, pos } = useMemo(() => {
    const pos = new Float32Array(total * 3);
    const sz = new Float32Array(total);
    const alpha = new Float32Array(total);
    const col = new Float32Array(total * 3);
    colors.forEach((hex, i) => {
      const c = new THREE.Color(hex);
      for (let k = 0; k < TRAIL; k++) {
        const j = i * TRAIL + k;
        const f = k / (TRAIL - 1);
        sz[j] = size * (1 - 0.82 * f);
        alpha[j] = Math.pow(1 - f, 1.6);
        col.set([c.r, c.g, c.b], j * 3);
      }
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame((frame) => {
    const { t, warp, opacity } = state();
    for (let i = 0; i < n; i++)
      for (let k = 0; k < TRAIL; k++) {
        at(i, (t - k * TRAIL_DT) * warp, v);
        pos.set([v.x, v.y, v.z], (i * TRAIL + k) * 3);
      }
    geo.attributes.position.needsUpdate = true;
    mat.uniforms.uOpacity.value = opacity;
    const cam = frame.camera as THREE.PerspectiveCamera;
    mat.uniforms.uScale.value = (frame.size.height * frame.viewport.dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2));
  });
  return <points geometry={geo} material={mat} frustumCulled={false} />;
}
