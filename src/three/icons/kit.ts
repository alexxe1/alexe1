import * as THREE from 'three';

export interface IconRig {
  root: THREE.Group;
  /** t: tiempo (s) · k: 0..1 qué tan seleccionado está (suavizado) · dt: delta */
  update: (t: number, k: number, dt: number) => void;
  dispose: () => void;
}

const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/**
 * Convierte una geometría en "low-poly con colores por vértice":
 * caras desindexadas, variación de tono por cara y degradé vertical.
 */
export function paint(src: THREE.BufferGeometry, color: THREE.ColorRepresentation, jitter = 0.1): THREE.BufferGeometry {
  const g = src.index ? src.toNonIndexed() : src;
  if (g !== src) src.dispose();
  g.computeBoundingBox();
  const bb = g.boundingBox!;
  const h = Math.max(1e-4, bb.max.y - bb.min.y);
  const pos = g.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const c = new THREE.Color(color);
  for (let i = 0; i < pos.count; i += 3) {
    const j = 1 + (hash(i * 0.37 + c.r * 13 + c.b * 7) - 0.5) * 2 * jitter;
    for (let k = 0; k < 3; k++) {
      const y = (pos.getY(i + k) - bb.min.y) / h;
      const v = j * (0.78 + 0.22 * y);
      col.set([c.r * v, c.g * v, c.b * v], (i + k) * 3);
    }
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

export interface MeshOpts {
  pos?: [number, number, number];
  rot?: [number, number, number];
  scale?: number | [number, number, number];
  parent?: THREE.Object3D;
  jitter?: number;
  double?: boolean;
}

/** Ayudante para armar un ícono: lleva la cuenta de geometrías para liberarlas. */
export class Kit {
  root = new THREE.Group();
  geos: THREE.BufferGeometry[] = [];
  /** Recursos propios de este ícono (materiales, etc.) que hay que liberar al destruirlo. */
  extras: { dispose: () => void }[] = [];
  disposed = false;
  constructor(public mat: THREE.Material, public matDouble: THREE.Material) {}

  mesh(geo: THREE.BufferGeometry, color: THREE.ColorRepresentation, o: MeshOpts = {}): THREE.Mesh {
    const g = paint(geo, color, o.jitter ?? 0.1);
    this.geos.push(g);
    const m = new THREE.Mesh(g, o.double ? this.matDouble : this.mat);
    if (o.pos) m.position.set(...o.pos);
    if (o.rot) m.rotation.set(...o.rot);
    if (o.scale !== undefined) {
      if (typeof o.scale === 'number') m.scale.setScalar(o.scale);
      else m.scale.set(...o.scale);
    }
    (o.parent ?? this.root).add(m);
    return m;
  }

  group(pos: [number, number, number] = [0, 0, 0], parent?: THREE.Object3D): THREE.Group {
    const g = new THREE.Group();
    g.position.set(...pos);
    (parent ?? this.root).add(g);
    return g;
  }

  rig(update: IconRig['update'], extraDispose?: () => void): IconRig {
    return {
      root: this.root,
      update,
      dispose: () => {
        this.disposed = true;
        this.geos.forEach((g) => g.dispose());
        this.extras.forEach((e) => e.dispose());
        extraDispose?.();
      },
    };
  }
}
