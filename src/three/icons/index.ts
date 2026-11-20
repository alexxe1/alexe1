import * as THREE from 'three';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import type { IconId } from '../../data/projects';
import { Kit, paint, type IconRig } from './kit';
import { LOGO_URLS, MODEL_URLS, fitted, loadModel, loadTexture } from '../models';
import noisepadShapeRaw from '../shapes/noisepad.json';
import assetlyShapeRaw from '../shapes/assetly.json';

export { preloadIconModels } from '../models';

interface ShapeData { aspect: number; shapes: { outer: number[][]; holes: number[][][] }[] }
const noisepadShape = noisepadShapeRaw as ShapeData;
const assetlyShape = assetlyShapeRaw as ShapeData;

/** Rectángulo redondeado como ShapeData (para el logo de Waka Waka, que es una imagen opaca). */
function roundedRect(aspect: number, radius: number): ShapeData {
  const w = aspect / 2, h = 0.5, r = radius, pts: number[][] = [];
  const corner = (cx: number, cy: number, a0: number) => {
    for (let i = 0; i <= 8; i++) {
      const a = a0 + (i / 8) * (Math.PI / 2);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  };
  corner(w - r, h - r, 0);
  corner(-w + r, h - r, Math.PI / 2);
  corner(-w + r, -h + r, Math.PI);
  corner(w - r, -h + r, Math.PI * 1.5);
  return { aspect, shapes: [{ outer: pts, holes: [] }] };
}

/**
 * Logo con grosor: silueta extruida (con bisel) y la imagen mapeada en las tapas frontal y trasera.
 * Las coordenadas de ShapeData están normalizadas (alto = 1, centradas en el origen).
 */
function logoSlab(k: Kit, data: ShapeData, texUrl: string, height: number, depth: number, sideColor: string): THREE.Mesh {
  const sc = (pts: number[][]) => pts.map(([x, y]) => new THREE.Vector2(x * height, y * height));
  const shapes = data.shapes.map((s) => {
    const sh = new THREE.Shape(sc(s.outer));
    s.holes.forEach((h) => sh.holes.push(new THREE.Path(sc(h))));
    return sh;
  });
  const geo = new THREE.ExtrudeGeometry(shapes, { depth, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.02, bevelSegments: 2, curveSegments: 4 });
  geo.translate(0, 0, -depth / 2);
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  const w = data.aspect * height;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / height + 0.5);
  uv.needsUpdate = true;
  const face = new THREE.MeshStandardMaterial({ map: loadTexture(texUrl), roughness: 0.42, metalness: 0.08 });
  const side = new THREE.MeshStandardMaterial({ color: sideColor, roughness: 0.4, metalness: 0.25 });
  k.geos.push(geo);
  k.extras.push(face, side);
  const m = new THREE.Mesh(geo, [face, side]);
  k.root.add(m);
  return m;
}

/** Cuerpos geométricos low-poly que giran alrededor del logo. */
function orbiters(k: Kit, palette: string[], radius = 1.15) {
  const orbit = k.group();
  const geos = [
    () => new THREE.TetrahedronGeometry(0.19),
    () => new THREE.OctahedronGeometry(0.19),
    () => new THREE.ConeGeometry(0.18, 0.32, 5),
    () => new THREE.TorusGeometry(0.14, 0.055, 5, 8),
    () => box(0.22, 0.22, 0.22),
  ];
  const items = palette.map((c, i) => {
    const a = (i / palette.length) * Math.PI * 2;
    return k.mesh(geos[i % geos.length](), c, { parent: orbit, pos: [Math.cos(a) * radius, Math.sin(i * 2.3) * 0.45, Math.sin(a) * radius] });
  });
  return (t: number, kk: number) => {
    orbit.rotation.y = t * (0.5 + 2.4 * kk);
    items.forEach((m, i) => { m.rotation.x = t * (1 + i * 0.35); m.rotation.z = t * 0.7; });
  };
}

/** Agrega un modelo glTF (cargado en segundo plano) al ícono, ajustado a `size`. */
function attachModel(k: Kit, url: string, size: number, onReady?: (g: THREE.Group) => void) {
  const holder = k.group();
  void loadModel(url)
    .then((scene) => {
      if (k.disposed) return;
      const g = fitted(scene, size);
      holder.add(g);
      onReady?.(g);
    })
    .catch(() => undefined);
  return holder;
}

