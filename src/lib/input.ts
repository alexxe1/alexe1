/**
 * Entrada unificada estilo DualShock: teclado + gamepad real → acciones.
 * Los componentes registran un handler con useInput(); sólo el último registrado (el de arriba) recibe las acciones.
 */
import { useEffect, useRef } from 'react';

export type Action = 'up' | 'down' | 'left' | 'right' | 'confirm' | 'back';
export type InputHandler = (a: Action) => void;

const stack: InputHandler[] = [];

export function pushInput(h: InputHandler): () => void {
  stack.push(h);
  return () => {
    const i = stack.lastIndexOf(h);
    if (i >= 0) stack.splice(i, 1);
  };
}

export function dispatch(a: Action) {
  stack[stack.length - 1]?.(a);
}

const KEYS: Record<string, Action> = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  Enter: 'confirm', NumpadEnter: 'confirm', Space: 'confirm',
  Escape: 'back', Backspace: 'back',
};

function onKey(e: KeyboardEvent) {
  const a = KEYS[e.code];
  if (!a) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  e.preventDefault();
  if (e.repeat && (a === 'confirm' || a === 'back')) return;
  dispatch(a);
}

/* ---- Gamepad (✕ = confirmar, ○ = volver, cruceta / stick izquierdo = mover) ---- */
const prev: Record<string, boolean> = {};
let stickCooldown = 0;
let raf = 0;
let last = 0;

function poll(now: number) {
  raf = requestAnimationFrame(poll);
  const dt = now - last;
  last = now;
  const pads = navigator.getGamepads?.() ?? [];
  const gp = Array.from(pads).find((p): p is Gamepad => !!p && p.connected);
  if (!gp) return;
  const press = (name: string, down: boolean, a: Action) => {
    if (down && !prev[name]) dispatch(a);
    prev[name] = down;
  };
  const b = (i: number) => !!gp.buttons[i]?.pressed;
  press('cross', b(0), 'confirm');
  press('circle', b(1), 'back');
  press('up', b(12), 'up');
  press('down', b(13), 'down');
  press('left', b(14), 'left');
  press('right', b(15), 'right');
  stickCooldown -= dt;
  const [x = 0, y = 0] = gp.axes;
  if (stickCooldown <= 0 && (Math.abs(x) > 0.6 || Math.abs(y) > 0.6)) {
    stickCooldown = 190;
    if (Math.abs(x) > Math.abs(y)) dispatch(x > 0 ? 'right' : 'left');
    else dispatch(y > 0 ? 'down' : 'up');
  }
}

export function installInput(): () => void {
  window.addEventListener('keydown', onKey);
  last = performance.now();
  raf = requestAnimationFrame(poll);
  return () => {
    window.removeEventListener('keydown', onKey);
    cancelAnimationFrame(raf);
  };
}

/** Registra un handler mientras el componente esté montado. */
export function useInput(handler: InputHandler) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => pushInput((a) => ref.current(a)), []);
}
