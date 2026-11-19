import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Carga y caché de modelos y texturas para los íconos de la Memory Card.
 *  - krypto.glb     → emblema "K" de Krypto
 *  - doll-head.glb  → cabeza de la muñeca de The Noris Project
 *      "doll" by lucq22 — CC BY 4.0 — https://sketchfab.com/3d-models/doll-51b4dafa7fa745c0af8e3772d0ac8a33
 *      (se conservó sólo la cabeza y se optimizaron las texturas)
 */
export const MODEL_URLS = {
  krypto: './models/krypto.glb',
  doll: './models/doll-head.glb',
} as const;

const loader = new GLTFLoader();
const modelCache = new Map<string, Promise<THREE.Group>>();

export function loadModel(url: string): Promise<THREE.Group> {
  let p = modelCache.get(url);
  if (!p) {
    p = loader.loadAsync(url).then((g) => g.scene);
    modelCache.set(url, p);
  }
  return p;
}

export function preloadIconModels() {
  Object.values(MODEL_URLS).forEach((u) => void loadModel(u).catch(() => undefined));
  Object.values(LOGO_URLS).forEach((u) => loadTexture(u));
}

/** Clona el modelo, lo centra y lo escala para que su dimensión mayor mida `size`. */
export function fitted(scene: THREE.Object3D, size: number): THREE.Group {
  const clone = scene.clone(true);
  const box = new THREE.Box3().setFromObject(clone);
  const sz = box.getSize(new THREE.Vector3());
  const c = box.getCenter(new THREE.Vector3());
  clone.position.sub(c);
  const holder = new THREE.Group();
  holder.add(clone);
  holder.scale.setScalar(size / Math.max(sz.x, sz.y, sz.z, 1e-6));
  return holder;
}

export const LOGO_URLS = {
  noisepad: './img/logos/noisepad.png',
  waka: './img/logos/waka-waka.png',
  assetly: './img/logos/assetly.png',
} as const;

const texCache = new Map<string, THREE.Texture>();
const texLoader = new THREE.TextureLoader();
export function loadTexture(url: string): THREE.Texture {
  let t = texCache.get(url);
  if (!t) {
    t = texLoader.load(url);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    texCache.set(url, t);
  }
  return t;
}