const PHI = (1 + Math.sqrt(5)) / 2;
const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
const cyl = (rt: number, rb: number, h: number, seg = 10, open = false) => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open);

/* ------------------------------ Krypto: emblema "K" (krypto.glb) ------------------------------ */
function krypto(k: Kit): IconRig {
  const holder = attachModel(k, MODEL_URLS.krypto, 1.7);
  return k.rig((t, kk) => {
    holder.rotation.x = Math.sin(t * 0.9) * 0.08;
    holder.position.y = Math.sin(t * 1.7) * 0.03 * (1 + kk);
  });
}

/* ------------------------------ The Noris Project: cabeza de la muñeca (doll-head.glb) ------------------------------ */
function tnp(k: Kit): IconRig {
  const holder = attachModel(k, MODEL_URLS.doll, 2.0);
  return k.rig((t, kk) => {
    holder.rotation.z = Math.sin(t * 1.3) * (0.05 + 0.1 * kk);
    holder.position.y = Math.sin(t * 1.5) * 0.04;
  });
}

/* ------------------------------ Noisepad: logo con grosor + cuerpos orbitando ------------------------------ */
function noisepad(k: Kit): IconRig {
  logoSlab(k, noisepadShape, LOGO_URLS.noisepad, 1.45, 0.17, '#2a1a8f');
  const orb = orbiters(k, ['#c04dff', '#4d7bff', '#ff6fd8', '#33d6ff', '#ffffff'], 1.12);
  return k.rig((t, kk) => orb(t, kk));
}

/* ------------------------------ Waka Waka Reloaded: logo (pulpo) con grosor ------------------------------ */
function waka(k: Kit): IconRig {
  logoSlab(k, roundedRect(264 / 362, 0.09), LOGO_URLS.waka, 1.7, 0.18, '#0f6a96');
  const orb = orbiters(k, ['#ff9a1f', '#7a4dff', '#ffd23f', '#ff6f91', '#33d6ff'], 1.12);
  return k.rig((t, kk) => orb(t, kk));
}

/* ------------------------------ Assetly: logo "A" con grosor + primitivas orbitando ------------------------------ */
function assetly(k: Kit): IconRig {
  logoSlab(k, assetlyShape, LOGO_URLS.assetly, 1.5, 0.2, '#3b1b94');
  const orbit = k.group();
  const prims = [
    k.mesh(new THREE.TetrahedronGeometry(0.2), '#ff6fa8', { parent: orbit, pos: [1.15, 0.4, 0] }),
    k.mesh(new THREE.OctahedronGeometry(0.2), '#33d6ff', { parent: orbit, pos: [0, -0.35, 1.15] }),
    k.mesh(new THREE.ConeGeometry(0.2, 0.34, 5), '#4be28f', { parent: orbit, pos: [-1.15, 0.2, 0] }),
    k.mesh(new THREE.TorusGeometry(0.15, 0.06, 5, 8), '#ffd75a', { parent: orbit, pos: [0, 0.5, -1.15] }),
  ];
  return k.rig((t, kk) => {
    orbit.rotation.y = t * (0.5 + 2.4 * kk);
    prims.forEach((p, i) => { p.rotation.x = t * (1 + i * 0.4); p.rotation.z = t * 0.7; });
  });
}

