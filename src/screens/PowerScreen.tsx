import { Power } from 'lucide-react';
import { useStore } from '../store';
import { useT } from '../i18n';
import { useInput } from '../lib/input';

/** Pantalla inicial: la PS2 en espera. Se enciende con el botón 3D, el botón POWER o Enter. */
export function PowerScreen({ power }: { power: () => void }) {
  const t = useT();
  const powering = useStore((s) => s.powering);
  useInput((a) => {
    if (a === 'confirm') power();
  });
  return (
    <div className="absolute inset-0 ps-ui">
      <div
        className="pointer-events-auto absolute bottom-[3rem] left-0 right-0 flex flex-col items-center gap-[1.1rem] transition-opacity duration-500"
        style={{ opacity: powering ? 0 : 1 }}
      >
        <div className="text-[1.1rem] tracking-[0.18em] text-sky-100/70" style={{ animation: 'breathe 2.6s ease-in-out infinite' }}>
          {t('power.hint').toUpperCase()}
        </div>
        <button
          onClick={power}
          disabled={powering}
          className="group flex items-center gap-[0.7rem] rounded-full border border-sky-200/40 bg-sky-400/10 px-[2.2rem] py-[0.65rem] text-[1.3rem] font-semibold tracking-[0.3em] text-sky-50 transition hover:border-sky-100/80 hover:bg-sky-300/20 hover:shadow-[0_0_2rem_rgba(110,160,255,0.55)] focus-visible:border-sky-100"
          autoFocus
        >
          <Power style={{ width: '1.4rem', height: '1.4rem' }} className="text-sky-200 transition group-hover:text-white" />
          {t('power.button')}
        </button>
      </div>
      {/* fundido a negro al encender, justo antes de que empiece la intro */}
      <div className="pointer-events-none absolute inset-0 bg-black transition-opacity" style={{ opacity: powering ? 1 : 0, transitionDelay: '1.05s', transitionDuration: '0.6s' }} />
    </div>
  );
}
