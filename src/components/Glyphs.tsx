import type { Action } from '../lib/input';

export type GlyphName = 'cross' | 'circle' | 'triangle' | 'square';

const COLORS: Record<GlyphName, string> = {
  cross: '#7aa7ff',
  circle: '#ff6b7a',
  triangle: '#5fe3a0',
  square: '#ff8fd0',
};

/** Botones del DualShock (✕ ○ △ □) con sus colores. */
export function Glyph({ name, size = '1.5rem' }: { name: GlyphName; size?: string }) {
  const c = COLORS[name];
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size }} fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10.4" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" fill="rgba(10,20,70,0.55)" />
      {name === 'cross' && <path d="M7.5 7.5l9 9M16.5 7.5l-9 9" />}
      {name === 'circle' && <circle cx="12" cy="12" r="4.6" />}
      {name === 'triangle' && <path d="M12 6.4l5.2 9H6.8z" />}
      {name === 'square' && <rect x="7.6" y="7.6" width="8.8" height="8.8" />}
    </svg>
  );
}

export interface Hint { glyph: GlyphName | 'dpad'; label: string; action?: Action }

export function DpadGlyph({ size = '1.5rem' }: { size?: string }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size }} fill="rgba(200,220,255,0.9)" aria-hidden>
      <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7z" opacity="0.85" />
    </svg>
  );
}