/* ------------------------------ BDA: base de datos + pelota ------------------------------ */
function soccerGeometry(radius: number): THREE.BufferGeometry {
  // Icosaedro truncado real (12 pentágonos + 20 hexágonos) a partir de sus 60 vértices.
  const base: [number, number, number][] = [[0, 1, 3 * PHI], [1, 2 + PHI, 2 * PHI], [PHI, 2, 2 * PHI + 1]];
  const pts = new Map<string, THREE.Vector3>();
  for (const [a, b, c] of base)
    for (const [x, y, z] of [[a, b, c], [b, c, a], [c, a, b]])
      for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1]) {
        const v = new THREE.Vector3(x * sx, y * sy, z * sz);
        pts.set(v.toArray().map((n) => n.toFixed(3)).join(','), v);
      }
  const verts = [...pts.values()];
  const s = radius / verts[0].length();
  const g = new ConvexGeometry(verts.map((v) => v.clone().multiplyScalar(s)));
  const pent: THREE.Vector3[] = [];
  for (const [a, b] of [[0, 1], [0, -1]]) for (const sg of [1, -1]) {
    pent.push(new THREE.Vector3(0, a || b, PHI * sg).normalize(), new THREE.Vector3(a || b, PHI * sg, 0).normalize(), new THREE.Vector3(PHI * sg, 0, a || b).normalize());
  }
  const out = g.index ? g.toNonIndexed() : g;
  const pos = out.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), N = new THREE.Vector3();
  const white = new THREE.Color('#f4f6ff'), dark = new THREE.Color('#14161c');
  for (let i = 0; i < pos.count; i += 3) {
    A.fromBufferAttribute(pos, i); B.fromBufferAttribute(pos, i + 1); C.fromBufferAttribute(pos, i + 2);
    N.subVectors(C, B).cross(A.clone().sub(B)).normalize();
    const isPent = pent.some((p) => p.dot(N) > 0.99);
    const c = isPent ? dark : white;
    for (let k = 0; k < 3; k++) col.set([c.r, c.g, c.b], (i + k) * 3);
  }
  out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return out;
}

function bda(k: Kit): IconRig {
  const cols = ['#33c6ff', '#3d7bff', '#33c6ff'];
  cols.forEach((c, i) => {
    k.mesh(cyl(0.6, 0.6, 0.26, 12), c, { pos: [0, -0.62 + i * 0.34, 0] });
    k.mesh(cyl(0.62, 0.62, 0.05, 12), '#0c1a3d', { pos: [0, -0.46 + i * 0.34, 0] });
  });
  const g = soccerGeometry(0.34);
  k.geos.push(g);
  const ball = new THREE.Mesh(g, k.mat);
  ball.position.set(0, 0.78, 0);
  k.root.add(ball);
  return k.rig((t, kk) => {
    const h = Math.abs(Math.sin(t * 3)) * 0.42 * kk;
    ball.position.y = 0.78 + h + Math.sin(t * 1.4) * 0.03;
    ball.rotation.y = t * (0.8 + 2.5 * kk);
    ball.rotation.x = t * 0.5 * kk;
  });
}

/* ------------------------------ elifest22: trofeo + confeti ------------------------------ */
function elifest(k: Kit): IconRig {
  const gold = '#ffc93a';
  k.mesh(cyl(0.5, 0.58, 0.14, 10), '#2a2f3a', { pos: [0, -0.7, 0] });
  k.mesh(cyl(0.12, 0.17, 0.5, 8), gold, { pos: [0, -0.38, 0] });
  k.mesh(cyl(0.46, 0.2, 0.62, 10), gold, { pos: [0, 0.18, 0] });
  [-1, 1].forEach((s) => k.mesh(new THREE.TorusGeometry(0.2, 0.05, 5, 8), gold, { pos: [s * 0.52, 0.22, 0], rot: [0, 0, s > 0 ? -0.5 : Math.PI + 0.5] }));
  const star = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 0.28 : 0.12;
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    if (i === 0) star.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else star.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  star.closePath();
  const starMesh = k.mesh(new THREE.ExtrudeGeometry(star, { depth: 0.08, bevelEnabled: false }), '#fff3a0', { pos: [0, 0.86, 0] });
  const confetti = k.group();
  const cols = ['#ff5d6c', '#4aa8ff', '#4be28f', '#ff7bd0', '#ffe14a', '#9a7bff'];
  const bits = cols.map((c, i) => k.mesh(box(0.1, 0.1, 0.02), c, { parent: confetti, pos: [Math.cos(i * 1.047) * 1.05, Math.sin(i * 2.1) * 0.5, Math.sin(i * 1.047) * 1.05] }));
  return k.rig((t, kk) => {
    starMesh.rotation.y = t * (1 + 3 * kk);
    starMesh.position.y = 0.86 + Math.sin(t * 2.2) * 0.06;
    confetti.rotation.y = t * (0.3 + 2.2 * kk);
    bits.forEach((b, i) => { b.rotation.x = t * (2 + i); b.rotation.z = t * 1.5; });
  });
}

