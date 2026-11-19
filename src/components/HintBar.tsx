import { dispatch } from '../lib/input';
import { DpadGlyph, Glyph, type Hint } from './Glyphs';

/** Barra inferior con los botones disponibles (clickeable con el mouse). */
export function HintBar({ hints }: { hints: Hint[] }) {
  return (
    <div className="pointer-events-auto absolute bottom-0 left-0 right-0 flex items-center justify-center gap-[2.2rem] px-[2rem] pb-[0.9rem] pt-[0.5rem] text-[1.05rem] font-medium text-white/90 ps-ui">
      {hints.map((h) => {
        const inner = (
          <>
            {h.glyph === 'dpad' ? <DpadGlyph /> : <Glyph name={h.glyph} />}
            <span>{h.label}</span>
          </>
        );
        return h.action ? (
          <button key={h.label} onClick={() => dispatch(h.action!)} className="flex items-center gap-[0.5rem] transition-opacity hover:opacity-100 opacity-90">
            {inner}
          </button>
        ) : (
          <div key={h.label} className="flex items-center gap-[0.5rem]">{inner}</div>
        );
      })}
    </div>
  );
}
