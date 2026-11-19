import { useCallback, useEffect, useState } from 'react';
import { useStore } from '../store';
import { useT } from '../i18n';
import { bootDurations, sfx, startAmbient } from '../lib/audio';
import { useInput } from '../lib/input';
import { Glyph } from '../components/Glyphs';

export type BootPhase = 'fly' | 'black' | 'logo';

/**
 * Capa DOM de la intro.
 *  fly   → fundido de entrada desde negro mientras vuelan las torres
 *  black → corte a negro (cuando termina ps2_startup.mp3)
 *  logo  → sobre negro, el logo + "alexe1" pasan de negro a color muy rápido (suena ps2_logo.mp3)
 */
export function BootScreen({ phase }: { phase: BootPhase }) {
  const t = useT();
  const [leaving, setLeaving] = useState(false);

  const finish = useCallback(() => {
    sfx.bootStop();
    const s = useStore.getState();
    s.setCurtain(true);
    s.go('menu');
    startAmbient();
  }, []);

  useInput((a) => {
    if (a === 'confirm' || a === 'back') finish();
  });

  useEffect(() => {
    if (phase !== 'logo') return;
    sfx.bootLogo();
    const hold = Math.max(3200, (bootDurations().logo ?? 1) * 1000 + 2400);
    const t1 = setTimeout(() => setLeaving(true), hold);
    const t2 = setTimeout(finish, hold + 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase, finish]);

  return (
    <div className="absolute inset-0 ps-ui">
      {/* fundido de entrada desde negro */}
      <div className="pointer-events-none absolute inset-0 bg-black" style={{ animation: 'fadeOut 1.4s ease-out 0.1s both' }} />
      {/* negro (corte rápido) */}
      <div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: phase === 'fly' ? 0 : 1, transition: 'opacity 0.35s ease-in' }} />

      {phase === 'logo' && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ opacity: leaving ? 0 : 1, transition: 'opacity 0.65s ease-in' }}
        >
          <div className="flex flex-col items-center gap-[1.4rem]" style={{ animation: 'logoReveal 0.8s ease-out both' }}>
            <img src={`${import.meta.env.BASE_URL}img/logo.png`} alt="alexe1" draggable={false} className="h-[15rem] w-[15rem] object-contain" style={{ filter: 'drop-shadow(0 0 1.6rem rgba(255,240,200,0.35))' }} />
            <div className="text-[6.6rem] font-semibold leading-none tracking-[0.06em] text-white" style={{ textShadow: '0 0 2rem rgba(255,245,220,0.45), 0.12rem 0.18rem 0.3rem rgba(0,0,0,0.6)' }}>
              alexe1
            </div>
          </div>
        </div>
      )}

      <button onClick={finish} className="pointer-events-auto absolute bottom-[1rem] right-[1.4rem] z-10 flex items-center gap-[0.5rem] text-[1rem] text-white/50 transition hover:text-white">
        <Glyph name="cross" />
        {t('boot.skip')}
      </button>
    </div>
  );
}