/* ------------------------------ Juego de la Vida: autómata de Conway real (5x5 toroidal) ------------------------------ */
function life(k: Kit): IconRig {
  const N = 5;
  let cells = new Uint8Array(N * N);
  const seed = () => {
    cells = new Uint8Array(N * N);
    [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]].forEach(([x, y]) => (cells[y * N + x] = 1)); // planeador
  };
  seed();
  // Placa + celdas dentro del MISMO grupo (se inclinan juntas). Los cubos nacen sobre la placa (z >= 0)
  // y sólo crecen hacia el frente, así nunca atraviesan la placa por detrás.
  const board = k.group();
  k.mesh(box(1.95, 1.95, 0.06), '#101a2e', { parent: board, pos: [0, 0, -0.03] });
  const cellGeo = paint(box(0.28, 0.28, 0.28), '#ffffff', 0.05);
  cellGeo.translate(0, 0, 0.14); // base del cubo en z = 0
  k.geos.push(cellGeo);
  const inst = new THREE.InstancedMesh(cellGeo, k.mat, N * N);
  board.add(inst);
  const dummy = new THREE.Object3D();
  const alive = new THREE.Color('#5dff9a'), dead = new THREE.Color('#22324d');
  const render = () => {
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) {
        const i = y * N + x;
        dummy.position.set((x - 2) * 0.35, (2 - y) * 0.35, 0.002);
        dummy.scale.set(1, 1, cells[i] ? 1.25 : 0.3);
        dummy.updateMatrix();
        inst.setMatrixAt(i, dummy.matrix);
        inst.setColorAt(i, cells[i] ? alive : dead);
      }
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  };
  const step = () => {
    const next = new Uint8Array(N * N);
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) {
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) n += cells[((y + dy + N) % N) * N + ((x + dx + N) % N)];
        const a = cells[y * N + x];
        next[y * N + x] = a ? (n === 2 || n === 3 ? 1 : 0) : n === 3 ? 1 : 0;
      }
    cells = next;
    if (!cells.some(Boolean)) seed();
  };
  render();
  let acc = 0;
  return k.rig((t, kk, dt) => {
    if (kk > 0.5) {
      acc += dt;
      if (acc > 0.34) { acc = 0; step(); render(); }
    }
    board.rotation.x = Math.sin(t * 0.8) * 0.1;
  });
}

/* ------------------------------ Laberintos y Fantasmas ------------------------------ */
function maze(k: Kit): IconRig {
  k.mesh(box(1.9, 0.08, 1.9), '#0d1630', { pos: [0, -0.72, 0] });
  const wall = '#2d5bff';
  [[0, -0.6, -0.9, 1.9, 0.9], [-0.9, -0.6, 0, 0.12, 1.9], [0.9, -0.6, 0, 0.12, 1.9], [0, -0.6, 0.9, 1.9, 0.12], [-0.3, -0.6, -0.3, 0.9, 0.12], [0.35, -0.6, 0.35, 0.12, 0.9]].forEach(([x, y, z, w, d], i) => {
    k.mesh(box(i === 0 ? 1.9 : w, 0.22, i === 0 ? 0.12 : d), wall, { pos: [x, y, z] });
  });
  const ghost = k.group([0, 0.1, 0]);
  k.mesh(new THREE.SphereGeometry(0.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), '#ff9ad0', { parent: ghost, pos: [0, 0.18, 0] });
  k.mesh(cyl(0.5, 0.5, 0.52, 12, true), '#ff9ad0', { parent: ghost, pos: [0, -0.08, 0], double: true });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    k.mesh(new THREE.ConeGeometry(0.17, 0.24, 5), '#ff9ad0', { parent: ghost, pos: [Math.cos(a) * 0.33, -0.46, Math.sin(a) * 0.33], rot: [Math.PI, 0, 0] });
  }
  [-1, 1].forEach((s) => {
    k.mesh(new THREE.IcosahedronGeometry(0.13, 0), '#ffffff', { parent: ghost, pos: [s * 0.19, 0.2, 0.4] });
    k.mesh(new THREE.IcosahedronGeometry(0.065, 0), '#1f3cff', { parent: ghost, pos: [s * 0.19, 0.2, 0.52] });
  });
  return k.rig((t, kk) => {
    ghost.position.y = 0.14 + Math.sin(t * (2 + 3 * kk)) * (0.08 + 0.1 * kk);
    ghost.rotation.y = Math.sin(t * 0.9) * (0.3 + 0.5 * kk);
  });
}

