import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * Puntos de luz suaves animados 100% en GPU (cero trabajo de CPU por frame).
 *  - mode "orbit": cada punto orbita el origen (orbes del menú, estilo reloj de la PS2)
 *  - mode "drift": polvo que asciende dentro de una caja y se reinicia (niebla de la intro)
 */
const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uScale;
uniform float uMode;
uniform vec3 uBox;
attribute vec4 aSeed;   // x: radio, y: velocidad, z: fase, w: inclinación
attribute float aSize;
attribute vec3 aColor;
varying vec3 vColor;
varying float vTwinkle;
void main() {
  vec3 p;
  if (uMode < 0.5) {
    float a = aSeed.z + uTime * aSeed.y;
    float r = aSeed.x;
    vec3 o = vec3(cos(a) * r, sin(a * 0.7 + aSeed.z) * r * 0.32, sin(a) * r);
    float c = cos(aSeed.w);
    float s = sin(aSeed.w);
    p = vec3(o.x, o.y * c - o.z * s, o.y * s + o.z * c);
  } else {
    p = position;
    p.y = mod(position.y + uTime * aSeed.y + uBox.y * 0.5, uBox.y) - uBox.y * 0.5;
    p.x += sin(uTime * 0.25 + aSeed.z) * 0.7;
    p.z += cos(uTime * 0.21 + aSeed.z) * 0.7;
  }
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uScale / max(0.1, -mv.z);
  vColor = aColor;
  vTwinkle = 0.55 + 0.45 * sin(uTime * 0.9 + aSeed.z * 5.0);
}`;

const fragmentShader = /* glsl */ `
uniform float uOpacity;
varying vec3 vColor;
varying float vTwinkle;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  float core = pow(1.0 - d, 3.0);
  float halo = pow(1.0 - d, 1.6) * 0.3;
  float i = (core + halo) * vTwinkle * uOpacity;
  gl_FragColor = vec4(vColor, i);
}`;

interface Props {
  count: number;
  mode: 'orbit' | 'drift';
  colors: string[];
  radius?: [number, number];
  size?: [number, number];
  speed?: [number, number];
  box?: [number, number, number];
  opacity?: number;
  /** Opacidad animable sin re-renderizar React (se lee en cada frame; multiplica a `opacity`). */
  opacityRef?: { current: number };
  seed?: number;
}

export function GlowPoints({
  count, mode, colors, radius = [3, 14], size = [0.4, 1.4], speed = [0.03, 0.18], box = [60, 30, 30], opacity = 1, opacityRef, seed = 7,
}: Props) {
  const geometry = useMemo(() => {
    let s = seed;
    const rnd = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
    const pos = new Float32Array(count * 3);
    const seedA = new Float32Array(count * 4);
    const sz = new Float32Array(count);
    const col = new Float32Array(count * 3);
    const palette = colors.map((c) => new THREE.Color(c));
    for (let i = 0; i < count; i++) {
      if (mode === 'drift') {
        pos[i * 3] = (rnd() - 0.5) * box[0];
        pos[i * 3 + 1] = (rnd() - 0.5) * box[1];
        pos[i * 3 + 2] = (rnd() - 0.5) * box[2];
      }
      seedA[i * 4] = radius[0] + rnd() * (radius[1] - radius[0]);
      seedA[i * 4 + 1] = (speed[0] + rnd() * (speed[1] - speed[0])) * (rnd() < 0.5 ? -1 : 1);
      seedA[i * 4 + 2] = rnd() * Math.PI * 2;
      seedA[i * 4 + 3] = (rnd() - 0.5) * 1.6;
      if (mode === 'drift') seedA[i * 4 + 1] = Math.abs(seedA[i * 4 + 1]) * 6;
      sz[i] = size[0] + rnd() * (size[1] - size[0]);
      const c = palette[Math.floor(rnd() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seedA, 4));
    g.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uScale: { value: 600 },
          uMode: { value: mode === 'orbit' ? 0 : 1 },
          uBox: { value: new THREE.Vector3(...box) },
          uOpacity: { value: opacity },
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uOpacity.value = opacity * (opacityRef ? opacityRef.current : 1);
    const cam = state.camera as THREE.PerspectiveCamera;
    material.uniforms.uScale.value = (state.size.height * state.viewport.dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2));
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