/* ------------------------------ CHIP-8: chip con pantalla de píxeles jugando Pong ------------------------------ */
function chip8(k: Kit): IconRig {
  const W = 16, H = 8;
  const board = k.group();
  board.rotation.x = -0.2;
  board.scale.setScalar(0.88); // con las patas mide ~2.2: lo achicamos para que entre en la baldosa
  // encapsulado + parte trasera más oscura
  k.mesh(box(1.8, 1.3, 0.22), '#1c2030', { parent: board });
  k.mesh(box(1.84, 1.34, 0.05), '#0f121b', { parent: board, pos: [0, 0, -0.08] });
  // 12 patas doradas (6 por lado)
  for (const side of [-1, 1])
    for (let i = 0; i < 6; i++) k.mesh(box(0.22, 0.09, 0.06), '#d8c46a', { parent: board, pos: [side * 0.99, (i - 2.5) * 0.21, -0.02] });
  // muesca de orientación + LED
  k.mesh(cyl(0.1, 0.1, 0.03, 10), '#0a0c12', { parent: board, pos: [0, 0.52, 0.115], rot: [Math.PI / 2, 0, 0] });
  const led = k.mesh(new THREE.IcosahedronGeometry(0.045, 0), '#5dff9a', { parent: board, pos: [0.72, 0.52, 0.13] });
  // pantalla 16x8 de píxeles (instanciada): las celdas nacen sobre el bisel y sólo crecen hacia el frente
  k.mesh(box(1.4, 0.78, 0.03), '#06130c', { parent: board, pos: [0, -0.06, 0.115] });
  const cellGeo = paint(box(0.07, 0.07, 0.07), '#ffffff', 0.04);
  cellGeo.translate(0, 0, 0.035);
  k.geos.push(cellGeo);
  const inst = new THREE.InstancedMesh(cellGeo, k.mat, W * H);
  inst.position.set(0, -0.06, 0.13);
  board.add(inst);
  const dummy = new THREE.Object3D();
  const on = new THREE.Color('#5dff9a'), off = new THREE.Color('#0f3320');
  const cells = new Uint8Array(W * H);
  // Pong: paletas en los bordes, línea central y una pelota que rebota
  let bx = 6, by = 2, vx = 1, vy = 1;
  const py = [3, 4];
  const draw = () => {
    cells.fill(0);
    for (let y = 0; y < H; y += 2) cells[y * W + W / 2] = 1;
    for (let d = -1; d <= 1; d++) {
      if (py[0] + d >= 0 && py[0] + d < H) cells[(py[0] + d) * W] = 1;
      if (py[1] + d >= 0 && py[1] + d < H) cells[(py[1] + d) * W + W - 1] = 1;
    }
    cells[by * W + bx] = 1;
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        dummy.position.set((x - (W - 1) / 2) * 0.082, ((H - 1) / 2 - y) * 0.082, 0);
        dummy.scale.set(1, 1, cells[i] ? 1 : 0.12);
        dummy.updateMatrix();
        inst.setMatrixAt(i, dummy.matrix);
        inst.setColorAt(i, cells[i] ? on : off);
      }
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  };
  let tick = 0;
  const step = () => {
    bx += vx; by += vy;
    if (by <= 0) { by = 0; vy = 1; }
    if (by >= H - 1) { by = H - 1; vy = -1; }
    if (bx <= 1) { bx = 1; vx = 1; }
    if (bx >= W - 2) { bx = W - 2; vx = -1; }
    tick++;
    py[0] = Math.min(H - 2, Math.max(1, py[0] + Math.sign(by - py[0])));
    if (tick % 2 === 0) py[1] = Math.min(H - 2, Math.max(1, py[1] + Math.sign(by - py[1])));
  };
  draw();
  let acc = 0;
  return k.rig((t, kk, dt) => {
    if (kk > 0.5) {
      acc += dt;
      if (acc > 0.085) { acc = 0; step(); draw(); }
    }
    led.scale.setScalar(Math.sin(t * 5) > 0 ? 1.3 : 0.6);
    board.rotation.x = -0.2 + Math.sin(t * 0.9) * 0.06;
  });
}

const BUILDERS: Record<IconId, (k: Kit) => IconRig> = { krypto, tnp, noisepad, waka, assetly, bda, elifest, life, maze, chip8 };

export function buildIcon(id: IconId, mat: THREE.Material, matDouble: THREE.Material): IconRig {
  return BUILDERS[id](new Kit(mat, matDouble));
}
